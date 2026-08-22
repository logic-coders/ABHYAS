import { BilingualQuestion } from './types';
import { ParsedRawQuestion } from './txt-parser';

export interface MatchingSummary {
  totalEnglish: number;
  totalHindi: number;
  totalAnswers: number;
  totalMatched: number;
  verifiedCount: number;
  warningCount: number;
  errorCount: number;
  answerKeyStatus: 'valid' | 'invalid' | 'none';
  globalIssues: string[];
}

export interface MatchResult {
  questions: BilingualQuestion[];
  summary: MatchingSummary;
}

/**
 * Valid option letters in order: A, B, C, D, E
 */
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'];

/**
 * Matches English, Hindi, and Answer Key parsed data by question number & sequence,
 * validating counts, option alignment, duplicate keys, answer key mappings, and missing questions.
 */
export function matchEnglishAndHindiQuestions(
  englishQs: ParsedRawQuestion[],
  hindiQs: ParsedRawQuestion[],
  answerKey?: Map<number, string>
): MatchResult {
  const globalIssues: string[] = [];

  // Build maps by question number
  const enMap = new Map<number, ParsedRawQuestion>();
  const hiMap = new Map<number, ParsedRawQuestion>();
  
  const enDuplicateNums = new Set<number>();
  const hiDuplicateNums = new Set<number>();

  for (const q of englishQs) {
    if (enMap.has(q.number)) {
      enDuplicateNums.add(q.number);
    }
    enMap.set(q.number, q);
  }

  for (const q of hindiQs) {
    if (hiMap.has(q.number)) {
      hiDuplicateNums.add(q.number);
    }
    hiMap.set(q.number, q);
  }

  if (enDuplicateNums.size > 0) {
    globalIssues.push(`English TXT contains duplicate question numbers: ${Array.from(enDuplicateNums).join(', ')}`);
  }
  if (hiDuplicateNums.size > 0) {
    globalIssues.push(`Hindi TXT contains duplicate question numbers: ${Array.from(hiDuplicateNums).join(', ')}`);
  }

  if (englishQs.length !== hindiQs.length) {
    globalIssues.push(
      `Question count mismatch: English has ${englishQs.length} questions, but Hindi has ${hindiQs.length} questions.`
    );
  }

  const hasAnswerKey = Boolean(answerKey && answerKey.size > 0);
  const totalAnswers = answerKey ? answerKey.size : 0;

  if (hasAnswerKey && answerKey && answerKey.size !== englishQs.length) {
    globalIssues.push(
      `Answer Key count mismatch: Found ${answerKey.size} answers, but English file has ${englishQs.length} questions.`
    );
  }

  // Collect all unique question numbers in order
  const allNumbersSet = new Set<number>();
  englishQs.forEach((q) => allNumbersSet.add(q.number));
  hindiQs.forEach((q) => allNumbersSet.add(q.number));
  if (answerKey) {
    answerKey.forEach((_, k) => allNumbersSet.add(k));
  }

  const sortedNumbers = Array.from(allNumbersSet).sort((a, b) => a - b);

  // Check for extraneous answer numbers
  if (hasAnswerKey && answerKey) {
    const extraAnswerNums: number[] = [];
    answerKey.forEach((_, k) => {
      if (!enMap.has(k) && !hiMap.has(k)) {
        extraAnswerNums.push(k);
      }
    });
    if (extraAnswerNums.length > 0) {
      globalIssues.push(
        `Answer Key contains extra answers for non-existent questions: ${extraAnswerNums.join(', ')}`
      );
    }
  }

  const matchedQuestions: BilingualQuestion[] = [];
  let verifiedCount = 0;
  let warningCount = 0;
  let errorCount = 0;
  let answerKeyErrors = 0;

  for (let idx = 0; idx < sortedNumbers.length; idx++) {
    const num = sortedNumbers[idx];
    const enQ = enMap.get(num);
    const hiQ = hiMap.get(num);

    const issues: string[] = [];
    let status: 'verified' | 'warning' | 'error' = 'verified';

    // Check missing in language files
    if (!enQ) {
      issues.push(`Question ${num} is missing in English TXT file.`);
      status = 'error';
    }
    if (!hiQ) {
      issues.push(`Question ${num} is missing in Hindi TXT file.`);
      status = 'error';
    }

    const enText = enQ?.text || '';
    const enOptions = enQ?.options || [];
    const hiText = hiQ?.text || '';
    const hiOptions = hiQ?.options || [];

    // Check empty text
    if (enQ && !enText.trim()) {
      issues.push(`English question text is empty.`);
      status = 'error';
    }
    if (hiQ && !hiText.trim()) {
      issues.push(`Hindi question text is empty.`);
      status = 'error';
    }

    // Check options count
    if (enQ && enOptions.length < 2) {
      issues.push(`English question has too few options (${enOptions.length}). Minimum 2 required.`);
      status = 'error';
    }
    if (hiQ && hiOptions.length < 2) {
      issues.push(`Hindi question has too few options (${hiOptions.length}). Minimum 2 required.`);
      status = 'error';
    }

    // Check option count mismatch between English and Hindi
    if (enQ && hiQ && enOptions.length !== hiOptions.length) {
      issues.push(
        `Option count mismatch: English has ${enOptions.length} options, but Hindi has ${hiOptions.length} options.`
      );
      status = 'error';
    }

    // Check duplicate numbers
    if (enDuplicateNums.has(num)) {
      issues.push(`Question ${num} appears multiple times in English TXT.`);
      status = 'error';
    }
    if (hiDuplicateNums.has(num)) {
      issues.push(`Question ${num} appears multiple times in Hindi TXT.`);
      status = 'error';
    }

    // Check Answer Key validation
    let correctAnswer: string | undefined = undefined;

    if (hasAnswerKey && answerKey) {
      const ans = answerKey.get(num);
      if (!ans) {
        issues.push(`Question ${num} is missing from the Answer Key.`);
        status = 'error';
        answerKeyErrors++;
      } else {
        correctAnswer = ans.toUpperCase();
        
        // Validate answer is within option range
        const maxOptions = Math.max(enOptions.length, hiOptions.length, 2);
        const validOptionsForQ = OPTION_LETTERS.slice(0, maxOptions);

        if (!validOptionsForQ.includes(correctAnswer)) {
          issues.push(
            `Answer Key specified '${correctAnswer}' for Question ${num}, but only options (${validOptionsForQ.join(', ')}) exist.`
          );
          status = 'error';
          answerKeyErrors++;
        }
      }
    }

    // Check sequence gaps (e.g. jumping from 1 to 3)
    if (idx > 0 && sortedNumbers[idx] !== sortedNumbers[idx - 1] + 1) {
      const skippedFrom = sortedNumbers[idx - 1] + 1;
      const skippedTo = sortedNumbers[idx] - 1;
      const skippedRange = skippedFrom === skippedTo ? `${skippedFrom}` : `${skippedFrom}-${skippedTo}`;
      issues.push(`Question numbering jumped (skipped question ${skippedRange}).`);
      if (status !== 'error') {
        status = 'warning';
      }
    }

    if (status === 'verified') verifiedCount++;
    else if (status === 'warning') warningCount++;
    else errorCount++;

    matchedQuestions.push({
      number: num,
      english: {
        text: enText,
        options: enOptions,
      },
      hindi: {
        text: hiText,
        options: hiOptions,
      },
      correctAnswer,
      status,
      issues,
    });
  }

  const answerKeyStatus: 'valid' | 'invalid' | 'none' = !hasAnswerKey
    ? 'none'
    : answerKeyErrors === 0 && globalIssues.filter((i) => i.includes('Answer Key')).length === 0
    ? 'valid'
    : 'invalid';

  return {
    questions: matchedQuestions,
    summary: {
      totalEnglish: englishQs.length,
      totalHindi: hindiQs.length,
      totalAnswers,
      totalMatched: matchedQuestions.length,
      verifiedCount,
      warningCount,
      errorCount,
      answerKeyStatus,
      globalIssues,
    },
  };
}

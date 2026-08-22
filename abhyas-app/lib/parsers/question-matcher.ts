import { BilingualQuestion } from '@/lib/types';
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

  const hasAnswerKey = Boolean(answerKey && answerKey.size > 0);
  const totalAnswers = answerKey ? answerKey.size : 0;

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
    let enQ = enMap.get(num);
    let hiQ = hiMap.get(num);

    const issues: string[] = [];
    let status: 'verified' | 'warning' | 'error' = 'verified';

    // Graceful fallback for language sections (e.g. Hindi grammar in Part I)
    if (!enQ && hiQ) {
      enQ = hiQ;
      issues.push(`Shared language section: used Hindi question for English medium.`);
    } else if (!hiQ && enQ) {
      hiQ = enQ;
      issues.push(`Shared language section: used English question for Hindi medium.`);
    } else if (!enQ && !hiQ) {
      issues.push(`Question ${num} is missing in both English and Hindi TXT files.`);
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
      issues.push(`Question has too few options (${enOptions.length}). Minimum 2 required.`);
      status = 'error';
    }

    // Check duplicate numbers
    if (enDuplicateNums.has(num) || hiDuplicateNums.has(num)) {
      issues.push(`Question ${num} appears multiple times in upload.`);
      status = 'warning';
    }

    // Check Answer Key validation
    let correctAnswer: string | undefined = undefined;

    if (hasAnswerKey && answerKey) {
      const ans = answerKey.get(num);
      if (!ans) {
        issues.push(`Question ${num} is missing from the Answer Key.`);
        status = 'warning';
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
          status = 'warning';
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

export interface ParsedRawQuestion {
  number: number;
  text: string;
  options: string[];
  rawBlock: string;
}

export interface ParsedAnswerKey {
  answers: Map<number, string>; // Maps question number to "A" | "B" | "C" | "D" | "E"
  duplicates: number[];
  invalidLines: string[];
  totalParsed: number;
}

/**
 * Normalizes text content:
 * - Standardizes line breaks (\r\n -> \n, \r -> \n)
 * - Removes zero-width spaces and BOM markers
 */
function normalizeRawContent(content: string): string {
  if (!content) return '';
  return content
    .replace(/^\uFEFF/, '') // Remove UTF-8 BOM if present
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero width chars
    .trim();
}

/**
 * Maps raw option characters/letters to standard uppercase "A", "B", "C", "D", "E".
 */
function normalizeOptionLetter(raw: string): string | null {
  const clean = raw.trim().toLowerCase();
  
  if (clean === 'a' || clean === '1' || clean === 'क' || clean === 'अ') return 'A';
  if (clean === 'b' || clean === '2' || clean === 'ख' || clean === 'ब') return 'B';
  if (clean === 'c' || clean === '3' || clean === 'ग' || clean === 'स') return 'C';
  if (clean === 'd' || clean === '4' || clean === 'घ' || clean === 'द') return 'D';
  if (clean === 'e' || clean === '5' || clean === 'ङ' || clean === 'इ') return 'E';

  // Handle special cases in official answer keys like "DELETED", "BONUS", "ALL", "X", "*"
  if (clean.includes('delete') || clean.includes('bonus') || clean === 'all' || clean === 'x' || clean === '*') {
    return 'A'; // Graceful fallback
  }

  return null;
}

/**
 * Parses an Answer Key TXT file.
 * Expected format:
 *   1. A
 *   2. C
 *   3. D
 *   4. E
 *   5. B
 * Also supports variants: 1: A, 1) A, 1 - A, 1 A, Q1. A, 1, A, 1 (A), 62. DELETED
 */
export function parseAnswerKey(rawText: string): ParsedAnswerKey {
  const normalized = normalizeRawContent(rawText);
  const answers = new Map<number, string>();
  const duplicates: number[] = [];
  const invalidLines: string[] = [];

  if (!normalized) {
    return {
      answers,
      duplicates,
      invalidLines,
      totalParsed: 0,
    };
  }

  const lines = normalized.split('\n');

  // Regex matching: (Q1.|1.|1)|1:|1 -|1,) (A|(A)|[A]|DELETED)
  const lineRegex = /^\s*(?:Q(?:uestion)?\s*[\.:\-]?\s*|Q\s*|H-?)?(\d+)\s*[\.:\-\)\,\s]\s*[\(\[]?([a-eA-E1-5क-ङअ-द]|deleted|bonus|all|\*|x)[\)\]\.\s]*$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue; // Skip empty lines

    const match = trimmed.match(lineRegex);
    if (match) {
      const qNum = parseInt(match[1], 10);
      const rawOpt = match[2];
      const optLetter = normalizeOptionLetter(rawOpt);

      if (optLetter) {
        if (answers.has(qNum)) {
          duplicates.push(qNum);
        }
        answers.set(qNum, optLetter);
      } else {
        invalidLines.push(trimmed);
      }
    } else {
      // Try space/tab separated pair "1 A" or "1	A" or "62 DELETED"
      const parts = trimmed.split(/[\s\t,:=]+/);
      if (parts.length >= 2) {
        const qNum = parseInt(parts[0].replace(/\D/g, ''), 10);
        const optLetter = normalizeOptionLetter(parts[1].replace(/[\(\)\[\]\.]/g, ''));
        if (!isNaN(qNum) && qNum > 0 && optLetter) {
          if (answers.has(qNum)) {
            duplicates.push(qNum);
          }
          answers.set(qNum, optLetter);
          continue;
        }
      }
      invalidLines.push(trimmed);
    }
  }

  return {
    answers,
    duplicates,
    invalidLines,
    totalParsed: answers.size,
  };
}

/**
 * Deterministically parses continuous question text from a .txt file.
 * Automatically captures preceding directions or reading passages for the first question.
 * Returns an array of ParsedRawQuestion.
 */
export function parseTxtQuestions(rawText: string): ParsedRawQuestion[] {
  const normalized = normalizeRawContent(rawText);
  if (!normalized) return [];

  // Match question start positions:
  // e.g. "1.", "1)", "Q1.", "Question 1.", "H-9.", "प्र-10.", "31. l."
  const questionRegex = /(?:^|\n)\s*(?:(?:Q(?:uestion)?|H|प्र|प्|H-)?\s*[\.:\-]?\s*|Q\s*|\b)?(\d+)\s*[\.:\-\)]\s+/gi;
  
  const questionMatches: { num: number; startIndex: number; headerLength: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = questionRegex.exec(normalized)) !== null) {
    const num = parseInt(match[1], 10);
    if (!isNaN(num) && num > 0) {
      const leadingNewline = match[0].startsWith('\n') ? 1 : 0;
      questionMatches.push({
        num,
        startIndex: match.index + leadingNewline,
        headerLength: match[0].length - leadingNewline,
      });
    }
  }

  // Fallback: If no Q1./1. matches found, check if questions are started by standalone number lines
  if (questionMatches.length === 0) {
    const simpleNumRegex = /(?:^|\n)\s*(\d+)\s+([^\n]+)/g;
    while ((match = simpleNumRegex.exec(normalized)) !== null) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0) {
        const leadingNewline = match[0].startsWith('\n') ? 1 : 0;
        questionMatches.push({
          num,
          startIndex: match.index + leadingNewline,
          headerLength: match[1].length + 1,
        });
      }
    }
  }

  const results: ParsedRawQuestion[] = [];

  for (let i = 0; i < questionMatches.length; i++) {
    const current = questionMatches[i];
    const nextStart = i + 1 < questionMatches.length ? questionMatches[i + 1].startIndex : normalized.length;
    
    // For Question 1, include any introductory directions or reading passage before "1."
    const blockStart = i === 0 ? 0 : current.startIndex;
    const fullBlock = normalized.substring(blockStart, nextStart).trim();
    
    let contentWithoutHeader = fullBlock;
    if (i === 0 && current.startIndex > 0) {
      // Preamble exists before Q1: Keep preamble + question body
      const preamble = normalized.substring(0, current.startIndex).trim();
      const questionBody = normalized.substring(current.startIndex + current.headerLength, nextStart).trim();
      contentWithoutHeader = `${preamble}\n\n${questionBody}`;
    } else {
      // Regular question: strip only the question number header
      contentWithoutHeader = fullBlock
        .replace(/^\s*(?:(?:Q(?:uestion)?|H|प्र|प्|H-)?\s*[\.:\-]?\s*|Q\s*)?\d+\s*[\.:\-\)]\s*(?:[a-zA-Z]\.\s*)?/i, '')
        .trim();
    }

    // Parse question statement and options from this block
    const { text, options } = parseQuestionBlock(contentWithoutHeader);

    results.push({
      number: current.num,
      text,
      options,
      rawBlock: fullBlock,
    });
  }

  return results;
}

/**
 * Extracts question statement and options from a single question block.
 */
function parseQuestionBlock(block: string): { text: string; options: string[] } {
  // Find all option positions in the block
  // Matches:
  // (a) Option text
  // (b) Option text
  // or a) Option text, A. Option text, (क) विकल्प, (1) विकल्प
  const optionRegex = /(?:^|\n)\s*(?:\(([a-eA-Eक-ङअ-द1-5])\)|\b([a-eA-Eक-ङअ-द1-5])[\.\)]\s+)\s*/gi;

  const optionMatches: { index: number; label: string; length: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = optionRegex.exec(block)) !== null) {
    const label = (match[1] || match[2] || '').toLowerCase();
    const leadingNewline = match[0].startsWith('\n') ? 1 : 0;
    optionMatches.push({
      index: match.index + leadingNewline,
      label,
      length: match[0].length - leadingNewline,
    });
  }

  if (optionMatches.length === 0) {
    // No options found, entire block is question text
    return {
      text: block.trim(),
      options: [],
    };
  }

  // Question statement is everything before the first option
  const firstOptionIdx = optionMatches[0].index;
  const questionText = block.substring(0, firstOptionIdx).trim();

  // Extract individual options
  const options: string[] = [];
  for (let i = 0; i < optionMatches.length; i++) {
    const currentOpt = optionMatches[i];
    const nextOptIdx = i + 1 < optionMatches.length ? optionMatches[i + 1].index : block.length;
    
    let optContent = block.substring(currentOpt.index + currentOpt.length, nextOptIdx).trim();
    
    // Clean any residual bracket artifact at start
    optContent = optContent.replace(/^[)\.\:\-\s]+/, '').trim();
    
    if (optContent) {
      options.push(optContent);
    }
  }

  return {
    text: questionText,
    options,
  };
}

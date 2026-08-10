import pdfParse from 'pdf-parse';
import { Question } from './types';
import { decodeHindi } from './hindi-decode';

export type Language = 'en' | 'hi';

/**
 * Extract raw text content from a PDF buffer.
 */
export async function extractText(pdfBuffer: Buffer): Promise<string> {
  const result = await pdfParse(pdfBuffer);
  let text = result.text ?? '';
  
  // Strip all instructions before the first PART section
  const firstPartIdx = text.search(/PART\s*-\s*I\b|PअRT\s*-\s*I\b/i);
  if (firstPartIdx !== -1) {
    text = text.substring(firstPartIdx);
  }

  // Clean up common headers/footers
  text = text.replace(/PART\s*-\s*[IVX]+\s*\n*\s*\([A-Z\s]+\)/gi, '');
  text = text.replace(/PअRT\s*-\s*खखख\s*\n*\s*\(चणSखउ\)/gi, ''); // pre-decoded garbage just in case

  // Remove page numbers like -- 21 of 46 -- or -- 21 ेष 46 --
  text = text.replace(/--\s*\d+\s+(of|ेष)\s+\d+\s*--/gi, '');
  
  // Remove page footers like "22 12/MATH/M-2024-15/S-315-A" or "22 12/चअत/च-2024-15/S-315-ए"
  text = text.replace(/\n\s*\d+\s+\d+\/[^\n]+/g, '\n');
  
  return text;
}

/**
 * Detect whether a text block is Hindi or English.
 *
 * The bilingual PDFs interleave English and Hindi on alternating pages:
 *   English Q71-78, Hindi Q71-78, English Q79-86, Hindi Q79-86, etc.
 *
 * Hindi text in the parsed output often appears as:
 * - Actual Devanagari Unicode characters (U+0900–U+097F)
 * - "Garbled" transliterated characters from PDF encoding
 *   (containing sequences with {, }, ¶, §, ©, ñ, etc.)
 *
 * We detect language per question block, not per section.
 */
function detectBlockLanguage(block: string): Language {
  // Count Devanagari Unicode characters
  const devanagariCount = (block.match(/[\u0900-\u097F]/g) || []).length;
  if (devanagariCount > 3) return 'hi';

  // Detect garbled Hindi encoding patterns common in these PDFs
  // These characters appear frequently in the Hindi transliteration
  const garbledPatterns = /[¶§©ñÎÌÐÊ{}'«»‹›‹ÝÞåæ¡¢£¤¥¦¨ª¬®¯°±²³µ·¸¹º¼½¾]|H\$|Am¡|Cn¶|'|\u003c\u003e/g;
  const garbledCount = (block.match(garbledPatterns) || []).length;
  
  // If more than 5 garbled characters relative to block length, it's likely Hindi
  if (garbledCount > 5 && garbledCount / block.length > 0.02) return 'hi';

  return 'en';
}


/**
 * Parse questions (without answers) from PDF text in the given range.
 *
 * Expected PDF format:
 *   Q1. What is the capital of France?
 *   A. Berlin
 *   B. Madrid
 *   C. Paris
 *   D. Rome
 *
 *   Q2. ...
 *
 * Also supports: "1.", "1)", "Question 1." prefixes.
 *
 * The answer key section is expected after a line like:
 *   "Answer Key" or "Answers" or "ANSWER KEY"
 * Everything after that line is excluded from question parsing.
 *
 * @param language - 'en' for English, 'hi' for Hindi. Defaults to 'en'.
 */
export function parseQuestions(
  text: string,
  start: number,
  end: number,
  language: Language = 'en'
): Question[] {
  // Strip answer section
  const questionText = stripAnswerSection(text);

  const questions: Question[] = [];

  // Match question blocks: handles Q1., 1., 1), Question 1.  etc.
  const questionRegex =
    /(?:^|\n)\s*(?:Q(?:uestion)?\s*\.?\s*)?(\d+)[.)]\s*([\s\S]*?)(?=(?:(?:^|\n)\s*(?:Q(?:uestion)?\s*\.?\s*)?\d+[.)])|$)/gi;

  let match: RegExpExecArray | null;
  while ((match = questionRegex.exec(questionText)) !== null) {
    const num = parseInt(match[1], 10);
    if (num < start || num > end) continue;

    const block = match[2].trim();
    if (!block) continue;

    // Detect language of this question block and filter
    const blockLang = detectBlockLanguage(block);
    if (blockLang !== language) continue;

    const parsed = parseQuestionBlock(num, block);
    if (parsed) {
      if (language === 'hi') {
        parsed.text = decodeHindi(parsed.text);
        parsed.options = parsed.options.map((o) => {
          const m = o.match(/^([(\s]*[A-Ja-j][).:\s]+\s*)([\s\S]*)$/);
          if (m) {
            return m[1] + decodeHindi(m[2]);
          }
          return decodeHindi(o);
        });
      }
      questions.push(parsed);
    }
  }

  // Sort by question number
  questions.sort((a, b) => a.number - b.number);

  // Deduplicate — keep only the first occurrence of each question number
  const seen = new Set<number>();
  const deduplicated: Question[] = [];
  for (const q of questions) {
    if (!seen.has(q.number)) {
      seen.add(q.number);
      deduplicated.push(q);
    }
  }

  return deduplicated;
}

/**
 * Parse the answer key from the PDF text for the given question range.
 * Returns a map of questionNumber → correct option letter (e.g., "C").
 *
 * Answer keys are language-independent (just numbers and letters),
 * so no language parameter is needed.
 *
 * Expected answer key formats:
 *   1. C      or     1) C     or     Q1. C    or    1. (C)   or   1 - C
 */
export function parseAnswers(
  text: string,
  start: number,
  end: number
): Map<number, string> {
  const answers = new Map<number, string>();

  // Find the answer key section
  const answerSection = extractAnswerSection(text);
  if (!answerSection) {
    // Fallback: try to find inline answers in the full text
    return parseInlineAnswers(text, start, end);
  }

  // Check if we have multiple sets in tabular format
  const setHeaders = Array.from(answerSection.matchAll(/SET-([A-Z]) ANSWER KEY/gi));
  if (setHeaders.length > 0) {
    let targetSet = null;
    const setMatch = text.match(/Booklet Series\s*([A-Z])/i) || text.match(/([A-Z])\s*Serial No\./i);
    if (setMatch) {
      targetSet = setMatch[1].toUpperCase();
    }
    if (!targetSet) targetSet = setHeaders[0][1].toUpperCase();

    const targetSetIndex = setHeaders.findIndex(h => h[1].toUpperCase() === targetSet);
    if (targetSetIndex !== -1) {
      const lines = answerSection.split('\n');
      for (const line of lines) {
        const pairs = Array.from(line.matchAll(/\b(\d+)\s+([A-Ea-e])\b/g));
        if (pairs.length > targetSetIndex) {
          const pair = pairs[targetSetIndex];
          const num = parseInt(pair[1], 10);
          if (num >= start && num <= end) {
            answers.set(num, pair[2].toUpperCase());
          }
        }
      }
      if (answers.size > 0) return answers;
    }
  }

  // Match patterns like: 1. C, 1) C, Q1. C, 1 - C, 1. (C), 1.(C), 1 C
  const answerRegex =
    /(?:Q(?:uestion)?\s*\.?\s*)?(\d+)\s*[.):\-–\s]+\s*\(?([A-Ea-e])\)?/gi;

  let match: RegExpExecArray | null;
  while ((match = answerRegex.exec(answerSection)) !== null) {
    const num = parseInt(match[1], 10);
    if (num >= start && num <= end) {
      answers.set(num, match[2].toUpperCase());
    }
  }

  return answers;
}

/* ─── Internal helpers ─── */

/**
 * Remove the answer key section from text, returning only question content.
 */
function stripAnswerSection(text: string): string {
  const idx = findAnswerKeyIndex(text);
  if (idx === -1) return text;
  return text.substring(0, idx);
}

/**
 * Extract only the answer key section.
 */
function extractAnswerSection(text: string): string | null {
  const idx = findAnswerKeyIndex(text);
  if (idx === -1) return null;
  return text.substring(idx);
}

/**
 * Find the character index where the answer key section begins.
 */
function findAnswerKeyIndex(text: string): number {
  const markers = [
    /answer\s*key/i,
    /\banswers?\b\s*[:]/i,
    /\bcorrect\s+answers?\b/i,
    /\bsolution(?:s)?\b\s*[:]/i,
  ];

  for (const marker of markers) {
    const match = marker.exec(text);
    if (match) return match.index;
  }

  return -1;
}

/**
 * Parse a single question block into a Question object.
 * The block contains the question text followed by options A–D.
 */
function parseQuestionBlock(num: number, block: string): Question | null {
  // Try to split out options: A., A), (A), a., a) etc. (up to 10 options, A-J)
  const optionRegex = /(?<=\s|^)\(?([A-Ja-j])\)?\s*[.):]\s+/g;

  // Find all option positions
  const optionPositions: { letter: string; index: number }[] = [];
  let optMatch: RegExpExecArray | null;
  while ((optMatch = optionRegex.exec(block)) !== null) {
    optionPositions.push({
      letter: optMatch[1].toUpperCase(),
      index: optMatch.index,
    });
  }

  // We need at least 2 options to consider this a valid question
  if (optionPositions.length < 2) {
    // Treat whole block as question text with no parseable options
    return {
      number: num,
      text: block,
      options: [],
    };
  }

  const questionText = block.substring(0, optionPositions[0].index).trim();
  const options: string[] = [];

  for (let i = 0; i < optionPositions.length; i++) {
    const start = optionPositions[i].index;
    const end =
      i + 1 < optionPositions.length
        ? optionPositions[i + 1].index
        : block.length;
    let optionText = block.substring(start, end).trim();

    // Remove trailing answer key section or garbage footers if accidentally included
    optionText = optionText.replace(/(\b(?:answer key|space for rough|rough work|रफ कार्य|SPअउए FजR|रμ’\$|प्रíन-पुpस्तका|महÎवपूर्ण अनुदेश>).*)[\s\S]*/i, '').trim();

    options.push(optionText);
  }

  return {
    number: num,
    text: questionText,
    options,
  };
}

/**
 * Fallback: try to extract answers that appear inline with questions
 * (e.g., "Answer: C" right after each question block).
 */
function parseInlineAnswers(
  text: string,
  start: number,
  end: number
): Map<number, string> {
  const answers = new Map<number, string>();

  // Pattern: "Answer: C" or "Ans: C" or "Correct: C"
  const inlineRegex =
    /(?:Q(?:uestion)?\s*\.?\s*)?(\d+)[.)]\s*[\s\S]*?(?:answer|ans|correct)\s*[:=]\s*\(?([A-Da-d])\)?/gi;

  let match: RegExpExecArray | null;
  while ((match = inlineRegex.exec(text)) !== null) {
    const num = parseInt(match[1], 10);
    if (num >= start && num <= end) {
      answers.set(num, match[2].toUpperCase());
    }
  }

  return answers;
}

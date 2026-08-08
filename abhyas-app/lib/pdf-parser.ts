import { PDFParse } from 'pdf-parse';
import { Question } from './types';

/**
 * Extract raw text content from a PDF buffer.
 */
export async function extractText(pdfBuffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(pdfBuffer) });
  const result = await parser.getText();
  return result.text ?? '';
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
 */
export function parseQuestions(
  text: string,
  start: number,
  end: number
): Question[] {
  // Split off the answer key section if present
  const questionText = stripAnswerSection(text);

  const questions: Question[] = [];

  // Match question blocks: handles Q1., 1., 1), Question 1.  etc.
  const questionRegex =
    /(?:Q(?:uestion)?\s*\.?\s*)?(\d+)[.)]\s*([\s\S]*?)(?=(?:(?:Q(?:uestion)?\s*\.?\s*)?\d+[.)])|$)/gi;

  let match: RegExpExecArray | null;
  while ((match = questionRegex.exec(questionText)) !== null) {
    const num = parseInt(match[1], 10);
    if (num < start || num > end) continue;

    const block = match[2].trim();
    if (!block) continue;

    const parsed = parseQuestionBlock(num, block);
    if (parsed) questions.push(parsed);
  }

  // Sort by question number
  questions.sort((a, b) => a.number - b.number);

  return questions;
}

/**
 * Parse the answer key from the PDF text for the given question range.
 * Returns a map of questionNumber → correct option letter (e.g., "C").
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

  // Match patterns like: 1. C, 1) C, Q1. C, 1 - C, 1. (C), 1.(C)
  const answerRegex =
    /(?:Q(?:uestion)?\s*\.?\s*)?(\d+)\s*[.):\-–]\s*\(?([A-Da-d])\)?/gi;

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
  // Try to split out options: A., A), (A), a., a) etc.
  const optionRegex = /\(?([A-Da-d])\)?\s*[.):\s]\s*/g;

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
    const optionText = block.substring(start, end).trim();
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

import pdfParse from 'pdf-parse';
import { Question } from './types';
import { decodeHindi } from './hindi-decode';
import { applyHindiCorrections } from './hindi-corrections';

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

  // Detect specific Kruti Dev words and glyphs common in Indian competitive exam PDFs
  if (/Cn`|Cn¶|Cn\x27|Cn`w|उपर्युक्त|Zht|H\$[mso]|gß|Òda|amJ|Vmb|h°|h¢|Am°a|Am`o|nwpÒVH\$m|dJuH\$aU|J´m_|J ́m_|_‹`|CŒma|drjH|A\x5C\x27sH|CÂ_rXdma|AZwXoe|‡ÌZ|loUr|nwaÒH\$ma|dV©Zr/i.test(block)) return 'hi';

  const krutiDevGlyphs = (block.match(/[¶§©ñÎÌÐÊ«»‹›ÝÞåæ¡¢£¤¥¦¨ª¬®¯°±²³µ·¸¹º¼½¾À-ÖØ-öø-ÿ‡•∫]/g) || []).length;
  if (krutiDevGlyphs >= 2) return 'hi';

  return 'en';
}

/**
 * Parse questions (without answers) from PDF text in the given range.
 *
 * Handles single/multi-column layouts, inner numbered lists (sub-points in match-the-column questions),
 * English, Hindi (Unicode & Kruti Dev), and hybrid language papers.
 *
 * @param language - 'en' for English, 'hi' for Hindi. Defaults to 'en'.
 */
export function parseQuestions(
  text: string,
  start: number,
  end: number,
  language: Language = 'en'
): Question[] {
  // Strip answer section and cover page instructions
  let questionText = stripAnswerSection(text);
  questionText = stripInstructionsSection(questionText);

  // Match question blocks: handles Q1., 1., 1), Question 1., E-1., H-1. etc.
  const questionRegex =
    /(?:^|\n)\s*(?:Q(?:uestion)?\s*\.?\s*|[EH]-)?(\d+)[.)]\s*([\s\S]*?)(?=(?:(?:^|\n)\s*(?:Q(?:uestion)?\s*\.?\s*|[EH]-)?\d+[.)])|$)/gi;

  const rawMatches: { num: number; rawText: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = questionRegex.exec(questionText)) !== null) {
    const num = parseInt(match[1], 10);
    rawMatches.push({
      num,
      rawText: match[2].trim(),
    });
  }

  const allParsed: { question: Question; lang: Language }[] = [];

  for (let i = 0; i < rawMatches.length; i++) {
    const item = rawMatches[i];
    if (item.num < 1 || item.num > 150) continue;
    if (item.num < start || item.num > end) continue;

    let parsed = parseQuestionBlock(item.num, item.rawText);
    if (parsed) {
      const blockLang = detectBlockLanguage(parsed.text + ' ' + parsed.options.join(' '));
      allParsed.push({ question: parsed, lang: blockLang });
    } else {
      // Look ahead to merge with fragmented sub-lists (e.g. Q55/56 with inner numbered items 1..4)
      let combinedText = item.rawText;
      let foundParsed: Question | null = null;
      for (let j = i + 1; j < Math.min(i + 8, rawMatches.length); j++) {
        combinedText += '\n' + rawMatches[j].num + '. ' + rawMatches[j].rawText;
        const testParsed = parseQuestionBlock(item.num, combinedText);
        if (testParsed) {
          foundParsed = testParsed;
          i = j; // skip forward past merged inner fragments
          break;
        }
      }
      if (foundParsed) {
        const blockLang = detectBlockLanguage(foundParsed.text + ' ' + foundParsed.options.join(' '));
        allParsed.push({ question: foundParsed, lang: blockLang });
      }
    }
  }

  const questions: Question[] = [];

  // For each question in the range [start, end], select the target language or best available
  for (let n = start; n <= end; n++) {
    const matching = allParsed.filter((item) => item.question.number === n);
    if (matching.length === 0) continue;

    // Prefer exact language match; if not available (e.g. English comprehension section in Hindi exam), fallback to the available one
    const targetMatch = matching.find((item) => item.lang === language) || matching[0];
    const finalQ: Question = {
      number: targetMatch.question.number,
      text: targetMatch.question.text,
      options: [...targetMatch.question.options],
    };

    if (targetMatch.lang === 'hi' || (language === 'hi' && targetMatch.lang !== 'en')) {
      finalQ.text = applyHindiCorrections(decodeHindi(finalQ.text));
      finalQ.options = finalQ.options.map((o) => {
        const m = o.match(/^([(\s]*[A-Ja-j][).:\s]*)([\s\S]*)$/);
        if (m) {
          return m[1] + applyHindiCorrections(decodeHindi(m[2]));
        }
        return applyHindiCorrections(decodeHindi(o));
      });
    }

    questions.push(finalQ);
  }

  // Sort by question number
  questions.sort((a, b) => a.number - b.number);

  return questions;
}

/**
 * Parse the answer key from the PDF text for the given question range.
 * Returns a map of questionNumber → correct option letter (e.g., "C").
 *
 * Answer keys are language-independent (just numbers and letters),
 * so no language parameter is needed.
 *
 * Expected answer key formats:
 *   1. C      or     1) C     or     Q1. C    or    1. (C)   or   1 - C   or   E-1. C
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
        const pairs = Array.from(line.matchAll(/(?:[EH]-)?(\d+)\s*[.):\-–\s]*\s*([A-Ea-e])/gi));
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

  // Match patterns like: 1. C, 1) C, Q1. C, 1 - C, 1. (C), 1.(C), 1 C, 71C, E-1. C
  const answerRegex =
    /(?:Q(?:uestion)?\s*\.?\s*|[EH]-)?(\d+)\s*[.):\-–\s]*\s*\(?([A-Ea-e])\)?/gi;

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
 * Remove the answer key section and back-cover instruction pages from text.
 */
function stripAnswerSection(text: string): string {
  const endMarkers = [
    /(?:FINAL|PROVISIONAL|2ND\s+PROVISIONAL)?\s*ANSWER\s*KEY/i,
    /SET-[A-Z]\s*ANSWER\s*KEY/i,
    /mÙkjkyk/i, // उत्तरमाला in Kruti Dev
    /['_‘`’"“”]?h[ÎŒ]dnyU©\s*AZwXoe/i, // महत्वपूर्ण अनुदेश in Kruti Dev
    /महत्वपूर्ण\s*अनुदेश/i,
    /Note\s*:\s*English version of the instructions is printed on the First Page/i,
    /SPACE\s*FOR\s*ROUGH\s*WORK/i,
    /aµ?\$?\s*H\$m`©\s*Ho\$\s*\{bE\s*ÒWmZ/i,
  ];

  let minIdx = -1;
  for (const marker of endMarkers) {
    const match = marker.exec(text);
    if (match && match.index > 5000) {
      if (minIdx === -1 || match.index < minIdx) {
        minIdx = match.index;
      }
    }
  }

  if (minIdx === -1) return text;
  return text.substring(0, minIdx);
}

/**
 * Remove cover page / "Important Instructions" before the actual exam begins.
 */
function stripInstructionsSection(text: string): string {
  const startMarkers = [
    /(?:^|\n)\s*Directions\s*\(Q\.\s*Nos\./i,
    /(?:^|\n)\s*[EH]-1\./i,
    /(?:^|\n)\s*Q(?:uestion)?\s*\.?\s*1[.)]/i,
    /(?:^|\n)\s*1[.)]\s+[A-Z\u0080-\uFFFF]/i,
    /(?:^|\n)\s*PART\s*[-–—]\s*I\s*(?:\n|\()/i,
  ];

  for (const marker of startMarkers) {
    const m = marker.exec(text);
    if (m && m.index > 500 && m.index < 10000) {
      return text.substring(m.index);
    }
  }

  return text;
}

/**
 * Detect whether a parsed block or text is part of the examination instructions.
 */
function isInstructionBlock(text: string): boolean {
  const norm = text.replace(/\s+/g, ' ');
  if (/question booklet is divided|àíZ-nwpñVH\$m\s*VrZ\s*\^mJm|प्रश्न-पुस्तिका\s*तीन\s*भागों|दो\s*भागों\s*में\s*विभाजित/i.test(norm)) return true;
  if (/important instructions|‘hÎdnyU©\s*AZwXoe|महत्वपूर्ण\s*अनुदेश|महत्वपूर्ण\s*निर्देश/i.test(norm)) return true;
  if (/read the following instructions|निर्देशों को ध्यानपूर्वक|AZwXoem| Ho$ CÎma/i.test(norm)) return true;
  if (/candidates must assure|narjm\s*\^dZ\s*N>mo|परीक्षा\s*भवन\s*छोड़ने/i.test(norm)) return true;
  if (/immediately after commencement|narjm\s*àmap‘\^|परीक्षा\s*प्रारंभ\s*होने/i.test(norm)) return true;
  if (/answer sheet will be supplied|OMR\s*sheet|self adhesive ldpe bag|LDPE Bag/i.test(norm)) return true;
  if (/english version of the instructions is printed|printed on the first page/i.test(norm)) return true;
  if (/printed pages including|rough work|रफ कार्य|a’\$ H\$m¶©/i.test(norm)) return true;
  return false;
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
    /(?:FINAL|PROVISIONAL|2ND\s+PROVISIONAL)?\s*ANSWER\s*KEY/i,
    /SET-[A-Z]\s*ANSWER\s*KEY/i,
    /mÙkjkyk/i, // उत्तरमाला (Uttarmala) in Kruti Dev
    /mÙkj\s*[:\-]/i, // उत्तर: (Uttar:) in Kruti Dev
  ];

  for (const marker of markers) {
    const match = marker.exec(text);
    if (match) return match.index;
  }

  return -1;
}

/**
 * Parse a single question block into a Question object.
 * The block contains the question text followed by options A–E.
 */
function parseQuestionBlock(num: number, block: string): Question | null {
  // Match options: strictly (A), (B), (C), (D), (E) or A., B., C., D., E.
  // Handles letters even without whitespace after parenthesis (e.g. `(C)`moJoe` or `(A){~_b`)
  const optionRegex = /(?<=\s|^)(?:\(([A-Ea-e])\)|\b([A-Ea-e])\s*[.):])\s*(?!\.m\b)/g;

  const rawPositions: { letter: string; index: number }[] = [];
  let optMatch: RegExpExecArray | null;
  while ((optMatch = optionRegex.exec(block)) !== null) {
    const letter = (optMatch[1] || optMatch[2]).toUpperCase();
    rawPositions.push({
      letter,
      index: optMatch.index,
    });
  }

  // Filter positions to enforce strictly sequential option letters: A -> B -> C -> D (-> E)
  const expectedLetters = ['A', 'B', 'C', 'D', 'E'];
  const optionPositions: { letter: string; index: number }[] = [];
  let expectedIdx = 0;

  for (const pos of rawPositions) {
    if (pos.letter === expectedLetters[expectedIdx]) {
      optionPositions.push(pos);
      expectedIdx++;
      if (expectedIdx >= 5) break; // Max 5 options (A to E)
    }
  }

  // We need at least 2 options to consider this a valid question
  if (optionPositions.length < 2) {
    return null;
  }

  const questionText = block.substring(0, optionPositions[0].index).trim();
  if (isInstructionBlock(questionText)) return null;

  const options: string[] = [];

  for (let i = 0; i < optionPositions.length; i++) {
    const start = optionPositions[i].index;
    const end =
      i + 1 < optionPositions.length
        ? optionPositions[i + 1].index
        : block.length;
    let optionText = block.substring(start, end).trim();

    // Remove trailing answer key section, P.T.O markers or garbage footers if accidentally included
    optionText = optionText.replace(/\[?\s*P\.?\s*T\.?\s*O\.?\s*\]?/gi, '');
    optionText = optionText.replace(/(\b(?:answer key|space for rough|rough work|रफ कार्य|SPअउए FजR|रμ’\$|प्रíन-पुpस्तका|महÎवपूर्ण अनुदेश>).*)[\s\S]*/i, '').trim();
    optionText = optionText.replace(/\n+\s*\d{1,3}\s*\/\s*[A-Z\u0080-\uFFFF\-–—0-9\/() ]+\s*$/gi, '').trim();

    options.push(optionText);
  }

  const cleanedQuestionText = questionText.replace(/\[?\s*P\.?\s*T\.?\s*O\.?\s*\]?/gi, '').trim();

  return {
    number: num,
    text: cleanedQuestionText,
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
    /(?:Q(?:uestion)?\s*\.?\s*)?(\d+)[.)]\s*[\s\S]*?(?:answer|ans|correct)\s*[:=]\s*\(?([A-Ea-e])\)?/gi;

  let match: RegExpExecArray | null;
  while ((match = inlineRegex.exec(text)) !== null) {
    const num = parseInt(match[1], 10);
    if (num >= start && num <= end) {
      answers.set(num, match[2].toUpperCase());
    }
  }

  return answers;
}

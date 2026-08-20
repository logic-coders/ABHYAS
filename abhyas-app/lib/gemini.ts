/**
 * Lightweight Gemini AI utility for:
 * 1. Translating manual quiz questions to Hindi
 * 2. (Future) Auto-generating streak quiz questions
 *
 * Uses Google Gemini API (free tier) to conserve resources.
 */

import { ManualQuestion, Subject } from './types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent';

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
}

/**
 * Calls Gemini API with a prompt and returns the text response.
 */
async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('Gemini API error:', res.status, errBody);
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data: GeminiResponse = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No text in Gemini response');
  }

  return text.trim();
}

/**
 * Translate an array of ManualQuestions from English to Hindi using Google Translate API (fast).
 * Returns translated questions with the same structure.
 */
export async function translateQuestionsToHindi(
  questions: ManualQuestion[]
): Promise<ManualQuestion[]> {
  if (questions.length === 0) return questions;

  try {
    // We use a delimiter that translation models usually preserve
    const DELIMITER = ' ||| ';
    const textsToTranslate: string[] = [];

    questions.forEach(q => {
      textsToTranslate.push(q.text);
      q.options.forEach(opt => {
        const cleanOpt = opt.replace(/^[(\s]*[A-Ja-j][).:\s]+\s*/, '').trim();
        textsToTranslate.push(cleanOpt);
      });
    });

    // Chunking to avoid URL length limits
    const CHUNK_SIZE = 25;
    const translatedTexts: string[] = [];

    for (let i = 0; i < textsToTranslate.length; i += CHUNK_SIZE) {
      const chunk = textsToTranslate.slice(i, i + CHUNK_SIZE);
      const combined = chunk.join(DELIMITER);
      
      const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(combined)}`);
      
      if (!res.ok) {
        throw new Error(`Translation API error: ${res.status}`);
      }
      
      const data = await res.json();
      // Google Translate returns an array of chunks if the text is long
      const translatedCombined = data[0].map((item: any) => item[0]).join('');
      
      // Split back by delimiter (Google might add spaces around it)
      const splits = translatedCombined.split(/\s*\|\|\|\s*/);
      translatedTexts.push(...splits);
    }

    // Reconstruct the objects
    let pointer = 0;
    return questions.map(q => {
      const text = translatedTexts[pointer++] || q.text;
      const options = q.options.map((opt) => translatedTexts[pointer++] || opt);
      
      return {
        number: q.number,
        text,
        options,
        correctAnswer: q.correctAnswer,
      };
    });
  } catch (error) {
    console.error('Failed to translate questions to Hindi:', error);
    return questions; // Graceful fallback
  }
}

/**
 * Generate 20 quiz questions for a given subject using Gemini AI.
 * Used for the Daily Streak Quiz auto-generation.
 */
export async function generateStreakQuestions(subject: Subject): Promise<ManualQuestion[]> {
  const prompt = `You are an expert quiz question creator for competitive exam preparation in India.

Generate exactly 20 multiple-choice questions for the subject: "${subject}".
Each question should be at an intermediate difficulty level, suitable for competitive exam aspirants.
Questions should cover a broad range of sub-topics within ${subject}.

Return ONLY a valid JSON array (no markdown, no code fences, no explanation):
[
  {
    "number": 1,
    "text": "Question text here",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    "correctAnswer": "B"
  },
  ...
]

Rules:
- Each question must have exactly 4 options labeled A, B, C, D
- The correctAnswer must be one of "A", "B", "C", or "D"
- Questions should be factually accurate
- Options should be plausible (no obviously wrong distractors)
- Vary the position of the correct answer across questions
- Do NOT repeat questions or make trivially similar ones
- Return exactly 20 questions`;

  const rawResponse = await callGemini(prompt);

  // Extract JSON
  let jsonStr = rawResponse;
  const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  const questions: ManualQuestion[] = JSON.parse(jsonStr);

  if (!Array.isArray(questions) || questions.length < 10) {
    throw new Error(`Expected 20 questions, got ${questions?.length || 0}`);
  }

  // Ensure proper numbering and structure
  return questions.slice(0, 20).map((q, idx) => ({
    number: idx + 1,
    text: q.text,
    options: q.options.slice(0, 4),
    correctAnswer: q.correctAnswer,
  }));
}

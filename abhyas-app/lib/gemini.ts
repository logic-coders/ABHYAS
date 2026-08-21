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
    const CHUNK_SIZE = 20;
    const translatedQuestions: ManualQuestion[] = [];

    // Create an array of chunked promises for parallel processing
    const promises = [];
    for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
      const chunk = questions.slice(i, i + CHUNK_SIZE);
      
      const prompt = `You are an expert academic translator specializing in Indian competitive exams.
Translate the following multiple-choice questions from English to Hindi.

Rules:
1. Ensure mathematical, scientific, and technical terms are accurately translated into formal academic Hindi.
2. Preserve all mathematical formulas, equations, numbers, and Latin/Greek symbols exactly as they are.
3. Translate ONLY the 'text' string and the strings inside the 'options' array.
4. Do NOT translate the 'correctAnswer' or 'number' fields.
5. Return EXACTLY the same JSON structure as provided.
6. Provide ONLY the final JSON array in your response, with no markdown, no code blocks, and no extra text.

Here is the JSON array of questions to translate:
${JSON.stringify(chunk, null, 2)}`;

      promises.push(
        callGemini(prompt).then((rawResponse) => {
          let jsonStr = rawResponse;
          const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
          return JSON.parse(jsonStr) as ManualQuestion[];
        })
      );
    }

    // Wait for all chunks to finish translating
    const chunkResults = await Promise.all(promises);

    // Flatten results
    for (const resChunk of chunkResults) {
      translatedQuestions.push(...resChunk);
    }

    // Ensure all questions translated properly, and clean up options
    if (translatedQuestions.length !== questions.length) {
      console.warn(`Translation length mismatch: expected ${questions.length}, got ${translatedQuestions.length}`);
    }

    return translatedQuestions.map(q => ({
      number: q.number,
      text: q.text,
      options: q.options.map(opt => opt.replace(/^[(\s]*[A-Ja-j][).:\s]+\s*/, '').trim()),
      correctAnswer: q.correctAnswer,
    }));
  } catch (error) {
    console.error('Failed to translate questions to Hindi via LLM:', error);
    return questions; // Graceful fallback to English if translation fails
  }
}

/**
 * Extract exact questions from raw PDF text using Gemini AI.
 * This does deep analysis to correctly identify the question numbers, text, and options,
 * even when special characters and encoding artifacts are present (like Hindi Kruti Dev/DevLys).
 */
export async function extractQuestionsWithLLM(
  text: string,
  start: number,
  end: number,
  language: string
): Promise<Question[]> {
  try {
    const prompt = `You are an expert data extractor and OCR text corrector for Indian competitive exams.
I have extracted raw text from a PDF containing multiple-choice questions. 
The text might contain garbled characters, formatting issues, or mixed English/Hindi content.

Task:
1. Extract questions numbered exactly from ${start} to ${end}.
2. The target language for extraction is: ${language === 'hi' ? 'Hindi' : 'English'}. If the PDF is bilingual, only extract the ${language === 'hi' ? 'Hindi' : 'English'} version of the questions.
3. Fix any garbled characters, typos, and font artifacts (e.g., legacy font encodings in Hindi) to form correct academic words.
4. Preserve all mathematical formulas, numbers, equations, and Latin/Greek symbols exactly as they are.
5. Identify exactly 4 options for each question, stripping out any '(A)', '(B)' prefixes from the option text itself.
6. Do NOT include the answer key or any explanation.

Return ONLY a valid JSON array of objects with this structure (no markdown, no extra text):
[
  {
    "number": 1,
    "text": "Question text...",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
  }
]

Here is the raw PDF text:
"""
${text}
"""`;

    // Wait, the text can be huge, but Gemini Flash has 1M context. Let's send it.
    const rawResponse = await callGemini(prompt);
    
    let jsonStr = rawResponse;
    const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    let questions = JSON.parse(jsonStr) as Question[];
    
    // Ensure we only return questions within start and end
    questions = questions.filter(q => q.number >= start && q.number <= end);
    
    // Clean up option prefixes if LLM missed it
    return questions.map(q => ({
      number: q.number,
      text: q.text,
      options: (q.options || []).map(opt => opt.replace(/^[(\s]*[A-Ja-j][).:\s]+\s*/, '').trim()),
    }));
  } catch (error) {
    console.error('Failed to extract questions via LLM:', error);
    return []; // Return empty so fallback can happen if necessary
  }
}

/**
 * Clean up garbled Hindi text extracted from PDFs (Kruti Dev/DevLys artifacts) using Gemini AI.
 * This runs on PDF test extractions when language is Hindi.
 */
export async function cleanGarbledHindiQuestions(
  questions: Question[]
): Promise<Question[]> {
  if (questions.length === 0) return questions;

  try {
    const CHUNK_SIZE = 20;
    const cleanedQuestions: Question[] = [];
    const promises = [];

    for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
      const chunk = questions.slice(i, i + CHUNK_SIZE);
      
      const prompt = `You are an expert Hindi proofreader and editor.
The following JSON array contains multiple-choice questions in Hindi extracted from a PDF.
Due to legacy font encodings (like Kruti Dev) and PDF extraction issues, the text contains garbled characters and artifacts such as 'ê', 'f', 'Û०रा', 'क्‌म', 'र,ु', 'मा°', etc.

Rules:
1. Fix all garbled characters, typos, and font artifacts to form correct academic Hindi words (e.g. 'Û०रा' -> 'द्वारा', 'êप' -> 'रूप', 'fूल' -> 'फूल', 'कृ्‌या' -> 'क्रिया', 'र,ु' -> 'वृंद').
2. Do NOT translate the questions. They are already in Hindi. Just correct the spelling/artifacts.
3. Preserve all mathematical formulas, numbers, equations, and Latin/Greek symbols exactly as they are.
4. Correct ONLY the 'text' string and the strings inside the 'options' array.
5. Do NOT modify the 'number' field.
6. Return EXACTLY the same JSON structure as provided.
7. Provide ONLY the final JSON array in your response, with no markdown, no code blocks, and no extra text.

Here is the JSON array of questions to clean:
${JSON.stringify(chunk, null, 2)}`;

      promises.push(
        callGemini(prompt).then((rawResponse) => {
          let jsonStr = rawResponse;
          const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
          return JSON.parse(jsonStr) as Question[];
        })
      );
    }

    const chunkResults = await Promise.all(promises);

    for (const resChunk of chunkResults) {
      cleanedQuestions.push(...resChunk);
    }

    if (cleanedQuestions.length !== questions.length) {
      console.warn(`Cleaning length mismatch: expected ${questions.length}, got ${cleanedQuestions.length}`);
    }

    // Return cleaned results, stripping out ABC prefixes from options just in case
    return cleanedQuestions.map(q => ({
      number: q.number,
      text: q.text,
      options: (q.options || []).map(opt => opt.replace(/^[(\s]*[A-Ja-j][).:\s]+\s*/, '').trim()),
    }));
  } catch (error) {
    console.error('Failed to clean Hindi questions via LLM:', error);
    return questions; // Graceful fallback to regex-only cleaned questions
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

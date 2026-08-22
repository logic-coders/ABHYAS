import { BilingualQuestion } from '@/lib/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent';

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
}

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
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('Gemini verification API error:', res.status, errBody);
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data: GeminiResponse = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No text in Gemini verification response');
  }

  return text.trim();
}

/**
 * Runs LLM verification on a chunk of bilingual questions.
 */
async function verifyChunkWithLLM(chunk: BilingualQuestion[]): Promise<BilingualQuestion[]> {
  const prompt = `You are an expert academic test verification and proofreading assistant for bilingual Indian competitive exams.
I have parsed a batch of bilingual questions (English and Hindi) and answer key mappings extracted from TXT files.

Your Task:
1. Verify English-Hindi Alignment: Ensure English Question N corresponds to Hindi Question N (check that they are translations of each other and not mismatched).
2. Clean Minor Extraction Artifacts:
   - Strip any residual prefixes like '(a)', '(b)', 'A.', '(क)', '(ख)' from inside the option texts if present.
   - Clean up accidental multi-line breaks, leading/trailing whitespace, or merged words.
3. Check for Structural Defects:
   - If an option was accidentally merged into the question text, extract it.
   - If option counts differ, question content is broken, or answer key mapping has a conflict, note it in the "issues" array.
4. Verify Answer Key Consistency:
   - Check if 'correctAnswer' (e.g. "A", "B", "C", "D", "E") is valid for the options present.
5. STRICT CONTENT PRESERVATION RULE:
   - DO NOT rewrite, rephrase, or change the original meaning, facts, terminology, formulas, equations, numbers, or correct answers.
   - DO NOT guess or alter the 'correctAnswer'. If a conflict exists, leave it and add a note in 'issues'.
   - Only perform structural, formatting, and minor typo/artifact cleanups.
6. Set status:
   - "verified" if question text, options, English-Hindi alignment, and answers are sound.
   - "warning" if minor non-critical discrepancy exists.
   - "error" if English and Hindi questions are completely mismatched, empty, or have missing options/answers.

Return ONLY a valid JSON array of objects with this exact structure (no markdown, no code fences):
[
  {
    "number": 1,
    "english": {
      "text": "English question statement",
      "options": ["Option a", "Option b", "Option c", "Option d", "Option e"]
    },
    "hindi": {
      "text": "Hindi question statement",
      "options": ["विकल्प a", "विकल्प b", "विकल्प c", "विकल्प d", "विकल्प e"]
    },
    "correctAnswer": "A",
    "status": "verified",
    "issues": []
  }
]

Here is the JSON batch of questions to verify:
${JSON.stringify(chunk, null, 2)}`;

  const rawResponse = await callGemini(prompt);
  
  let jsonStr = rawResponse;
  const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  const verifiedChunk = JSON.parse(jsonStr) as BilingualQuestion[];
  return verifiedChunk;
}

/**
 * Verifies and refines all matched bilingual questions using Google Gemini.
 * Processes in chunks of 20 questions in parallel.
 * Falls back gracefully to original matched questions if Gemini is unavailable.
 */
export async function reverifyQuestionsWithLLM(
  questions: BilingualQuestion[]
): Promise<BilingualQuestion[]> {
  if (!questions || questions.length === 0) return [];
  
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not configured. Skipping LLM verification step.');
    return questions;
  }

  try {
    const CHUNK_SIZE = 20;
    const promises: Promise<BilingualQuestion[]>[] = [];

    for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
      const chunk = questions.slice(i, i + CHUNK_SIZE);
      promises.push(
        verifyChunkWithLLM(chunk).catch((err) => {
          console.error(`LLM verification failed for chunk starting at Q${chunk[0]?.number}:`, err);
          return chunk; // Fallback to raw chunk on error
        })
      );
    }

    const chunkResults = await Promise.all(promises);
    const verifiedQuestions: BilingualQuestion[] = [];

    for (const chunk of chunkResults) {
      verifiedQuestions.push(...chunk);
    }

    // If chunk returned different count, map back safely
    if (verifiedQuestions.length !== questions.length) {
      console.warn(
        `LLM verification count discrepancy: input ${questions.length}, output ${verifiedQuestions.length}. Merging.`
      );
      return questions.map((orig, idx) => {
        const verified = verifiedQuestions.find((v) => v.number === orig.number);
        return verified || orig;
      });
    }

    return verifiedQuestions;
  } catch (error) {
    console.error('LLM reverification process encountered an error:', error);
    return questions; // Graceful fallback
  }
}

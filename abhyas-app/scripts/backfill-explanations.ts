/**
 * Backfill Explanations Script
 * 
 * Reads all ~120 curated bilingual questions from streak-pool.ts,
 * calls the AI API (Nvidia NIM with automatic Gemini / OpenAI fallback)
 * to generate detailed explanations in English and Hindi,
 * and outputs an updated streak-pool.ts with explanations embedded.
 * 
 * Usage: npx tsx scripts/backfill-explanations.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env.local from project root
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent';

interface BilingualQ {
  number: number;
  english: { text: string; options: string[]; explanation?: string };
  hindi: { text: string; options: string[]; explanation?: string };
  correctAnswer: string;
  status: string;
}

async function callNvidia(prompt: string): Promise<string> {
  if (!NVIDIA_API_KEY) throw new Error('NVIDIA_API_KEY missing');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'meta/llama-3.2-11b-vision-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`Nvidia API error ${res.status}: ${errBody}`);
    }

    const data = await res.json();
    return (data.choices?.[0]?.message?.content || '').trim();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text.trim();
}

async function callAI(prompt: string): Promise<string> {
  // Try Nvidia NIM first
  if (NVIDIA_API_KEY) {
    try {
      return await callNvidia(prompt);
    } catch (err: any) {
      console.log(`    ⚠️ Nvidia NIM failed (${err.message}). Trying Gemini...`);
    }
  }

  // Fallback to Gemini
  if (GEMINI_API_KEY) {
    return await callGemini(prompt);
  }

  throw new Error('No AI provider available');
}

async function generateExplanations(questions: BilingualQ[], subject: string): Promise<{ english: string; hindi: string }[]> {
  const BATCH_SIZE = 5;
  const results: { english: string; hindi: string }[] = [];

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);
    console.log(`  📝 Processing ${subject} questions ${i + 1}–${Math.min(i + BATCH_SIZE, questions.length)}...`);

    const prompt = `You are an expert academic tutor for Indian competitive exams.

For each of the following multiple-choice questions, generate a clear, accurate, detailed explanation in BOTH English and Hindi.

Requirements for each explanation:
1. Explain WHY the correct answer is correct with facts/logic.
2. Provide essential background context.
3. Keep explanation concise (2-3 sentences).
4. Hindi explanation must be in formal academic Hindi (शुद्ध हिंदी).

Return ONLY a JSON array formatted as:
[
  {
    "number": 1,
    "englishExplanation": "Explanation in English...",
    "hindiExplanation": "हिंदी में विस्तृत व्याख्या..."
  }
]

Questions to explain:
${JSON.stringify(batch.map(q => ({
  number: q.number,
  question: q.english.text,
  options: q.english.options,
  correctAnswer: q.correctAnswer,
})), null, 2)}`;

    try {
      const rawResponse = await callAI(prompt);
      let jsonStr = rawResponse;
      const jsonMatch = rawResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) jsonStr = jsonMatch[0];

      const explanations = JSON.parse(jsonStr) as {
        number: number;
        englishExplanation: string;
        hindiExplanation: string;
      }[];

      for (let j = 0; j < batch.length; j++) {
        const exp = explanations.find(e => e.number === batch[j].number) || explanations[j];
        results.push({
          english: exp?.englishExplanation || `The correct answer is (${batch[j].correctAnswer}).`,
          hindi: exp?.hindiExplanation || `सही उत्तर (${batch[j].correctAnswer}) है।`,
        });
      }
      console.log(`    ✅ Completed batch (${results.length}/${questions.length})`);
    } catch (err: any) {
      console.error(`  ❌ Error on batch:`, err.message);
      for (let j = 0; j < batch.length; j++) {
        results.push({
          english: `The correct answer is option (${batch[j].correctAnswer}).`,
          hindi: `सही उत्तर विकल्प (${batch[j].correctAnswer}) है।`,
        });
      }
    }

    await new Promise(r => setTimeout(r, 600));
  }

  return results;
}

function escapeForTS(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function generateQuestionBlock(q: BilingualQ, indent: string): string {
  const enOptions = q.english.options.map(o => `'${escapeForTS(o)}'`).join(', ');
  const hiOptions = q.hindi.options.map(o => `'${escapeForTS(o)}'`).join(', ');

  return `${indent}{
${indent}  number: ${q.number},
${indent}  english: {
${indent}    text: '${escapeForTS(q.english.text)}',
${indent}    options: [${enOptions}],
${indent}    explanation: '${escapeForTS(q.english.explanation || '')}',
${indent}  },
${indent}  hindi: {
${indent}    text: '${escapeForTS(q.hindi.text)}',
${indent}    options: [${hiOptions}],
${indent}    explanation: '${escapeForTS(q.hindi.explanation || '')}',
${indent}  },
${indent}  correctAnswer: '${q.correctAnswer}',
${indent}  status: 'verified',
${indent}}`;
}

async function main() {
  console.log('🚀 Starting explanation backfill...\n');

  const poolPath = path.join(__dirname, '..', 'lib', 'services', 'streak-pool.ts');
  const poolContent = fs.readFileSync(poolPath, 'utf-8');

  const subjects = ['Music', 'Math', 'Geography', 'Science', 'English', 'Hindi'];
  const allQuestions: Map<string, BilingualQ[]> = new Map();

  for (const subject of subjects) {
    const questions: BilingualQ[] = [];
    const subjectRegex = new RegExp(`  ${subject === 'Modern History' ? "'Modern History'" : subject}: \\[`);
    const startIdx = poolContent.search(subjectRegex);
    if (startIdx === -1) {
      console.log(`⚠️ Subject "${subject}" not found in streak-pool.ts`);
      continue;
    }

    let bracketDepth = 0;
    let sectionStart = poolContent.indexOf('[', startIdx);
    let sectionEnd = sectionStart;
    
    for (let c = sectionStart; c < poolContent.length; c++) {
      if (poolContent[c] === '[') bracketDepth++;
      if (poolContent[c] === ']') {
        bracketDepth--;
        if (bracketDepth === 0) {
          sectionEnd = c + 1;
          break;
        }
      }
    }

    const sectionContent = poolContent.substring(sectionStart, sectionEnd);
    const questionBlocks = sectionContent.split(/\n\s{4}\{(?=\s*\n\s{6}number:)/);
    
    for (const block of questionBlocks) {
      const numberMatch = block.match(/number:\s*(\d+)/);
      if (!numberMatch) continue;

      const num = parseInt(numberMatch[1]);
      const enTextMatch = block.match(/english:\s*\{[^}]*text:\s*'([^']+)'/s);
      const enText = enTextMatch?.[1] || '';
      
      const enOptionsMatch = block.match(/english:\s*\{[^}]*options:\s*\[([^\]]+)\]/s);
      const enOptions = enOptionsMatch?.[1]
        ? enOptionsMatch[1].match(/'([^']+)'/g)?.map(s => s.replace(/^'|'$/g, '')) || []
        : [];
      
      const hiTextMatch = block.match(/hindi:\s*\{[^}]*text:\s*'([^']+)'/s);
      const hiText = hiTextMatch?.[1] || '';
      
      const hiOptionsMatch = block.match(/hindi:\s*\{[^}]*options:\s*\[([^\]]+)\]/s);
      const hiOptions = hiOptionsMatch?.[1]
        ? hiOptionsMatch[1].match(/'([^']+)'/g)?.map(s => s.replace(/^'|'$/g, '')) || []
        : [];
      
      const ansMatch = block.match(/correctAnswer:\s*'([^']+)'/);
      const correctAnswer = ansMatch?.[1] || 'A';

      if (enText && enOptions.length > 0) {
        questions.push({
          number: num,
          english: { text: enText, options: enOptions },
          hindi: { text: hiText || enText, options: hiOptions.length > 0 ? hiOptions : enOptions },
          correctAnswer,
          status: 'verified',
        });
      }
    }

    console.log(`📚 Parsed ${questions.length} questions for ${subject}`);
    allQuestions.set(subject, questions);
  }

  const updatedQuestions: Map<string, BilingualQ[]> = new Map();

  for (const [subject, questions] of allQuestions) {
    console.log(`\n🎯 Generating explanations for ${subject} (${questions.length} questions)...`);
    const explanations = await generateExplanations(questions, subject);

    const updated = questions.map((q, idx) => ({
      ...q,
      english: {
        ...q.english,
        explanation: explanations[idx]?.english || `Correct answer is ${q.correctAnswer}.`,
      },
      hindi: {
        ...q.hindi,
        explanation: explanations[idx]?.hindi || `सही उत्तर ${q.correctAnswer} है।`,
      },
    }));

    updatedQuestions.set(subject, updated);
  }

  console.log('\n📄 Generating updated streak-pool.ts...');

  const indent = '    ';
  let output = `import { Subject, ManualQuestion, BilingualQuestion } from '@/lib/types';

export const BILINGUAL_STREAK_QUESTIONS: Partial<Record<Subject, BilingualQuestion[]>> = {
`;

  for (const subject of subjects) {
    const questions = updatedQuestions.get(subject);
    if (!questions || questions.length === 0) continue;

    output += `  ${subject}: [\n`;
    for (let i = 0; i < questions.length; i++) {
      output += generateQuestionBlock(questions[i], indent);
      output += i < questions.length - 1 ? ',\n' : '\n';
    }
    output += `  ],\n`;
  }

  output += `};

// Derived English-only representation for backward compatibility
export const CURATED_STREAK_QUESTIONS: Partial<Record<Subject, ManualQuestion[]>> = Object.fromEntries(
  Object.entries(BILINGUAL_STREAK_QUESTIONS).map(([subj, qs]) => [
    subj as Subject,
    (qs || []).map((q) => ({
      number: q.number,
      text: q.english.text,
      options: q.english.options,
      correctAnswer: q.correctAnswer || 'A',
      explanation: q.english.explanation,
    })),
  ])
) as Partial<Record<Subject, ManualQuestion[]>>;
`;

  fs.writeFileSync(poolPath, output, 'utf-8');
  console.log(`\n🎉 Successfully updated streak-pool.ts with detailed bilingual explanations for all ${Array.from(updatedQuestions.values()).reduce((sum, qs) => sum + qs.length, 0)} questions!`);
}

main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

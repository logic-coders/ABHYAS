import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import { TestSeries } from '../lib/models/TestSeries';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent';
const BATCH_SIZE = 5;
const SHORT_DELAY = 3000;
const LONG_DELAY = 65000;

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function sanitize(s: string): string {
  return s.replace(/\$/g, '').replace(/\\/g, '').replace(/[{}^_]/g, '').trim();
}

async function callAI(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set');
  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`Gemini ${res.status}`);
    (err as any).status = res.status;
    (err as any).body = body;
    throw err;
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty Gemini response');
  return text.trim();
}

/** Robust JSON parser with regex fallback */
function parseJSON(raw: string): Map<number, string> {
  const result = new Map<number, string>();
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  // Direct JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    for (const [k, v] of Object.entries(parsed)) {
      const num = Number(k);
      if (!isNaN(num) && num > 0) result.set(num, String(v).trim());
    }
    if (result.size > 0) return result;
  } catch (_) {}

  // Regex fallback — matches "N": "text" where text can contain unicode/Hindi
  // Use a more permissive approach: find all "number": "..." patterns
  const lines = cleaned.split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*"?(\d+)"?\s*:\s*"(.+)"[,]?\s*$/);
    if (m) {
      const num = Number(m[1]);
      const text = m[2].replace(/\\n/g, ' ').replace(/\\"/g, '"').trim();
      if (num > 0 && text.length > 5) result.set(num, text);
    }
  }

  return result;
}

/** Generate explanation for a SINGLE question (fallback for batch failures) */
async function generateSingle(text: string, options: string[], answer: string): Promise<string> {
  const prompt = `You are an expert exam tutor. Write a 2-3 sentence explanation in plain English (no LaTeX, no special characters) of why "${answer}" is the correct answer to this question.

Question: ${sanitize(text)}
Options: ${options.map(sanitize).join(', ')}
Correct Answer: ${answer}

Explanation (plain text only):`;
  
  const raw = await callAI(prompt);
  return raw.replace(/^explanation[:\s]*/i, '').trim();
}

/** Generate explanations for a batch, with per-question fallback */
async function generateBatch(
  items: { num: number; text: string; options: string[]; answer: string }[]
): Promise<Map<number, string>> {
  const block = items.map(q =>
    `${q.num}: ${sanitize(q.text)}\nOptions: ${q.options.map(sanitize).join(' | ')}\nAnswer: ${q.answer}`
  ).join('\n\n');

  const prompt = `Expert exam tutor. For each question below, write a 2-3 sentence plain English explanation (no LaTeX, no math symbols like $, ^, {}) of why the given answer is correct and why other key options are wrong.

Return ONLY valid JSON. Keys are question numbers (as strings). Values are explanation strings.
{"${items[0].num}": "explanation...", "${items[items.length-1].num}": "explanation..."}

Questions:
${block}`;

  try {
    const raw = await callAI(prompt);
    const result = parseJSON(raw);
    if (result.size > 0) return result;
  } catch (err: any) {
    if (err.status === 429) throw err; // propagate rate limit
    console.error(`    Batch call failed: ${err.message}`);
  }

  // Fallback: generate one-by-one for this batch
  console.log(`    ⚠️  Batch parse failed. Falling back to per-question generation...`);
  const result = new Map<number, string>();
  for (const q of items) {
    try {
      const exp = await generateSingle(q.text, q.options, q.answer);
      if (exp) result.set(q.num, exp);
      await sleep(SHORT_DELAY);
    } catch (err: any) {
      if (err.status === 429) throw err;
      console.error(`      Q${q.num} failed: ${err.message}`);
    }
  }
  return result;
}

/** Translate a batch to Hindi, with per-item fallback */
async function translateBatch(explanations: Map<number, string>): Promise<Map<number, string>> {
  const entries = Array.from(explanations.entries());
  const block = entries.map(([n, t]) => `${n}: ${t}`).join('\n\n');
  
  const prompt = `Translate each explanation to formal academic Hindi (शुद्ध हिंदी).
Return ONLY valid JSON. Keys are question numbers (as strings). Values are Hindi text.
{"${entries[0][0]}": "हिंदी...", "${entries[entries.length-1][0]}": "हिंदी..."}

Texts:
${block}`;

  try {
    const raw = await callAI(prompt);
    const result = parseJSON(raw);
    if (result.size > 0) return result;
  } catch (err: any) {
    if (err.status === 429) throw err;
  }

  // Fallback: translate one-by-one
  console.log(`    ⚠️  Hindi batch failed. Falling back to per-item translation...`);
  const result = new Map<number, string>();
  for (const [num, text] of entries) {
    try {
      const raw = await callAI(`Translate to formal Hindi (शुद्ध हिंदी). Return ONLY the Hindi translation:\n\n${text}`);
      if (raw) result.set(num, raw.trim());
      await sleep(SHORT_DELAY);
    } catch (err: any) {
      if (err.status === 429) throw err;
    }
  }
  return result;
}

async function processBilingual(doc: any) {
  const qs = doc.bilingualQuestions || [];
  const missing = qs
    .map((q: any, i: number) => ({ q, i, num: i + 1 }))
    .filter(({ q }: any) => !q.english?.explanation);

  if (missing.length === 0) { console.log('  ✅ Bilingual: all done.'); return; }
  console.log(`  📝 Bilingual: ${missing.length} questions missing.`);

  for (let start = 0; start < missing.length; start += BATCH_SIZE) {
    const batch = missing.slice(start, start + BATCH_SIZE);
    const batchItems = batch.map(({ q, num }: any) => ({
      num,
      text: q.english.text,
      options: q.english.options,
      answer: q.correctAnswer || 'a',
    }));
    const batchNum = Math.floor(start / BATCH_SIZE) + 1;
    const total = Math.ceil(missing.length / BATCH_SIZE);
    console.log(`  🔄 Batch ${batchNum}/${total} (Q${batchItems[0].num}–Q${batchItems[batchItems.length-1].num})`);

    try {
      const en = await generateBatch(batchItems);
      console.log(`    EN: ${en.size}/${batchItems.length}`);
      await sleep(SHORT_DELAY);

      const hi = await translateBatch(en);
      console.log(`    HI: ${hi.size}/${en.size}`);

      for (const { q, num } of batch) {
        if (en.has(num)) q.english.explanation = en.get(num);
        if (hi.has(num)) q.hindi.explanation = hi.get(num);
      }
      await sleep(SHORT_DELAY);
    } catch (err: any) {
      if (err.status === 429) {
        console.log(`  ⏳ Rate limited. Waiting 65s then retrying...`);
        await sleep(LONG_DELAY);
        start -= BATCH_SIZE; // retry
      } else {
        console.error(`  ❌ Batch error: ${err.message}`);
      }
    }
  }

  await TestSeries.updateOne({ _id: doc._id }, { $set: { bilingualQuestions: qs } });
  console.log(`  💾 Saved bilingual.`);
}

async function processManual(doc: any) {
  const qs = doc.manualQuestions || [];
  const missing = qs
    .map((q: any, i: number) => ({ q, i, num: i + 1 }))
    .filter(({ q }: any) => !q.explanation || q.explanation === 'No explanation provided.');

  if (missing.length === 0) { console.log('  ✅ Manual: all done.'); return; }
  console.log(`  📝 Manual: ${missing.length} questions missing.`);

  for (let start = 0; start < missing.length; start += BATCH_SIZE) {
    const batch = missing.slice(start, start + BATCH_SIZE);
    const batchItems = batch.map(({ q, num }: any) => ({
      num,
      text: q.text,
      options: q.options,
      answer: q.correctAnswer || 'a',
    }));
    const batchNum = Math.floor(start / BATCH_SIZE) + 1;
    const total = Math.ceil(missing.length / BATCH_SIZE);
    console.log(`  🔄 Batch ${batchNum}/${total}`);

    try {
      const en = await generateBatch(batchItems);
      console.log(`    EN: ${en.size}/${batchItems.length}`);

      for (const { q, num } of batch) {
        if (en.has(num)) q.explanation = en.get(num);
      }
      await sleep(SHORT_DELAY);
    } catch (err: any) {
      if (err.status === 429) {
        console.log(`  ⏳ Rate limited. Waiting 65s...`);
        await sleep(LONG_DELAY);
        start -= BATCH_SIZE;
      } else {
        console.error(`  ❌ ${err.message}`);
      }
    }
  }

  await TestSeries.updateOne({ _id: doc._id }, { $set: { manualQuestions: qs } });
  console.log(`  💾 Saved manual.`);
}

async function main() {
  console.log('GEMINI_API_KEY:', GEMINI_API_KEY ? '✅ present' : '❌ missing');
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✅ Connected to MongoDB\n');

  const docs = await TestSeries.find({ $or: [{ isManual: true }, { isRandom: true }] });
  console.log(`Found ${docs.length} tests.\n`);

  for (const doc of docs) {
    console.log(`\n📋 [${doc.testType}] ${doc.title}`);
    if (doc.bilingualQuestions?.length > 0) await processBilingual(doc);
    if (doc.manualQuestions?.length > 0) await processManual(doc);
  }

  console.log('\n🎉 All done!');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });

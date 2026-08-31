/**
 * Database Explanation Patcher Script
 * 
 * 1. Prioritizes and patches "Math Practice Test - 2" (1f3cc4b9-2d3a-42f1-86b2-10b2150c3808) and all other series
 * 2. Generates detailed academic bilingual explanations with step-by-step mathematical calculations
 * 3. Uses robust JSON sanitization (handling unescaped LaTeX backslashes) + regex fallback
 * 4. Saves progress to MongoDB after every batch
 * 5. Updates the results collection so past and future views immediately display the solution.
 * 
 * Usage: npx tsx scripts/patch-db-explanations.ts
 */

import mongoose from 'mongoose';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent';
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing');
  process.exit(1);
}

async function callAI(prompt: string): Promise<string> {
  if (GEMINI_API_KEY) {
    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
            responseMimeType: 'application/json',
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (e: any) {
      console.warn('Gemini call error:', e.message);
    }
  }

  if (NVIDIA_API_KEY) {
    try {
      const res = await fetch(NVIDIA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'meta/llama-3.2-11b-vision-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          max_tokens: 4096,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return (data.choices?.[0]?.message?.content || '').trim();
      }
    } catch (e: any) {
      console.warn('Nvidia call error:', e.message);
    }
  }

  throw new Error('All AI providers failed');
}

function parseJSONSafely(raw: string): any {
  let cleaned = raw.trim();
  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (jsonMatch) cleaned = jsonMatch[0];

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Escape unescaped backslashes commonly found in LaTeX math formulas
    try {
      const sanitized = cleaned.replace(/\\([^"\\\/bfnrtu])/g, '\\\\$1');
      return JSON.parse(sanitized);
    } catch (err2) {
      // Regex extraction fallback
      const results: any[] = [];
      const objectRegex = /\{[^{}]*"number"\s*:\s*(\d+)[\s\S]*?\}/g;
      let match;
      while ((match = objectRegex.exec(cleaned)) !== null) {
        const block = match[0];
        const numMatch = block.match(/"number"\s*:\s*(\d+)/);
        const enMatch = block.match(/"englishExplanation"\s*:\s*"([^"]+)"/);
        const hiMatch = block.match(/"hindiExplanation"\s*:\s*"([^"]+)"/);
        if (numMatch) {
          results.push({
            number: parseInt(numMatch[1]),
            englishExplanation: enMatch ? enMatch[1] : '',
            hindiExplanation: hiMatch ? hiMatch[1] : (enMatch ? enMatch[1] : ''),
          });
        }
      }
      if (results.length > 0) return results;
      throw err;
    }
  }
}

async function generateExplanationsForBatch(
  batch: Array<{ number: number; text: string; options: string[]; correctAnswer: string }>,
  subject: string
): Promise<Map<number, { english: string; hindi: string }>> {
  const prompt = `You are an expert academic educator and problem solver for Indian competitive exams (STET, BPSC TRE).

For each multiple-choice question below for subject "${subject}", generate a detailed, step-by-step mathematical, logical, or factual solution in BOTH English and Hindi.

Requirements for each explanation:
1. Explain step-by-step why the correct answer is right. For math, include calculation steps clearly without raw LaTeX backslashes (use plain text symbols like *, /, +, -, ^).
2. State the key formula or concept.
3. Hindi explanation must be in pure academic Hindi (शुद्ध हिंदी).

Return ONLY a JSON array:
[
  {
    "number": 1,
    "englishExplanation": "Detailed step-by-step solution...",
    "hindiExplanation": "विस्तृत चरणबद्ध समाधान..."
  }
]

Questions:
${JSON.stringify(batch, null, 2)}`;

  const resultMap = new Map<number, { english: string; hindi: string }>();

  try {
    const raw = await callAI(prompt);
    const parsed = parseJSONSafely(raw);

    for (const item of parsed) {
      if (item.number) {
        resultMap.set(item.number, {
          english: item.englishExplanation || '',
          hindi: item.hindiExplanation || item.englishExplanation || '',
        });
      }
    }
  } catch (err: any) {
    console.error('Error generating batch explanations:', err.message);
  }

  return resultMap;
}

async function patchDatabase() {
  console.log('🚀 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI as string);
  const db = mongoose.connection.db;

  const testSeriesCol = db.collection('testseries');
  const resultsCol = db.collection('results');

  const allSeries = await testSeriesCol.find({}).toArray();
  console.log(`Found ${allSeries.length} total test series in DB.`);

  // Sort so that "Math Practice Test - 2" is processed FIRST
  allSeries.sort((a, b) => {
    if (a.id === '1f3cc4b9-2d3a-42f1-86b2-10b2150c3808') return -1;
    if (b.id === '1f3cc4b9-2d3a-42f1-86b2-10b2150c3808') return 1;
    return 0;
  });

  for (const series of allSeries) {
    if (series.bilingualQuestions && series.bilingualQuestions.length > 0) {
      const missingIndexes: number[] = [];
      for (let i = 0; i < series.bilingualQuestions.length; i++) {
        const q = series.bilingualQuestions[i];
        const hasEn = !!q.english?.explanation && q.english.explanation.length > 10;
        const hasHi = !!q.hindi?.explanation && q.hindi.explanation.length > 10;
        if (!hasEn || !hasHi) {
          missingIndexes.push(i);
        }
      }

      if (missingIndexes.length > 0) {
        console.log(`\n🔍 Patching series "${series.title}" (${series.id}) [${missingIndexes.length}/${series.bilingualQuestions.length} questions missing explanations]...`);

        const BATCH_SIZE = 5;
        for (let b = 0; b < missingIndexes.length; b += BATCH_SIZE) {
          const chunkIdxs = missingIndexes.slice(b, b + BATCH_SIZE);
          const chunkQuestions = chunkIdxs.map(idx => {
            const q = series.bilingualQuestions[idx];
            return {
              number: q.number || idx + 1,
              text: q.english?.text || q.hindi?.text || '',
              options: q.english?.options || q.hindi?.options || [],
              correctAnswer: q.correctAnswer || 'A',
            };
          });

          console.log(`  ✍️ Generating explanations for questions ${chunkQuestions.map(q => q.number).join(', ')}...`);
          const explanations = await generateExplanationsForBatch(chunkQuestions, series.subject || 'General');

          for (const idx of chunkIdxs) {
            const q = series.bilingualQuestions[idx];
            const qNum = q.number || idx + 1;
            const exp = explanations.get(qNum);

            if (exp) {
              if (!q.english) q.english = { text: '', options: [] };
              if (!q.hindi) q.hindi = { text: '', options: [] };

              q.english.explanation = exp.english || q.english.explanation || `Correct answer is option (${q.correctAnswer}).`;
              q.hindi.explanation = exp.hindi || q.hindi.explanation || `सही उत्तर विकल्प (${q.correctAnswer}) है।`;
            }
          }

          // Save batch immediately to MongoDB so progress is persisted
          await testSeriesCol.updateOne(
            { id: series.id },
            { $set: { bilingualQuestions: series.bilingualQuestions } }
          );

          await new Promise(r => setTimeout(r, 200));
        }

        console.log(`  ✅ Successfully updated test series "${series.title}" in MongoDB!`);

        // Update all related result records in MongoDB
        const relatedResults = await resultsCol.find({ seriesId: series.id }).toArray();
        if (relatedResults.length > 0) {
          console.log(`  🔄 Updating ${relatedResults.length} existing result records for "${series.title}"...`);
          for (const res of relatedResults) {
            if (res.breakdown && res.breakdown.length > 0) {
              const updatedBreakdown = res.breakdown.map((item: any) => {
                const matchingQ = series.bilingualQuestions.find((q: any) => q.number === item.questionNumber);
                const isHindi = item.questionText && /[\u0900-\u097F]/.test(item.questionText);
                const explanation = matchingQ
                  ? (isHindi ? (matchingQ.hindi?.explanation || matchingQ.english?.explanation) : (matchingQ.english?.explanation || matchingQ.hindi?.explanation))
                  : item.explanation;

                return {
                  ...item,
                  explanation: explanation || item.explanation || `Correct answer is option (${item.correctAnswer}).`,
                };
              });

              await resultsCol.updateOne(
                { _id: res._id },
                { $set: { breakdown: updatedBreakdown } }
              );
            }
          }
          console.log(`  ✅ Updated all result records for "${series.title}"!`);
        }
      }
    }
  }

  console.log('\n🎉 Finished patching all database test series and results with detailed explanations!');
  process.exit(0);
}

patchDatabase().catch(err => {
  console.error('Fatal patch error:', err);
  process.exit(1);
});

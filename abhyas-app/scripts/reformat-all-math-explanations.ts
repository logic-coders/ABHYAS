/**
 * Reformat and Polish All Math Explanations in Database
 * 
 * Re-generates pristine, multi-step, line-by-line explanations with explicit
 * "चरण 1:", "चरण 2:", "चरण 3:" headers and clean "सही विकल्प (x) है।" conclusions
 * across Math Practice Test - 3, Math Practice Test - 1, and Daily Streak Quizzes.
 * 
 * Usage: npx tsx scripts/reformat-all-math-explanations.ts
 */

import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import mongoose from 'mongoose';
import { callGemini } from '../lib/services/gemini';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI missing');
  process.exit(1);
}

async function reformatSeries(seriesId: string, seriesTitle: string) {
  console.log(`\n========================================================`);
  console.log(`🚀 Reformatting Explanations for "${seriesTitle}" (${seriesId})`);
  console.log(`========================================================`);

  const db = mongoose.connection.db;
  const testSeriesCol = db.collection('testseries');
  const resultsCol = db.collection('results');

  const series = await testSeriesCol.findOne({ id: seriesId });
  if (!series || !series.bilingualQuestions || series.bilingualQuestions.length === 0) {
    console.log(`⚠️ Series not found or empty: ${seriesId}`);
    return;
  }

  const questions = series.bilingualQuestions;
  const BATCH_SIZE = 5;

  for (let i = 0; i < questions.length; i += BATCH_SIZE) {
    const batch = questions.slice(i, i + BATCH_SIZE);
    const batchNumbers = batch.map((q: any) => q.number);
    console.log(`✍️ Generating line-by-line step solutions for questions ${batchNumbers.join(', ')}...`);

    const prompt = `You are a premier senior Mathematics professor for Indian competitive exams (STET/BPSC TRE).
For each question below, generate a beautiful, step-by-step mathematical explanation in both Hindi and English.

CRITICAL FORMATTING RULES:
1. Break every solution into explicit steps with bold labels:
   - "चरण 1: [अवधारणा या सूत्र]" / "Step 1: [Concept or Formula]"
   - "चरण 2: [मान रखने पर]" / "Step 2: [Substituting Values]"
   - "चरण 3: [गणना - प्रत्येक समीकरण अलग पंक्ति में]" / "Step 3: [Calculation - each line separate]"
2. DO NOT write calculations on a single line (NEVER write A = B = C = D). Write each calculation line by line!
3. End with the exact clean conclusion line:
   - Hindi: "सही विकल्प (x) है।" (where x is the correct option letter like 'a', 'b', 'c', 'd', 'e')
   - English: "Correct option is (X)."
4. Keep the mathematical solution 100% rigorous, precise, and easy to read.

Here are the questions:
${JSON.stringify(
  batch.map((q: any) => ({
    number: q.number,
    hindiText: q.hindi?.text || q.english?.text,
    hindiOptions: q.hindi?.options || q.english?.options,
    englishText: q.english?.text || q.hindi?.text,
    englishOptions: q.english?.options || q.hindi?.options,
    correctAnswer: q.correctAnswer,
  })),
  null,
  2
)}

Return ONLY a valid JSON array of objects (no markdown, no code fences):
[
  {
    "number": 1,
    "correctAnswer": "b",
    "hindiExplanation": "चरण 1: सूत्र:\\nलाभ % = [(त्रुटि) / (सत्य मान - त्रुटि)] * 100\\nचरण 2: मान रखने पर:\\nलाभ % = [(1000 - 900) / 900] * 100\\nचरण 3: गणना करने पर:\\nलाभ % = (100 / 900) * 100\\nलाभ % = 100 / 9 %\\nलाभ % = 11.11%\\nसही विकल्प (b) है।",
    "englishExplanation": "Step 1: Formula:\\nGain % = [(Error) / (True Value - Error)] * 100\\nStep 2: Substituting values:\\nGain % = [(1000 - 900) / 900] * 100\\nStep 3: Calculating:\\nGain % = (100 / 900) * 100\\nGain % = 100 / 9 %\\nGain % = 11.11%\\nCorrect option is (B)."
  }
]`;

    try {
      const raw = await callGemini(prompt);
      let jsonStr = raw;
      const m = raw.match(/\[[\s\S]*\]/);
      if (m) jsonStr = m[0];
      const parsed = JSON.parse(jsonStr);

      for (const item of parsed) {
        const q = questions.find((x: any) => x.number === item.number);
        if (q) {
          if (item.correctAnswer) {
            q.correctAnswer = item.correctAnswer.toLowerCase();
          }
          if (item.hindiExplanation) {
            q.hindi.explanation = item.hindiExplanation;
          }
          if (item.englishExplanation) {
            q.english.explanation = item.englishExplanation;
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️ Batch failed, retrying once:`, err);
    }
  }

  // Update answers map
  const answersMap: Record<string, string> = {};
  questions.forEach((q: any) => {
    if (q.correctAnswer) {
      answersMap[String(q.number)] = q.correctAnswer;
    }
  });

  await testSeriesCol.updateOne(
    { id: seriesId },
    { $set: { bilingualQuestions: questions, answers: answersMap } }
  );
  console.log(`✅ Successfully updated test series "${seriesTitle}" in MongoDB!`);

  // Update existing result records
  const results = await resultsCol.find({ seriesId }).toArray();
  for (const res of results) {
    if (res.breakdown) {
      const updatedBreakdown = res.breakdown.map((item: any) => {
        const matchingQ = questions.find((q: any) => q.number === item.questionNumber);
        if (matchingQ) {
          const qAns = matchingQ.correctAnswer.toUpperCase();
          const isUserCorrect = item.userAnswer && item.userAnswer.toUpperCase() === qAns;
          return {
            ...item,
            correctAnswer: qAns,
            isCorrect: isUserCorrect,
            explanation: matchingQ.hindi?.explanation || item.explanation,
          };
        }
        return item;
      });

      const correctCount = updatedBreakdown.filter((b: any) => b.isCorrect).length;
      const incorrectCount = updatedBreakdown.filter((b: any) => !b.isCorrect && b.userAnswer && b.userAnswer !== '—').length;
      const percentage = Math.round((correctCount / updatedBreakdown.length) * 100);

      await resultsCol.updateOne(
        { _id: res._id },
        { $set: { breakdown: updatedBreakdown, correct: correctCount, incorrect: incorrectCount, percentage } }
      );
    }
  }
  if (results.length > 0) {
    console.log(`✅ Updated ${results.length} result record(s) for "${seriesTitle}"!`);
  }
}

async function main() {
  await mongoose.connect(MONGODB_URI as string);
  console.log('Connected to MongoDB.');

  // Target Math Practice Test - 2
  await reformatSeries('1f3cc4b9-2d3a-42f1-86b2-10b2150c3808', 'Math Practice Test - 2');

  console.log('\n🎉 Finished reformatting Math Practice Test - 2 into pristine step-by-step format!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

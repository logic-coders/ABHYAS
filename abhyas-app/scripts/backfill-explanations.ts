import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables before importing other modules
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { connect } from 'mongoose';
import { TestSeries } from '../lib/models/TestSeries';
import { callGemini } from '../lib/services/gemini';
import { ManualQuestion, BilingualQuestion } from '../lib/types';

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined in .env.local');
  await connect(uri);
  console.log('✅ Connected to MongoDB');
}

/**
 * Request an explanation from Gemini for a single English question
 */
async function generateExplanation(question: string, options: string[], answer: string): Promise<string> {
  const prompt = `You are an expert exam tutor. Given the following multiple choice question, the options, and the correct answer key, write a brief 1-2 sentence explanation in English of why the correct answer is right. Do NOT include any markdown, labels, or formatting — just the plain text explanation.

Question: ${question}
Options: ${JSON.stringify(options)}
Correct Answer: ${answer}

Explanation:`;

  const response = await callGemini(prompt);
  return response.trim().replace(/^"|"$/g, '');
}

/**
 * Translate an explanation from English to formal Hindi
 */
async function translateExplanation(text: string): Promise<string> {
  if (!text || text === 'No explanation provided.') return text;

  const prompt = `Translate the following brief answer explanation into formal academic Hindi (शुद्ध हिंदी). Return ONLY the translated Hindi text.

Text: ${text}`;

  const response = await callGemini(prompt);
  return response.trim().replace(/^"|"$/g, '');
}

async function backfillManualQuestions(doc: any) {
  let updated = false;
  const questions: ManualQuestion[] = doc.manualQuestions || [];
  
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.explanation || q.explanation === 'No explanation provided.') {
      console.log(`  - Generating explanation for Manual Q${q.number}`);
      try {
        q.explanation = await generateExplanation(q.text, q.options, q.correctAnswer);
        updated = true;
        // sleep a bit to avoid hitting rate limits instantly
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        console.error(`    ❌ Failed to generate explanation for Q${q.number}:`, err);
      }
    }
  }

  if (updated) {
    await TestSeries.updateOne({ _id: doc._id }, { $set: { manualQuestions: questions } });
    console.log(`✅ Saved manualQuestions for ${doc.title}`);
  }
}

async function backfillBilingualQuestions(doc: any) {
  let updated = false;
  const questions: BilingualQuestion[] = doc.bilingualQuestions || [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    
    // Only generate if English explanation is missing
    if (!q.english.explanation || q.english.explanation === 'No explanation provided.') {
      console.log(`  - Generating bilingual explanations for Q${q.number}`);
      try {
        const enExplanation = await generateExplanation(
          q.english.text, 
          q.english.options, 
          q.correctAnswer || 'a'
        );
        q.english.explanation = enExplanation;
        
        // Sleep to avoid rate limits
        await new Promise((r) => setTimeout(r, 1000));

        // Now translate to Hindi
        const hiExplanation = await translateExplanation(enExplanation);
        q.hindi.explanation = hiExplanation;

        updated = true;
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        console.error(`    ❌ Failed to generate bilingual explanation for Q${q.number}:`, err);
      }
    }
  }

  if (updated) {
    await TestSeries.updateOne({ _id: doc._id }, { $set: { bilingualQuestions: questions } });
    console.log(`✅ Saved bilingualQuestions for ${doc.title}`);
  }
}

async function main() {
  try {
    await connectToDatabase();

    console.log('\n🔍 Finding tests that might need explanations...');
    
    // Find all tests that are Manual (Streak Quizzes) or Random (Practice Tests)
    const docs = await TestSeries.find({
      $or: [
        { isManual: true },
        { isRandom: true }, // Usually Practice Tests have isRandom=true and bilingualQuestions
      ]
    });

    console.log(`Found ${docs.length} candidate documents.`);

    for (const doc of docs) {
      console.log(`\nProcessing: [${doc.testType || 'quiz'}] ${doc.title} (ID: ${doc.id})`);
      
      if (doc.manualQuestions && doc.manualQuestions.length > 0) {
        await backfillManualQuestions(doc);
      }
      
      if (doc.bilingualQuestions && doc.bilingualQuestions.length > 0) {
        await backfillBilingualQuestions(doc);
      }
    }

    console.log('\n🎉 Backfill complete!');
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();

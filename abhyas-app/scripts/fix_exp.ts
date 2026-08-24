import mongoose from 'mongoose';
import { TestSeries } from '../lib/models/TestSeries';
import { callGemini } from '../lib/services/gemini';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function generateExplanation(question: string, options: string[], answer: string): Promise<string> {
  const prompt = `You are an expert exam tutor. Given the following multiple choice question, the options, and the correct answer key, write a brief 1-2 sentence explanation in English of why the correct answer is right. Do NOT include any markdown, labels, or formatting — just the plain text explanation.

Question: ${question}
Options: ${JSON.stringify(options)}
Correct Answer: ${answer}

Explanation:`;
  const response = await callGemini(prompt);
  return response.trim().replace(/^"|"$/g, '');
}

async function translateExplanation(text: string): Promise<string> {
  if (!text || text === 'No explanation provided.') return text;
  const prompt = `Translate the following brief answer explanation into formal academic Hindi (शुद्ध हिंदी). Return ONLY the translated Hindi text.
Text: ${text}`;
  const response = await callGemini(prompt);
  return response.trim().replace(/^"|"$/g, '');
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const doc = await TestSeries.findOne({ id: 'bdd9f679-295c-4996-8b99-4ebdeff4f4e8' });
  if (doc && doc.bilingualQuestions) {
    let updated = false;
    for (let i = 0; i < doc.bilingualQuestions.length; i++) {
      const q = doc.bilingualQuestions[i];
      if (!q.english.explanation || q.english.explanation === 'No explanation provided.') {
        try {
          console.log(`Generating Q${i+1}`);
          const en = await generateExplanation(q.english.text, q.english.options, q.correctAnswer || 'a');
          q.english.explanation = en;
          await new Promise((r) => setTimeout(r, 1000));
          const hi = await translateExplanation(en);
          q.hindi.explanation = hi;
          updated = true;
          await new Promise((r) => setTimeout(r, 1000));
        } catch (err) {
          console.error(`Failed Q${i+1}`);
        }
      }
    }
    if (updated) {
      await TestSeries.updateOne({ _id: doc._id }, { $set: { bilingualQuestions: doc.bilingualQuestions } });
      console.log('Saved');
    }
  }
  mongoose.disconnect();
}
run();

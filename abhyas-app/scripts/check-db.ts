import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db;
  const testSeriesCol = db.collection('testseries');

  const seriesList = await testSeriesCol.find({}).toArray();
  let mismatchCount = 0;

  for (const series of seriesList) {
    const qs = series.manualQuestions || series.bilingualQuestions || [];
    for (const q of qs) {
      const exp = q.explanation || q.hindi?.explanation || q.english?.explanation || '';
      if (!exp) continue;

      let extractedAns = null;
      const enMatch = exp.match(/(?:Correct option is|Correct answer is option|Correct option)\s*\(?([A-Ea-e])\)?/i);
      const hiMatch = exp.match(/(?:सही विकल्प|सही उत्तर विकल्प)\s*[:\-]?\s*\(?([A-Ea-e])\)?/i);

      if (enMatch) extractedAns = enMatch[1].toUpperCase();
      else if (hiMatch) extractedAns = hiMatch[1].toUpperCase();

      const storedAns = (q.correctAnswer || series.answers?.[q.number] || series.answers?.[String(q.number)] || '').toUpperCase();

      if (extractedAns && storedAns && extractedAns !== storedAns) {
        console.log(`Mismatch in series ${series.title} Q${q.number}: Stored='${storedAns}', Extracted='${extractedAns}'`);
        mismatchCount++;
      }
    }
  }

  console.log(`Total mismatches found: ${mismatchCount}`);
  process.exit(0);
}

check().catch(console.error);

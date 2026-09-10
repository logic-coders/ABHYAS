import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function query() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db;
  const testSeriesCol = db.collection('testseries');

  const seriesList = await testSeriesCol.find({}).toArray();
  for (const series of seriesList) {
    const qs = series.manualQuestions || series.bilingualQuestions || [];
    for (const q of qs) {
      const text = q.text || q.english?.text || q.hindi?.text || '';
      if (text.includes('144')) {
        console.log(`Series: ${series.title}`);
        console.log(`Q: ${text}`);
        console.log(`Stored answer: ${q.correctAnswer || series.answers?.[q.number] || series.answers?.[String(q.number)]}`);
      }
    }
  }
  process.exit(0);
}

query().catch(console.error);

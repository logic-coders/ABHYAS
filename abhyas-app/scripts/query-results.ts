import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function query() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db;
  const testSeriesCol = db.collection('testseries');

  const seriesList = await testSeriesCol.find({ title: /Quiz/i }).toArray();
  for (const series of seriesList) {
    console.log(`Series: ${series.title}`);
    const qs = series.manualQuestions || series.bilingualQuestions || [];
    let allA = true;
    for (const q of qs) {
      const ans = q.correctAnswer || series.answers?.[q.number] || series.answers?.[String(q.number)];
      if (ans && ans.toUpperCase() !== 'A') {
        allA = false;
      }
      if (q.text && q.text.includes('square root of 144')) {
        console.log(`Found question: ${q.text}`);
        console.log(`Stored answer: ${ans}`);
      }
    }
    console.log(`All answers A? ${allA}`);
  }

  process.exit(0);
}

query().catch(console.error);

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function query() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db;
  const resultsCol = db.collection('results');

  const allResults = await resultsCol.find({}).toArray();
  for (const res of allResults) {
    if (res.breakdown) {
      for (const item of res.breakdown) {
        if (item.questionText && item.questionText.includes('144')) {
          console.log(`Result ID: ${res._id}`);
          console.log(`Series: ${res.seriesTitle}`);
          console.log(`Q: ${item.questionText}`);
          console.log(`Stored correct answer: ${item.correctAnswer}`);
          console.log(`Explanation: ${item.explanation}`);
        }
      }
    }
  }
  process.exit(0);
}

query().catch(console.error);

import mongoose from 'mongoose';
import { TestSeries } from '../lib/models/TestSeries';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  
  // Check ALL practice tests
  const docs = await TestSeries.find({ $or: [{ isRandom: true }, { isManual: true }] });
  
  for (const doc of docs) {
    let enExp = 0, hiExp = 0, manualExp = 0;
    
    if (doc.bilingualQuestions?.length) {
      doc.bilingualQuestions.forEach((q: any) => {
        if (q.english?.explanation) enExp++;
        if (q.hindi?.explanation) hiExp++;
      });
    }
    if (doc.manualQuestions?.length) {
      doc.manualQuestions.forEach((q: any) => {
        if (q.explanation && q.explanation !== 'No explanation provided.') manualExp++;
      });
    }
    
    const total = doc.bilingualQuestions?.length || doc.manualQuestions?.length || 0;
    console.log(`[${doc.testType || 'quiz'}] ${doc.title} (ID: ${doc.id})`);
    console.log(`  Total Qs: ${total} | EN exp: ${enExp} | HI exp: ${hiExp} | Manual exp: ${manualExp}`);
    console.log('');
  }
  
  mongoose.disconnect();
}
run();

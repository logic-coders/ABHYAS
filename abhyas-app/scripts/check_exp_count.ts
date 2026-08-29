import mongoose from 'mongoose';
import { TestSeries } from '../lib/models/TestSeries';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const series = await TestSeries.findOne({ id: 'bdd9f679-295c-4996-8b99-4ebdeff4f4e8' });
  if (series) {
    let enCount = 0;
    let hiCount = 0;
    series.bilingualQuestions?.forEach((q: any) => {
      if (q.english?.explanation) enCount++;
      if (q.hindi?.explanation) hiCount++;
    });
    console.log(`EN explanations: ${enCount}`);
    console.log(`HI explanations: ${hiCount}`);
  } else {
    console.log("Not found");
  }
  mongoose.disconnect();
}
run();

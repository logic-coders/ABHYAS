import mongoose from 'mongoose';
import { TestSeries } from './lib/models/TestSeries';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const series = await TestSeries.findOne({ id: 'bdd9f679-295c-4996-8b99-4ebdeff4f4e8' });
  if (series) {
    console.log("Bilingual questions count:", series.bilingualQuestions?.length);
    console.log("First question explanation (EN):", series.bilingualQuestions[0]?.english?.explanation);
    console.log("First question explanation (HI):", series.bilingualQuestions[0]?.hindi?.explanation);
  } else {
    console.log("Not found");
  }
  mongoose.disconnect();
}
run();

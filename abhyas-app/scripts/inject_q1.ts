import mongoose from 'mongoose';
import { TestSeries } from '../lib/models/TestSeries';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const doc = await TestSeries.findOne({ id: 'bdd9f679-295c-4996-8b99-4ebdeff4f4e8' });
  if (doc && doc.bilingualQuestions) {
    const q1 = doc.bilingualQuestions[0];
    q1.english.explanation = "Alhaiya Bilawal is a popular morning Raga that belongs to the Bilawal Thaat. The Bilawal Thaat uses all natural (Shuddha) notes, and Alhaiya Bilawal shares this characteristic, making it a prominent representative of its parent Thaat.";
    q1.hindi.explanation = "अल्हैया बिलावल एक लोकप्रिय प्रातःकालीन राग है जो बिलावल थाट से संबंधित है। बिलावल थाट में सभी शुद्ध स्वरों का प्रयोग होता है, और अल्हैया बिलावल इस विशेषता को साझा करता है, जो इसे अपने मूल थाट का एक प्रमुख प्रतिनिधि बनाता है।";
    
    await TestSeries.updateOne({ _id: doc._id }, { $set: { bilingualQuestions: doc.bilingualQuestions } });
    console.log('Saved Q1 explanation manually.');
  }
  mongoose.disconnect();
}
run();

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const tests = await db.collection('testseries').find({}).limit(20).toArray();
  for (const t of tests) {
      if (t.manualQuestions && t.manualQuestions.length > 0) {
          console.log(`Test: ${t.title}`);
          console.log(`  Manual Q1 CA:`, t.manualQuestions[0].correctAnswer);
          console.log(`  Manual Q1 Options:`, t.manualQuestions[0].options);
      }
      if (t.bilingualQuestions && t.bilingualQuestions.length > 0) {
          console.log(`Test: ${t.title}`);
          console.log(`  Bilingual Q1 CA:`, t.bilingualQuestions[0].correctAnswer);
          console.log(`  Bilingual Q1 Options:`, t.bilingualQuestions[0].english?.options || t.bilingualQuestions[0].hindi?.options);
      }
  }
  
  await client.close();
}
run().catch(console.error);

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const testseries = await db.collection('testseries').findOne({ title: "Music Practice Test - 1" });
  if (testseries && testseries.bilingualQuestions) {
      for (const qNum of [12, 56, 57, 58, 59, 79, 80]) {
          const q = testseries.bilingualQuestions.find(bq => bq.number === qNum);
          if (q) {
             console.log(`Q${qNum} DB CA:`, q.correctAnswer);
             console.log(`  Explanation:`, q.english?.explanation || q.hindi?.explanation);
          }
      }
  }
  
  await client.close();
}
run().catch(console.error);

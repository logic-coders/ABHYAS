const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  const testseries = await db.collection('testseries').findOne({id: "1f3cc4b9-2d3a-42f1-86b2-10b2150c3808"});
  if (testseries) {
    for (let i = 0; i < 5; i++) {
        const q = testseries.bilingualQuestions[i];
        console.log(`Q${i+1} correctAnswer in Q:`, q.correctAnswer);
        console.log(`Q${i+1} correctAnswer in answers dict:`, testseries.answers[`${i+1}`]);
        console.log(`Q${i+1} explanation:`, q.english.explanation);
    }
  }
  await client.close();
}
run().catch(console.error);

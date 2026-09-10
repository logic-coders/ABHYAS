const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  const testseries = await db.collection('testseries').findOne({id: "1f3cc4b9-2d3a-42f1-86b2-10b2150c3808"});
  if (testseries && testseries.bilingualQuestions) {
    const q = testseries.bilingualQuestions[0];
    console.log("English Q:", q.english);
    console.log("Hindi Q:", q.hindi);
    console.log("correctAnswer:", q.correctAnswer);
  }
  await client.close();
}
run().catch(console.error);

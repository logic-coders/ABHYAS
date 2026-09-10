const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const testseries = await db.collection('testseries').findOne({ title: "Music Test - 1" });
  if (testseries && testseries.bilingualQuestions) {
      const q = testseries.bilingualQuestions.find(bq => bq.number === 36);
      if (q) {
         console.log(`Q36 Options EN:`, q.english?.options);
      }
  }
  
  await client.close();
}
run().catch(console.error);

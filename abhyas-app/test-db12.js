const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const testseries = await db.collection('testseries').findOne({ title: "Music Practice Test - 1" });
  if (testseries && testseries.bilingualQuestions) {
      console.log(`Q0 number:`, testseries.bilingualQuestions[0].number);
      console.log(`Q0 correctAns:`, testseries.bilingualQuestions[0].correctAnswer);
  }
  
  const result = await db.collection('results').findOne({ seriesTitle: "Music Practice Test - 1" });
  if (result && result.breakdown) {
      console.log(`Result Q0 number:`, result.breakdown[0].questionNumber);
      console.log(`Result Q0 correctAns:`, result.breakdown[0].correctAnswer);
  }
  
  await client.close();
}
run().catch(console.error);

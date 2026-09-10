const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const results = await db.collection('results').find({}).sort({ _id: -1 }).limit(1).toArray();
  if (results.length > 0) {
      console.log(`Latest Result ID: ${results[0].id}`);
      console.log(`Latest Result Title: ${results[0].seriesTitle}`);
      console.log(`Date: ${results[0].date}`);
      for (const q of results[0].breakdown) {
          console.log(`Q${q.questionNumber}: User=${q.userAnswer}, Correct=${q.correctAnswer}, isCorrect=${q.isCorrect}`);
      }
  }
  
  await client.close();
}
run().catch(console.error);

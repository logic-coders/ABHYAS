const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const results = await db.collection('results').find({ "breakdown.explanation": { $exists: true, $ne: null, $ne: "" } }).limit(5).toArray();
  for (const r of results) {
      if (r.breakdown && r.breakdown.length > 0) {
          const q = r.breakdown[0];
          console.log(`Test: ${r.seriesTitle}`);
          console.log(`Q1 Text:`, q.questionText.substring(0, 50));
          console.log(`Options:`, q.options);
          console.log(`Correct Answer:`, q.correctAnswer);
          console.log(`Explanation:`, q.explanation.substring(0, 100).replace(/\n/g, ' '));
      }
  }
  
  await client.close();
}
run().catch(console.error);

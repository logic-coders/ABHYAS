const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const results = await db.collection('results').find({}).limit(5).toArray();
  for (const r of results) {
      if (r.breakdown && r.breakdown.length > 0) {
          const q = r.breakdown[0];
          console.log(`Result Q1 text:`, q.questionText.substring(0, 50));
          console.log(`  correctAnswer in Result:`, q.correctAnswer);
          console.log(`  explanation:`, q.explanation ? q.explanation.substring(0, 80) : "none");
          const conclusionMatch = q.explanation ? q.explanation.match(/(?:Correct option|सही विकल्प)[^.]*\./i) : null;
          console.log(`  explanation conclusion:`, conclusionMatch ? conclusionMatch[0] : "none");
      }
  }
  
  await client.close();
}
run().catch(console.error);

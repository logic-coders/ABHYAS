const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  // check a few test series
  const tests = await db.collection('testseries').find({}).limit(5).toArray();
  for (const t of tests) {
      console.log(`Test: ${t.title}`);
      if (t.bilingualQuestions && t.bilingualQuestions.length > 0) {
          console.log(`  Bilingual Q1 CA:`, t.bilingualQuestions[0].correctAnswer);
      }
      if (t.manualQuestions && t.manualQuestions.length > 0) {
          console.log(`  Manual Q1 CA:`, t.manualQuestions[0].correctAnswer);
      }
      if (t.randomQuestions && t.randomQuestions.length > 0) {
          console.log(`  Random Q1 CA in answers:`, t.answers ? t.answers[t.randomQuestions[0].number] : undefined);
      }
  }
  
  // check results
  const results = await db.collection('results').find({}).limit(5).toArray();
  for (const r of results) {
      console.log(`Result for ${r.seriesTitle}, Q1 CA:`, r.breakdown && r.breakdown.length > 0 ? r.breakdown[0].correctAnswer : null);
  }
  
  await client.close();
}
run().catch(console.error);

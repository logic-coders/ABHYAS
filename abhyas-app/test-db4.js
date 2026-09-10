const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const results = await db.collection('results').find({}).limit(20).toArray();
  for (const r of results) {
      if (r.breakdown && r.breakdown.length > 0) {
          const ca = r.breakdown[0].correctAnswer;
          if (["1", "2", "3", "4"].includes(ca)) {
             console.log(`Found numeric CA in ${r.seriesTitle}: ${ca}`);
          }
      }
  }
  
  const tests = await db.collection('testseries').find({}).limit(20).toArray();
  for (const t of tests) {
      if (t.answers) {
         const ca = t.answers["1"];
         if (["1", "2", "3", "4"].includes(String(ca))) {
             console.log(`Found numeric CA in test answers ${t.title}: ${ca}`);
         }
      }
  }
  
  await client.close();
}
run().catch(console.error);

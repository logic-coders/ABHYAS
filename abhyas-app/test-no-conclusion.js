const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const testseries = await db.collection('testseries').find({}).toArray();
  let countNoConclusion = 0;
  let totalQuestions = 0;
  const regex = /(?:Correct option(?: is)?|सही विकल्प|Correct Answer).*?(?:option|विकल्प)?\s*\(?\s*\b([A-Ea-e])\b\s*\)?\s*(?:\.|$|है)/i;
  
  for (const s of testseries) {
      if (s.bilingualQuestions) {
          for (const q of s.bilingualQuestions) {
              totalQuestions++;
              const exp = q.english?.explanation || q.hindi?.explanation || "";
              if (exp.length > 10 && !exp.match(regex)) {
                  countNoConclusion++;
              }
          }
      }
      if (s.manualQuestions) {
          for (const q of s.manualQuestions) {
              totalQuestions++;
              const exp = q.explanation || "";
              if (exp.length > 10 && !exp.match(regex)) {
                  countNoConclusion++;
              }
          }
      }
  }
  
  console.log(`Total questions: ${totalQuestions}`);
  console.log(`Questions with no explicit conclusion match: ${countNoConclusion}`);
  
  await client.close();
}
run().catch(console.error);

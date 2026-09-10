const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const seriesCursor = db.collection('testseries').find({});
  let totalMismatches = 0;
  
  for await (const s of seriesCursor) {
      if (s.bilingualQuestions) {
          for (const q of s.bilingualQuestions) {
              const exp = q.english?.explanation || q.hindi?.explanation || "";
              const conclusionMatch = exp.match(/(?:Correct option(?: is)?|सही विकल्प).*?([A-Ea-e])/i) || exp.match(/Correct Answer:\s*([A-Ea-e])/i);
              if (conclusionMatch) {
                  const expAns = conclusionMatch[1].toUpperCase();
                  const dbAns = (q.correctAnswer || '').trim().toUpperCase();
                  if (dbAns && expAns !== dbAns && ['A','B','C','D','E'].includes(expAns)) {
                      console.log(`[${s.title}] Q${q.number}: DB=${dbAns}, Exp=${expAns}`);
                      totalMismatches++;
                  }
              }
          }
      }
      if (s.manualQuestions) {
          for (const q of s.manualQuestions) {
              const exp = q.explanation || "";
              const conclusionMatch = exp.match(/(?:Correct option(?: is)?|सही विकल्प).*?([A-Ea-e])/i) || exp.match(/Correct Answer:\s*([A-Ea-e])/i);
              if (conclusionMatch) {
                  const expAns = conclusionMatch[1].toUpperCase();
                  const dbAns = (q.correctAnswer || '').trim().toUpperCase();
                  if (dbAns && expAns !== dbAns && ['A','B','C','D','E'].includes(expAns)) {
                      console.log(`[${s.title}] Q${q.number}: DB=${dbAns}, Exp=${expAns}`);
                      totalMismatches++;
                  }
              }
          }
      }
  }
  console.log(`Total mismatches found: ${totalMismatches}`);
  
  await client.close();
}
run().catch(console.error);

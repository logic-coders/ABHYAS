const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const results = await db.collection('results').find({ "breakdown.explanation": { $exists: true, $ne: null, $ne: "" } }).limit(20).toArray();
  let foundMismatch = false;
  for (const r of results) {
      if (r.breakdown && r.breakdown.length > 0) {
          for (const q of r.breakdown) {
             if (q.explanation && q.correctAnswer) {
                 const conclusionMatch = q.explanation.match(/(?:Correct option|सही विकल्प).*?\(([A-Za-z])\)/i) || q.explanation.match(/(?:Correct option is|सही विकल्प).*?([A-Za-z])/i);
                 if (conclusionMatch) {
                     const expAns = conclusionMatch[1].toUpperCase();
                     const dbAns = q.correctAnswer.trim().toUpperCase();
                     if (expAns !== dbAns) {
                         console.log(`Mismatch in ${r.seriesTitle} Q${q.questionNumber}! DB CA: ${dbAns}, Exp CA: ${expAns}`);
                         foundMismatch = true;
                     }
                 }
             }
          }
      }
  }
  if (!foundMismatch) console.log("No mismatches found between DB correctAnswer and explanation conclusion!");
  
  await client.close();
}
run().catch(console.error);

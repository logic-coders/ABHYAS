const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const results = await db.collection('results').find({ "breakdown.explanation": { $exists: true, $ne: null, $ne: "" } }).toArray();
  for (const r of results) {
      if (r.breakdown && r.breakdown.length > 0) {
          for (const q of r.breakdown) {
             if (q.explanation && q.correctAnswer) {
                 const match = q.explanation.match(/(?:Correct option|सही विकल्प|Correct Answer).*?\b([A-Ea-e])\b(?:\.|$|है)/i);
                 if (match) {
                     const expAns = match[1].toUpperCase();
                     const dbAns = q.correctAnswer.trim().toUpperCase();
                     if (dbAns && expAns !== dbAns && ['A','B','C','D','E'].includes(expAns)) {
                         console.log(`Mismatch in ${r.seriesTitle} Q${q.questionNumber}! DB CA: ${dbAns}, Exp CA: ${expAns}`);
                     }
                 }
             }
          }
      }
  }
  
  await client.close();
}
run().catch(console.error);

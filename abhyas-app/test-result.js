const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const resultIdStr = "10f8540b-9ad5-4a00-8670-577238c3dc5b";
  let result = await db.collection('results').findOne({ _id: resultIdStr });
  
  if (!result) {
      try {
          result = await db.collection('results').findOne({ _id: new ObjectId(resultIdStr) });
      } catch (e) {}
  }
  
  if (!result) {
      result = await db.collection('results').findOne({ id: resultIdStr });
  }

  if (result) {
      console.log(`Found result! Series ID: ${result.seriesId}`);
      for (const q of result.breakdown) {
          if (q.questionNumber === 5) {
              console.log(`Q5 CA: ${q.correctAnswer}`);
              console.log(`Q5 Exp: ${q.explanation}`);
          }
      }
  } else {
      console.log(`Result ${resultIdStr} not found.`);
  }
  
  await client.close();
}
run().catch(console.error);

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const seriesId = "10f8540b-9ad5-4a00-8670-577238c3dc5b";
  const result = await db.collection('results').findOne({ seriesId });
  
  if (result) {
      const q8 = result.breakdown.find(q => q.questionNumber === 8);
      console.log(`Q8 English text:`, q8.questionText);
      console.log(`Q8 Options:`, q8.options);
      console.log(`Q8 Explanation:`, q8.explanation);
      
      const series = await db.collection('testseries').findOne({ id: seriesId });
      const q8Series = series.bilingualQuestions.find(q => q.number === 8);
      console.log(`Series Q8 English Explanation:`, q8Series.english.explanation);
      console.log(`Series Q8 Hindi Explanation:`, q8Series.hindi.explanation);
  }
  
  await client.close();
}
run().catch(console.error);

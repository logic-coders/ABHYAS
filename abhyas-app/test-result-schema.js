const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  const sample = await db.collection('results').findOne({});
  if (sample) {
      console.log(`Keys:`, Object.keys(sample));
      console.log(`id type:`, typeof sample.id);
      console.log(`_id type:`, typeof sample._id);
  }
  
  await client.close();
}
run().catch(console.error);

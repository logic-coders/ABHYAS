const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  const testSeries = await mongoose.connection.db.collection('testseries').find({}).toArray();
  console.log('Users:', users.length);
  console.log('TestSeries:', testSeries.length);
  process.exit(0);
}
check().catch(console.error);

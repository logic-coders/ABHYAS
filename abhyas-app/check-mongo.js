require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const series = await mongoose.connection.db.collection('testseries').find({}).toArray();
  console.log(series);
  process.exit(0);
}
check().catch(console.error);

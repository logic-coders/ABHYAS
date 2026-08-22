require('dotenv').config({ path: '.env.local' });
require('ts-node').register({ transpileOnly: true });
const mongoose = require('mongoose');
const { User } = require('./lib/models/User');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({}).lean();
  console.log('Users in DB:', users.length, users[0]);
  process.exit(0);
}
test().catch(console.error);

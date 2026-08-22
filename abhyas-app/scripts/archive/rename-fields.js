require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.db.collection('users').updateMany(
    { password: { $exists: true } },
    { $rename: { "password": "passwordHash" } }
  );
  console.log('Renamed password to passwordHash');
  process.exit(0);
}
fix().catch(console.error);

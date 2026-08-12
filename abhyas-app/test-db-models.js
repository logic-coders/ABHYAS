require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String
});
const User = mongoose.model('User', UserSchema);

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({}).lean();
  console.log(users);
  process.exit(0);
}
check().catch(console.error);

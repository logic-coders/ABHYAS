require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

// Mongoose Models
const UserSchema = new mongoose.Schema({
  id: String, name: String, email: String, passwordHash: String, password: String,
  role: String, accountStatus: String, createdAt: String, resetOtp: String, resetOtpExpiry: String
}, { strict: false });
const User = mongoose.model('User', UserSchema);

const TestSeriesSchema = new mongoose.Schema({
  id: String, title: String, subject: String, s3Key: String, startQuestion: Number, endQuestion: Number,
  createdAt: String, isRandom: Boolean, randomQuestions: Array
}, { strict: false });
const TestSeries = mongoose.model('TestSeries', TestSeriesSchema);

const ResultSchema = new mongoose.Schema({
  id: String, userId: String, seriesId: String, seriesTitle: String, subject: String, score: Number,
  correct: Number, incorrect: Number, unanswered: Number, totalQuestions: Number, percentage: Number, date: String, breakdown: Array
}, { strict: false });
const Result = mongoose.model('Result', ResultSchema);

// S3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY }
});

async function downloadJSON(key) {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }));
    const str = await res.Body.transformToString();
    return JSON.parse(str);
  } catch (err) {
    if (err.name === 'NoSuchKey') return null;
    throw err;
  }
}

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);

  const users = await downloadJSON('abhyas/users.json') || [];
  if (users.length > 0) {
    await User.deleteMany({});
    await User.insertMany(users);
    console.log(`Migrated ${users.length} users`);
  }

  const series = await downloadJSON('abhyas/test-series.json') || [];
  if (series.length > 0) {
    await TestSeries.deleteMany({});
    await TestSeries.insertMany(series);
    console.log(`Migrated ${series.length} test series`);
  }

  const results = await downloadJSON('abhyas/results.json') || [];
  if (results.length > 0) {
    await Result.deleteMany({});
    await Result.insertMany(results);
    console.log(`Migrated ${results.length} results`);
  }

  console.log('Done!');
  process.exit(0);
}

migrate().catch(console.error);

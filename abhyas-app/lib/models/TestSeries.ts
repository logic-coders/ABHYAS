import mongoose from 'mongoose';

const TestSeriesSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  s3Key: { type: String },
  startQuestion: { type: Number },
  endQuestion: { type: Number },
  createdAt: { type: String, required: true },
  isRandom: { type: Boolean },
  randomQuestions: [{ s3Key: String, number: Number }],
});

export const TestSeries = mongoose.models.TestSeries || mongoose.model('TestSeries', TestSeriesSchema);

import mongoose from 'mongoose';

const ManualQuestionSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  text: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
}, { _id: false });

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
  format: { type: String, default: 'test' },
  isQuiz: { type: Boolean, default: false },
  durationPerQuestion: { type: Number, default: 30 },
  isManual: { type: Boolean, default: false },
  manualQuestions: [ManualQuestionSchema],
  isDailyStreak: { type: Boolean, default: false },
  streakDate: { type: String },
});

export const TestSeries = mongoose.models.TestSeries || mongoose.model('TestSeries', TestSeriesSchema);

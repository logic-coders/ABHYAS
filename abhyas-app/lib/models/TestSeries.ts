import mongoose from 'mongoose';

const ManualQuestionSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  text: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
}, { _id: false });

const BilingualQuestionSchema = new mongoose.Schema({
  number: { type: Number, required: true },
  english: {
    text: { type: String, required: true },
    options: [{ type: String }],
    explanation: { type: String },
  },
  hindi: {
    text: { type: String, required: true },
    options: [{ type: String }],
    explanation: { type: String },
  },
  correctAnswer: { type: String },
  status: { type: String },
  issues: [{ type: String }],
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
  bilingualQuestions: [BilingualQuestionSchema],
  answers: { type: Map, of: String },
  isDailyStreak: { type: Boolean, default: false },
  streakDate: { type: String },
  testType: { type: String, default: 'prev-year' },
  durationMinutes: { type: Number },
  cachedQuestions: { 
    type: Map, 
    of: [{
      number: { type: Number, required: true },
      text: { type: String, required: true },
      options: [{ type: String }],
    }]
  }
});

TestSeriesSchema.index({ isDailyStreak: 1, streakDate: 1 });

export const TestSeries = mongoose.models.TestSeries || mongoose.model('TestSeries', TestSeriesSchema);

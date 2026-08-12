import mongoose from 'mongoose';

const ResultItemSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  userAnswer: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const ResultSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  seriesId: { type: String, required: true },
  seriesTitle: { type: String, required: true },
  subject: { type: String, required: true },
  score: { type: Number, required: true },
  correct: { type: Number },
  incorrect: { type: Number },
  unanswered: { type: Number },
  totalQuestions: { type: Number },
  percentage: { type: Number },
  date: { type: String, required: true },
  breakdown: [ResultItemSchema],
});

export const Result = mongoose.models.Result || mongoose.model('Result', ResultSchema);

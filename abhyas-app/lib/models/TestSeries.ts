import mongoose from 'mongoose';

const TestSeriesSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  createdAt: { type: String, required: true },
  pdfS3Key: { type: String },
  totalQuestions: { type: Number },
  durationMinutes: { type: Number },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
});

export const TestSeries = mongoose.models.TestSeries || mongoose.model('TestSeries', TestSeriesSchema);

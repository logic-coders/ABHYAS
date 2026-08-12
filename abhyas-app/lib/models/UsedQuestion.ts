import mongoose from 'mongoose';

const UsedQuestionSchema = new mongoose.Schema({
  subject: { type: String, required: true, unique: true },
  keys: [{ type: String }],
});

export const UsedQuestion = mongoose.models.UsedQuestion || mongoose.model('UsedQuestion', UsedQuestionSchema);

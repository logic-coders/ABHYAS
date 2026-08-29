import mongoose from 'mongoose';

/**
 * Tracks previously generated AI practice test questions per subject.
 * Used to prevent question repetition across multiple generations.
 *
 * - fingerprints: normalised question stems for dedup matching
 * - sampleTexts: last ~160 raw English question texts, injected into LLM prompts
 */
const GeneratedQuestionHistorySchema = new mongoose.Schema({
  subject: { type: String, required: true, unique: true },
  fingerprints: [{ type: String }],
  sampleTexts: [{ type: String }],
});

export const GeneratedQuestionHistory =
  mongoose.models.GeneratedQuestionHistory ||
  mongoose.model('GeneratedQuestionHistory', GeneratedQuestionHistorySchema);

import { Subject, ExamFormat, ResultItem } from '@/lib/types';
import connectToDatabase from '@/lib/db/mongoose';
import { Result } from '@/lib/models/Result';

export interface TestResultSummary {
  id: string;
  userId: string;
  seriesId: string;
  seriesTitle: string;
  subject: Subject;
  score: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  totalQuestions: number;
  percentage: number;
  format?: ExamFormat;
  date: string; // ISO string
  breakdown?: ResultItem[];
}

// Helper to convert Mongoose document to plain object
function toPlainResult(doc: any): TestResultSummary {
  const plainBreakdown = Array.isArray(doc.breakdown)
    ? doc.breakdown.map((item: any) => ({
        questionNumber: item.questionNumber,
        questionText: item.questionText,
        options: Array.isArray(item.options) ? [...item.options] : [],
        userAnswer: item.userAnswer,
        correctAnswer: item.correctAnswer,
        isCorrect: Boolean(item.isCorrect),
        explanation: item.explanation,
      }))
    : undefined;

  return {
    id: doc.id,
    userId: doc.userId,
    seriesId: doc.seriesId,
    seriesTitle: doc.seriesTitle,
    subject: doc.subject as Subject,
    score: doc.score,
    correct: doc.correct,
    incorrect: doc.incorrect,
    unanswered: doc.unanswered,
    totalQuestions: doc.totalQuestions,
    percentage: doc.percentage,
    format: (doc.format as ExamFormat) || 'test',
    date: doc.date,
    breakdown: plainBreakdown,
  };
}

export async function saveResult(
  data: Omit<TestResultSummary, 'id' | 'date'> & { id?: string; date?: string }
): Promise<TestResultSummary> {
  await connectToDatabase();
  const doc = await Result.create({
    ...data,
    id: data.id || crypto.randomUUID(),
    date: data.date || new Date().toISOString(),
  });
  return toPlainResult(doc);
}

export const addResult = saveResult;

export async function getAllResults(): Promise<TestResultSummary[]> {
  await connectToDatabase();
  const docs = await Result.find({}).sort({ createdAt: -1 }).lean();
  return docs.map(toPlainResult);
}

export async function getResultsByUserId(userId: string): Promise<TestResultSummary[]> {
  await connectToDatabase();
  const docs = await Result.find({ userId }).sort({ createdAt: -1 }).lean();
  return docs.map(toPlainResult);
}

export const getResultsByUser = getResultsByUserId;
export const getUserResults = getResultsByUserId;

export async function getResultById(id: string): Promise<TestResultSummary | null> {
  await connectToDatabase();
  const doc = await Result.findOne({ id }).lean();
  return doc ? toPlainResult(doc) : null;
}

/**
 * Keeps only the latest `limit` (default: 5) test results for an admin login/account.
 * Deletes any older test history beyond the top 5 for the admin user.
 * Regular users' test histories remain completely unchanged.
 */
export async function trimAdminResultsToLatestN(userId: string, limit: number = 5): Promise<{ deletedCount: number }> {
  await connectToDatabase();
  try {
    const allResults = await Result.find({ userId })
      .sort({ createdAt: -1, date: -1 })
      .select('_id')
      .lean();

    if (allResults.length > limit) {
      const idsToDelete = allResults.slice(limit).map((r) => r._id);
      const res = await Result.deleteMany({ _id: { $in: idsToDelete } });
      return { deletedCount: res.deletedCount || 0 };
    }

    return { deletedCount: 0 };
  } catch (error) {
    console.error('Failed to trim admin test history:', error);
    return { deletedCount: 0 };
  }
}

export const clearAdminResultsOlderThanToday = (userId: string) => trimAdminResultsToLatestN(userId, 5);

/**
 * Clears all test results for a specific user.
 */
export async function clearAllUserResults(userId: string): Promise<{ deletedCount: number }> {
  await connectToDatabase();
  try {
    const res = await Result.deleteMany({ userId });
    return { deletedCount: res.deletedCount || 0 };
  } catch (error) {
    console.error('Failed to clear user results:', error);
    return { deletedCount: 0 };
  }
}

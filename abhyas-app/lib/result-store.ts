import { Subject, ExamFormat, ResultItem } from '@/lib/types';
import connectToDatabase from '@/lib/mongoose';
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
    breakdown: doc.breakdown,
  };
}

export async function saveResult(
  data: Omit<TestResultSummary, 'id' | 'date'>
): Promise<TestResultSummary> {
  await connectToDatabase();
  const doc = await Result.create({
    ...data,
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
  });
  return toPlainResult(doc);
}

export const addResult = saveResult;

export async function getAllResults(): Promise<TestResultSummary[]> {
  await connectToDatabase();
  const docs = await Result.find({}).sort({ createdAt: -1 }).lean();
  return docs.map(toPlainResult);
}

export async function getResultsByUser(userId: string): Promise<TestResultSummary[]> {
  await connectToDatabase();
  const docs = await Result.find({ userId }).sort({ createdAt: -1 }).lean();
  return docs.map(toPlainResult);
}

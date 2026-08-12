import { Subject } from './types';
import connectToDatabase from './mongoose';
import { Result } from './models/Result';

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
  date: string; // ISO string
  breakdown?: import('./types').ResultItem[];
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
    date: doc.date,
    breakdown: doc.breakdown,
  };
}

export async function getAllResults(): Promise<TestResultSummary[]> {
  await connectToDatabase();
  const results = await Result.find({}).lean();
  return results.map(toPlainResult);
}

export async function getResultsByUser(userId: string): Promise<TestResultSummary[]> {
  await connectToDatabase();
  const results = await Result.find({ userId }).sort({ date: -1 }).lean();
  return results.map(toPlainResult);
}

export async function addResult(result: TestResultSummary): Promise<void> {
  await connectToDatabase();
  await Result.create(result);
}

import { uploadJSON, downloadJSON } from './s3';
import { Subject } from './types';

const RESULTS_KEY = 'abhyas/results.json';

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

/**
 * Retrieve all results from S3.
 */
export async function getAllResults(): Promise<TestResultSummary[]> {
  try {
    const data = await downloadJSON<TestResultSummary[]>(RESULTS_KEY);
    return data ?? [];
  } catch (error) {
    console.warn('Could not load results from S3:', (error as Error).message);
    return [];
  }
}

/**
 * Get results for a specific user.
 */
export async function getResultsByUser(userId: string): Promise<TestResultSummary[]> {
  const all = await getAllResults();
  return all.filter((r) => r.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Add a new result to the store.
 */
export async function addResult(result: TestResultSummary): Promise<void> {
  const all = await getAllResults();
  all.push(result);
  await uploadJSON(RESULTS_KEY, all);
}

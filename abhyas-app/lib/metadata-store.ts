import { TestSeries } from './types';
import { uploadJSON, downloadJSON } from './s3';

const METADATA_KEY = 'abhyas/test-series.json';

/**
 * Retrieve all test series from the S3-backed JSON store.
 * Returns an empty array if no data exists yet.
 */
export async function getAllTestSeries(): Promise<TestSeries[]> {
  try {
    const data = await downloadJSON<TestSeries[]>(METADATA_KEY);
    return data ?? [];
  } catch (error) {
    console.warn('Could not load test series from S3 (credentials configured?):', (error as Error).message);
    return [];
  }
}

/**
 * Retrieve a single test series by its ID.
 * Returns null if not found.
 */
export async function getTestSeriesById(
  id: string
): Promise<TestSeries | null> {
  const all = await getAllTestSeries();
  return all.find((ts) => ts.id === id) ?? null;
}

/**
 * Add a new test series entry and persist back to S3.
 */
export async function addTestSeries(entry: TestSeries): Promise<void> {
  const all = await getAllTestSeries();
  all.push(entry);
  await uploadJSON(METADATA_KEY, all);
}

/**
 * Delete a test series by ID and persist back to S3.
 */
export async function deleteTestSeries(id: string): Promise<void> {
  const all = await getAllTestSeries();
  const filtered = all.filter((ts) => ts.id !== id);
  await uploadJSON(METADATA_KEY, filtered);
}

const USED_QUESTIONS_KEY = 'abhyas/used-random-questions.json';

/** Store of used question keys (format: `s3Key:questionNumber`) per subject */
type UsedQuestionsStore = Record<string, string[]>;

export async function getUsedQuestions(subject: string): Promise<string[]> {
  try {
    const data = await downloadJSON<UsedQuestionsStore>(USED_QUESTIONS_KEY);
    return data?.[subject] ?? [];
  } catch (error) {
    return [];
  }
}

export async function markQuestionsAsUsed(subject: string, questions: { s3Key: string, number: number }[]): Promise<void> {
  let data: UsedQuestionsStore = {};
  try {
    const existing = await downloadJSON<UsedQuestionsStore>(USED_QUESTIONS_KEY);
    if (existing) data = existing;
  } catch (error) {
    // Ignore, just initialize empty
  }

  const usedForSubject = new Set(data[subject] ?? []);
  for (const q of questions) {
    usedForSubject.add(`${q.s3Key}:${q.number}`);
  }
  
  data[subject] = Array.from(usedForSubject);
  await uploadJSON(USED_QUESTIONS_KEY, data);
}

export async function clearUsedQuestions(subject: string): Promise<void> {
  let data: UsedQuestionsStore = {};
  try {
    const existing = await downloadJSON<UsedQuestionsStore>(USED_QUESTIONS_KEY);
    if (existing) data = existing;
  } catch (error) {
    // Ignore
  }

  data[subject] = [];
  await uploadJSON(USED_QUESTIONS_KEY, data);
}

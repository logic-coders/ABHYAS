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

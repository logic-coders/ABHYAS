import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { downloadJSON } from '@/lib/s3';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/lib/models/User';
import { TestSeries } from '@/lib/models/TestSeries';
import { Result } from '@/lib/models/Result';
import { UsedQuestion } from '@/lib/models/UsedQuestion';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const results = {
      users: 0,
      testSeries: 0,
      results: 0,
      usedQuestions: 0,
    };

    // 1. Migrate Users
    const users = await downloadJSON<any[]>('abhyas/users.json') ?? [];
    if (users.length > 0) {
      // Clear existing to avoid duplicates during migration
      await User.deleteMany({});
      await User.insertMany(users);
      results.users = users.length;
    }

    // 2. Migrate Test Series
    const series = await downloadJSON<any[]>('abhyas/test-series.json') ?? [];
    if (series.length > 0) {
      await TestSeries.deleteMany({});
      await TestSeries.insertMany(series);
      results.testSeries = series.length;
    }

    // 3. Migrate Results
    const testResults = await downloadJSON<any[]>('abhyas/results.json') ?? [];
    if (testResults.length > 0) {
      await Result.deleteMany({});
      await Result.insertMany(testResults);
      results.results = testResults.length;
    }

    // 4. Migrate Used Questions
    const usedQuestionsMap = await downloadJSON<Record<string, string[]>>('abhyas/used-random-questions.json') ?? {};
    const usedQuestionsArray = Object.keys(usedQuestionsMap).map(subject => ({
      subject,
      keys: usedQuestionsMap[subject]
    }));
    
    if (usedQuestionsArray.length > 0) {
      await UsedQuestion.deleteMany({});
      await UsedQuestion.insertMany(usedQuestionsArray);
      results.usedQuestions = usedQuestionsArray.length;
    }

    return NextResponse.json({ success: true, message: 'Migration complete', details: results }, { status: 200 });
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: error.message || 'Migration failed' }, { status: 500 });
  }
}

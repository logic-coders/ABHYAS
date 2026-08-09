import { NextResponse, NextRequest } from 'next/server';
import { getAllTestSeries, addTestSeries, getUsedQuestions, markQuestionsAsUsed, clearUsedQuestions } from '@/lib/metadata-store';
import { Subject, TestSeries } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/auth';

const QUESTIONS_PER_TEST = 80;

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject } = await request.json();
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    // 2. Build pool of available questions
    const allSeries = await getAllTestSeries();
    const subjectSeries = allSeries.filter((s) => s.subject === subject && !s.isRandom);

    let fullPool: { s3Key: string, number: number }[] = [];
    for (const series of subjectSeries) {
      for (let i = series.startQuestion; i <= series.endQuestion; i++) {
        fullPool.push({ s3Key: series.s3Key, number: i });
      }
    }

    if (fullPool.length === 0) {
      return NextResponse.json({ error: 'No questions available for this subject' }, { status: 400 });
    }

    // 3. Filter out used questions
    let usedIds = await getUsedQuestions(subject);
    const usedSet = new Set(usedIds);
    let availablePool = fullPool.filter((q) => !usedSet.has(`${q.s3Key}:${q.number}`));

    // 4. Reset pool if not enough questions
    if (availablePool.length < QUESTIONS_PER_TEST) {
      await clearUsedQuestions(subject);
      availablePool = [...fullPool];
      usedSet.clear();
    }

    // 5. Shuffle and pick 80
    // Fisher-Yates shuffle
    for (let i = availablePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePool[i], availablePool[j]] = [availablePool[j], availablePool[i]];
    }

    const selectedQuestions = availablePool.slice(0, QUESTIONS_PER_TEST);

    // 6. Mark as used
    await markQuestionsAsUsed(subject, selectedQuestions);

    // 7. Create TestSeries
    const entry: TestSeries = {
      id: uuidv4(),
      title: `Random ${subject} Test - ${new Date().toLocaleDateString()}`,
      subject: subject as Subject,
      s3Key: '', // N/A for random tests
      startQuestion: 0,
      endQuestion: 0,
      createdAt: new Date().toISOString(),
      isRandom: true,
      randomQuestions: selectedQuestions,
    };

    await addTestSeries(entry);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Failed to generate test:', error);
    return NextResponse.json({ error: 'Failed to generate test' }, { status: 500 });
  }
}

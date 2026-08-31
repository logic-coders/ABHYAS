import { NextRequest, NextResponse } from 'next/server';
import { addTestSeries } from '@/lib/db/metadata-store';
import { TestSeries, Subject, SUBJECTS, BilingualQuestion, Question } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/utils/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      subject,
      testType = 'prev-year',
      durationMinutes,
      format = 'test',
      questions,
    }: {
      title: string;
      subject: Subject;
      testType?: 'prev-year' | 'practice';
      durationMinutes?: number;
      format?: 'test' | 'quiz';
      questions: BilingualQuestion[];
    } = body;

    // 2. Validation
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Test title is required' }, { status: 400 });
    }

    if (!subject || !SUBJECTS.includes(subject)) {
      return NextResponse.json(
        { error: `Invalid subject. Must be one of: ${SUBJECTS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'At least 1 question is required' }, { status: 400 });
    }

    // Format English & Hindi cached questions
    const enQuestions: Question[] = questions.map((q, idx) => ({
      number: idx + 1,
      text: q.english.text.trim(),
      options: q.english.options.map((opt) => opt.trim()),
    }));

    const hiQuestions: Question[] = questions.map((q, idx) => ({
      number: idx + 1,
      text: q.hindi.text.trim(),
      options: q.hindi.options.map((opt) => opt.trim()),
    }));

    // Extract answers map if provided
    const answersMap: Record<number, string> = {};
    questions.forEach((q, idx) => {
      if (q.correctAnswer) {
        answersMap[idx + 1] = q.correctAnswer.toUpperCase();
      }
    });

    const isQuiz = format === 'quiz';
    const computedDurationMinutes =
      durationMinutes || (isQuiz ? Math.ceil((questions.length * 30) / 60) : testType === 'prev-year' ? 150 : 80);

    const newTest: TestSeries = {
      id: uuidv4(),
      title: title.trim(),
      subject,
      startQuestion: 1,
      endQuestion: questions.length,
      createdAt: new Date().toISOString(),
      format,
      isQuiz,
      durationPerQuestion: isQuiz ? 30 : undefined,
      testType,
      durationMinutes: computedDurationMinutes,
      isRandom: false,
      bilingualQuestions: questions,
      answers: answersMap,
      cachedQuestions: {
        en: enQuestions,
        hi: hiQuestions,
      },
    };

    await addTestSeries(newTest);

    // Register fingerprints for future dedup
    try {
      const { addGeneratedQuestionHistory } = await import('@/lib/db/metadata-store');
      const { normalizeForFingerprint } = await import('@/lib/services/gemini');
      const fps = questions.map(q => normalizeForFingerprint(q.english?.text || q.hindi?.text || ''));
      const samples = questions.map(q => q.english?.text || q.hindi?.text || '');
      await addGeneratedQuestionHistory(subject, fps, samples);
    } catch (e) {
      console.warn('Could not register fingerprints:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Test "${newTest.title}" created successfully with ${questions.length} questions!`,
      test: newTest,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating test from TXT:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create test series' },
      { status: 500 }
    );
  }
}

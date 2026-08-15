import { NextResponse, NextRequest } from 'next/server';
import { getAllTestSeries, addTestSeries, getUsedQuestions, markQuestionsAsUsed, clearUsedQuestions } from '@/lib/metadata-store';
import { Subject, TestSeries } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/auth';

const QUESTIONS_PER_QUIZ = 20;
const DURATION_PER_QUESTION = 30; // seconds

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { subject } = await request.json();
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    // 1. Gather all question pools for this subject from original PDFs
    const allSeries = await getAllTestSeries();
    const subjectSeries = allSeries.filter((s) => s.subject === subject && !s.isRandom && !s.isQuiz);

    let fullPool: { s3Key: string; number: number }[] = [];
    for (const series of subjectSeries) {
      for (let i = series.startQuestion; i <= series.endQuestion; i++) {
        fullPool.push({ s3Key: series.s3Key, number: i });
      }
    }

    if (fullPool.length === 0) {
      return NextResponse.json(
        { error: `No question papers uploaded yet for ${subject}. Please ask your admin to upload a PDF.` },
        { status: 400 }
      );
    }

    // 2. Filter out already used quiz questions for this subject
    const quizSubjectKey = `quiz_${subject}`;
    let usedIds = await getUsedQuestions(quizSubjectKey);
    const usedSet = new Set(usedIds);
    let availablePool = fullPool.filter((q) => !usedSet.has(`${q.s3Key}:${q.number}`));

    // 3. Reset pool if remaining questions are fewer than needed
    if (availablePool.length < QUESTIONS_PER_QUIZ) {
      await clearUsedQuestions(quizSubjectKey);
      availablePool = [...fullPool];
      usedSet.clear();
    }

    // 4. Shuffle and select 20 questions
    for (let i = availablePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePool[i], availablePool[j]] = [availablePool[j], availablePool[i]];
    }

    const countToTake = Math.min(QUESTIONS_PER_QUIZ, availablePool.length);
    const selectedQuestions = availablePool.slice(0, countToTake);

    // 5. Mark as used for quizzes
    await markQuestionsAsUsed(quizSubjectKey, selectedQuestions);

    // 6. Create Quiz Series entity
    const allQuizzesForSubject = allSeries.filter((s) => s.subject === subject && (s.isQuiz || s.format === 'quiz')).length + 1;

    const quizEntry: TestSeries = {
      id: uuidv4(),
      title: `${subject} Speed Quiz ${allQuizzesForSubject}`,
      subject: subject as Subject,
      s3Key: '',
      startQuestion: 1,
      endQuestion: selectedQuestions.length,
      createdAt: new Date().toISOString(),
      isRandom: true,
      isQuiz: true,
      format: 'quiz',
      durationPerQuestion: DURATION_PER_QUESTION,
      randomQuestions: selectedQuestions,
    };

    await addTestSeries(quizEntry);

    return NextResponse.json({ quiz: quizEntry }, { status: 201 });
  } catch (error) {
    console.error('Failed to generate speed quiz:', error);
    return NextResponse.json({ error: 'Failed to create speed quiz' }, { status: 500 });
  }
}

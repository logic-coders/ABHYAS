import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { addTestSeries } from '@/lib/metadata-store';
import { getUser } from '@/lib/auth';
import { ManualQuestion, Subject, SUBJECTS } from '@/lib/types';

/**
 * POST /api/admin/create-quiz-manual
 * Accepts title, subject, and an array of ManualQuestions (1 to 20).
 * Stores a manual-entry speed quiz.
 */
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, subject, questions } = body as {
      title?: string;
      subject?: Subject;
      questions?: ManualQuestion[];
    };

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Quiz title is required' }, { status: 400 });
    }

    if (!subject || !SUBJECTS.includes(subject)) {
      return NextResponse.json({ error: 'Valid subject is required' }, { status: 400 });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'At least one question is required' }, { status: 400 });
    }

    if (questions.length > 20) {
      return NextResponse.json({ error: 'Maximum 20 questions allowed per quiz' }, { status: 400 });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text || !q.text.trim()) {
        return NextResponse.json({ error: `Question ${i + 1} text is empty` }, { status: 400 });
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return NextResponse.json({ error: `Question ${i + 1} must have at least 2 options` }, { status: 400 });
      }
      if (!q.correctAnswer) {
        return NextResponse.json({ error: `Question ${i + 1} must have a correct answer selected` }, { status: 400 });
      }
    }

    const newQuizId = uuidv4();
    const formattedQuestions: ManualQuestion[] = questions.map((q, idx) => ({
      number: idx + 1,
      text: q.text.trim(),
      options: q.options.map((opt) => opt.trim()),
      correctAnswer: q.correctAnswer.trim().toUpperCase(),
    }));

    const newQuiz = {
      id: newQuizId,
      title: title.trim(),
      subject,
      createdAt: new Date().toISOString(),
      format: 'quiz' as const,
      isQuiz: true,
      durationPerQuestion: 30,
      isManual: true,
      manualQuestions: formattedQuestions,
      startQuestion: 1,
      endQuestion: formattedQuestions.length,
    };

    await addTestSeries(newQuiz);

    return NextResponse.json({ success: true, quiz: newQuiz }, { status: 201 });
  } catch (error) {
    console.error('Failed to create manual quiz:', error);
    return NextResponse.json({ error: 'Failed to create manual quiz' }, { status: 500 });
  }
}

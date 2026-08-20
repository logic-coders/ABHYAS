import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getUser } from '@/lib/auth';
import { SUBJECTS, Subject } from '@/lib/types';
import { CURATED_STREAK_QUESTIONS } from '@/lib/streak-pool';
import { generateStreakQuestions } from '@/lib/gemini';
import connectToDatabase from '@/lib/mongoose';
import { TestSeries } from '@/lib/models/TestSeries';

import { getTodayDateIST } from '@/lib/date-utils';

/**
 * POST /api/admin/generate-streak-quiz
 * Auto-generates today's 20-question rotating Daily Streak Quiz.
 * Tries AI generation first (Gemini), falls back to curated pool.
 */
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const forceSubject = url.searchParams.get('subject') as Subject | null;

    // Calculate today's rotating subject based on date
    const todayDate = getTodayDateIST();
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % SUBJECTS.length;
    const rotatingSubject: Subject = forceSubject && SUBJECTS.includes(forceSubject)
      ? forceSubject
      : SUBJECTS[dayIndex];

    await connectToDatabase();

    // Check if a streak quiz already exists for today
    const existing = await TestSeries.findOne({
      isDailyStreak: true,
      streakDate: todayDate,
    });

    if (existing) {
      // Admin is forcefully generating a new streak quiz, so delete the existing one for today
      await TestSeries.deleteOne({ _id: existing._id });
      console.log(`🗑️ Admin override: Deleted existing streak quiz for ${todayDate}`);
    }

    // Try AI-powered generation first, fall back to curated pool
    let selectedQuestions;
    let generationMethod = 'ai';

    try {
      selectedQuestions = await generateStreakQuestions(rotatingSubject);
      console.log(`✅ AI generated ${selectedQuestions.length} questions for ${rotatingSubject}`);
    } catch (aiError) {
      console.warn('⚠️ AI generation failed, falling back to curated pool:', aiError);
      generationMethod = 'curated';

      const curatedList = CURATED_STREAK_QUESTIONS[rotatingSubject] || CURATED_STREAK_QUESTIONS.Music;
      const shuffled = [...curatedList].sort(() => 0.5 - Math.random());
      selectedQuestions = shuffled.slice(0, 20).map((q, idx) => ({
        number: idx + 1,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
      }));
    }

    const quizId = uuidv4();
    const streakQuiz = {
      id: quizId,
      title: `🔥 Daily Streak Quiz — ${rotatingSubject}`,
      subject: rotatingSubject,
      createdAt: new Date().toISOString(),
      format: 'quiz',
      isQuiz: true,
      isManual: true,
      durationPerQuestion: 30,
      isDailyStreak: true,
      streakDate: todayDate,
      manualQuestions: selectedQuestions,
      startQuestion: 1,
      endQuestion: selectedQuestions.length,
    };

    await TestSeries.create(streakQuiz);

    return NextResponse.json({
      success: true,
      quiz: streakQuiz,
      rotatingSubject,
      streakDate: todayDate,
      generationMethod,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to generate daily streak quiz:', error);
    return NextResponse.json({ error: 'Failed to generate streak quiz' }, { status: 500 });
  }
}

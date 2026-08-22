import { NextResponse } from 'next/server';
import { getTodayDateIST } from '@/lib/utils/date-utils';
import { v4 as uuidv4 } from 'uuid';
import { getUser } from '@/lib/utils/auth';
import { getUserById } from '@/lib/db/user-store';
import { SUBJECTS, Subject } from '@/lib/types';
import { CURATED_STREAK_QUESTIONS } from '@/lib/services/streak-pool';
import { generateStreakQuestions } from '@/lib/services/gemini';
import connectToDatabase from '@/lib/db/mongoose';
import { TestSeries } from '@/lib/models/TestSeries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/streak
 * Returns current user's streak stats, today's subject, and today's active streak quiz.
 * Auto-generates today's streak quiz if it doesn't exist yet (no admin action needed).
 */
export async function GET() {
  try {
    const authUser = await getUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fullUser = await getUserById(authUser.id);
    const todayDate = getTodayDateIST();
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % SUBJECTS.length;
    const todaySubject = SUBJECTS[dayIndex];

    await connectToDatabase();

    // Look for today's streak quiz
    let streakQuiz = await TestSeries.findOne({
      isDailyStreak: true,
      streakDate: todayDate,
    }).lean();

    // Auto-generate if it doesn't exist yet (no admin intervention required)
    if (!streakQuiz) {
      let selectedQuestions;

      try {
        selectedQuestions = await generateStreakQuestions(todaySubject);
        console.log(`✅ Auto-generated ${selectedQuestions.length} AI questions for streak (${todaySubject})`);
      } catch (aiError) {
        console.warn('⚠️ AI generation failed during auto-gen, using curated pool:', aiError);
        const curatedList = CURATED_STREAK_QUESTIONS[todaySubject] || CURATED_STREAK_QUESTIONS.Music;
        const shuffled = [...curatedList].sort(() => 0.5 - Math.random());
        selectedQuestions = shuffled.slice(0, 20).map((q, idx) => ({
          number: idx + 1,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
        }));
      }

      const quizId = uuidv4();
      const newQuiz = {
        id: quizId,
        title: `🔥 Daily Streak Quiz — ${todaySubject}`,
        subject: todaySubject,
        createdAt: new Date().toISOString(),
        format: 'quiz',
        isQuiz: true,
        isManual: true,
        durationPerQuestion: 60,
        isDailyStreak: true,
        streakDate: todayDate,
        manualQuestions: selectedQuestions,
        startQuestion: 1,
        endQuestion: selectedQuestions.length,
      };

      await TestSeries.create(newQuiz);
      streakQuiz = newQuiz;
      console.log(`🔥 Auto-created streak quiz for ${todayDate}: ${todaySubject}`);
    }

    const isTodayCompleted = fullUser?.lastStreakDate === todayDate;

    return NextResponse.json({
      streak: {
        currentStreak: fullUser?.currentStreak || 0,
        longestStreak: fullUser?.longestStreak || 0,
        lastStreakDate: fullUser?.lastStreakDate || null,
        streakHistory: fullUser?.streakHistory || [],
        isTodayCompleted,
      },
      todaySubject,
      streakDate: todayDate,
      streakQuiz: streakQuiz
        ? {
            id: (streakQuiz as any).id,
            title: (streakQuiz as any).title,
            subject: (streakQuiz as any).subject,
            durationPerQuestion: (streakQuiz as any).durationPerQuestion || 30,
          }
        : null,
    });
  } catch (error) {
    console.error('Failed to get streak info:', error);
    return NextResponse.json({ error: 'Failed to get streak info' }, { status: 500 });
  }
}

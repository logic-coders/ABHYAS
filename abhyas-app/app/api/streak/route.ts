import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getUserById } from '@/lib/user-store';
import { SUBJECTS } from '@/lib/types';
import connectToDatabase from '@/lib/mongoose';
import { TestSeries } from '@/lib/models/TestSeries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/streak
 * Returns current user's streak stats, today's subject, and today's active streak quiz.
 */
export async function GET() {
  try {
    const authUser = await getUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fullUser = await getUserById(authUser.id);
    const todayDate = new Date().toISOString().split('T')[0];
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % SUBJECTS.length;
    const todaySubject = SUBJECTS[dayIndex];

    await connectToDatabase();
    const streakQuiz = await TestSeries.findOne({
      isDailyStreak: true,
      streakDate: todayDate,
    }).lean();

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
            id: streakQuiz.id,
            title: streakQuiz.title,
            subject: streakQuiz.subject,
            durationPerQuestion: streakQuiz.durationPerQuestion || 30,
          }
        : null,
    });
  } catch (error) {
    console.error('Failed to get streak info:', error);
    return NextResponse.json({ error: 'Failed to get streak info' }, { status: 500 });
  }
}

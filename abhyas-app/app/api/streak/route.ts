import { NextResponse } from 'next/server';
import { getTodayDateIST } from '@/lib/utils/date-utils';
import { v4 as uuidv4 } from 'uuid';
import { getUser } from '@/lib/utils/auth';
import { getUserById } from '@/lib/db/user-store';
import { SUBJECTS, Subject, BilingualQuestion } from '@/lib/types';
import { BILINGUAL_STREAK_QUESTIONS } from '@/lib/services/streak-pool';
import { generateStreakQuestions, translateQuestionsToHindi, normalizeForFingerprint } from '@/lib/services/gemini';
import { getGeneratedQuestionHistory, addGeneratedQuestionHistory } from '@/lib/db/metadata-store';
import connectToDatabase from '@/lib/db/mongoose';
import { TestSeries } from '@/lib/models/TestSeries';

export const dynamic = 'force-dynamic';

/**
 * GET /api/streak
 * Returns current user's streak stats, today's subject, and today's active streak quiz.
 * Auto-generates today's streak quiz with English & Hindi support if it doesn't exist yet.
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
      let bilingualQuestions: BilingualQuestion[] = [];

      try {
        const { fingerprints } = await getGeneratedQuestionHistory(todaySubject);
        const aiQuestions = await generateStreakQuestions(todaySubject, fingerprints);
        const translatedHindi = await translateQuestionsToHindi(aiQuestions);

        bilingualQuestions = aiQuestions.map((q, idx) => ({
          number: idx + 1,
          english: {
            text: q.text,
            options: q.options,
            explanation: q.explanation,
          },
          hindi: {
            text: translatedHindi[idx]?.text || q.text,
            options: translatedHindi[idx]?.options || q.options,
            explanation: translatedHindi[idx]?.explanation || q.explanation,
          },
          correctAnswer: q.correctAnswer || 'A',
          status: 'verified',
        }));
        console.log(`✅ Auto-generated ${bilingualQuestions.length} unique bilingual AI questions for streak (${todaySubject})`);

        // Record fingerprints for future dedup
        const newFps = bilingualQuestions.map(q => normalizeForFingerprint(q.english.text));
        const newSamples = bilingualQuestions.map(q => q.english.text);
        await addGeneratedQuestionHistory(todaySubject, newFps, newSamples);
      } catch (aiError) {
        console.warn('⚠️ AI generation failed during auto-gen, using curated bilingual pool:', aiError);
        const curatedList = (BILINGUAL_STREAK_QUESTIONS[todaySubject] || BILINGUAL_STREAK_QUESTIONS.Music) as NonNullable<typeof BILINGUAL_STREAK_QUESTIONS.Music>;
        const shuffled = [...curatedList].sort(() => 0.5 - Math.random());
        bilingualQuestions = shuffled.slice(0, 20).map((q, idx) => ({
          ...q,
          number: idx + 1,
        }));
      }

      const cachedEn = bilingualQuestions.map((q) => ({
        number: q.number,
        text: q.english.text,
        options: q.english.options,
      }));

      const cachedHi = bilingualQuestions.map((q) => ({
        number: q.number,
        text: q.hindi.text,
        options: q.hindi.options,
      }));

      const answersMap: Record<string, string> = {};
      bilingualQuestions.forEach((q) => {
        if (q.correctAnswer) {
          answersMap[String(q.number)] = q.correctAnswer;
        }
      });

      const cachedQuestionsMap = new Map();
      cachedQuestionsMap.set('en', cachedEn);
      cachedQuestionsMap.set('hi', cachedHi);

      const quizId = uuidv4();
      const newStreakDoc = {
        id: quizId,
        title: `🔥 Daily Streak Quiz — ${todaySubject}`,
        subject: todaySubject,
        createdAt: new Date().toISOString(),
        format: 'quiz',
        isQuiz: true,
        isManual: false,
        durationPerQuestion: 30,
        isDailyStreak: true,
        streakDate: todayDate,
        bilingualQuestions,
        cachedQuestions: cachedQuestionsMap,
        answers: answersMap,
        startQuestion: 1,
        endQuestion: bilingualQuestions.length,
      };

      streakQuiz = (await TestSeries.create(newStreakDoc)).toObject();
      console.log(`🔥 Auto-created bilingual streak quiz for ${todayDate}: ${todaySubject}`);
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
    console.error('Streak API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

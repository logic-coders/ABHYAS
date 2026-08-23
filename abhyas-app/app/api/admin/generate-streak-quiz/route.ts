import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getUser } from '@/lib/utils/auth';
import { SUBJECTS, Subject, BilingualQuestion } from '@/lib/types';
import { BILINGUAL_STREAK_QUESTIONS } from '@/lib/services/streak-pool';
import { generateStreakQuestions, translateQuestionsToHindi } from '@/lib/services/gemini';
import connectToDatabase from '@/lib/db/mongoose';
import { TestSeries } from '@/lib/models/TestSeries';
import { getTodayDateIST } from '@/lib/utils/date-utils';

/**
 * POST /api/admin/generate-streak-quiz
 * Auto-generates today's 20-question rotating Daily Streak Quiz in both English and Hindi.
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

    let bilingualQuestions: BilingualQuestion[] = [];
    let generationMethod = 'curated';

    // 1. Try AI-powered generation first if configured
    try {
      const aiQuestions = await generateStreakQuestions(rotatingSubject);
      const translatedHindi = await translateQuestionsToHindi(aiQuestions);

      bilingualQuestions = aiQuestions.map((q, idx) => ({
        number: idx + 1,
        english: {
          text: q.text,
          options: q.options,
        },
        hindi: {
          text: translatedHindi[idx]?.text || q.text,
          options: translatedHindi[idx]?.options || q.options,
        },
        correctAnswer: q.correctAnswer || 'A',
        status: 'verified',
      }));
      generationMethod = 'ai';
      console.log(`✅ AI generated ${bilingualQuestions.length} bilingual questions for ${rotatingSubject}`);
    } catch (aiError) {
      console.warn('⚠️ AI generation failed or skipped, using curated bilingual pool:', aiError);
      generationMethod = 'curated';

      const curatedList = BILINGUAL_STREAK_QUESTIONS[rotatingSubject] || BILINGUAL_STREAK_QUESTIONS.Music;
      const shuffled = [...curatedList].sort(() => 0.5 - Math.random());
      bilingualQuestions = shuffled.slice(0, 20).map((q, idx) => ({
        ...q,
        number: idx + 1,
      }));
    }

    // Build cached questions and answers map
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
    const streakQuiz = {
      id: quizId,
      title: `🔥 Daily Streak Quiz — ${rotatingSubject}`,
      subject: rotatingSubject,
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

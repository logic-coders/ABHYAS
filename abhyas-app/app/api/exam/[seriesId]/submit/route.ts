import { NextResponse } from 'next/server';
import { getTestSeriesById } from '@/lib/db/metadata-store';
import { downloadPDF } from '@/lib/services/s3';
import { extractText, parseQuestions, parseAnswers, Language } from '@/lib/parsers/pdf-parser';
import { ExamAnswer, ExamResult, ResultItem, Question } from '@/lib/types';
import { addResult } from '@/lib/db/result-store';
import { getCurrentUser } from '@/lib/utils/auth';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest } from 'next/server';

/**
 * POST /api/exam/[seriesId]/submit
 * Receives the user's answers, scores them against the correct answer map,
 * and returns the scored result with detailed breakdown.
 *
 * Body: { answers: ExamAnswer[], lang?: 'en' | 'hi' }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const series = await getTestSeriesById(seriesId);

    if (!series) {
      return NextResponse.json(
        { error: 'Test series not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const userAnswers: ExamAnswer[] = body.answers;
    const lang: Language = body.lang || 'en';

    if (!Array.isArray(userAnswers)) {
      return NextResponse.json(
        { error: 'answers must be an array of { questionNumber, selectedOption }' },
        { status: 400 }
      );
    }

    // 1. Resolve Questions & Correct Answers across all test types
    let questions: Question[] = [];
    const correctAnswers = new Map<number, string>();

    // Case A: Bilingual Questions (Imported via TXT)
    if (series.bilingualQuestions && series.bilingualQuestions.length > 0) {
      questions = series.bilingualQuestions.map((q, idx) => ({
        number: idx + 1,
        text: lang === 'hi' ? q.hindi.text : q.english.text,
        options: lang === 'hi' ? q.hindi.options : q.english.options,
        explanation: lang === 'hi' ? (q.hindi.explanation || q.english.explanation) : q.english.explanation,
      }));

      series.bilingualQuestions.forEach((q, idx) => {
        const ans = q.correctAnswer || (series.answers && ((series.answers as any)[idx + 1] || (series.answers as any)[String(idx + 1)]));
        if (ans) {
          correctAnswers.set(idx + 1, String(ans).trim().toUpperCase());
        }
      });
    }
    // Case B: Manual Questions (Speed Quiz, Daily Streak Quiz, Manual Entry)
    else if (series.isManual && series.manualQuestions && series.manualQuestions.length > 0) {
      if (series.cachedQuestions && series.cachedQuestions[lang] && series.cachedQuestions[lang].length > 0) {
        questions = series.cachedQuestions[lang];
      } else {
        questions = series.manualQuestions.map((q, idx) => ({
          number: idx + 1,
          text: q.text,
          options: q.options,
          explanation: q.explanation,
        }));
      }

      series.manualQuestions.forEach((q, idx) => {
        const ans = q.correctAnswer || (series.answers && ((series.answers as any)[idx + 1] || (series.answers as any)[String(idx + 1)]));
        if (ans) {
          correctAnswers.set(idx + 1, String(ans).trim().toUpperCase());
        }
      });
    }
    // Case C: Random Practice / Quiz from PDF Pool
    else if (series.isRandom && series.randomQuestions && series.randomQuestions.length > 0) {
      if (series.answers && Object.keys(series.answers).length > 0) {
        for (const [k, v] of Object.entries(series.answers)) {
          const qNum = Number(k);
          if (!isNaN(qNum) && v) {
            correctAnswers.set(qNum, String(v).trim().toUpperCase());
          }
        }
      }

      if (
        series.cachedQuestions &&
        series.cachedQuestions[lang] &&
        series.cachedQuestions[lang].length > 0 &&
        correctAnswers.size === series.randomQuestions.length
      ) {
        questions = series.cachedQuestions[lang];
      } else {
        // Download and parse questions and answers from PDFs
        const groupedByS3Key = new Map<string, number[]>();
        for (const rq of series.randomQuestions) {
          if (!groupedByS3Key.has(rq.s3Key)) {
            groupedByS3Key.set(rq.s3Key, []);
          }
          groupedByS3Key.get(rq.s3Key)!.push(rq.number);
        }

        const fetchPromises = Array.from(groupedByS3Key.entries()).map(async ([s3Key, nums]) => {
          const pdfBuffer = await downloadPDF(s3Key);
          const text = await extractText(pdfBuffer);
          const start = Math.min(...nums);
          const end = Math.max(...nums);
          const parsed = parseQuestions(text, start, end, lang);
          const parsedAns = parseAnswers(text, start, end);
          const requiredSet = new Set(nums);

          return {
            questions: parsed.filter((q) => requiredSet.has(q.number)),
            answers: parsedAns,
          };
        });

        const resultsArray = await Promise.all(fetchPromises);
        const rawQuestions = resultsArray.flatMap((r) => r.questions);

        questions = rawQuestions.map((q, idx) => ({ ...q, number: idx + 1 }));

        rawQuestions.forEach((q, idx) => {
          const parentResult = resultsArray.find((r) => r.questions.includes(q));
          if (parentResult) {
            const ans = parentResult.answers.get(q.number);
            if (ans) {
              correctAnswers.set(idx + 1, String(ans).trim().toUpperCase());
            }
          }
        });
      }
    }
    // Case D: Single PDF Test Series
    else if (series.s3Key) {
      if (
        series.cachedQuestions &&
        series.cachedQuestions[lang] &&
        series.cachedQuestions[lang].length > 0 &&
        series.answers &&
        Object.keys(series.answers).length > 0
      ) {
        questions = series.cachedQuestions[lang];
        for (const [k, v] of Object.entries(series.answers)) {
          const qNum = Number(k);
          if (!isNaN(qNum) && v) {
            correctAnswers.set(qNum, String(v).trim().toUpperCase());
          }
        }
      } else {
        const pdfBuffer = await downloadPDF(series.s3Key);
        const text = await extractText(pdfBuffer);
        const startQ = series.startQuestion || 1;
        const endQ = series.endQuestion || 150;
        const rawAnswers = parseAnswers(text, startQ, endQ);
        const rawQuestions = parseQuestions(text, startQ, endQ, lang);

        questions = rawQuestions.map((q, idx) => ({ ...q, number: idx + 1 }));
        rawQuestions.forEach((q, idx) => {
          const ans = rawAnswers.get(q.number);
          if (ans) {
            correctAnswers.set(idx + 1, String(ans).trim().toUpperCase());
          }
        });
      }
    }
    // Case E: Fallback to cachedQuestions and series.answers
    else if (series.cachedQuestions && series.cachedQuestions[lang]) {
      questions = series.cachedQuestions[lang];
    }

    // Merge any global answers from series.answers if not yet present
    if (series.answers) {
      for (const [k, v] of Object.entries(series.answers)) {
        const qNum = Number(k);
        if (!isNaN(qNum) && v && !correctAnswers.has(qNum)) {
          correctAnswers.set(qNum, String(v).trim().toUpperCase());
        }
      }
    }

    // Build a lookup for user answers
    const userAnswerMap = new Map<number, string>();
    for (const ans of userAnswers) {
      if (ans.selectedOption) {
        userAnswerMap.set(ans.questionNumber, String(ans.selectedOption).trim().toUpperCase());
      }
    }

    // Score each question
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const breakdown: ResultItem[] = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qNum = q.number || i + 1;
      const correctAns = correctAnswers.get(qNum) ?? '?';
      const userAns = userAnswerMap.get(qNum) ?? '';
      const isCorrect = userAns !== '' && userAns !== '—' && userAns === correctAns;

      if (!userAns || userAns === '—') {
        unanswered++;
      } else if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }

      breakdown.push({
        questionNumber: qNum,
        questionText: q.text,
        options: q.options,
        userAnswer: userAns || '—',
        correctAnswer: correctAns,
        isCorrect,
        explanation: q.explanation,
      });
    }

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const format = series.format || (series.isQuiz ? 'quiz' : 'test');

    const result: ExamResult = {
      seriesId: series.id,
      seriesTitle: series.title,
      subject: series.subject,
      totalQuestions,
      correct,
      incorrect,
      unanswered,
      percentage,
      format,
      breakdown,
    };

    // Save result to store and update streak if applicable
    const user = await getCurrentUser(request);
    if (user) {
      await addResult({
        id: uuidv4(),
        userId: user.id,
        seriesId: series.id,
        seriesTitle: series.title,
        subject: series.subject,
        score: correct,
        correct,
        incorrect,
        unanswered,
        totalQuestions,
        percentage,
        format,
        date: new Date().toISOString(),
        breakdown,
      });

      // Keep only latest 5 test history records for admin accounts
      if (user.role === 'admin') {
        const { trimAdminResultsToLatestN } = await import('@/lib/db/result-store');
        await trimAdminResultsToLatestN(user.id, 5);
      }

      // If this was a daily streak quiz, update user's streak
      if (series.isDailyStreak) {
        const { getUserById, updateUser } = await import('@/lib/db/user-store');
        const { getTodayDateIST, getYesterdayDateIST } = require('@/lib/utils/date-utils');
        const todayStr = getTodayDateIST();
        const yesterdayStr = getYesterdayDateIST();

        const fullUser = await getUserById(user.id);
        if (fullUser) {
          let newCurrentStreak = fullUser.currentStreak || 0;
          let newLongestStreak = fullUser.longestStreak || 0;
          const history = fullUser.streakHistory || [];

          if (fullUser.lastStreakDate === todayStr) {
            // Already completed today, keep streak
          } else if (fullUser.lastStreakDate === yesterdayStr) {
            newCurrentStreak += 1;
          } else {
            newCurrentStreak = 1;
          }

          if (newCurrentStreak > newLongestStreak) {
            newLongestStreak = newCurrentStreak;
          }

          const newHistory = history.includes(todayStr) ? history : [...history, todayStr];

          await updateUser(user.id, {
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            lastStreakDate: todayStr,
            streakHistory: newHistory,
          });
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error while processing exam' },
      { status: 500 }
    );
  }
}

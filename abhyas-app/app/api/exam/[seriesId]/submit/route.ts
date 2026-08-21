import { NextResponse } from 'next/server';
import { getTestSeriesById } from '@/lib/metadata-store';
import { downloadPDF } from '@/lib/s3';
import { extractText, parseQuestions, parseAnswers, Language } from '@/lib/pdf-parser';
import { ExamAnswer, ExamResult, ResultItem, Question } from '@/lib/types';
import { addResult } from '@/lib/result-store';
import { getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest } from 'next/server';

/**
 * POST /api/exam/[seriesId]/submit
 * Receives the user's answers, re-parses the PDF for correct answers,
 * and returns a scored result.
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

    // Parse correct answers and questions
    let correctAnswers = new Map<number, string>();
    let questions: Question[] = [];

    if (series.isManual && series.manualQuestions && series.manualQuestions.length > 0) {
      questions = series.manualQuestions.map((q) => ({
        number: q.number,
        text: q.text,
        options: q.options,
      }));
      for (const q of series.manualQuestions) {
        correctAnswers.set(q.number, (q.correctAnswer || '').toUpperCase());
      }
    } else if (series.isRandom && series.randomQuestions) {
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
          questions: parsed.filter(q => requiredSet.has(q.number)),
          answers: parsedAns
        };
      });

      const resultsArray = await Promise.all(fetchPromises);
      const rawQuestions = resultsArray.flatMap(r => r.questions);
      
      // Remap question numbers 1..N based on the random order
      questions = rawQuestions.map((q, idx) => ({ ...q, number: idx + 1 }));
      
      // Remap correct answers to the new 1..N indices
      rawQuestions.forEach((q, idx) => {
        // Find which PDF's answer map this belonged to
        const parentResult = resultsArray.find(r => r.questions.includes(q));
        if (parentResult) {
          const ans = parentResult.answers.get(q.number);
          if (ans) {
            correctAnswers.set(idx + 1, ans);
          }
        }
      });

    } else if (series.s3Key) {
      // Download single PDF from S3
      const pdfBuffer = await downloadPDF(series.s3Key);
      const text = await extractText(pdfBuffer);
      const startQ = series.startQuestion || 1;
      const endQ = series.endQuestion || 150;
      const rawAnswers = parseAnswers(text, startQ, endQ);
      const rawQuestions = parseQuestions(text, startQ, endQ, lang);

      // Renumber questions 1..N and map correct answers to 1..N
      questions = rawQuestions.map((q, idx) => ({ ...q, number: idx + 1 }));
      rawQuestions.forEach((q, idx) => {
        const ans = rawAnswers.get(q.number);
        if (ans) {
          correctAnswers.set(idx + 1, ans);
        }
      });
    }

    // Build a lookup for user answers
    const userAnswerMap = new Map<number, string>();
    for (const ans of userAnswers) {
      userAnswerMap.set(ans.questionNumber, ans.selectedOption.toUpperCase());
    }

    // Score each question
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const breakdown: ResultItem[] = [];

    for (const q of questions) {
      const correctAns = correctAnswers.get(q.number) ?? '?';
      const userAns = userAnswerMap.get(q.number) ?? '';
      const isCorrect = userAns !== '' && userAns === correctAns;

      if (userAns === '') {
        unanswered++;
      } else if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }

      breakdown.push({
        questionNumber: q.number,
        questionText: q.text,
        options: q.options,
        userAnswer: userAns || '—',
        correctAnswer: correctAns,
        isCorrect,
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

      // If this was a daily streak quiz, update user's streak
      if (series.isDailyStreak) {
        const { getUserById, updateUser } = await import('@/lib/user-store');
        const { getTodayDateIST, getYesterdayDateIST } = require('@/lib/date-utils');
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
    console.error('Failed to submit exam:', error);
    return NextResponse.json(
      { error: 'Failed to score exam' },
      { status: 500 }
    );
  }
}

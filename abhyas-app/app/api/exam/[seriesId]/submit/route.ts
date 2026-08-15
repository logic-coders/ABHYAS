import { NextResponse } from 'next/server';
import { getTestSeriesById } from '@/lib/metadata-store';
import { downloadPDF } from '@/lib/s3';
import { extractText, parseQuestions, parseAnswers, Language } from '@/lib/pdf-parser';
import { ExamAnswer, ExamResult, ResultItem } from '@/lib/types';
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
    let questions = [];

    if (series.isRandom && series.randomQuestions) {
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

    } else {
      // Download single PDF from S3
      const pdfBuffer = await downloadPDF(series.s3Key);
      const text = await extractText(pdfBuffer);
      correctAnswers = parseAnswers(text, series.startQuestion, series.endQuestion);
      questions = parseQuestions(text, series.startQuestion, series.endQuestion, lang);
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

    // Save result to store
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

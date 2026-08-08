import { NextResponse } from 'next/server';
import { getTestSeriesById } from '@/lib/metadata-store';
import { downloadPDF } from '@/lib/s3';
import { extractText, parseQuestions, parseAnswers } from '@/lib/pdf-parser';
import { ExamAnswer, ExamResult, ResultItem } from '@/lib/types';

/**
 * POST /api/exam/[seriesId]/submit
 * Receives the user's answers, re-parses the PDF for correct answers,
 * and returns a scored result.
 *
 * Body: { answers: ExamAnswer[] }
 */
export async function POST(
  request: Request,
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

    if (!Array.isArray(userAnswers)) {
      return NextResponse.json(
        { error: 'answers must be an array of { questionNumber, selectedOption }' },
        { status: 400 }
      );
    }

    // Download PDF from S3
    const pdfBuffer = await downloadPDF(series.s3Key);
    const text = await extractText(pdfBuffer);

    // Parse correct answers
    const correctAnswers = parseAnswers(text, series.startQuestion, series.endQuestion);
    // Parse questions for display in results
    const questions = parseQuestions(text, series.startQuestion, series.endQuestion);

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

    const result: ExamResult = {
      seriesId: series.id,
      seriesTitle: series.title,
      subject: series.subject,
      totalQuestions,
      correct,
      incorrect,
      unanswered,
      percentage,
      breakdown,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to submit exam:', error);
    return NextResponse.json(
      { error: 'Failed to score exam' },
      { status: 500 }
    );
  }
}

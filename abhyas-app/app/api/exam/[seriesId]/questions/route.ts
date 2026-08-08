import { NextResponse } from 'next/server';
import { getTestSeriesById } from '@/lib/metadata-store';
import { downloadPDF } from '@/lib/s3';
import { extractText, parseQuestions } from '@/lib/pdf-parser';

/**
 * GET /api/exam/[seriesId]/questions
 * Fetches the test series PDF from S3, parses questions in the defined range,
 * and returns them WITHOUT answers.
 */
export async function GET(
  _request: Request,
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

    // Download PDF from S3
    const pdfBuffer = await downloadPDF(series.s3Key);

    // Extract text and parse questions
    const text = await extractText(pdfBuffer);
    const questions = parseQuestions(text, series.startQuestion, series.endQuestion);

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: 'No questions could be parsed from the PDF in the specified range',
          hint: 'Check that the PDF format matches the expected question structure',
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      seriesId: series.id,
      seriesTitle: series.title,
      subject: series.subject,
      totalQuestions: questions.length,
      questions,
    });
  } catch (error) {
    console.error('Failed to fetch exam questions:', error);
    return NextResponse.json(
      { error: 'Failed to load exam questions' },
      { status: 500 }
    );
  }
}

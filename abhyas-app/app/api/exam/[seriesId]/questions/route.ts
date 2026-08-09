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

    let questions = [];

    if (series.isRandom && series.randomQuestions) {
      // Group by S3 Key to minimize downloads
      const groupedByS3Key = new Map<string, number[]>();
      for (const rq of series.randomQuestions) {
        if (!groupedByS3Key.has(rq.s3Key)) {
          groupedByS3Key.set(rq.s3Key, []);
        }
        groupedByS3Key.get(rq.s3Key)!.push(rq.number);
      }

      // Fetch and parse each required PDF in parallel
      const fetchPromises = Array.from(groupedByS3Key.entries()).map(async ([s3Key, nums]) => {
        const pdfBuffer = await downloadPDF(s3Key);
        const text = await extractText(pdfBuffer);
        // Find min and max for this PDF to parse efficiently
        const start = Math.min(...nums);
        const end = Math.max(...nums);
        const parsed = parseQuestions(text, start, end);
        // Filter only the randomly selected ones
        const requiredSet = new Set(nums);
        return parsed.filter(q => requiredSet.has(q.number));
      });

      const resultsArray = await Promise.all(fetchPromises);
      const rawQuestions = resultsArray.flat();
      
      // Remap question numbers 1..N based on the random order
      questions = rawQuestions.map((q, idx) => ({ ...q, number: idx + 1 }));
    } else {
      // Regular single-PDF test series
      const pdfBuffer = await downloadPDF(series.s3Key);
      const text = await extractText(pdfBuffer);
      questions = parseQuestions(text, series.startQuestion, series.endQuestion);
    }

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

import { NextResponse, NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/utils/auth';
import { getTestSeriesById } from '@/lib/db/metadata-store';
import connectToDatabase from '@/lib/db/mongoose';
import { Result } from '@/lib/models/Result';

export const dynamic = 'force-dynamic';

/**
 * GET /api/exam/[seriesId]/result
 * Returns the latest result or enriched breakdown with detailed solutions for this series.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { seriesId } = await params;
    await connectToDatabase();

    // Fetch latest result for this user and series
    const latestResult = await Result.findOne({
      userId: user.id,
      seriesId,
    })
      .sort({ date: -1 })
      .lean();

    const series = await getTestSeriesById(seriesId);

    if (latestResult && series && series.bilingualQuestions) {
      // Enrich any breakdown items missing explanations with latest series explanations
      const enrichedBreakdown = (latestResult.breakdown || []).map((item: any) => {
        const matchingQ = series.bilingualQuestions?.find(
          (q) => q.number === item.questionNumber
        );
        const isHindi = item.questionText && /[\u0900-\u097F]/.test(item.questionText);
        const explanation =
          item.explanation && item.explanation.length > 5
            ? item.explanation
            : matchingQ
            ? isHindi
              ? matchingQ.hindi?.explanation || matchingQ.english?.explanation
              : matchingQ.english?.explanation || matchingQ.hindi?.explanation
            : `Correct answer is option (${item.correctAnswer || 'A'}).`;

        return {
          ...item,
          explanation,
        };
      });

      return NextResponse.json({
        ...latestResult,
        breakdown: enrichedBreakdown,
      });
    }

    if (latestResult) {
      return NextResponse.json(latestResult);
    }

    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  } catch (err: any) {
    console.error('Error fetching result:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

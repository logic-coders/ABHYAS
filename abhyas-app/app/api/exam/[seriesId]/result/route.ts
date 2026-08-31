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

    if (latestResult && series) {
      // Enrich all breakdown items with latest explanations strictly in the question's language
      const enrichedBreakdown = (latestResult.breakdown || []).map((item: any) => {
        const isHindi = !!(item.questionText && /[\u0900-\u097F]/.test(item.questionText));
        let explanation = item.explanation;

        if (series.bilingualQuestions) {
          const matchingQ = series.bilingualQuestions.find(
            (q) => q.number === item.questionNumber
          );
          if (matchingQ) {
            explanation = isHindi
              ? (matchingQ.hindi?.explanation || matchingQ.english?.explanation)
              : (matchingQ.english?.explanation || matchingQ.hindi?.explanation);
          }
        } else if (series.manualQuestions) {
          const manualQ = series.manualQuestions[item.questionNumber - 1];
          if (isHindi && series.cachedQuestions?.hi) {
            explanation =
              series.cachedQuestions.hi[item.questionNumber - 1]?.explanation ||
              manualQ?.explanation ||
              explanation;
          } else if (manualQ) {
            explanation = manualQ.explanation || explanation;
          }
        }

        return {
          ...item,
          explanation:
            explanation ||
            (isHindi
              ? `सही विकल्प (${item.correctAnswer?.toLowerCase() || 'a'}) है।`
              : `Correct option is (${item.correctAnswer?.toUpperCase() || 'A'}).`),
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

import { NextRequest, NextResponse } from 'next/server';
import { getTestSeriesById, updateTestSeriesQuestions } from '@/lib/db/metadata-store';
import { getCurrentUser } from '@/lib/utils/auth';
import { BilingualQuestion } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/tests/[id]/questions
 * Fetches all questions (bilingual) and answers for editing in the Admin Portal.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await params;
    const series = await getTestSeriesById(id);

    if (!series) {
      return NextResponse.json({ error: 'Test series not found' }, { status: 404 });
    }

    let questions: BilingualQuestion[] = [];

    if (series.bilingualQuestions && series.bilingualQuestions.length > 0) {
      questions = series.bilingualQuestions;
    } else if (series.manualQuestions && series.manualQuestions.length > 0) {
      questions = series.manualQuestions.map((q, idx) => ({
        number: q.number || idx + 1,
        english: { text: q.text, options: q.options || [] },
        hindi: { text: q.text, options: q.options || [] },
        correctAnswer: q.correctAnswer || (series.answers && ((series.answers as any)[q.number] || (series.answers as any)[String(q.number)])) || 'A',
        status: 'verified',
      }));
    } else if (series.cachedQuestions) {
      const enQs = (series.cachedQuestions as any)?.en || [];
      const hiQs = (series.cachedQuestions as any)?.hi || [];
      const totalLen = Math.max(enQs.length, hiQs.length);

      for (let i = 0; i < totalLen; i++) {
        const en = enQs[i];
        const hi = hiQs[i];
        const qNum = i + 1;
        const ans = series.answers && ((series.answers as any)[qNum] || (series.answers as any)[String(qNum)]);

        questions.push({
          number: qNum,
          english: {
            text: en?.text || hi?.text || '',
            options: en?.options || hi?.options || [],
          },
          hindi: {
            text: hi?.text || en?.text || '',
            options: hi?.options || en?.options || [],
          },
          correctAnswer: ans || 'A',
          status: 'verified',
        });
      }
    }

    return NextResponse.json({
      success: true,
      test: {
        id: series.id,
        title: series.title,
        subject: series.subject,
        testType: series.testType,
        format: series.format,
        durationMinutes: series.durationMinutes,
        questions,
      },
    });
  } catch (error) {
    console.error('Failed to fetch test questions for editing:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/tests/[id]/questions
 * Updates the questions and answers for the test series in MongoDB.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { id } = await params;
    const series = await getTestSeriesById(id);

    if (!series) {
      return NextResponse.json({ error: 'Test series not found' }, { status: 404 });
    }

    const body = await request.json();
    const { questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Questions array is required' }, { status: 400 });
    }

    // Clean & validate questions
    const cleanedQuestions: BilingualQuestion[] = questions.map((q: any, idx: number) => ({
      number: q.number || idx + 1,
      english: {
        text: (q.english?.text || '').trim(),
        options: Array.isArray(q.english?.options) ? q.english.options.map((o: string) => String(o).trim()) : [],
      },
      hindi: {
        text: (q.hindi?.text || '').trim(),
        options: Array.isArray(q.hindi?.options) ? q.hindi.options.map((o: string) => String(o).trim()) : [],
      },
      correctAnswer: (q.correctAnswer || 'A').trim().toUpperCase(),
      status: 'verified',
    }));

    await updateTestSeriesQuestions(id, cleanedQuestions);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${cleanedQuestions.length} questions for "${series.title}".`,
      totalQuestions: cleanedQuestions.length,
    });
  } catch (error) {
    console.error('Failed to update test questions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update questions' },
      { status: 500 }
    );
  }
}

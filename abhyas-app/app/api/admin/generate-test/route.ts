import { NextResponse, NextRequest } from 'next/server';
import { getAllTestSeries, addTestSeries, getGeneratedQuestionHistory } from '@/lib/db/metadata-store';
import { Subject, TestSeries, BilingualQuestion } from '@/lib/types';
import { generatePracticeTestQuestions } from '@/lib/services/gemini';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/utils/auth';

/**
 * POST /api/admin/generate-test
 * Body: { subject: string }
 * Generates 80 AI-powered bilingual MCQs using Gemini.
 * Returns the questions for admin review WITHOUT saving to DB.
 * Fetches previously generated question history to avoid repeats.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const subject = body.subject as string;
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    // 2. Fetch previously generated question history for this subject
    const { fingerprints, sampleTexts } = await getGeneratedQuestionHistory(subject);
    console.log(`📋 Found ${fingerprints.length} historical fingerprints and ${sampleTexts.length} sample texts for "${subject}"`);

    // 3. Generate 80 bilingual questions via Gemini AI (with history context)
    let questions: BilingualQuestion[];
    try {
      questions = await generatePracticeTestQuestions(subject, sampleTexts, fingerprints);
    } catch (genErr) {
      console.error('AI generation failed:', genErr);
      return NextResponse.json(
        { error: `AI generation failed: ${genErr instanceof Error ? genErr.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    if (!questions || questions.length < 10) {
      return NextResponse.json(
        { error: `AI generated too few questions (${questions?.length ?? 0}). Please try again.` },
        { status: 500 }
      );
    }

    // 4. Return questions for admin review (not saved yet)
    return NextResponse.json(
      {
        questions,
        subject,
        count: questions.length,
        message: 'Questions generated. Review and approve to publish.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to generate practice test:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate practice test' },
      { status: 500 }
    );
  }
}

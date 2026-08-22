import { NextRequest, NextResponse } from 'next/server';
import { parseTxtQuestions, parseAnswerKey } from '@/lib/parsers/txt-parser';
import { matchEnglishAndHindiQuestions } from '@/lib/parsers/question-matcher';
import { reverifyQuestionsWithLLM } from '@/lib/parsers/llm-verifier';
import { getCurrentUser } from '@/lib/utils/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s max execution for LLM verification

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate admin user
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    let englishText = '';
    let hindiText = '';
    let answerKeyText = '';
    let skipLLM = false;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const enFile = formData.get('englishFile') as File | null;
      const hiFile = formData.get('hindiFile') as File | null;
      const ansFile = formData.get('answerKeyFile') as File | null;
      skipLLM = formData.get('skipLLM') === 'true';

      if (!enFile || !hiFile) {
        return NextResponse.json(
          { error: 'Both English TXT and Hindi TXT files are required.' },
          { status: 400 }
        );
      }

      englishText = await enFile.text();
      hindiText = await hiFile.text();
      if (ansFile) {
        answerKeyText = await ansFile.text();
      }
    } else {
      const body = await request.json();
      englishText = body.englishText || '';
      hindiText = body.hindiText || '';
      answerKeyText = body.answerKeyText || '';
      skipLLM = Boolean(body.skipLLM);
    }

    if (!englishText.trim()) {
      return NextResponse.json({ error: 'English TXT content cannot be empty.' }, { status: 400 });
    }
    if (!hindiText.trim()) {
      return NextResponse.json({ error: 'Hindi TXT content cannot be empty.' }, { status: 400 });
    }

    // 2. Parse raw TXT content for questions
    const parsedEn = parseTxtQuestions(englishText);
    const parsedHi = parseTxtQuestions(hindiText);

    if (parsedEn.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract any questions from the English TXT file. Please verify file format.' },
        { status: 422 }
      );
    }

    if (parsedHi.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract any questions from the Hindi TXT file. Please verify file format.' },
        { status: 422 }
      );
    }

    // 3. Parse Answer Key if provided
    let answerKeyMap: Map<number, string> | undefined = undefined;
    if (answerKeyText.trim()) {
      const parsedAns = parseAnswerKey(answerKeyText);
      answerKeyMap = parsedAns.answers;
    }

    // 4. Match English, Hindi, and Answer Key data
    const matchResult = matchEnglishAndHindiQuestions(parsedEn, parsedHi, answerKeyMap);

    let finalQuestions = matchResult.questions;

    // 5. Run LLM Reverification if not skipped
    if (!skipLLM) {
      try {
        finalQuestions = await reverifyQuestionsWithLLM(finalQuestions);
      } catch (llmErr) {
        console.warn('LLM reverification encountered an error, proceeding with parsed questions:', llmErr);
      }
    }

    // Recompute counts after verification
    let verifiedCount = 0;
    let warningCount = 0;
    let errorCount = 0;

    for (const q of finalQuestions) {
      if (q.status === 'verified') verifiedCount++;
      else if (q.status === 'warning') warningCount++;
      else errorCount++;
    }

    const summary = {
      ...matchResult.summary,
      verifiedCount,
      warningCount,
      errorCount,
    };

    return NextResponse.json({
      success: true,
      questions: finalQuestions,
      summary,
    });
  } catch (error) {
    console.error('Error in parse-txt endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse TXT questions' },
      { status: 500 }
    );
  }
}

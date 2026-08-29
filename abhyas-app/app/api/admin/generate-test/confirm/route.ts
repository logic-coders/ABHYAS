import { NextResponse, NextRequest } from 'next/server';
import { getAllTestSeries, addTestSeries, addGeneratedQuestionHistory } from '@/lib/db/metadata-store';
import { normalizeForFingerprint } from '@/lib/services/gemini';
import { Subject, TestSeries, BilingualQuestion } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/utils/auth';

/**
 * POST /api/admin/generate-test/confirm
 * Body: { subject: string; questions: BilingualQuestion[] }
 * Saves admin-reviewed questions to DB as a new Practice test series.
 * Auto-names as "{Subject} Practice Test - N".
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
    const questions: BilingualQuestion[] = body.questions;

    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'Questions array is required and must not be empty' }, { status: 400 });
    }

    // 2. Renumber questions sequentially 1..N (preserve edits but fix ordering)
    const finalQuestions: BilingualQuestion[] = questions.map((q, idx) => ({
      ...q,
      number: idx + 1,
      status: 'verified' as const,
    }));

    // 3. Build answers map and cached questions maps
    const answersMap: Record<string, string> = {};
    finalQuestions.forEach((q) => {
      if (q.correctAnswer) {
        answersMap[String(q.number)] = q.correctAnswer;
      }
    });

    const cachedEn = finalQuestions.map((q) => ({
      number: q.number,
      text: q.english.text,
      options: q.english.options,
    }));

    const cachedHi = finalQuestions.map((q) => ({
      number: q.number,
      text: q.hindi.text,
      options: q.hindi.options,
    }));

    const cachedQuestionsMap = new Map();
    cachedQuestionsMap.set('en', cachedEn);
    cachedQuestionsMap.set('hi', cachedHi);

    // 4. Calculate practice test serial number for this subject
    const allSeries = await getAllTestSeries();
    const existingPracticeTests = allSeries.filter(
      (s) => s.subject === (subject as Subject) && (s.testType === 'practice' || s.isRandom) && !s.isQuiz
    );
    const nextPracticeNumber = existingPracticeTests.length + 1;

    const newTest: TestSeries = {
      id: uuidv4(),
      title: `${subject} Practice Test - ${nextPracticeNumber}`,
      subject: subject as Subject,
      s3Key: '',
      startQuestion: 1,
      endQuestion: finalQuestions.length,
      createdAt: new Date().toISOString(),
      isRandom: true,
      testType: 'practice',
      format: 'test',
      durationMinutes: 80,
      bilingualQuestions: finalQuestions,
      cachedQuestions: cachedQuestionsMap as any,
      answers: answersMap as any,
    };

    await addTestSeries(newTest);

    // 5. Record question fingerprints + sample texts for future dedup
    const newFingerprints = finalQuestions.map(q => normalizeForFingerprint(q.english.text));
    const newSampleTexts = finalQuestions.map(q => q.english.text);
    await addGeneratedQuestionHistory(subject, newFingerprints, newSampleTexts);
    console.log(`📝 Recorded ${newFingerprints.length} question fingerprints for "${subject}" dedup history.`);

    return NextResponse.json(
      {
        id: newTest.id,
        title: newTest.title,
        subject: newTest.subject,
        questionCount: finalQuestions.length,
        message: `Practice test "${newTest.title}" published successfully!`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to confirm and save practice test:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save practice test' },
      { status: 500 }
    );
  }
}

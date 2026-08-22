import { NextResponse, NextRequest } from 'next/server';
import { getAllTestSeries, addTestSeries } from '@/lib/db/metadata-store';
import { Subject, TestSeries, BilingualQuestion } from '@/lib/types';
import { CURATED_STREAK_QUESTIONS } from '@/lib/services/streak-pool';
import { generateStreakQuestions } from '@/lib/services/gemini';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/utils/auth';

const QUESTIONS_PER_PRACTICE_TEST = 80;

export async function POST(request: NextRequest) {
  try {
    // 1. Auth check
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const body = await request.json();
    const subject = body.subject as Subject;
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    // 2. Collect pool of all available bilingual questions for this subject from MongoDB
    const allSeries = await getAllTestSeries();
    const subjectSeries = allSeries.filter((s) => s.subject === subject);

    const questionPool: BilingualQuestion[] = [];
    const seenTexts = new Set<string>();

    for (const s of subjectSeries) {
      if (s.bilingualQuestions && s.bilingualQuestions.length > 0) {
        for (const q of s.bilingualQuestions) {
          const key = (q.english.text || q.hindi.text || '').trim().toLowerCase();
          if (key && !seenTexts.has(key)) {
            seenTexts.add(key);
            questionPool.push(q);
          }
        }
      } else if (s.manualQuestions && s.manualQuestions.length > 0) {
        for (const mq of s.manualQuestions) {
          const key = (mq.text || '').trim().toLowerCase();
          if (key && !seenTexts.has(key)) {
            seenTexts.add(key);
            questionPool.push({
              number: mq.number,
              english: { text: mq.text, options: mq.options },
              hindi: { text: mq.text, options: mq.options },
              correctAnswer: mq.correctAnswer,
              status: 'verified',
            });
          }
        }
      }
    }

    // Include curated fallback pool if available
    const curated = CURATED_STREAK_QUESTIONS[subject];
    if (curated && curated.length > 0) {
      for (const cq of curated) {
        const key = (cq.text || '').trim().toLowerCase();
        if (key && !seenTexts.has(key)) {
          seenTexts.add(key);
          questionPool.push({
            number: cq.number,
            english: { text: cq.text, options: cq.options },
            hindi: { text: cq.text, options: cq.options },
            correctAnswer: cq.correctAnswer,
            status: 'verified',
          });
        }
      }
    }

    // If pool is still empty, generate questions via Gemini AI
    if (questionPool.length < QUESTIONS_PER_PRACTICE_TEST) {
      try {
        const aiGenerated = await generateStreakQuestions(subject);
        for (const gq of aiGenerated) {
          const key = (gq.text || '').trim().toLowerCase();
          if (key && !seenTexts.has(key)) {
            seenTexts.add(key);
            questionPool.push({
              number: gq.number,
              english: { text: gq.text, options: gq.options },
              hindi: { text: gq.text, options: gq.options },
              correctAnswer: gq.correctAnswer,
              status: 'verified',
            });
          }
        }
      } catch (err) {
        console.warn('AI question generation fallback encountered an error:', err);
      }
    }

    if (questionPool.length === 0) {
      return NextResponse.json(
        { error: `No questions available for ${subject}. Please upload a TXT question paper first.` },
        { status: 400 }
      );
    }

    // 3. Shuffle pool (Fisher-Yates)
    const shuffled = [...questionPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 4. Select up to 80 questions
    const countToSelect = Math.min(shuffled.length, QUESTIONS_PER_PRACTICE_TEST);
    const selected = shuffled.slice(0, countToSelect);

    // 5. Renumber questions 1..N and build structured bilingual records
    const finalBilingualQuestions: BilingualQuestion[] = selected.map((q, idx) => ({
      number: idx + 1,
      english: {
        text: q.english?.text || q.hindi?.text || '',
        options: q.english?.options || q.hindi?.options || [],
      },
      hindi: {
        text: q.hindi?.text || q.english?.text || '',
        options: q.hindi?.options || q.english?.options || [],
      },
      correctAnswer: q.correctAnswer || 'A',
      status: 'verified',
    }));

    // 6. Build answers map & cached questions
    const answersMap: Record<string, string> = {};
    finalBilingualQuestions.forEach((q) => {
      if (q.correctAnswer) {
        answersMap[String(q.number)] = q.correctAnswer;
      }
    });

    const cachedEn = finalBilingualQuestions.map((q) => ({
      number: q.number,
      text: q.english.text,
      options: q.english.options,
    }));

    const cachedHi = finalBilingualQuestions.map((q) => ({
      number: q.number,
      text: q.hindi.text,
      options: q.hindi.options,
    }));

    const cachedQuestionsMap = new Map();
    cachedQuestionsMap.set('en', cachedEn);
    cachedQuestionsMap.set('hi', cachedHi);

    // 7. Calculate Practice Test Number
    const existingPracticeTests = allSeries.filter(
      (s) => s.subject === subject && (s.testType === 'practice' || s.isRandom) && !s.isQuiz
    );
    const nextPracticeNumber = existingPracticeTests.length + 1;

    const newTest: TestSeries = {
      id: uuidv4(),
      title: `${subject} Practice Test - ${nextPracticeNumber}`,
      subject: subject,
      s3Key: '',
      startQuestion: 1,
      endQuestion: finalBilingualQuestions.length,
      createdAt: new Date().toISOString(),
      isRandom: true,
      testType: 'practice',
      format: 'test',
      durationMinutes: 80,
      bilingualQuestions: finalBilingualQuestions,
      cachedQuestions: cachedQuestionsMap as any,
      answers: answersMap as any,
    };

    await addTestSeries(newTest);

    return NextResponse.json(newTest, { status: 201 });
  } catch (error) {
    console.error('Failed to generate practice test:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate practice test' },
      { status: 500 }
    );
  }
}

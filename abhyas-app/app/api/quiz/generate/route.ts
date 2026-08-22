import { NextResponse, NextRequest } from 'next/server';
import { getAllTestSeries, addTestSeries } from '@/lib/db/metadata-store';
import { Subject, TestSeries, BilingualQuestion } from '@/lib/types';
import { CURATED_STREAK_QUESTIONS } from '@/lib/services/streak-pool';
import { generateStreakQuestions } from '@/lib/services/gemini';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/utils/auth';

const QUESTIONS_PER_QUIZ = 20;
const DURATION_PER_QUESTION = 30; // seconds

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { subject } = await request.json();
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    // 1. Gather all bilingual question pools for this subject from MongoDB
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

    // Include curated questions if needed
    const curated = CURATED_STREAK_QUESTIONS[subject as Subject];
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

    // If pool has fewer than needed, generate with Gemini AI
    if (questionPool.length < QUESTIONS_PER_QUIZ) {
      try {
        const aiGenerated = await generateStreakQuestions(subject as Subject);
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
        console.warn('AI fallback failed for quiz generation:', err);
      }
    }

    if (questionPool.length === 0) {
      return NextResponse.json(
        { error: `No questions available for ${subject}. Please upload a TXT question paper or try again.` },
        { status: 400 }
      );
    }

    // 2. Shuffle and pick 20
    const shuffled = [...questionPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const countToTake = Math.min(QUESTIONS_PER_QUIZ, shuffled.length);
    const selected = shuffled.slice(0, countToTake);

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

    const allQuizzesForSubject = allSeries.filter((s) => s.subject === subject && (s.isQuiz || s.format === 'quiz')).length + 1;

    const quizEntry: TestSeries = {
      id: uuidv4(),
      title: `${subject} Speed Quiz ${allQuizzesForSubject}`,
      subject: subject as Subject,
      s3Key: '',
      startQuestion: 1,
      endQuestion: finalBilingualQuestions.length,
      createdAt: new Date().toISOString(),
      isRandom: true,
      isQuiz: true,
      format: 'quiz',
      durationPerQuestion: DURATION_PER_QUESTION,
      bilingualQuestions: finalBilingualQuestions,
      cachedQuestions: cachedQuestionsMap as any,
      answers: answersMap as any,
    };

    await addTestSeries(quizEntry);

    return NextResponse.json({ quiz: quizEntry }, { status: 201 });
  } catch (error) {
    console.error('Failed to generate speed quiz:', error);
    return NextResponse.json({ error: 'Failed to create speed quiz' }, { status: 500 });
  }
}

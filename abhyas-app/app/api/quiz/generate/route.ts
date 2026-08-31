import { NextResponse, NextRequest } from 'next/server';
import { getAllTestSeries, addTestSeries } from '@/lib/db/metadata-store';
import { Subject, TestSeries, BilingualQuestion } from '@/lib/types';
import { BILINGUAL_STREAK_QUESTIONS } from '@/lib/services/streak-pool';
import { generateStreakQuestions, normalizeForFingerprint } from '@/lib/services/gemini';
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

    // 1. Gather all test series for this subject from MongoDB
    const allSeries = await getAllTestSeries();
    const subjectSeries = allSeries.filter((s) => s.subject === subject);

    // Collect practice test fingerprints to exclude from quiz pool
    const practiceFingerprints: string[] = [];
    for (const s of subjectSeries) {
      if (s.testType === 'practice') {
        const questions = s.bilingualQuestions || [];
        for (const q of questions) {
          const text = q.english?.text || q.hindi?.text || '';
          if (text) {
            practiceFingerprints.push(normalizeForFingerprint(text));
          }
        }
      }
    }

    const questionPool: BilingualQuestion[] = [];
    const seenTexts = new Set<string>();
    const practiceTextSet = new Set(practiceFingerprints);

    // Only include NON-practice series questions in the quiz pool
    for (const s of subjectSeries) {
      // Skip practice tests — quiz must not overlap
      if (s.testType === 'practice') continue;

      if (s.bilingualQuestions && s.bilingualQuestions.length > 0) {
        for (const q of s.bilingualQuestions) {
          const text = q.english?.text || q.hindi?.text || '';
          const key = text.trim().toLowerCase();
          const fp = normalizeForFingerprint(text);
          if (key && !seenTexts.has(key) && !practiceTextSet.has(fp)) {
            seenTexts.add(key);
            questionPool.push(q);
          }
        }
      } else if (s.manualQuestions && s.manualQuestions.length > 0) {
        for (const mq of s.manualQuestions) {
          const key = (mq.text || '').trim().toLowerCase();
          const fp = normalizeForFingerprint(mq.text || '');
          if (key && !seenTexts.has(key) && !practiceTextSet.has(fp)) {
            seenTexts.add(key);
            questionPool.push({
              number: mq.number,
              english: { text: mq.text, options: mq.options, explanation: mq.explanation },
              hindi: { text: mq.text, options: mq.options, explanation: mq.explanation },
              correctAnswer: mq.correctAnswer,
              status: 'verified',
            });
          }
        }
      }
    }

    // Include bilingual curated streak questions (with explanations)
    const curatedBilingual = BILINGUAL_STREAK_QUESTIONS[subject as Subject];
    if (curatedBilingual && curatedBilingual.length > 0) {
      for (const cq of curatedBilingual) {
        const text = cq.english?.text || cq.hindi?.text || '';
        const key = text.trim().toLowerCase();
        const fp = normalizeForFingerprint(text);
        if (key && !seenTexts.has(key) && !practiceTextSet.has(fp)) {
          seenTexts.add(key);
          questionPool.push(cq);
        }
      }
    }

    // If pool has fewer than needed, generate with AI (passing practice fingerprints for dedup)
    if (questionPool.length < QUESTIONS_PER_QUIZ) {
      try {
        const aiGenerated = await generateStreakQuestions(subject as Subject, practiceFingerprints);
        for (const gq of aiGenerated) {
          const key = (gq.text || '').trim().toLowerCase();
          if (key && !seenTexts.has(key)) {
            seenTexts.add(key);
            questionPool.push({
              number: gq.number,
              english: { text: gq.text, options: gq.options, explanation: gq.explanation },
              hindi: { text: gq.text, options: gq.options, explanation: gq.explanation },
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

    // Build final bilingual questions — preserve explanations
    const finalBilingualQuestions: BilingualQuestion[] = selected.map((q, idx) => ({
      number: idx + 1,
      english: {
        text: q.english?.text || q.hindi?.text || '',
        options: q.english?.options || q.hindi?.options || [],
        explanation: q.english?.explanation,
      },
      hindi: {
        text: q.hindi?.text || q.english?.text || '',
        options: q.hindi?.options || q.english?.options || [],
        explanation: q.hindi?.explanation,
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
      explanation: q.english.explanation,
    }));

    const cachedHi = finalBilingualQuestions.map((q) => ({
      number: q.number,
      text: q.hindi.text,
      options: q.hindi.options,
      explanation: q.hindi.explanation,
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

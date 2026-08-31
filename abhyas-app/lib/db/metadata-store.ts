import { TestSeries as TestSeriesType, ExamFormat, BilingualQuestion } from '@/lib/types';
import connectToDatabase from '@/lib/db/mongoose';
import { TestSeries } from '@/lib/models/TestSeries';
import { UsedQuestion } from '@/lib/models/UsedQuestion';
import { GeneratedQuestionHistory } from '@/lib/models/GeneratedQuestionHistory';

function toPlainTestSeries(doc: any): TestSeriesType {
  return {
    id: doc.id,
    title: doc.title,
    subject: doc.subject,
    s3Key: doc.s3Key,
    startQuestion: doc.startQuestion,
    endQuestion: doc.endQuestion,
    createdAt: doc.createdAt,
    isRandom: doc.isRandom,
    randomQuestions: doc.randomQuestions,
    format: (doc.format as ExamFormat) || (doc.isQuiz ? 'quiz' : 'test'),
    isQuiz: Boolean(doc.isQuiz),
    durationPerQuestion: doc.durationPerQuestion || 30,
    isManual: Boolean(doc.isManual),
    manualQuestions: doc.manualQuestions,
    isDailyStreak: Boolean(doc.isDailyStreak),
    streakDate: doc.streakDate,
    testType: doc.testType || (doc.isRandom ? 'practice' : 'prev-year'),
    durationMinutes: doc.durationMinutes,
    bilingualQuestions: doc.bilingualQuestions || [],
    answers: doc.answers instanceof Map ? Object.fromEntries(doc.answers) : doc.answers || {},
    cachedQuestions: doc.cachedQuestions instanceof Map 
      ? Object.fromEntries(doc.cachedQuestions) 
      : doc.cachedQuestions || {},
  };
}

export async function getAllTestSeries(): Promise<TestSeriesType[]> {
  await connectToDatabase();
  const series = await TestSeries.find({}).lean();
  return series.map(toPlainTestSeries);
}

export async function getTestSeriesMetadata(): Promise<TestSeriesType[]> {
  await connectToDatabase();
  const series = await TestSeries.find({}, {
    bilingualQuestions: 0,
    answers: 0,
    cachedQuestions: 0
  }).lean();
  return series.map(toPlainTestSeries);
}

export async function getTestSeriesById(id: string): Promise<TestSeriesType | null> {
  await connectToDatabase();
  const series = await TestSeries.findOne({ id }).lean();
  return series ? toPlainTestSeries(series) : null;
}

export async function addTestSeries(entry: TestSeriesType): Promise<void> {
  await connectToDatabase();
  await TestSeries.create(entry);
}

export async function deleteTestSeries(id: string): Promise<void> {
  await connectToDatabase();
  await TestSeries.deleteOne({ id });
}

export async function updateTestSeriesTitle(id: string, title: string): Promise<void> {
  await connectToDatabase();
  await TestSeries.findOneAndUpdate({ id }, { $set: { title } });
}

export async function updateTestSeriesQuestions(
  id: string,
  bilingualQuestions: BilingualQuestion[]
): Promise<void> {
  await connectToDatabase();

  const answersMap = new Map<string, string>();
  bilingualQuestions.forEach((q) => {
    if (q.correctAnswer) {
      answersMap.set(String(q.number), q.correctAnswer.trim().toUpperCase());
    }
  });

  const cachedEn = bilingualQuestions.map((q) => ({
    number: q.number,
    text: q.english.text,
    options: q.english.options,
  }));

  const cachedHi = bilingualQuestions.map((q) => ({
    number: q.number,
    text: q.hindi.text,
    options: q.hindi.options,
  }));

  const cachedQuestionsMap = new Map();
  cachedQuestionsMap.set('en', cachedEn);
  cachedQuestionsMap.set('hi', cachedHi);

  await TestSeries.findOneAndUpdate(
    { id },
    {
      $set: {
        bilingualQuestions,
        cachedQuestions: cachedQuestionsMap,
        answers: answersMap,
        endQuestion: bilingualQuestions.length,
      },
    }
  );
}

export async function getUsedQuestions(subject: string): Promise<string[]> {
  await connectToDatabase();
  const doc = await UsedQuestion.findOne({ subject }).lean();
  return doc?.keys ?? [];
}

export async function markQuestionsAsUsed(subject: string, questions: { s3Key: string, number: number }[]): Promise<void> {
  await connectToDatabase();
  const newKeys = questions.map(q => `${q.s3Key}:${q.number}`);
  
  await UsedQuestion.findOneAndUpdate(
    { subject },
    { $addToSet: { keys: { $each: newKeys } } },
    { upsert: true, new: true }
  );
}

export async function clearUsedQuestions(subject: string): Promise<void> {
  await connectToDatabase();
  await UsedQuestion.deleteOne({ subject });
}

export async function updateTestSeriesCache(id: string, lang: string, questions: any[]): Promise<void> {
  await connectToDatabase();
  const updateQuery: Record<string, any> = {};
  updateQuery[`cachedQuestions.${lang}`] = questions;
  await TestSeries.findOneAndUpdate(
    { id },
    { $set: updateQuery }
  );
}

// ── Generated Question History (AI Practice Test & Quiz Dedup) ──

/** Maximum sample texts kept for prompt injection (last ~2 generations worth) */
const MAX_SAMPLE_TEXTS = 160;

function cleanQuestionFingerprint(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/^q\d+[.:)\s]*/i, '')
    .replace(/^[0-9]+[.:)\s]*/, '')
    .replace(/[^a-z0-9\u0900-\u097F\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get previously generated question fingerprints and sample texts for a subject.
 * Aggregates from:
 * 1. GeneratedQuestionHistory collection
 * 2. ALL existing TestSeries documents in MongoDB for this subject
 */
export async function getGeneratedQuestionHistory(
  subject: string
): Promise<{ fingerprints: string[]; sampleTexts: string[] }> {
  await connectToDatabase();

  const fingerprintSet = new Set<string>();
  const sampleTextsSet = new Set<string>();

  // 1. Fetch from GeneratedQuestionHistory table
  try {
    const doc = await GeneratedQuestionHistory.findOne({ subject }).lean() as any;
    if (doc?.fingerprints) {
      doc.fingerprints.forEach((fp: string) => {
        const clean = cleanQuestionFingerprint(fp);
        if (clean) fingerprintSet.add(clean);
      });
    }
    if (doc?.sampleTexts) {
      doc.sampleTexts.forEach((st: string) => {
        if (st && st.trim()) sampleTextsSet.add(st.trim());
      });
    }
  } catch (err) {
    console.warn('Could not read GeneratedQuestionHistory:', err);
  }

  // 2. Fetch all existing test series in MongoDB matching this subject
  try {
    const subjectRegex = new RegExp(`^${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    const existingSeries = await TestSeries.find({
      $or: [
        { subject: subjectRegex },
        { title: new RegExp(subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      ],
    }).lean() as any[];

    for (const s of existingSeries) {
      // Check bilingualQuestions
      if (Array.isArray(s.bilingualQuestions)) {
        for (const bq of s.bilingualQuestions) {
          const enText = bq.english?.text;
          const hiText = bq.hindi?.text;
          if (enText) {
            fingerprintSet.add(cleanQuestionFingerprint(enText));
            sampleTextsSet.add(enText.trim());
          }
          if (hiText) {
            fingerprintSet.add(cleanQuestionFingerprint(hiText));
          }
        }
      }

      // Check manualQuestions
      if (Array.isArray(s.manualQuestions)) {
        for (const mq of s.manualQuestions) {
          if (mq.text) {
            fingerprintSet.add(cleanQuestionFingerprint(mq.text));
            sampleTextsSet.add(mq.text.trim());
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not aggregate test series questions for dedup:', err);
  }

  const sampleTexts = Array.from(sampleTextsSet).slice(0, MAX_SAMPLE_TEXTS);
  const fingerprints = Array.from(fingerprintSet);

  return {
    fingerprints,
    sampleTexts,
  };
}

/**
 * Record newly generated question fingerprints and update sample texts.
 * Fingerprints are appended (deduplicated); sampleTexts are replaced with the latest ~160.
 */
export async function addGeneratedQuestionHistory(
  subject: string,
  newFingerprints: string[],
  newSampleTexts: string[]
): Promise<void> {
  await connectToDatabase();

  const cleanedFps = newFingerprints.map(cleanQuestionFingerprint).filter(Boolean);

  // Get existing sample texts so we can prepend them and cap at MAX_SAMPLE_TEXTS
  const existing = await GeneratedQuestionHistory.findOne({ subject }).lean() as any;
  const existingSamples: string[] = existing?.sampleTexts ?? [];
  const mergedSamples = [...newSampleTexts, ...existingSamples].slice(0, MAX_SAMPLE_TEXTS);

  await GeneratedQuestionHistory.findOneAndUpdate(
    { subject },
    {
      $addToSet: { fingerprints: { $each: cleanedFps } },
      $set: { sampleTexts: mergedSamples },
    },
    { upsert: true, new: true }
  );
}

/**
 * Clear all generated question history for a subject (admin reset).
 */
export async function clearGeneratedQuestionHistory(subject: string): Promise<void> {
  await connectToDatabase();
  await GeneratedQuestionHistory.deleteOne({ subject });
}

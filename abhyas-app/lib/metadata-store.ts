import { TestSeries as TestSeriesType, ExamFormat } from './types';
import connectToDatabase from './mongoose';
import { TestSeries } from './models/TestSeries';
import { UsedQuestion } from './models/UsedQuestion';

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
  };
}

export async function getAllTestSeries(): Promise<TestSeriesType[]> {
  await connectToDatabase();
  const series = await TestSeries.find({}).lean();
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

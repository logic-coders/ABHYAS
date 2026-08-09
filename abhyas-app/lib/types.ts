/* ─── Shared TypeScript types for Abhyas ─── */

export type Subject = 'Music' | 'Math' | 'History' | 'Geography';

export const SUBJECTS: Subject[] = ['Music', 'Math', 'History', 'Geography'];

export const SUBJECT_ICONS: Record<Subject, string> = {
  Music: '🎵',
  Math: '📐',
  History: '📜',
  Geography: '🌍',
};

export const SUBJECT_COLORS: Record<Subject, string> = {
  Music: '#a855f7',
  Math: '#3b82f6',
  History: '#f59e0b',
  Geography: '#10b981',
};

/** Metadata for a test series, stored in S3 as JSON */
export interface TestSeries {
  id: string;
  title: string;
  subject: Subject;
  s3Key: string;
  startQuestion: number;
  endQuestion: number;
  createdAt: string; // ISO date string
  isRandom?: boolean;
  randomQuestions?: { s3Key: string, number: number }[];
}

/** A single parsed question (options only — no answer exposed to client) */
export interface Question {
  number: number;
  text: string;
  options: string[]; // ["A. ...", "B. ...", "C. ...", "D. ..."]
}

/** A user's answer for one question */
export interface ExamAnswer {
  questionNumber: number;
  selectedOption: string; // "A" | "B" | "C" | "D"
}

/** Breakdown for a single question in results */
export interface ResultItem {
  questionNumber: number;
  questionText: string;
  options: string[];
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

/** Final exam result */
export interface ExamResult {
  seriesId: string;
  seriesTitle: string;
  subject: Subject;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  percentage: number;
  breakdown: ResultItem[];
}

/* ─── Phase II: Authentication types ─── */

export type UserRole = 'admin' | 'user';

/** Full user record stored in S3 (includes password hash) */
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string; // ISO date string
}

/** Safe user sent to the client (no password hash) */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

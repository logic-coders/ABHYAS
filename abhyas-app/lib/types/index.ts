/* ─── Shared TypeScript types for Abhyas ─── */

export type Subject = 'Music' | 'Math' | 'History' | 'Geography' | 'Science' | 'English' | 'Hindi';

export const SUBJECTS: Subject[] = ['Music', 'Math', 'History', 'Geography', 'Science', 'English', 'Hindi'];

export const SUBJECT_ICONS: Record<Subject, string> = {
  Music: '🎵',
  Math: '📐',
  History: '📜',
  Geography: '🌍',
  Science: '🔬',
  English: '📖',
  Hindi: '✍️',
};

export const SUBJECT_COLORS: Record<Subject, string> = {
  Music: '#a855f7',
  Math: '#3b82f6',
  History: '#f59e0b',
  Geography: '#10b981',
  Science: '#06b6d4',
  English: '#ec4899',
  Hindi: '#f97316',
};

export type ExamFormat = 'test' | 'quiz';
export type Language = 'en' | 'hi';

export interface ManualQuestion {
  number: number;
  text: string;
  options: string[]; // ["A. ...", "B. ...", "C. ...", "D. ..."]
  correctAnswer: string; // "A" | "B" | "C" | "D"
}

export interface BilingualQuestion {
  number: number;
  english: {
    text: string;
    options: string[];
  };
  hindi: {
    text: string;
    options: string[];
  };
  correctAnswer?: string; // "A" | "B" | "C" | "D" | "E"
  status?: 'verified' | 'warning' | 'error';
  issues?: string[];
}

/** Metadata for a test series or speed quiz, stored in S3/DB as JSON */
export interface TestSeries {
  id: string;
  title: string;
  subject: Subject;
  s3Key?: string;
  startQuestion?: number;
  endQuestion?: number;
  createdAt: string; // ISO date string
  isRandom?: boolean;
  randomQuestions?: { s3Key: string; number: number }[];
  format?: ExamFormat;
  isQuiz?: boolean;
  durationPerQuestion?: number; // In seconds (default: 30 for quiz)
  isManual?: boolean;
  manualQuestions?: ManualQuestion[];
  bilingualQuestions?: BilingualQuestion[];
  answers?: Record<number, string>;
  isDailyStreak?: boolean;
  streakDate?: string; // "YYYY-MM-DD"
  cachedQuestions?: Record<string, Question[]>; // Keyed by language ('en' | 'hi')
  testType?: 'prev-year' | 'practice'; // Type of test
  durationMinutes?: number; // Duration in minutes (e.g. 150 for prev-year, 80 for practice)
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
  selectedOption: string; // "A" | "B" | "C" | "D" | "E"
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
  format?: ExamFormat;
}

/* ─── Phase II: Authentication types ─── */

export type UserRole = 'admin' | 'user';
export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** Full user record stored in S3/DB (includes password hash) */
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string; // ISO date string
  resetOtp?: string;
  resetOtpExpiry?: string;
  currentStreak?: number;
  longestStreak?: number;
  lastStreakDate?: string;
  streakHistory?: string[];
}

/** Safe user sent to the client (no password hash) */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  currentStreak?: number;
  longestStreak?: number;
  lastStreakDate?: string;
  streakHistory?: string[];
}

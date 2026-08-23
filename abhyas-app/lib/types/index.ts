/* ─── Shared TypeScript types for Abhyas ─── */

/**
 * All subjects in the system.
 * 'Geography' is kept for backward-compatibility with Prev Year tests stored in DB.
 * 'Indian Geography' and 'Global Geography' are for the Practice section only.
 */
export type Subject =
  | 'Music'
  | 'Math'
  | 'Modern History'
  | 'Geography'
  | 'Indian Geography'
  | 'Global Geography'
  | 'Science'
  | 'English'
  | 'Hindi';

/** Subjects used in Prev Year page and general admin TXT uploader (single Geography) */
export const SUBJECTS: Subject[] = ['Music', 'Math', 'Modern History', 'Geography', 'Science', 'English', 'Hindi'];

/** Subjects used in Practice page, Quiz banner, and AI Practice generator (Geography split into two) */
export const PRACTICE_SUBJECTS: Subject[] = [
  'Music',
  'Math',
  'Modern History',
  'Indian Geography',
  'Global Geography',
  'Science',
  'English',
  'Hindi',
];

export const SUBJECT_ICONS: Record<Subject, string> = {
  Music: '🎵',
  Math: '📐',
  'Modern History': '📜',
  Geography: '🌍',
  'Indian Geography': '🗺️',
  'Global Geography': '🌐',
  Science: '🔬',
  English: '📖',
  Hindi: '✍️',
};

export const SUBJECT_COLORS: Record<Subject, string> = {
  Music: '#a855f7',
  Math: '#3b82f6',
  'Modern History': '#f59e0b',
  Geography: '#10b981',
  'Indian Geography': '#059669',
  'Global Geography': '#0891b2',
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
  correctAnswer?: string;
  status?: 'verified' | 'warning' | 'error';
  issues?: string[];
}

export interface TestSeries {
  id: string;
  title: string;
  subject: Subject;
  s3Key?: string;
  startQuestion?: number;
  endQuestion?: number;
  createdAt?: string;
  isRandom?: boolean;
  randomQuestions?: { s3Key: string; number: number }[];
  cachedQuestions?: Map<Language, Question[]> | Record<string, Question[]> | any;
  answers?: Map<number, string> | Record<number, string> | Record<string, string> | any;
  format?: ExamFormat;
  isQuiz?: boolean;
  durationPerQuestion?: number;
  isManual?: boolean;
  manualQuestions?: ManualQuestion[];
  isDailyStreak?: boolean;
  streakDate?: string;
  testType?: 'practice' | 'prev-year';
  durationMinutes?: number;
  bilingualQuestions?: BilingualQuestion[];
}

export interface Question {
  number: number;
  text: string;
  options: string[];
}

export interface ExamAnswer {
  questionNumber: number;
  selectedOption: string;
}

export interface ResultItem {
  questionNumber: number;
  questionText: string;
  options: string[];
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface ExamResult {
  seriesId: string;
  seriesTitle: string;
  subject: Subject;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  percentage: number;
  format?: ExamFormat;
  breakdown: ResultItem[];
}

/* ─── User & Auth types ─── */
export type UserRole = 'user' | 'admin';
export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
  currentStreak?: number;
  longestStreak?: number;
  lastStreakDate?: string;
  streakHistory?: string[];
  resetOtp?: string;
  resetOtpExpiry?: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt?: string;
  currentStreak?: number;
  longestStreak?: number;
  lastStreakDate?: string;
  streakHistory?: string[];
}

export interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

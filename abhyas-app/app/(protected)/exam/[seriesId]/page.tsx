'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question, ExamResult, Language } from '@/lib/types';
import { useTheme } from '@/lib/context/theme-context';
import LanguageSelector from '@/components/exam/LanguageSelector';
import QuestionView from '@/components/exam/QuestionView';
import QuestionNavigator from '@/components/exam/QuestionNavigator';
import Pagination from '@/components/exam/Pagination';
import DisclaimerModal from '@/components/exam/DisclaimerModal';

interface ExamData {
  seriesId: string;
  seriesTitle: string;
  subject: string;
  totalQuestions: number;
  questions: Question[];
  testType?: string;
  durationMinutes?: number;
}

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params.seriesId as string;
  const { theme, toggleTheme } = useTheme();

  // Language selection
  const [language, setLanguage] = useState<Language | null>(null);
  
  // Disclaimer
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Exam state
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set());
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track previous index to mark as visited when navigating away
  const [prevIndex, setPrevIndex] = useState<number | null>(null);

  useEffect(() => {
    if (prevIndex !== null && prevIndex !== currentIndex) {
      setVisitedQuestions((prev) => {
        const next = new Set(prev);
        next.add(prevIndex);
        return next;
      });
    }
    setPrevIndex(currentIndex);
  }, [currentIndex, prevIndex]);

  // Fetch exam data when language is selected
  useEffect(() => {
    if (!language) return;

    const fetchExam = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/exam/${seriesId}/questions?lang=${language}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to load exam');
        }
        const data = await res.json();
        setExamData(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load exam');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExam();
  }, [seriesId, language]);

  const handleSelect = useCallback(
    (option: string) => {
      if (!examData || isTimeUp || isSubmitting) return;
      const question = examData.questions[currentIndex];
      setAnswers((prev) => ({ ...prev, [question.number]: option }));
    },
    [examData, currentIndex, isTimeUp, isSubmitting]
  );

  const handleNavigate = useCallback((index: number) => {
    if (isTimeUp || isSubmitting) return;
    setCurrentIndex(index);
  }, [isTimeUp, isSubmitting]);

  const handleClearResponse = useCallback(() => {
    if (!examData || isTimeUp || isSubmitting) return;
    const question = examData.questions[currentIndex];
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[question.number];
      return next;
    });
  }, [examData, currentIndex, isTimeUp, isSubmitting]);

  const handleMarkForReview = useCallback(() => {
    if (!examData || isTimeUp || isSubmitting) return;
    const question = examData.questions[currentIndex];
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      next.add(question.number);
      return next;
    });
    // Move to next question if not last
    if (currentIndex < examData.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [examData, currentIndex, isTimeUp, isSubmitting]);

  // Finish and view Scoreboard
  const handleSubmit = useCallback(async () => {
    if (!examData || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const answerPayload = Object.entries(answers).map(([qNum, option]) => ({
        questionNumber: Number(qNum),
        selectedOption: option,
      }));

      const res = await fetch(`/api/exam/${seriesId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answerPayload,
          lang: language,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit exam');
      }

      const result: ExamResult = await res.json();

      // Clear timer key upon successful submission
      sessionStorage.removeItem(`exam_end_time_${seriesId}`);

      // Exit fullscreen mode upon submitting test
      if (typeof document !== 'undefined' && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      // Store result in sessionStorage for the detailed result / scoreboard page
      sessionStorage.setItem(`result-${seriesId}`, JSON.stringify(result));

      // Redirect directly to the Scoreboard page
      router.push(`/result/${seriesId}`);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Submission failed');
      setIsSubmitting(false);
    }
  }, [examData, isSubmitting, answers, seriesId, language, router]);

  const handleTimeUp = useCallback(() => {
    setIsTimeUp(true);
    handleSubmit();
  }, [handleSubmit]);

  // Fullscreen lock & back navigation prevention mid-test
  useEffect(() => {
    if (!hasAcceptedDisclaimer) return;

    // 1. Prevent back navigation
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      alert('Back navigation is disabled during the exam. Please complete your exam using the Finish & View Scoreboard button.');
    };
    window.addEventListener('popstate', handlePopState);

    // 2. Warn on tab close / reload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Your exam is in progress. Leaving this page will auto-submit your test.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasAcceptedDisclaimer]);

  const handleAcceptDisclaimer = () => {
    // Clear any stale timer from a previous attempt before starting fresh
    sessionStorage.removeItem(`exam_end_time_${seriesId}`);
    setHasAcceptedDisclaimer(true);
    // Request fullscreen on accepting disclaimer
    if (typeof document !== 'undefined' && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen block ignored by browser permissions if any
      });
    }
  };

  // ── Language Selection ──
  if (!language) {
    return <LanguageSelector onSelect={(lang) => setLanguage(lang)} />;
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="container page-wrapper">
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="skeleton" style={{ height: '2rem', width: '40%', marginBottom: '1.5rem' }} />
          <div className="skeleton" style={{ height: '3rem', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: '1.5rem', width: '80%', marginBottom: '2rem' }} />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '3.5rem', marginBottom: '0.75rem' }} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !examData) {
    return (
      <div className="container page-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <p className="empty-state-text">{error || 'Exam not found'}</p>
          <button className="btn btn-primary" onClick={() => router.push('/tests')}>
            ← Back to Tests
          </button>
        </div>
      </div>
    );
  }

  // ── Disclaimer ──
  if (!hasAcceptedDisclaimer) {
    return (
      <DisclaimerModal
        onAccept={handleAcceptDisclaimer}
        onCancel={() => router.push('/tests')}
      />
    );
  }

  const currentQuestion = examData.questions[currentIndex];

  return (
    <div className="exam-container">
      {/* Top Header Bar */}
      <header className="exam-top-nav">
        <div className="exam-top-nav-inner">
          <div className="exam-branding">
            <span className="exam-subject-badge">{examData.subject.toUpperCase()}</span>
            <div className="exam-header-titles">
              <h1 className="exam-header-main-title">{examData.seriesTitle}</h1>
              <span className="exam-header-subtitle">
                {examData.totalQuestions} Questions • Standard Marking (+1.00, -0.25)
              </span>
            </div>
          </div>

          <div className="exam-nav-actions">
            <span className="cbt-mode-badge">
              <span className="cbt-dot" /> CBT Exam Mode
            </span>
            <span className="lang-pill">
              {language === 'en' ? 'English' : 'Hindi'}
            </span>
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <div className="exam-layout">
          {/* Main Question & Actions Area */}
          <main className="exam-main-panel">
            <QuestionView
              question={currentQuestion}
              displayNumber={currentIndex + 1}
              totalQuestions={examData.totalQuestions}
              subjectName={examData.subject}
              selectedOption={answers[currentQuestion.number] || ''}
              onSelect={handleSelect}
            />

            <Pagination
              current={currentIndex}
              total={examData.questions.length}
              onPrevious={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              onNext={() => setCurrentIndex((i) => Math.min(examData.questions.length - 1, i + 1))}
              onClearResponse={handleClearResponse}
              onMarkForReview={handleMarkForReview}
            />
          </main>

          {/* Right-Side Question Navigator & Timer Panel */}
          <div className="exam-side-panel">
            <QuestionNavigator
              seriesId={seriesId}
              questions={examData.questions}
              currentIndex={currentIndex}
              answers={answers}
              visitedQuestions={visitedQuestions}
              markedForReview={markedForReview}
              onNavigate={handleNavigate}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onTimeUp={handleTimeUp}
              durationMinutes={examData.durationMinutes}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        .exam-container {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        /* ── Top Header Bar ── */
        .exam-top-nav {
          background: var(--header-bg);
          border-bottom: 1px solid var(--border-medium);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 0.75rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: var(--shadow-sm);
        }

        .exam-top-nav-inner {
          width: 100%;
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 var(--space-lg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .exam-branding {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .exam-subject-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.75rem;
          background: #2563eb;
          color: #ffffff;
          font-weight: 800;
          font-size: 0.82rem;
          border-radius: var(--radius-sm);
          letter-spacing: 0.04em;
        }

        .exam-header-titles {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .exam-header-main-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .exam-header-subtitle {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        .exam-nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cbt-mode-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          background: var(--bg-glass-strong);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .cbt-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
        }

        .lang-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.65rem;
          background: var(--bg-glass-strong);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        /* ── Main Layout ── */
        .exam-layout {
          display: grid;
          grid-template-columns: 1fr 310px;
          gap: 1.75rem;
          align-items: start;
        }

        .exam-main-panel {
          min-width: 0;
        }

        .exam-side-panel {
          min-width: 0;
        }

        @media (max-width: 900px) {
          .exam-layout {
            grid-template-columns: 1fr;
          }

          .exam-header-subtitle {
            display: none;
          }

          .cbt-mode-badge {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question, ExamResult } from '@/lib/types';
import { Language } from '@/lib/pdf-parser';
import { useTheme } from '@/lib/theme-context';
import LanguageSelector from '@/components/LanguageSelector';

const QUESTION_TIME_LIMIT = 60; // 60 seconds per question

interface QuizData {
  seriesId: string;
  seriesTitle: string;
  subject: string;
  totalQuestions: number;
  questions: Question[];
}

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const { theme, toggleTheme } = useTheme();

  // Language selection
  const [language, setLanguage] = useState<Language | null>(null);

  // Disclaimer
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

  // Quiz state
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref to track latest answers for async timeout submission
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Fetch quiz questions once language is chosen
  useEffect(() => {
    if (!language) return;

    const fetchQuiz = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/exam/${quizId}/questions?lang=${language}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to load quiz');
        }
        const data = await res.json();
        setQuizData(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, language]);

  // Submit Quiz function
  const handleSubmit = useCallback(
    async (finalAnswers?: Record<number, string>) => {
      if (!quizData || isSubmitting) return;
      setIsSubmitting(true);

      const answersToSubmit = finalAnswers || answersRef.current;

      try {
        const answerPayload = Object.entries(answersToSubmit).map(([qNum, option]) => ({
          questionNumber: Number(qNum),
          selectedOption: option,
        }));

        const res = await fetch(`/api/exam/${quizId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: answerPayload,
            lang: language,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to submit quiz');
        }

        const result: ExamResult = await res.json();

        // Exit fullscreen mode upon submitting
        if (typeof document !== 'undefined' && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }

        // Store result in sessionStorage for the scoreboard page
        sessionStorage.setItem(`result-${quizId}`, JSON.stringify(result));

        // Redirect directly to the Scoreboard page
        router.push(`/result/${quizId}`);
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : 'Submission failed');
        setIsSubmitting(false);
      }
    },
    [quizData, isSubmitting, quizId, language, router]
  );

  // Advance to next question or submit if on last question
  const handleNext = useCallback(() => {
    if (!quizData || isSubmitting) return;

    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Last question completed
      handleSubmit();
    }
  }, [quizData, isSubmitting, currentIndex, handleSubmit]);

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(QUESTION_TIME_LIMIT);
  }, [currentIndex]);

  // Per-question 30-second Timer countdown
  useEffect(() => {
    if (!hasAcceptedDisclaimer || !quizData || isSubmitting) return;

    if (timeLeft <= 0) {
      handleNext();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasAcceptedDisclaimer, quizData, isSubmitting, timeLeft, handleNext]);

  // Option selection
  const handleSelect = (option: string) => {
    if (!quizData || isSubmitting) return;
    const currentQ = quizData.questions[currentIndex];
    setAnswers((prev) => ({ ...prev, [currentQ.number]: option }));
  };

  // Fullscreen lock & back navigation prevention
  useEffect(() => {
    if (!hasAcceptedDisclaimer) return;

    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      alert('Back navigation is disabled in Speed Quiz mode.');
    };
    window.addEventListener('popstate', handlePopState);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Speed Quiz is in progress. Leaving will end your quiz.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasAcceptedDisclaimer]);

  const handleAcceptDisclaimer = () => {
    setHasAcceptedDisclaimer(true);
    if (typeof document !== 'undefined' && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
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
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <div className="skeleton" style={{ height: '3rem', width: '60%', margin: '0 auto 1.5rem' }} />
          <div className="skeleton" style={{ height: '80px', marginBottom: '1.5rem' }} />
          <div className="skeleton" style={{ height: '250px', marginBottom: '1rem' }} />
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !quizData) {
    return (
      <div className="container page-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <p className="empty-state-text">{error || 'Quiz not found'}</p>
          <button className="btn btn-primary" onClick={() => router.push('/tests')}>
            ← Back to Tests & Quizzes
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz Disclaimer Modal ──
  if (!hasAcceptedDisclaimer) {
    return (
      <div className="modal-overlay">
        <div className="modal-content quiz-disclaimer">
          <div className="quiz-badge-header">⚡ SPEED QUIZ ARENA</div>
          <h2 className="modal-title">Speed Quiz Rules</h2>

          <div className="quiz-rules-list">
            <div className="rule-item">
              <span className="rule-icon">⏱️</span>
              <div>
                <strong>60 Seconds Per Question:</strong>
                <p>Timer begins immediately. If time expires, the question is marked as skipped and auto-advances.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">🎯</span>
              <div>
                <strong>20 High-Yield Questions:</strong>
                <p>Curated speed assessment to test your instant recall and accuracy.</p>
              </div>
            </div>
            <div className="rule-item">
              <span className="rule-icon">⏩</span>
              <div>
                <strong>Forward-Only Navigation:</strong>
                <p>No going back to earlier questions once you advance.</p>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => router.push('/tests')} type="button">
              Cancel
            </button>
            <button className="btn btn-primary btn-quiz-start" onClick={handleAcceptDisclaimer} type="button">
              Start Speed Quiz ⚡
            </button>
          </div>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.25s ease;
            padding: 1rem;
          }
          .quiz-disclaimer {
            background: var(--bg-card);
            border: 1px solid var(--border-medium);
            border-radius: var(--radius-xl);
            padding: 2.25rem;
            max-width: 520px;
            width: 100%;
            box-shadow: var(--shadow-lg);
          }
          .quiz-badge-header {
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.1em;
            color: #f59e0b;
            background: rgba(245, 158, 11, 0.12);
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-full);
            display: inline-block;
            margin-bottom: 0.75rem;
          }
          .modal-title {
            font-size: 1.5rem;
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 1.25rem;
          }
          .quiz-rules-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 2rem;
          }
          .rule-item {
            display: flex;
            gap: 0.85rem;
            align-items: flex-start;
          }
          .rule-icon {
            font-size: 1.3rem;
            flex-shrink: 0;
          }
          .rule-item strong {
            display: block;
            font-size: 0.95rem;
            color: var(--text-primary);
            margin-bottom: 0.15rem;
          }
          .rule-item p {
            font-size: 0.85rem;
            color: var(--text-secondary);
            margin: 0;
            line-height: 1.4;
          }
          .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
          }
          .btn-quiz-start {
            background: linear-gradient(135deg, #f59e0b, #ec4899);
            border: none;
            font-weight: 700;
            color: #ffffff !important;
          }
        `}</style>
      </div>
    );
  }

  const currentQ = quizData.questions[currentIndex];
  const isLastQuestion = currentIndex === quizData.questions.length - 1;
  const currentSelected = answers[currentQ.number] || '';

  // Timer Progress Calculation
  const timerPercentage = (timeLeft / QUESTION_TIME_LIMIT) * 100;
  const isWarning = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className="quiz-container">
      {/* Top Navigation Bar */}
      <header className="quiz-top-nav">
        <div className="quiz-top-inner">
          <div className="quiz-branding">
            <span className="quiz-badge">{quizData.subject.toUpperCase()}</span>
            <div className="quiz-titles">
              <span className="quiz-main-title">{quizData.seriesTitle}</span>
              <span className="quiz-sub-title">20 Questions • 60s per Question</span>
            </div>
          </div>

          <div className="quiz-nav-actions">
            <span className="quiz-mode-pill">⚡ Speed Quiz</span>
            <span className="lang-pill">{language === 'en' ? 'English' : 'Hindi'}</span>
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Quiz Arena */}
      <main className="container quiz-main-wrapper">
        {/* Progress & Speed Timer Bar */}
        <div className="quiz-progress-card">
          <div className="progress-meta">
            <div className="q-counter">
              <span className="q-curr">Question {currentIndex + 1}</span>
              <span className="q-tot">of {quizData.questions.length}</span>
            </div>

            {/* Circular / Pill 30s Digital Clock */}
            <div className={`speed-clock ${isCritical ? 'clock-critical' : isWarning ? 'clock-warning' : ''}`}>
              <span className="clock-icon">⏱️</span>
              <span className="clock-digits">{timeLeft}s</span>
            </div>
          </div>

          {/* Animated Time-Remaining Progress Bar */}
          <div className="timer-track">
            <div
              className={`timer-fill ${isCritical ? 'fill-critical' : isWarning ? 'fill-warning' : ''}`}
              style={{ width: `${timerPercentage}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="quiz-card">
          <h2 className="quiz-question-text">{currentQ.text}</h2>

          {/* Options */}
          <div className="quiz-options">
            {currentQ.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx); // 'A', 'B', 'C', 'D', 'E'
              const cleanText = opt.replace(/^[(\s]*[A-Ja-j][).:\s]+\s*/, '').trim();
              const isSelected = currentSelected === letter;

              return (
                <button
                  key={idx}
                  type="button"
                  className={`quiz-option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(letter)}
                >
                  <span className={`option-letter ${isSelected ? 'letter-selected' : ''}`}>
                    ({letter})
                  </span>
                  <span className="option-text">{cleanText || opt}</span>
                  {isSelected && <span className="option-check">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Forward-Only Bottom Navigation */}
          <div className="quiz-bottom-actions">
            <button
              className="btn btn-ghost btn-skip"
              onClick={handleNext}
              type="button"
            >
              Skip Question ⏭️
            </button>

            <button
              className="btn btn-primary btn-next-q"
              onClick={handleNext}
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : isLastQuestion ? (
                'Finish & View Scoreboard 🏁'
              ) : (
                'Next Question →'
              )}
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .quiz-container {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        /* ── Header ── */
        .quiz-top-nav {
          background: var(--header-bg);
          border-bottom: 1px solid var(--border-medium);
          backdrop-filter: blur(20px);
          padding: 0.75rem 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .quiz-top-inner {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 var(--space-lg);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .quiz-branding {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .quiz-badge {
          background: linear-gradient(135deg, #f59e0b, #ec4899);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-sm);
          letter-spacing: 0.04em;
        }

        .quiz-titles {
          display: flex;
          flex-direction: column;
        }

        .quiz-main-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .quiz-sub-title {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .quiz-nav-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .quiz-mode-pill {
          font-size: 0.75rem;
          font-weight: 700;
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(245, 158, 11, 0.3);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
        }

        .lang-pill {
          font-size: 0.75rem;
          background: var(--bg-glass-strong);
          border: 1px solid var(--border-subtle);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          font-weight: 600;
        }

        /* ── Main Arena ── */
        .quiz-main-wrapper {
          max-width: 800px;
          margin: 2rem auto;
          padding: 0 var(--space-md);
        }

        /* ── Speed Progress Card ── */
        .quiz-progress-card {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .progress-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .q-counter {
          display: flex;
          align-items: baseline;
          gap: 0.4rem;
        }

        .q-curr {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .q-tot {
          font-size: 0.88rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .speed-clock {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #0f172a;
          border: 1px solid #1e293b;
          color: #38bdf8;
          padding: 0.4rem 0.9rem;
          border-radius: var(--radius-full);
          font-family: monospace;
          font-size: 1.15rem;
          font-weight: 800;
          transition: all 0.3s ease;
        }

        .clock-warning {
          background: rgba(245, 158, 11, 0.15);
          border-color: #f59e0b;
          color: #f59e0b;
        }

        .clock-critical {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
          color: #ef4444;
          animation: pulse 1s infinite alternate;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }

        .timer-track {
          width: 100%;
          height: 8px;
          background: var(--bg-glass-strong);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .timer-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #6366f1);
          border-radius: var(--radius-full);
          transition: width 1s linear;
        }

        .fill-warning {
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
        }

        .fill-critical {
          background: linear-gradient(90deg, #ef4444, #dc2626);
        }

        /* ── Question Card ── */
        .quiz-card {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-xl);
          padding: 2.25rem;
          box-shadow: var(--shadow-md);
        }

        .quiz-question-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.5;
          margin-bottom: 2rem;
        }

        .quiz-options {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 2.5rem;
        }

        .quiz-option-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--bg-glass);
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-md);
          font-family: inherit;
          text-align: left;
          cursor: pointer;
          transition: all 0.15s ease;
          color: var(--text-secondary);
        }

        .quiz-option-btn:hover {
          border-color: var(--accent);
          background: var(--bg-card-hover);
          color: var(--text-primary);
          transform: translateX(4px);
        }

        .quiz-option-btn.selected {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.1);
          color: var(--text-primary);
          box-shadow: 0 0 0 1px #2563eb;
        }

        .option-letter {
          font-weight: 800;
          font-size: 0.95rem;
          color: var(--text-muted);
          min-width: 28px;
        }

        .letter-selected {
          color: #2563eb;
        }

        .option-text {
          font-size: 1.02rem;
          font-weight: 500;
          flex: 1;
        }

        .option-check {
          color: #2563eb;
          font-weight: 800;
          font-size: 1.1rem;
        }

        .quiz-bottom-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
          flex-wrap: wrap;
        }

        .btn-skip {
          color: var(--text-muted);
        }
        .btn-skip:hover {
          color: var(--text-primary);
        }

        .btn-next-q {
          padding: 0.75rem 1.75rem;
          font-weight: 700;
          font-size: 1rem;
          background: #2563eb;
          border: none;
          color: #ffffff !important;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
        }

        .btn-next-q:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .quiz-top-inner {
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
            text-align: center;
          }
          .quiz-branding {
            flex-direction: column;
            align-items: center;
          }
          .quiz-nav-actions {
            width: 100%;
            justify-content: center;
          }
          .quiz-card {
            padding: 1.5rem;
          }
          .quiz-question-text {
            font-size: 1.1rem;
          }
          .progress-meta {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }
          .quiz-option-btn {
            padding: 0.85rem 1rem;
          }
          .quiz-bottom-actions {
            flex-direction: column-reverse;
            gap: 1rem;
          }
          .btn-skip, .btn-next-q {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

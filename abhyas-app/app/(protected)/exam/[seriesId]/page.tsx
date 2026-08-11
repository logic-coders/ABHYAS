'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question, ExamResult } from '@/lib/types';
import { Language } from '@/lib/pdf-parser';
import LanguageSelector from '@/components/LanguageSelector';
import QuestionView from '@/components/QuestionView';
import QuestionNavigator from '@/components/QuestionNavigator';
import Pagination from '@/components/Pagination';
import ResultModal from '@/components/ResultModal';
import DisclaimerModal from '@/components/DisclaimerModal';
import ExamTimer from '@/components/ExamTimer';

interface ExamData {
  seriesId: string;
  seriesTitle: string;
  subject: string;
  totalQuestions: number;
  questions: Question[];
}

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params.seriesId as string;

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

  // Result modal
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

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

  const handleSubmit = async () => {
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

      // Exit fullscreen mode upon submitting test
      if (typeof document !== 'undefined' && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      // Store result in sessionStorage for the detailed result page
      sessionStorage.setItem(`result-${seriesId}`, JSON.stringify(result));

      // Show result modal instead of redirecting
      setExamResult(result);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = useCallback(() => {
    setIsTimeUp(true);
    if (!examResult) {
      handleSubmit();
    }
  }, [examResult, handleSubmit]);

  // Fullscreen lock & back navigation prevention mid-test
  useEffect(() => {
    if (!hasAcceptedDisclaimer || examResult) return;

    // 1. Prevent back navigation
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      alert('Back navigation is disabled during the exam. Please complete and submit your exam using the Submit button.');
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
  }, [hasAcceptedDisclaimer, examResult]);

  const handleAcceptDisclaimer = () => {
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
          <button className="btn btn-primary" onClick={() => router.push('/')}>
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
        onCancel={() => router.push('/')}
      />
    );
  }

  const currentQuestion = examData.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <>
      <div className="container page-wrapper">
        <div className="exam-layout">
          {/* Main content area */}
          <div className="exam-main">
            {/* Exam Header */}
            <div className="exam-header">
              <div className="exam-title-area">
                <h1 className="exam-title">{examData.seriesTitle}</h1>
                <span className="badge">{examData.subject}</span>
                <span className="lang-badge">
                  {language === 'en' ? 'English' : 'Hindi'}
                </span>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <ExamTimer seriesId={seriesId} onTimeUp={handleTimeUp} />
              </div>
            </div>

            {/* Question */}
            <QuestionView
              question={currentQuestion}
              displayNumber={currentIndex + 1}
              selectedOption={answers[currentQuestion.number] || ''}
              onSelect={handleSelect}
            />

            {/* Pagination */}
            <Pagination
              current={currentIndex}
              total={examData.questions.length}
              onPrevious={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              onNext={() => setCurrentIndex((i) => Math.min(examData.questions.length - 1, i + 1))}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              answeredCount={answeredCount}
              onClearResponse={handleClearResponse}
              onMarkForReview={handleMarkForReview}
            />
          </div>

          {/* Question Navigator Panel */}
          <QuestionNavigator
            questions={examData.questions}
            currentIndex={currentIndex}
            answers={answers}
            visitedQuestions={visitedQuestions}
            markedForReview={markedForReview}
            onNavigate={handleNavigate}
          />
        </div>
      </div>

      {/* Result Modal */}
      {examResult && (
        <ResultModal
          result={examResult}
          onClose={() => router.push('/')}
        />
      )}

      <style jsx>{`
        .exam-layout {
          display: grid;
          grid-template-columns: 1fr 220px;
          gap: 2rem;
          align-items: start;
        }

        .exam-main {
          min-width: 0;
        }

        .exam-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .exam-title-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .exam-title {
          font-size: 1.3rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .lang-badge {
          padding: 0.2rem 0.5rem;
          font-size: 0.72rem;
          font-weight: 700;
          background: var(--bg-glass-strong);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .exam-layout {
            grid-template-columns: 1fr;
          }
          
          .exam-header {
            position: sticky;
            top: 0;
            z-index: 50;
            background: rgba(10, 10, 15, 0.95);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            padding: 1rem 0;
            margin-top: -1rem;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-subtle);
          }
        }
      `}</style>
    </>
  );
}

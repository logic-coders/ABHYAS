'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TestSeries, Subject } from '@/lib/types';
import SubjectFilter from '@/components/SubjectFilter';
import TestSeriesCard from '@/components/TestSeriesCard';

export default function QuizDashboardPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<TestSeries[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<Subject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuizzes();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const subj = params.get('subject');
      if (subj && ['Music', 'Math', 'History', 'Geography'].includes(subj)) {
        setSelectedSubject(subj as Subject);
      }
    }
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/test-series');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: TestSeries[] = await res.json();
      // Only keep Speed Quizzes
      const quizOnly = data.filter((s) => s.isQuiz || s.format === 'quiz');
      setQuizzes(quizOnly);
    } catch (err) {
      console.error(err);
      setError('Failed to load speed quizzes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Launch instant 20-question Speed Quiz
  const handleStartInstantQuiz = async (subject: Subject) => {
    setIsGeneratingQuiz(subject);
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to start speed quiz');
      }

      const data = await res.json();
      router.push(`/quiz/${data.quiz.id}`);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to start speed quiz');
    } finally {
      setIsGeneratingQuiz(null);
    }
  };

  const filtered =
    selectedSubject === 'All'
      ? quizzes
      : quizzes.filter((s) => s.subject === selectedSubject);

  return (
    <div className="container">
      {/* Quiz Dashboard Header */}
      <section className="quiz-header-section">
        <div className="quiz-pill-tag">⚡ SPEED QUIZ ARENA</div>
        <h1 className="header-title">20 Questions • 30s Per Question</h1>
        <p className="header-desc">
          High-yield rapid quizzes designed to test instant recall, reaction time, and precision under pressure.
        </p>

        {/* Instant Speed Quiz Quick Launcher Banner */}
        <div className="instant-quiz-banner">
          <div className="banner-left">
            <span className="banner-badge">⚡ INSTANT BLITZ</span>
            <h2 className="banner-title">Take a 20-Question Blitz (30s / Question)</h2>
            <p className="banner-desc">Select a subject to instantly generate a 20-question rapid quiz:</p>
          </div>
          <div className="banner-actions">
            {(['Music', 'Math', 'History', 'Geography'] as Subject[]).map((subj) => (
              <button
                key={subj}
                className="btn btn-instant-quiz"
                onClick={() => handleStartInstantQuiz(subj)}
                disabled={isGeneratingQuiz !== null}
                type="button"
              >
                {isGeneratingQuiz === subj ? (
                  <>
                    <span className="spinner-mini" /> Starting...
                  </>
                ) : (
                  <>⚡ {subj}</>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Subject Filter */}
      <SubjectFilter selected={selectedSubject} onChange={setSelectedSubject} />

      {/* Speed Quiz Grid */}
      {isLoading ? (
        <div className="card-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '220px' }} />
          ))}
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <p className="empty-state-text">{error}</p>
          <button className="btn btn-primary" onClick={fetchQuizzes}>
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚡</div>
          <p className="empty-state-text">
            {selectedSubject === 'All'
              ? 'No Speed Quizzes generated yet'
              : `No Speed Quizzes for ${selectedSubject}`}
          </p>
          <p className="empty-state-hint">
            Click any subject button in the Instant Blitz banner above to generate and take your first speed quiz!
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((s, idx) => (
            <TestSeriesCard key={s.id} series={s} index={idx} />
          ))}
        </div>
      )}

      {/* Bottom spacer */}
      <div style={{ height: '4rem' }} />

      <style jsx>{`
        .quiz-header-section {
          margin-top: 3rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .quiz-pill-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.75rem;
        }

        .header-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .header-desc {
          font-size: 0.95rem;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto 2rem auto;
        }

        /* ── Instant Quiz Banner ── */
        .instant-quiz-banner {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(236, 72, 153, 0.08));
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-xl);
          padding: 1.75rem 2rem;
          margin: 0 auto 2.5rem auto;
          max-width: 860px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          text-align: left;
        }

        .banner-left {
          flex: 1;
          min-width: 280px;
        }

        .banner-badge {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.15);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-bottom: 0.4rem;
        }

        .banner-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .banner-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
        }

        .banner-actions {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .btn-instant-quiz {
          background: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border-medium);
          padding: 0.6rem 1rem;
          font-size: 0.88rem;
          font-weight: 700;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }

        .btn-instant-quiz:hover:not(:disabled) {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
        }

        .spinner-mini {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(245, 158, 11, 0.3);
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .instant-quiz-banner {
            flex-direction: column;
            text-align: center;
            padding: 1.25rem;
          }
          .banner-actions {
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

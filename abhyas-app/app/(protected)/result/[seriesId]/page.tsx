'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ExamResult, SUBJECT_ICONS } from '@/lib/types';
import ResultBreakdown from '@/components/ResultBreakdown';

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params.seriesId as string;

  const [result, setResult] = useState<ExamResult | null>(null);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(`result-${seriesId}`);
    if (stored) {
      const parsed = JSON.parse(stored) as ExamResult;
      setResult(parsed);
      // Trigger score animation after mount
      setTimeout(() => setShowScore(true), 300);
    }
  }, [seriesId]);

  if (!result) {
    return (
      <div className="container page-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-text">No result data found</p>
          <p className="empty-state-hint">
            Please take an exam first to see your results.
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/')} style={{ marginTop: '1rem' }}>
            ← Browse Tests
          </button>
        </div>
      </div>
    );
  }

  const scoreColor =
    result.percentage >= 70
      ? 'var(--color-correct)'
      : result.percentage >= 40
        ? 'var(--color-history)'
        : 'var(--color-incorrect)';

  const subjectIcon = SUBJECT_ICONS[result.subject] || '📖';

  return (
    <div className="container page-wrapper">
      <div className="result-container">
        {/* Header */}
        <div className="result-header">
          <button className="btn btn-ghost" onClick={() => router.push('/tests')}>
            ← Back to Tests
          </button>
        </div>

        {/* Score Card */}
        <div className="score-card glass-card">
          <div className="score-card-inner">
            <div className="score-subject">
              <span className="score-subject-icon">{subjectIcon}</span>
              <h1 className="score-title">{result.seriesTitle}</h1>
            </div>

            <div className={`score-ring ${showScore ? 'score-ring-animate' : ''}`}>
              <svg viewBox="0 0 120 120" className="ring-svg">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="var(--border-subtle)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(result.percentage / 100) * 327} 327`}
                  className="ring-progress"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="score-value">
                <span className="score-number" style={{ color: scoreColor }}>
                  {result.percentage}%
                </span>
                <span className="score-label">Score</span>
              </div>
            </div>

            <div className="score-stats">
              <div className="stat stat-correct">
                <span className="stat-icon">✅</span>
                <span className="stat-value">{result.correct}</span>
                <span className="stat-label">Correct</span>
              </div>
              <div className="stat stat-incorrect">
                <span className="stat-icon">❌</span>
                <span className="stat-value">{result.incorrect}</span>
                <span className="stat-label">Incorrect</span>
              </div>
              <div className="stat stat-unanswered">
                <span className="stat-icon">⬜</span>
                <span className="stat-value">{result.unanswered}</span>
                <span className="stat-label">Skipped</span>
              </div>
              <div className="stat stat-total">
                <span className="stat-icon">📋</span>
                <span className="stat-value">{result.totalQuestions}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="breakdown-section">
          <h2 className="section-heading">Question Breakdown</h2>
          <ResultBreakdown breakdown={result.breakdown} />
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/tests')}>
            📖 Take Another Test
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              sessionStorage.removeItem(`result-${seriesId}`);
              router.push(`/exam/${seriesId}`);
            }}
          >
            🔄 Retake This Exam
          </button>
        </div>
      </div>

      <style jsx>{`
        .result-container {
          max-width: 760px;
          margin: 0 auto;
        }

        .result-header {
          margin-bottom: 1.5rem;
        }

        /* ── Score Card ── */
        .score-card {
          padding: 2.5rem;
          margin-bottom: 2.5rem;
          text-align: center;
          animation: scaleIn 0.5s ease;
        }

        .score-card-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }

        .score-subject {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .score-subject-icon {
          font-size: 1.6rem;
        }

        .score-title {
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        /* ── Score Ring ── */
        .score-ring {
          position: relative;
          width: 140px;
          height: 140px;
        }

        .ring-svg {
          width: 100%;
          height: 100%;
        }

        .ring-progress {
          transition: stroke-dasharray 1.2s ease;
          stroke-dasharray: 0 327;
        }

        .score-ring-animate .ring-progress {
          stroke-dasharray: ${''};
        }

        .score-value {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .score-number {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          animation: countUp 0.6s ease 0.4s both;
        }

        .score-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* ── Stats Row ── */
        .score-stats {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.75rem 1rem;
          background: var(--bg-glass);
          border-radius: var(--radius-md);
          min-width: 80px;
        }

        .stat-icon {
          font-size: 1.1rem;
        }

        .stat-value {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .stat-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── Breakdown Section ── */
        .breakdown-section {
          margin-bottom: 2.5rem;
        }

        /* ── Actions ── */
        .result-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          padding-bottom: 3rem;
        }

        @media (max-width: 480px) {
          .score-card {
            padding: 1.5rem;
          }

          .score-stats {
            gap: 0.75rem;
          }

          .stat {
            min-width: 70px;
            padding: 0.5rem 0.75rem;
          }

          .result-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

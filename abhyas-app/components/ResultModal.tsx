'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExamResult, SUBJECT_ICONS } from '@/lib/types';

interface ResultModalProps {
  result: ExamResult;
  onClose: () => void;
}

export default function ResultModal({ result, onClose }: ResultModalProps) {
  const router = useRouter();
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    // Trigger score animation after modal mounts
    const timer = setTimeout(() => setShowScore(true), 400);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  const scoreColor =
    result.percentage >= 70
      ? 'var(--color-correct)'
      : result.percentage >= 40
        ? 'var(--color-history)'
        : 'var(--color-incorrect)';

  const subjectIcon = SUBJECT_ICONS[result.subject] || '📖';

  const emoji =
    result.percentage >= 80
      ? '🎉'
      : result.percentage >= 60
        ? '👏'
        : result.percentage >= 40
          ? '💪'
          : '📚';

  const message =
    result.percentage >= 80
      ? 'Excellent work!'
      : result.percentage >= 60
        ? 'Good job!'
        : result.percentage >= 40
          ? 'Keep practicing!'
          : 'Don\'t give up!';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Celebration emoji */}
        <div className="modal-emoji">{emoji}</div>

        <h2 className="modal-message">{message}</h2>

        <div className="modal-subject">
          <span>{subjectIcon}</span>
          <span className="modal-title">{result.seriesTitle}</span>
        </div>

        {/* Score Ring */}
        <div className={`modal-ring ${showScore ? 'ring-animate' : ''}`}>
          <svg viewBox="0 0 120 120" className="ring-svg">
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="8"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={showScore ? `${(result.percentage / 100) * 327} 327` : '0 327'}
              className="ring-progress"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="ring-value">
            <span className="ring-number" style={{ color: scoreColor }}>
              {result.percentage}%
            </span>
            <span className="ring-label">Score</span>
          </div>
        </div>

        {/* Stats */}
        <div className="modal-stats">
          <div className="modal-stat">
            <span className="modal-stat-icon">✅</span>
            <span className="modal-stat-value">{result.correct}</span>
            <span className="modal-stat-label">Correct</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-icon">❌</span>
            <span className="modal-stat-value">{result.incorrect}</span>
            <span className="modal-stat-label">Wrong</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-icon">⬜</span>
            <span className="modal-stat-value">{result.unanswered}</span>
            <span className="modal-stat-label">Skipped</span>
          </div>
          <div className="modal-stat">
            <span className="modal-stat-icon">📋</span>
            <span className="modal-stat-value">{result.totalQuestions}</span>
            <span className="modal-stat-label">Total</span>
          </div>
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => {
              sessionStorage.setItem(`result-${result.seriesId}`, JSON.stringify(result));
              router.push(`/result/${result.seriesId}`);
            }}
          >
            📊 View Detailed Results
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => router.push('/')}
          >
            ← Back to Tests
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(16px);
          animation: fadeIn 0.3s ease;
          padding: 1rem;
        }

        .modal-content {
          background: var(--bg-secondary);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-xl);
          padding: 2.5rem 2rem;
          max-width: 480px;
          width: 100%;
          text-align: center;
          animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-emoji {
          font-size: 3.5rem;
          margin-bottom: 0.75rem;
          animation: bounceIn 0.6s ease 0.2s both;
        }

        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }

        .modal-message {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .modal-subject {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .modal-title {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        /* ── Score Ring ── */
        .modal-ring {
          position: relative;
          width: 130px;
          height: 130px;
          margin: 0 auto 1.5rem;
        }

        .ring-svg {
          width: 100%;
          height: 100%;
        }

        .ring-progress {
          transition: stroke-dasharray 1.2s ease;
        }

        .ring-value {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .ring-number {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .ring-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* ── Stats ── */
        .modal-stats {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .modal-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          padding: 0.6rem 0.75rem;
          background: var(--bg-glass);
          border-radius: var(--radius-md);
          min-width: 70px;
        }

        .modal-stat-icon {
          font-size: 1rem;
        }

        .modal-stat-value {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .modal-stat-label {
          font-size: 0.68rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        /* ── Actions ── */
        .modal-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (max-width: 480px) {
          .modal-content {
            padding: 1.5rem;
          }

          .modal-stats {
            gap: 0.5rem;
          }

          .modal-stat {
            min-width: 60px;
            padding: 0.5rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}

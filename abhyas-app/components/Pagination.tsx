'use client';

interface PaginationProps {
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  answeredCount: number;
  onClearResponse: () => void;
  onMarkForReview: () => void;
}

export default function Pagination({
  current,
  total,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
  answeredCount,
  onClearResponse,
  onMarkForReview,
}: PaginationProps) {
  const isFirst = current === 0;
  const isLast = current === total - 1;

  return (
    <div className="pagination-wrapper">
      {/* Progress bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>

      {/* Info */}
      <div className="pagination-info">
        <span className="page-indicator">
          Question <strong>{current + 1}</strong> of <strong>{total}</strong>
        </span>
        <span className="answered-indicator">
          {answeredCount} / {total} answered
        </span>
      </div>

      {/* Navigation */}
      <div className="pagination-nav">
        <button
          className="btn btn-secondary"
          onClick={onPrevious}
          disabled={isFirst}
        >
          ← Previous
        </button>

        <div className="action-buttons">
          <button className="btn btn-ghost clear-btn" onClick={onClearResponse}>
            Clear Response
          </button>
          
          {isLast ? (
            <>
              <button className="btn btn-secondary review-btn" onClick={onMarkForReview}>
                Mark for Review
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner" /> Scoring...
                  </>
                ) : (
                  '✓ Submit Exam'
                )}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary review-btn" onClick={onMarkForReview}>
                Mark for Review & Next
              </button>
              <button className="btn btn-primary" onClick={onNext}>
                Save & Next →
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .pagination-wrapper {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: var(--bg-glass-strong);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent-gradient);
          border-radius: var(--radius-full);
          transition: width 0.4s ease;
        }

        .pagination-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .page-indicator strong {
          color: var(--text-primary);
        }

        .answered-indicator {
          color: var(--text-muted);
        }

        .pagination-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .clear-btn {
          color: var(--text-muted);
        }

        .clear-btn:hover {
          color: var(--color-incorrect);
        }

        .review-btn {
          background: rgba(168, 85, 247, 0.1);
          color: #a855f7;
          border-color: rgba(168, 85, 247, 0.3);
        }

        .review-btn:hover {
          background: rgba(168, 85, 247, 0.2);
          border-color: #a855f7;
        }

        @media (max-width: 768px) {
          .pagination-nav {
            flex-direction: column;
          }

          .action-buttons {
            flex-direction: column;
            width: 100%;
          }

          .pagination-nav .btn,
          .action-buttons .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

'use client';

interface PaginationProps {
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
  onClearResponse: () => void;
  onMarkForReview: () => void;
}

export default function Pagination({
  current,
  total,
  onPrevious,
  onNext,
  onClearResponse,
  onMarkForReview,
}: PaginationProps) {
  const isFirst = current === 0;
  const isLast = current === total - 1;

  return (
    <div className="exam-bottom-bar">
      {/* Left side actions */}
      <div className="bottom-bar-left">
        <button
          className="btn btn-review"
          onClick={onMarkForReview}
          type="button"
        >
          {isLast ? 'Mark for Review' : 'Mark for Review & Next'}
        </button>
        <button
          className="btn btn-clear"
          onClick={onClearResponse}
          type="button"
        >
          Clear Response
        </button>
      </div>

      {/* Right side navigation */}
      <div className="bottom-bar-right">
        <button
          className="btn btn-prev"
          onClick={onPrevious}
          disabled={isFirst}
          type="button"
        >
          ← Previous
        </button>

        {!isLast && (
          <button
            className="btn btn-next"
            onClick={onNext}
            type="button"
          >
            Save & Next →
          </button>
        )}
      </div>

      <style jsx>{`
        .exam-bottom-bar {
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1rem 0;
        }

        .bottom-bar-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .bottom-bar-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-left: auto;
        }

        .btn-review {
          background: #7c3aed;
          color: #ffffff !important;
          border: none;
          font-weight: 600;
          font-size: 0.88rem;
          padding: 0.65rem 1.15rem;
          border-radius: var(--radius-md);
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);
        }

        .btn-review:hover {
          background: #6d28d9;
          transform: translateY(-1px);
        }

        .btn-clear {
          background: var(--bg-glass-strong);
          color: var(--text-secondary);
          border: 1px solid var(--border-medium);
          font-weight: 600;
          font-size: 0.88rem;
          padding: 0.65rem 1.15rem;
          border-radius: var(--radius-md);
        }

        .btn-clear:hover {
          color: var(--color-incorrect);
          border-color: rgba(239, 68, 68, 0.4);
          background: rgba(239, 68, 68, 0.08);
        }

        .btn-prev {
          background: var(--bg-glass-strong);
          color: var(--text-primary);
          border: 1px solid var(--border-medium);
          font-weight: 600;
          font-size: 0.88rem;
          padding: 0.65rem 1.25rem;
          border-radius: var(--radius-md);
        }

        .btn-prev:hover:not(:disabled) {
          border-color: var(--border-accent);
          background: var(--bg-card-hover);
        }

        .btn-next {
          background: #2563eb;
          color: #ffffff !important;
          border: none;
          font-weight: 600;
          font-size: 0.88rem;
          padding: 0.65rem 1.35rem;
          border-radius: var(--radius-md);
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }

        .btn-next:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        @media (max-width: 768px) {
          .exam-bottom-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .bottom-bar-left,
          .bottom-bar-right {
            width: 100%;
            justify-content: space-between;
          }

          .bottom-bar-left .btn,
          .bottom-bar-right .btn {
            flex: 1;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

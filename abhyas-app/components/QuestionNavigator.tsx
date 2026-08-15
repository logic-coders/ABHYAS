'use client';

import { useState } from 'react';
import { Question } from '@/lib/types';
import ExamTimer from '@/components/ExamTimer';

interface QuestionNavigatorProps {
  seriesId: string;
  questions: Question[];
  currentIndex: number;
  answers: Record<number, string>; // questionNumber -> selected option
  visitedQuestions: Set<number>;   // set of question indices that have been visited
  markedForReview: Set<number>;    // set of question numbers marked for review
  onNavigate: (index: number) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  onTimeUp: () => void;
}

export default function QuestionNavigator({
  seriesId,
  questions,
  currentIndex,
  answers,
  visitedQuestions,
  markedForReview,
  onNavigate,
  onSubmit,
  isSubmitting = false,
  onTimeUp,
}: QuestionNavigatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatus = (idx: number): 'current' | 'answered' | 'unanswered' | 'marked' | 'answered-marked' | 'default' => {
    const qNum = questions[idx].number;
    const isAnswered = !!answers[qNum];
    const isMarked = markedForReview.has(qNum);
    
    if (isAnswered && isMarked) return 'answered-marked';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    if (visitedQuestions.has(idx)) return 'unanswered';
    return 'default';
  };

  // State counts
  let answeredCount = 0;
  let notAnsweredCount = 0;
  let notVisitedCount = 0;
  let markedCount = 0;
  let ansMarkedCount = 0;

  questions.forEach((q, idx) => {
    const isAns = !!answers[q.number];
    const isMkd = markedForReview.has(q.number);
    const isVisited = visitedQuestions.has(idx) || idx === currentIndex;

    if (isAns && isMkd) {
      ansMarkedCount++;
    } else if (isMkd) {
      markedCount++;
    } else if (isAns) {
      answeredCount++;
    } else if (isVisited) {
      notAnsweredCount++;
    } else {
      notVisitedCount++;
    }
  });

  return (
    <>
      {/* Desktop side panel */}
      <aside className="nav-panel">
        {/* Prominent Timer at the top */}
        <div className="nav-timer-container">
          <ExamTimer seriesId={seriesId} onTimeUp={onTimeUp} />
        </div>

        {/* Legend Summary Badges */}
        <div className="nav-legend-grid">
          <div className="legend-badge legend-badge-answered">
            <span className="legend-badge-count">{answeredCount}</span>
            <span className="legend-badge-text">Answered</span>
          </div>
          <div className="legend-badge legend-badge-unanswered">
            <span className="legend-badge-count">{notAnsweredCount}</span>
            <span className="legend-badge-text">Not Answered</span>
          </div>
          <div className="legend-badge legend-badge-notvisited">
            <span className="legend-badge-count">{notVisitedCount}</span>
            <span className="legend-badge-text">Not Visited</span>
          </div>
          <div className="legend-badge legend-badge-marked">
            <span className="legend-badge-count">{markedCount}</span>
            <span className="legend-badge-text">Marked for Review</span>
          </div>
          <div className="legend-badge legend-badge-ans-marked">
            <span className="legend-badge-count">{ansMarkedCount}</span>
            <span className="legend-badge-text">Ans & Marked for Review</span>
          </div>
        </div>

        {/* Question Palette Section */}
        <div className="nav-palette-section">
          <div className="nav-palette-header">
            <h3 className="nav-palette-title">Question Palette</h3>
            <span className="nav-palette-count">All {questions.length} Questions</span>
          </div>

          <div className="nav-grid">
            {questions.map((q, idx) => {
              const status = getStatus(idx);
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={idx}
                  className={`nav-bubble nav-${status} ${isCurrent ? 'nav-active' : ''}`}
                  onClick={() => {
                    onNavigate(idx);
                    if (window.innerWidth <= 768) setIsExpanded(false);
                  }}
                  type="button"
                  title={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Finish & View Scorecard / Submit Button */}
        <div className="nav-footer">
          <button
            className="btn btn-submit-panel"
            onClick={onSubmit}
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? (
              <>
                <span className="spinner" /> Submitting...
              </>
            ) : (
              'Finish & View Scoreboard'
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Floating Action Button */}
      <button
        className="nav-fab"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
        aria-label="Open Question Palette"
      >
        <span className="nav-fab-icon">☰</span>
        <span className="nav-fab-count">{answeredCount}/{questions.length}</span>
      </button>

      {/* Mobile Drawer Overlay */}
      {isExpanded && (
        <div className="nav-mobile-overlay" onClick={() => setIsExpanded(false)}>
          <div
            className="nav-mobile-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nav-mobile-header">
              <h3 className="nav-palette-title">Question Palette</h3>
              <button
                className="nav-close-btn"
                onClick={() => setIsExpanded(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            {/* Mobile Timer */}
            <div style={{ marginBottom: '1rem' }}>
              <ExamTimer seriesId={seriesId} onTimeUp={onTimeUp} />
            </div>

            {/* Mobile Legend */}
            <div className="nav-legend-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="legend-badge legend-badge-answered">
                <span className="legend-badge-count">{answeredCount}</span>
                <span className="legend-badge-text">Answered</span>
              </div>
              <div className="legend-badge legend-badge-unanswered">
                <span className="legend-badge-count">{notAnsweredCount}</span>
                <span className="legend-badge-text">Not Answered</span>
              </div>
              <div className="legend-badge legend-badge-notvisited">
                <span className="legend-badge-count">{notVisitedCount}</span>
                <span className="legend-badge-text">Not Visited</span>
              </div>
              <div className="legend-badge legend-badge-marked">
                <span className="legend-badge-count">{markedCount}</span>
                <span className="legend-badge-text">Marked</span>
              </div>
              <div className="legend-badge legend-badge-ans-marked">
                <span className="legend-badge-count">{ansMarkedCount}</span>
                <span className="legend-badge-text">Ans & Marked</span>
              </div>
            </div>

            {/* Mobile Grid */}
            <div className="nav-grid">
              {questions.map((q, idx) => {
                const status = getStatus(idx);
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    className={`nav-bubble nav-${status} ${isCurrent ? 'nav-active' : ''}`}
                    onClick={() => {
                      onNavigate(idx);
                      setIsExpanded(false);
                    }}
                    type="button"
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                className="btn btn-submit-panel"
                onClick={() => {
                  setIsExpanded(false);
                  onSubmit();
                }}
                disabled={isSubmitting}
                type="button"
                style={{ width: '100%' }}
              >
                {isSubmitting ? 'Submitting...' : 'Finish & View Scoreboard'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* ── Desktop Panel ── */
        .nav-panel {
          position: sticky;
          top: 5rem;
          background: var(--nav-panel-bg);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          max-height: calc(100vh - 6.5rem);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: var(--shadow-sm);
          animation: fadeInUp 0.4s ease;
        }

        .nav-timer-container {
          width: 100%;
        }

        /* ── Legend Badges ── */
        .nav-legend-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .legend-badge {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.4rem 0.55rem;
          border-radius: var(--radius-sm);
          font-size: 0.72rem;
          font-weight: 600;
          line-height: 1.2;
        }

        .legend-badge-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 1.35rem;
          height: 1.35rem;
          border-radius: 4px;
          color: #fff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0 0.2rem;
        }

        .legend-badge-text {
          color: var(--text-secondary);
        }

        .legend-badge-answered {
          background: rgba(34, 197, 94, 0.1);
        }
        .legend-badge-answered .legend-badge-count {
          background: #22c55e;
        }

        .legend-badge-unanswered {
          background: rgba(239, 68, 68, 0.1);
        }
        .legend-badge-unanswered .legend-badge-count {
          background: #ef4444;
        }

        .legend-badge-notvisited {
          background: var(--bg-glass-strong);
        }
        .legend-badge-notvisited .legend-badge-count {
          background: #64748b;
        }

        .legend-badge-marked {
          background: rgba(168, 85, 247, 0.1);
        }
        .legend-badge-marked .legend-badge-count {
          background: #a855f7;
        }

        .legend-badge-ans-marked {
          background: rgba(168, 85, 247, 0.1);
          grid-column: span 2;
        }
        .legend-badge-ans-marked .legend-badge-count {
          background: #a855f7;
          border-bottom: 3px solid #22c55e;
        }

        /* ── Question Palette ── */
        .nav-palette-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
          padding: 0 4px;
        }

        .nav-palette-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2px;
        }

        .nav-palette-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .nav-palette-count {
          font-size: 0.78rem;
          font-weight: 600;
          color: #3b82f6;
        }

        /* ── Bubble Grid ── */
        .nav-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
          padding: 4px 2px;
        }

        .nav-bubble {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          aspect-ratio: 1;
          font-family: inherit;
          font-size: 0.92rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
          position: relative;
        }

        .nav-bubble:hover {
          transform: scale(1.08);
          z-index: 2;
        }

        /* Status Styles */
        .nav-default {
          background: var(--nav-bubble-default-bg);
          color: var(--nav-bubble-default-text);
          border-color: var(--nav-bubble-default-border);
        }

        .nav-answered {
          background: #22c55e !important;
          color: #ffffff !important;
          border-color: #16a34a !important;
        }

        .nav-unanswered {
          background: #ef4444 !important;
          color: #ffffff !important;
          border-color: #dc2626 !important;
        }

        .nav-marked {
          background: #a855f7 !important;
          color: #ffffff !important;
          border-color: #9333ea !important;
        }

        .nav-answered-marked {
          background: #a855f7 !important;
          color: #ffffff !important;
          border-color: #9333ea !important;
          position: relative;
        }

        .nav-answered-marked::after {
          content: '';
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          border: 1px solid #ffffff;
        }

        .nav-active {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.4) !important;
          font-weight: 800;
          z-index: 3;
        }

        /* ── Footer / Submit Button ── */
        .nav-footer {
          margin-top: auto;
          padding-top: 0.5rem;
        }

        .btn-submit-panel {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #16a34a;
          color: #ffffff !important;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(22, 163, 74, 0.3);
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .btn-submit-panel:hover {
          background: #15803d;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(22, 163, 74, 0.4);
        }

        /* ── Mobile FAB ── */
        .nav-fab {
          display: none;
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 100;
          padding: 0.75rem 1rem;
          background: var(--accent-gradient);
          color: #fff;
          border: none;
          border-radius: var(--radius-full);
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
          gap: 0.5rem;
          align-items: center;
        }

        /* ── Mobile Overlay ── */
        .nav-mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease;
        }

        .nav-mobile-panel {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--modal-bg);
          border-top: 1px solid var(--border-medium);
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          padding: 1.5rem;
          max-height: 80vh;
          overflow-y: auto;
          animation: slideInUp 0.3s ease;
        }

        .nav-mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        .nav-close-btn {
          background: var(--bg-glass);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          width: 2rem;
          height: 2rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .nav-panel {
            display: none;
          }

          .nav-fab {
            display: flex;
          }

          .nav-mobile-overlay {
            display: block;
          }
        }
      `}</style>
    </>
  );
}

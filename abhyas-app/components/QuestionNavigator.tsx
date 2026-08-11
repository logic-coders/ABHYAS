'use client';

import { useState } from 'react';

import { Question } from '@/lib/types';

interface QuestionNavigatorProps {
  questions: Question[];
  currentIndex: number;
  answers: Record<number, string>; // questionNumber -> selected option
  visitedQuestions: Set<number>;   // set of question indices that have been visited
  markedForReview: Set<number>;    // set of question numbers marked for review
  onNavigate: (index: number) => void;
}

export default function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  visitedQuestions,
  markedForReview,
  onNavigate,
}: QuestionNavigatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatus = (idx: number): 'current' | 'answered' | 'unanswered' | 'marked' | 'answered-marked' | 'default' => {
    if (idx === currentIndex) return 'current';
    const qNum = questions[idx].number;
    const isAnswered = !!answers[qNum];
    const isMarked = markedForReview.has(qNum);
    
    if (isAnswered && isMarked) return 'answered-marked';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    if (visitedQuestions.has(idx)) return 'unanswered';
    return 'default';
  };

  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.size;
  const unansweredVisited = Array.from(visitedQuestions).filter(
    idx => !answers[questions[idx].number] && !markedForReview.has(questions[idx].number) && idx !== currentIndex
  ).length;

  return (
    <>
      {/* Desktop: side panel */}
      <aside className="nav-panel">
        <div className="nav-panel-header">
          <h3 className="nav-panel-title">Questions</h3>
          <div className="nav-legend">
            <span className="legend-item">
              <span className="legend-dot legend-answered" />
              <span>{answeredCount} Answered</span>
            </span>
            <span className="legend-item">
              <span className="legend-dot legend-marked" />
              <span>{markedCount} Marked</span>
            </span>
            <span className="legend-item" style={{ marginTop: '0.25rem' }}>
              <span className="legend-dot legend-unanswered" />
              <span>{unansweredVisited} Skipped</span>
            </span>
          </div>
        </div>
        <div className="nav-grid">
          {questions.map((q, idx) => {
            const status = getStatus(idx);
            return (
              <button
                key={idx}
                className={`nav-bubble nav-${status}`}
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
      </aside>

      {/* Mobile: floating button + expandable panel */}
      <button
        className="nav-fab"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        <span className="nav-fab-icon">☰</span>
        <span className="nav-fab-count">{answeredCount}/{questions.length}</span>
      </button>

      {isExpanded && (
        <div className="nav-mobile-overlay" onClick={() => setIsExpanded(false)}>
          <div
            className="nav-mobile-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="nav-panel-header">
              <h3 className="nav-panel-title">Questions</h3>
              <button
                className="nav-close-btn"
                onClick={() => setIsExpanded(false)}
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="nav-legend" style={{ marginBottom: '1rem' }}>
              <span className="legend-item">
                <span className="legend-dot legend-answered" />
                <span>{answeredCount} Answered</span>
              </span>
              <span className="legend-item">
                <span className="legend-dot legend-marked" />
                <span>{markedCount} Marked</span>
              </span>
              <span className="legend-item">
                <span className="legend-dot legend-unanswered" />
                <span>{unansweredVisited} Skipped</span>
              </span>
            </div>
            <div className="nav-grid">
              {questions.map((q, idx) => {
                const status = getStatus(idx);
                return (
                  <button
                    key={idx}
                    className={`nav-bubble nav-${status}`}
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
        </div>
      )}

      <style jsx>{`
        /* ── Desktop Panel ── */
        .nav-panel {
          position: sticky;
          top: 5.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          max-height: calc(100vh - 7rem);
          overflow-y: auto;
          animation: fadeInUp 0.4s ease;
        }

        .nav-panel-header {
          margin-bottom: 1rem;
        }

        .nav-panel-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .nav-legend {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-answered {
          background: var(--color-correct);
        }

        .legend-marked {
          background: #a855f7;
        }

        .legend-unanswered {
          background: var(--color-incorrect);
        }

        /* ── Question Bubbles Grid ── */
        .nav-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .nav-bubble {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          aspect-ratio: 1;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 700;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-bubble:hover {
          transform: scale(1.1);
        }

        /* Status colors */
        .nav-default {
          background: var(--bg-glass);
          color: var(--text-muted);
          border-color: var(--border-subtle);
        }

        .nav-current {
          background: rgba(139, 92, 246, 0.15);
          color: var(--accent-light);
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .nav-answered {
          background: rgba(34, 197, 94, 0.15);
          color: var(--color-correct);
          border-color: rgba(34, 197, 94, 0.4);
        }

        .nav-marked {
          background: rgba(168, 85, 247, 0.15);
          color: #a855f7;
          border-color: rgba(168, 85, 247, 0.4);
        }

        .nav-answered-marked {
          background: rgba(168, 85, 247, 0.15);
          color: #a855f7;
          border-color: rgba(168, 85, 247, 0.4);
          position: relative;
        }

        .nav-answered-marked::after {
          content: '';
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--color-correct);
          border: 2px solid var(--bg-card);
        }

        .nav-unanswered {
          background: rgba(239, 68, 68, 0.12);
          color: var(--color-incorrect);
          border-color: rgba(239, 68, 68, 0.35);
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
          transition: transform 0.2s ease;
        }

        .nav-fab:hover {
          transform: scale(1.05);
        }

        .nav-fab-icon {
          font-size: 1rem;
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
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-medium);
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
          padding: 1.5rem;
          max-height: 70vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease;
        }

        .nav-close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--bg-glass);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          width: 2rem;
          height: 2rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .nav-close-btn:hover {
          background: var(--bg-glass-strong);
          color: var(--text-primary);
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
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

        /* Scrollbar styling */
        .nav-panel::-webkit-scrollbar,
        .nav-mobile-panel::-webkit-scrollbar {
          width: 4px;
        }

        .nav-panel::-webkit-scrollbar-thumb,
        .nav-mobile-panel::-webkit-scrollbar-thumb {
          background: var(--border-medium);
          border-radius: 4px;
        }
      `}</style>
    </>
  );
}

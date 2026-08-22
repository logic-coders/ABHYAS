'use client';

import { ResultItem } from '@/lib/types';
import { useState } from 'react';

interface ResultBreakdownProps {
  breakdown: ResultItem[];
}

export default function ResultBreakdown({ breakdown }: ResultBreakdownProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const getOptionLetter = (optionText: string, index: number): string => {
    const match = optionText.match(/^[(\s]*([A-Ja-j])[).:\s]/);
    if (match) return match[1].toUpperCase();
    const fallbackLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    return fallbackLetters[index] || String.fromCharCode(65 + index);
  };

  return (
    <div className="breakdown-list">
      {breakdown.map((item, idx) => {
        const isExpanded = expandedIndex === idx;
        const wasUnanswered = item.userAnswer === '—' || !item.userAnswer;

        return (
          <div
            key={item.questionNumber || idx}
            className={`breakdown-item ${
              item.isCorrect
                ? 'item-correct'
                : wasUnanswered
                  ? 'item-unanswered'
                  : 'item-incorrect'
            }`}
            style={{ animationDelay: `${idx * 0.03}s` }}
          >
            {/* Summary row (always visible) */}
            <button
              className="breakdown-summary"
              onClick={() => toggle(idx)}
              type="button"
            >
              <span className="status-icon">
                {item.isCorrect ? '✅' : wasUnanswered ? '⬜' : '❌'}
              </span>
              <span className="q-label">Q{idx + 1}</span>
              <span className="q-text-preview">
                {item.questionText.length > 80
                  ? item.questionText.substring(0, 80) + '…'
                  : item.questionText}
              </span>
              <span className="answer-badges">
                {!wasUnanswered && (
                  <span
                    className={`answer-badge ${item.isCorrect ? 'badge-correct' : 'badge-incorrect'}`}
                  >
                    You: {item.userAnswer}
                  </span>
                )}
                <span className="answer-badge badge-answer">
                  Ans: {item.correctAnswer}
                </span>
              </span>
              <span className={`expand-chevron ${isExpanded ? 'expanded' : ''}`}>
                ▾
              </span>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="breakdown-detail">
                <p className="detail-question">{item.questionText}</p>
                <div className="detail-options">
                  {item.options.map((opt, oidx) => {
                    const optLetter = getOptionLetter(opt, oidx);
                    const isUserChoice = !wasUnanswered && item.userAnswer && optLetter === item.userAnswer.toUpperCase();
                    const isCorrectChoice = Boolean(item.correctAnswer && optLetter === item.correctAnswer.toUpperCase());
                    const cleanOptionText = opt.replace(/^[(\s]*[A-Ja-j][).:\s]+\s*/, '');

                    return (
                      <div
                        key={oidx}
                        className={`detail-option ${isCorrectChoice ? 'opt-correct' : ''} ${
                          isUserChoice && !item.isCorrect ? 'opt-wrong' : ''
                        }`}
                      >
                        <span className={`option-letter-badge ${isCorrectChoice ? 'badge-correct-letter' : isUserChoice ? 'badge-wrong-letter' : ''}`}>
                          ({optLetter})
                        </span>
                        <span className="option-text-content">{cleanOptionText}</span>
                        {isCorrectChoice && <span className="opt-tag correct-tag">✓ Correct Answer</span>}
                        {isUserChoice && !item.isCorrect && (
                          <span className="opt-tag wrong-tag">✗ Your Choice</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .breakdown-item {
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          overflow: hidden;
          animation: fadeInUp 0.3s ease both;
          transition: border-color var(--transition-fast);
        }

        .item-correct {
          border-left: 3px solid var(--color-correct);
        }
        .item-incorrect {
          border-left: 3px solid var(--color-incorrect);
        }
        .item-unanswered {
          border-left: 3px solid var(--text-muted);
        }

        .breakdown-summary {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.85rem 1rem;
          background: var(--bg-glass);
          border: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.88rem;
          text-align: left;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .breakdown-summary:hover {
          background: var(--bg-glass-strong);
        }

        .status-icon {
          font-size: 1rem;
          flex-shrink: 0;
        }

        .q-label {
          font-weight: 700;
          color: var(--text-secondary);
          flex-shrink: 0;
          min-width: 2rem;
        }

        .q-text-preview {
          flex: 1;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .answer-badges {
          display: flex;
          gap: 0.4rem;
          flex-shrink: 0;
        }

        .answer-badge {
          padding: 0.15rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
        }

        .badge-correct {
          background: var(--color-correct-bg);
          color: var(--color-correct);
        }
        .badge-incorrect {
          background: var(--color-incorrect-bg);
          color: var(--color-incorrect);
        }
        .badge-answer {
          background: rgba(139, 92, 246, 0.12);
          color: var(--accent-light);
        }

        .expand-chevron {
          font-size: 0.8rem;
          color: var(--text-muted);
          transition: transform var(--transition-fast);
          flex-shrink: 0;
        }
        .expanded {
          transform: rotate(180deg);
        }

        /* Detail panel */
        .breakdown-detail {
          padding: 1rem 1.25rem;
          background: var(--bg-card);
          border-top: 1px solid var(--border-subtle);
          animation: fadeIn 0.2s ease;
        }

        .detail-question {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-primary);
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .detail-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detail-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.92rem;
          color: var(--text-primary);
          border-radius: var(--radius-md);
          background: var(--bg-glass);
          border: 1.5px solid var(--border-subtle);
          transition: all 0.2s ease;
        }

        .opt-correct {
          background: rgba(34, 197, 94, 0.12) !important;
          border-color: #22c55e !important;
          color: var(--text-primary) !important;
          box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.25);
        }

        .opt-wrong {
          background: rgba(239, 68, 68, 0.12) !important;
          border-color: #ef4444 !important;
          color: var(--text-primary) !important;
          box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.25);
        }

        .option-letter-badge {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .badge-correct-letter {
          color: #22c55e;
        }

        .badge-wrong-letter {
          color: #ef4444;
        }

        .option-text-content {
          flex: 1;
          line-height: 1.5;
        }

        .opt-tag {
          margin-left: auto;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }

        .correct-tag {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .wrong-tag {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        @media (max-width: 640px) {
          .q-text-preview {
            display: none;
          }
          .answer-badges {
            margin-left: auto;
          }
        }
      `}</style>
    </div>
  );
}

'use client';

import { Question } from '@/lib/types';

interface QuestionViewProps {
  question: Question;
  displayNumber: number;
  totalQuestions: number;
  subjectName?: string;
  selectedOption: string;
  onSelect: (option: string) => void;
}

export default function QuestionView({
  question,
  displayNumber,
  totalQuestions,
  subjectName,
  selectedOption,
  onSelect,
}: QuestionViewProps) {
  // Extract option letter from option text or index (e.g., "A. Paris" → "A")
  const getOptionLetter = (optionText: string, index: number): string => {
    const match = optionText.match(/^[(\s]*([A-Ja-j])[).:\s]/);
    if (match) return match[1].toUpperCase();
    const fallbackLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    return fallbackLetters[index] || String.fromCharCode(65 + index);
  };

  return (
    <div className="question-card">
      {/* Top Question Header Bar */}
      <div className="question-top-bar">
        <div className="question-meta-left">
          <span className="question-pill">
            Question {displayNumber} of {totalQuestions}
          </span>
          {subjectName && (
            <span className="question-subject-name">
              {subjectName}
            </span>
          )}
        </div>
        <div className="question-marks">
          <span>Marks: <strong>+1.00</strong></span>
          <span className="marks-sep">|</span>
          <span>Neg: <strong>-0.25</strong></span>
        </div>
      </div>

      {/* Question Text */}
      <div className="question-body">
        <h2 className="question-text">{question.text}</h2>
      </div>

      {/* Options List */}
      <div className="options-list">
        {question.options.map((option, idx) => {
          const letter = getOptionLetter(option, idx);
          const isSelected = selectedOption === letter;
          const cleanOptionText = option.replace(/^[(\s]*[A-Ja-j][).:\s]+\s*/, '');

          return (
            <div
              key={idx}
              className={`option-row ${isSelected ? 'option-row-selected' : ''}`}
              onClick={() => onSelect(letter)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(letter);
                }
              }}
            >
              {/* Radio Indicator */}
              <div className={`radio-circle ${isSelected ? 'radio-selected' : ''}`}>
                {isSelected && <div className="radio-dot" />}
              </div>

              {/* Option Letter & Text */}
              <span className="option-label">({letter})</span>
              <span className="option-content">{cleanOptionText}</span>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .question-card {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.75rem;
          box-shadow: var(--shadow-sm);
          animation: fadeInUp 0.3s ease;
        }

        .question-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 1.5rem;
        }

        .question-meta-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .question-pill {
          display: inline-flex;
          align-items: center;
          padding: 0.35rem 0.85rem;
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .question-subject-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .question-marks {
          font-size: 0.8rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .question-marks strong {
          color: var(--text-primary);
        }

        .marks-sep {
          opacity: 0.4;
        }

        .question-body {
          margin-bottom: 2rem;
        }

        .question-text {
          font-size: 1.15rem;
          font-weight: 600;
          line-height: 1.65;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .option-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.95rem 1.25rem;
          background: var(--bg-glass);
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          user-select: none;
        }

        .option-row:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-medium);
        }

        .option-row-selected {
          background: rgba(59, 130, 246, 0.08) !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }

        .radio-circle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          border: 2px solid var(--text-muted);
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .radio-selected {
          border-color: #3b82f6;
        }

        .radio-dot {
          width: 0.6rem;
          height: 0.6rem;
          border-radius: 50%;
          background: #3b82f6;
          animation: scaleIn 0.2s ease;
        }

        .option-label {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          flex-shrink: 0;
        }

        .option-content {
          font-size: 0.95rem;
          color: var(--text-primary);
          line-height: 1.5;
          flex: 1;
        }

        @media (max-width: 480px) {
          .question-card {
            padding: 1.15rem 1rem;
          }
          .question-top-bar {
            gap: 0.5rem;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
          }
          .question-text {
            font-size: 1.02rem;
            line-height: 1.55;
          }
          .option-row {
            padding: 0.75rem 0.85rem;
            gap: 0.65rem;
          }
          .option-label {
            font-size: 0.88rem;
          }
          .option-content {
            font-size: 0.88rem;
          }
        }
      `}</style>
    </div>
  );
}

'use client';

import { Question } from '@/lib/types';

interface QuestionViewProps {
  question: Question;
  displayNumber: number;
  selectedOption: string;
  onSelect: (option: string) => void;
}

export default function QuestionView({
  question,
  displayNumber,
  selectedOption,
  onSelect,
}: QuestionViewProps) {
  // Extract option letter from option text (e.g., "A. Paris" → "A")
  const getOptionLetter = (optionText: string): string => {
    const match = optionText.match(/^[(\s]*([A-Ja-j])[).:\s]/);
    return match ? match[1].toUpperCase() : optionText.charAt(0).toUpperCase();
  };

  return (
    <div className="question-view">
      {/* Question Number & Text */}
      <div className="question-header">
        <span className="question-number">Q{displayNumber}</span>
        <h2 className="question-text">{question.text}</h2>
      </div>

      {/* Options */}
      <div className="options-grid">
        {question.options.map((option, idx) => {
          const letter = getOptionLetter(option);
          const isSelected = selectedOption === letter;

          return (
            <button
              key={idx}
              className={`option-btn ${isSelected ? 'option-selected' : ''}`}
              onClick={() => onSelect(letter)}
              type="button"
            >
              <span className={`option-letter ${isSelected ? 'letter-selected' : ''}`}>
                {letter}
              </span>
              <span className="option-text">{option.replace(/^[(\s]*[A-Ja-j][).:\s]+\s*/, '')}</span>
              {isSelected && <span className="check-icon">✓</span>}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .question-view {
          animation: fadeInUp 0.35s ease;
        }

        .question-header {
          margin-bottom: 2rem;
        }

        .question-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          font-size: 1rem;
          font-weight: 800;
          color: var(--accent-light);
          background: var(--accent-glow);
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
        }

        .question-text {
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.6;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .options-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .option-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
          padding: 1rem 1.25rem;
          text-align: left;
          font-family: inherit;
          font-size: 0.95rem;
          color: var(--text-primary);
          background: var(--bg-glass);
          border: 1.5px solid var(--border-subtle);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .option-btn:hover {
          background: var(--bg-glass-strong);
          border-color: var(--border-medium);
          transform: translateX(4px);
        }

        .option-selected {
          background: rgba(139, 92, 246, 0.1);
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .option-selected:hover {
          background: rgba(139, 92, 246, 0.14);
        }

        .option-letter {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 2.2rem;
          height: 2.2rem;
          font-weight: 700;
          font-size: 0.9rem;
          border-radius: var(--radius-sm);
          background: var(--bg-glass-strong);
          color: var(--text-secondary);
          border: 1px solid var(--border-subtle);
          transition: all var(--transition-base);
        }

        .letter-selected {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
        }

        .option-text {
          flex: 1;
          line-height: 1.5;
        }

        .check-icon {
          font-size: 1.1rem;
          color: var(--accent-light);
          animation: scaleIn 0.25s ease;
        }
      `}</style>
    </div>
  );
}

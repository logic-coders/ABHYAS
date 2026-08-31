'use client';

import { ResultItem } from '@/lib/types';
import { useState } from 'react';

interface ResultBreakdownProps {
  breakdown: ResultItem[];
}

interface SolutionLine {
  type: 'step-header' | 'calc' | 'text' | 'conclusion';
  label?: string;
  content: string;
}

function renderFormattedExplanation(rawText: string, isHindi: boolean) {
  if (!rawText) return null;

  // 1. Normalize line separators: replace pipes '|' and clean double spaces
  let text = rawText
    .replace(/\s*\|\s*/g, '\n')
    .replace(/\r\n/g, '\n')
    .trim();

  // 2. Break text by explicit newlines, step markers, and Hindi/English sentence boundaries with calculations
  const rawSegments: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Split inline step headers like "चरण 1: ... चरण 2: ..."
    const stepSplit = trimmed.split(/(?=(?:चरण\s*\d+[:\-]|Step\s*\d+[:\-]|दिया गया है[:\-]|Given[:\-]|सूत्र[:\-]|Formula[:\-]|गणना[:\-]|Calculation[:\-]|निष्कर्ष[:\-]|Conclusion[:\-]|सही उत्तर[:\-]|सही विकल्प[:\-]|Correct Answer[:\-]|Correct Option[:\-]))/gi);

    for (const seg of stepSplit) {
      const segTrimmed = seg.trim();
      if (!segTrimmed) continue;

      // If segment has multiple Hindi full-stops '।' with math formulas inside, split them line by line
      if (segTrimmed.includes('।')) {
        const dandaSplit = segTrimmed.split(/(?<=।)\s+/g);
        for (const sub of dandaSplit) {
          if (sub.trim()) rawSegments.push(sub.trim());
        }
      } else {
        rawSegments.push(segTrimmed);
      }
    }
  }

  // 3. Classify and structure each segment
  const structuredItems: SolutionLine[] = [];

  for (const seg of rawSegments) {
    // Check for Conclusion / Final Answer
    const isConclusion =
      /^(?:सही उत्तर|सही विकल्प|Correct Answer|Correct Option|अतः,\s*सही|अतः\s*सही)/i.test(seg) ||
      (/(?:सही उत्तर|सही विकल्प|Correct Option|Correct Answer)/i.test(seg) && /(?:[a-eA-E]|\d+)/.test(seg));

    if (isConclusion) {
      let cleanContent = seg.replace(/^[-•*▶]\s*/, '').trim();

      if (isHindi) {
        // Strip leading "अतः," or "अतः"
        cleanContent = cleanContent.replace(/^अतः[,\s]*/i, '').trim();
        // Replace "सही उत्तर:" with "सही विकल्प"
        cleanContent = cleanContent.replace(/^सही उत्तर[:\-\s]*/i, 'सही विकल्प ').trim();

        // Standardize format to "सही विकल्प (a) है।" if matching option pattern
        const optMatch = cleanContent.match(/सही विकल्प\s*[:\-]?\s*\(?([a-eA-E])\)?(?:\.?\s*(.*))?/i);
        if (optMatch) {
          const letter = optMatch[1].toLowerCase();
          const rest = optMatch[2]?.replace(/^[.\s:]+/, '').trim();
          cleanContent = rest && !rest.startsWith('है')
            ? `सही विकल्प (${letter}) ${rest} है।`
            : `सही विकल्प (${letter}) है।`;
        }
      } else {
        // English normalization
        cleanContent = cleanContent.replace(/^(?:Hence|Therefore)[,\s]*/i, '').trim();
        const optMatch = cleanContent.match(/(?:Correct option|Correct answer)\s*[:\-]?\s*\(?([a-eA-E])\)?/i);
        if (optMatch) {
          cleanContent = `Correct option is (${optMatch[1].toUpperCase()}).`;
        }
      }

      structuredItems.push({
        type: 'conclusion',
        content: cleanContent,
      });
      continue;
    }

    // Check for Step Headers (e.g. "चरण 1:", "Step 1:", "सूत्र:")
    const stepMatch = seg.match(/^((?:चरण\s*\d+|Step\s*\d+|दिया गया है|Given|सूत्र|Formula|गणना|Calculation|निष्कर्ष|Conclusion)[:\-])\s*(.*)/i);
    if (stepMatch) {
      const label = stepMatch[1].trim();
      const body = stepMatch[2]?.trim() || '';

      structuredItems.push({
        type: 'step-header',
        label,
        content: body,
      });
      continue;
    }

    // Clean up leading indicator or punctuation
    let cleanedSeg = seg.replace(/^[-•*▶]\s*/, '').replace(/।$/, '').trim();

    // Check if segment has introductory text followed by a colon and a formula/bracketed calculation
    // e.g. "गलत वजन का उपयोग करने पर बेईमान डीलर के लिए लाभ प्रतिशत किसके द्वारा दिया जाता है: [(वास्तविक वजन - गलत वजन) ...]"
    const colonFormulaMatch = cleanedSeg.match(/^([^:=><\d]{5,})[:=]\s*([\[\(].*[=><\+\-\*\/].*)/);
    if (colonFormulaMatch) {
      structuredItems.push({
        type: 'text',
        content: colonFormulaMatch[1].trim() + ':',
      });
      cleanedSeg = colonFormulaMatch[2].trim();
    }

    // Check if line has a leading introductory word (e.g. "इसलिए, a * sqrt(3) = 6 * sqrt(3)")
    const leadingIntroMatch = cleanedSeg.match(/^(इसलिए|चूँकि|अर्थात|अतः|Therefore|Hence|Since)[,:]?\s+(.+)/i);
    if (leadingIntroMatch && /[=≠≈><≤≥]/.test(leadingIntroMatch[2])) {
      structuredItems.push({
        type: 'text',
        content: leadingIntroMatch[1] + ':',
      });
      cleanedSeg = leadingIntroMatch[2].trim();
    }

    // If calculation has chained "=" (e.g. "[(1000 - 900) / 900] * 100 = (100 / 900) * 100 = 100/9% = 11.11%")
    if (cleanedSeg.includes('=')) {
      const parts = cleanedSeg.split(/\s*=\s*/);
      if (parts.length > 2) {
        // Chained equation! Break into line by line calculations
        structuredItems.push({
          type: 'calc',
          content: `${parts[0]} = ${parts[1]}`,
        });
        for (let p = 2; p < parts.length; p++) {
          structuredItems.push({
            type: 'calc',
            content: `= ${parts[p]}`,
          });
        }
        continue;
      }
    }

    // Check if line is a mathematical equation/calculation
    const hasMathEqual = /[=≠≈><≤≥]/.test(cleanedSeg);
    const hasMathSymbols = /[\+\-\*\/\^×÷√²³%]/.test(cleanedSeg) || /\d+/.test(cleanedSeg);
    const isMathLine = hasMathEqual && (hasMathSymbols || /^(?:प्रत्येक भुजा|क्षेत्रफल|परिमाप|विकर्ण|d\d|HCF|LCM|Area|Perimeter|TSA|CSA)/i.test(cleanedSeg));

    if (isMathLine) {
      structuredItems.push({
        type: 'calc',
        content: cleanedSeg,
      });
    } else {
      structuredItems.push({
        type: 'text',
        content: cleanedSeg,
      });
    }
  }

  const conclusionBadgeLabel = isHindi ? '✓ सही उत्तर' : '✓ Correct Answer';

  return (
    <div className="line-by-line-solution">
      {structuredItems.map((item, idx) => {
        if (item.type === 'step-header') {
          return (
            <div key={idx} className="solution-step-block">
              <div className="step-header-row">
                <strong className="step-bold-title">{item.label}</strong>
              </div>
              {item.content && (
                <div className="step-body-line">
                  {item.content}
                </div>
              )}
            </div>
          );
        }

        if (item.type === 'calc') {
          return (
            <div key={idx} className="math-calc-line">
              <span className="calc-indicator">▶</span>
              <span className="calc-expression">{item.content}</span>
            </div>
          );
        }

        if (item.type === 'conclusion') {
          return (
            <div key={idx} className="solution-conclusion-card">
              <span className="conclusion-check">✓</span>
              <strong className="conclusion-text">{item.content}</strong>
            </div>
          );
        }

        return (
          <div key={idx} className="solution-text-line">
            {item.content}
          </div>
        );
      })}
    </div>
  );
}

export default function ResultBreakdown({ breakdown }: ResultBreakdownProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const getOptionLetter = (optionText: string, index: number): string => {
    if (!optionText) return String.fromCharCode(65 + index);
    const match = optionText.match(/^[(\s]*([A-Ja-j1-5क-ङअ-द])[).:\s]/);
    if (match) {
      const char = match[1].toLowerCase();
      if (char === 'a' || char === '1' || char === 'क' || char === 'अ') return 'A';
      if (char === 'b' || char === '2' || char === 'ख' || char === 'ब') return 'B';
      if (char === 'c' || char === '3' || char === 'ग' || char === 'स') return 'C';
      if (char === 'd' || char === '4' || char === 'घ' || char === 'द') return 'D';
      if (char === 'e' || char === '5' || char === 'ङ' || char === 'इ') return 'E';
      return char.toUpperCase();
    }
    const fallbackLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    return fallbackLetters[index] || String.fromCharCode(65 + index);
  };

  return (
    <div className="breakdown-list">
      {breakdown.map((item, idx) => {
        const isExpanded = expandedIndex === idx;
        const wasUnanswered = item.userAnswer === '—' || !item.userAnswer;
        const formattedCorrectAns = item.correctAnswer ? item.correctAnswer.trim().toUpperCase() : '?';
        const formattedUserAns = item.userAnswer && item.userAnswer !== '—' ? item.userAnswer.trim().toUpperCase() : '';
        const isHindi = item.questionText && /[\u0900-\u097F]/.test(item.questionText);

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
              <span className="q-label">Q{item.questionNumber || idx + 1}</span>
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
                    {isHindi ? 'आपका: ' : 'You: '}{formattedUserAns}
                  </span>
                )}
                <span className="answer-badge badge-answer">
                  {isHindi ? 'उत्तर: ' : 'Ans: '}{formattedCorrectAns}
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
                    const isUserChoice = Boolean(formattedUserAns && (optLetter === formattedUserAns || opt.trim().toLowerCase() === formattedUserAns.toLowerCase()));
                    const isCorrectChoice = Boolean(formattedCorrectAns && formattedCorrectAns !== '?' && (optLetter === formattedCorrectAns || opt.trim().toLowerCase() === formattedCorrectAns.toLowerCase()));
                    const cleanOptionText = opt.replace(/^\s*(?:\([a-eA-E1-5क-ङअ-द]\)|[a-eA-E1-5क-ङअ-द][\.\)\:\-]\s*)\s*/, '').trim() || opt;

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
                        {isCorrectChoice && <span className="opt-tag correct-tag">{isHindi ? '✓ सही उत्तर' : '✓ Correct Answer'}</span>}
                        {isUserChoice && !item.isCorrect && (
                          <span className="opt-tag wrong-tag">{isHindi ? '✗ आपका उत्तर' : '✗ Your Choice'}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {item.explanation && item.explanation !== 'No explanation provided.' && (
                  <div className="detail-explanation-card">
                    <div className="explanation-header">
                      <span className="explanation-icon">💡</span>
                      <span className="explanation-title">{isHindi ? 'विस्तृत चरणबद्ध समाधान' : 'Detailed Step-by-Step Solution'}</span>
                    </div>
                    <div className="explanation-body">
                      {renderFormattedExplanation(item.explanation, !!isHindi)}
                    </div>
                  </div>
                )}
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
          border-left: 4px solid #22c55e;
        }
        .item-incorrect {
          border-left: 4px solid #ef4444;
        }
        .item-unanswered {
          border-left: 4px solid var(--text-muted);
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
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        .badge-incorrect {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .badge-answer {
          background: rgba(139, 92, 246, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(139, 92, 246, 0.3);
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
          padding: 1.15rem 1.25rem;
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
          gap: 0.6rem;
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

        .detail-option.opt-correct {
          background: rgba(34, 197, 94, 0.14) !important;
          border: 2px solid #22c55e !important;
          color: #fff !important;
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.25) !important;
        }

        .detail-option.opt-wrong {
          background: rgba(239, 68, 68, 0.14) !important;
          border: 2px solid #ef4444 !important;
          color: #fff !important;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.25) !important;
        }

        .option-letter-badge {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .badge-correct-letter {
          color: #22c55e !important;
          font-weight: 900;
        }

        .badge-wrong-letter {
          color: #ef4444 !important;
          font-weight: 900;
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
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.4);
        }

        .wrong-tag {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
        }

        /* ── Structured Step-by-Step Solution Card ── */
        .detail-explanation-card {
          margin-top: 1.25rem;
          padding: 1.2rem 1.35rem;
          background: rgba(16, 185, 129, 0.04);
          border: 1.5px solid rgba(16, 185, 129, 0.25);
          border-left: 4px solid #10b981;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          animation: fadeIn 0.25s ease-out;
        }

        .explanation-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(16, 185, 129, 0.15);
        }

        .explanation-icon {
          font-size: 1.1rem;
        }

        .explanation-title {
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: #10b981;
        }

        .line-by-line-solution {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .solution-step-block {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-top: 0.4rem;
          margin-bottom: 0.2rem;
        }

        .step-header-row {
          display: flex;
          align-items: center;
        }

        .step-bold-title {
          font-size: 0.96rem;
          font-weight: 800;
          color: #38bdf8;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          border-bottom: 2px solid rgba(56, 189, 248, 0.4);
          padding-bottom: 0.15rem;
        }

        .step-body-line {
          font-size: 0.93rem;
          line-height: 1.6;
          color: var(--text-primary);
          padding-left: 0.25rem;
        }

        /* ── Mathematical Calculation Row ── */
        .math-calc-line {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.65rem 0.95rem;
          background: rgba(30, 41, 59, 0.45);
          border: 1.5px solid rgba(56, 189, 248, 0.22);
          border-left: 4px solid #38bdf8;
          border-radius: var(--radius-sm);
          font-family: 'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace;
          font-size: 0.92rem;
          color: #e2e8f0;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }

        .math-calc-line:hover {
          border-color: rgba(56, 189, 248, 0.45);
          background: rgba(30, 41, 59, 0.65);
        }

        .calc-indicator {
          color: #38bdf8;
          font-size: 0.75rem;
          margin-top: 0.2rem;
          flex-shrink: 0;
        }

        .calc-expression {
          flex: 1;
          word-break: break-word;
          line-height: 1.5;
          letter-spacing: 0.01em;
        }

        .solution-text-line {
          font-size: 0.93rem;
          line-height: 1.65;
          color: var(--text-primary);
          padding: 0.2rem 0.3rem;
        }

        /* ── Final Answer Conclusion Card ── */
        .solution-conclusion-card {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-top: 0.6rem;
          padding: 0.75rem 1rem;
          background: rgba(34, 197, 94, 0.12);
          border: 1.5px solid rgba(34, 197, 94, 0.4);
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.96rem;
          color: #22c55e;
          animation: fadeIn 0.2s ease;
        }

        .conclusion-check {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          background: #22c55e;
          color: #000;
          font-size: 0.85rem;
          font-weight: 900;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .conclusion-text {
          color: var(--text-primary);
          font-weight: 800;
          font-size: 0.98rem;
          letter-spacing: 0.01em;
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

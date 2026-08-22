'use client';

export default function ProductShowcase() {
  return (
    <section className="showcase-section">
      <div className="showcase-header">
        <span className="showcase-tag">Live Interface Preview</span>
        <h2 className="showcase-title">Experience the Real Test Environment</h2>
        <p className="showcase-desc">
          Designed for maximum focus. Authentic CBT test arena with digital timer countdown, 5-state question palette, and instant scoreboard analytics.
        </p>
      </div>

      <div className="showcase-frame">
        {/* Browser Mockup Top Bar */}
        <div className="browser-header">
          <div className="browser-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <div className="browser-url">abhyas.app/exam/music-test-1</div>
        </div>

        {/* Live Exam Mode Interface */}
        <div className="preview-exam-wrapper">
          {/* Top Exam Navigation Bar */}
          <div className="preview-top-nav">
            <div className="preview-branding">
              <span className="preview-subject-badge">MUSIC</span>
              <div className="preview-titles">
                <span className="preview-main-title">Music Test - 1</span>
                <span className="preview-sub-title">80 Questions • Standard Marking (+1.00, -0.25)</span>
              </div>
            </div>
            <div className="preview-controls">
              <span className="preview-cbt-badge">
                <span className="cbt-dot" /> CBT Exam Mode
              </span>
              <span className="preview-lang-badge">English</span>
              <span className="preview-theme-icon">🌙</span>
            </div>
          </div>

          {/* Exam Arena Layout */}
          <div className="preview-arena">
            {/* Left Question Area */}
            <div className="preview-question-area">
              <div className="preview-q-card">
                {/* Question Info Header */}
                <div className="q-card-header">
                  <div className="q-badge-pill">Question 1 of 80</div>
                  <span className="q-subject-name">Music</span>
                  <div className="q-marks-pill">
                    Marks: <strong className="pos-marks">+1.00</strong> | Neg: <strong className="neg-marks">-0.25</strong>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="q-question-text">
                  In the word &lsquo;Naad&rsquo; the meaning of the letter &lsquo;Na&rsquo; is :-
                </h3>

                {/* Options List */}
                <div className="q-options-list">
                  <div className="q-option-item selected">
                    <div className="q-radio-circle checked">
                      <span className="q-radio-dot" />
                    </div>
                    <span className="q-opt-label">(A)</span>
                    <span className="q-opt-text">Prana Vayu</span>
                  </div>

                  <div className="q-option-item">
                    <div className="q-radio-circle" />
                    <span className="q-opt-label">(B)</span>
                    <span className="q-opt-text">Agni Shakti</span>
                  </div>

                  <div className="q-option-item">
                    <div className="q-radio-circle" />
                    <span className="q-opt-label">(C)</span>
                    <span className="q-opt-text">Omkar</span>
                  </div>

                  <div className="q-option-item">
                    <div className="q-radio-circle" />
                    <span className="q-opt-label">(D)</span>
                    <span className="q-opt-text">More than one of the above</span>
                  </div>

                  <div className="q-option-item">
                    <div className="q-radio-circle" />
                    <span className="q-opt-label">(E)</span>
                    <span className="q-opt-text">None of the above</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="preview-bottom-bar">
                <div className="bar-left">
                  <button className="preview-btn btn-review" type="button">Mark for Review & Next</button>
                  <button className="preview-btn btn-clear" type="button">Clear Response</button>
                </div>
                <div className="bar-right">
                  <button className="preview-btn btn-prev" disabled type="button">← Previous</button>
                  <button className="preview-btn btn-next" type="button">Save & Next →</button>
                </div>
              </div>
            </div>

            {/* Right Question Palette & Timer Panel */}
            <div className="preview-side-panel">
              {/* Timer Card */}
              <div className="preview-timer-card">
                <span className="timer-label">TIME REMAINING</span>
                <span className="timer-clock">01:19:54</span>
              </div>

              {/* 5-State Legend Badges */}
              <div className="preview-legend-grid">
                <div className="legend-badge-item badge-green">
                  <span className="l-count">1</span>
                  <span className="l-text">Answered</span>
                </div>
                <div className="legend-badge-item badge-red">
                  <span className="l-count">0</span>
                  <span className="l-text">Not Answered</span>
                </div>
                <div className="legend-badge-item badge-gray">
                  <span className="l-count">78</span>
                  <span className="l-text">Not Visited</span>
                </div>
                <div className="legend-badge-item badge-purple">
                  <span className="l-count">1</span>
                  <span className="l-text">Marked for Review</span>
                </div>
                <div className="legend-badge-item badge-ans-purple">
                  <span className="l-count">0</span>
                  <span className="l-text">Ans & Marked</span>
                </div>
              </div>

              {/* Palette Header & Grid */}
              <div className="preview-palette-header">
                <span className="palette-title">Question Palette</span>
                <span className="palette-count">All 80 Questions</span>
              </div>

              <div className="preview-bubble-grid">
                <span className="b-bubble b-active">1</span>
                <span className="b-bubble b-answered">2</span>
                <span className="b-bubble b-marked">3</span>
                <span className="b-bubble">4</span>
                <span className="b-bubble">5</span>
                <span className="b-bubble">6</span>
                <span className="b-bubble">7</span>
                <span className="b-bubble">8</span>
                <span className="b-bubble">9</span>
                <span className="b-bubble">10</span>
                <span className="b-bubble">11</span>
                <span className="b-bubble">12</span>
                <span className="b-bubble">13</span>
                <span className="b-bubble">14</span>
                <span className="b-bubble">15</span>
                <span className="b-bubble">16</span>
                <span className="b-bubble">17</span>
                <span className="b-bubble">18</span>
                <span className="b-bubble">19</span>
                <span className="b-bubble">20</span>
              </div>

              {/* Finish & View Scoreboard Button */}
              <button className="preview-finish-btn" type="button">
                Finish & View Scoreboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .showcase-section {
          margin: 3.5rem 0;
        }

        .showcase-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .showcase-tag {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent);
          background: var(--accent-glow);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .showcase-title {
          font-size: 1.9rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .showcase-desc {
          font-size: 0.95rem;
          color: var(--text-muted);
          max-width: 650px;
          margin: 0 auto;
        }

        .showcase-frame {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .browser-header {
          display: flex;
          align-items: center;
          background: var(--bg-glass-strong);
          padding: 0.65rem 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          gap: 1rem;
        }

        .browser-dots {
          display: flex;
          gap: 0.4rem;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .dot-red { background: #ef4444; }
        .dot-yellow { background: #f59e0b; }
        .dot-green { background: #10b981; }

        .browser-url {
          font-size: 0.78rem;
          color: var(--text-muted);
          background: var(--bg-primary);
          padding: 0.25rem 1rem;
          border-radius: var(--radius-sm);
          flex: 1;
          max-width: 320px;
          font-family: monospace;
        }

        /* ── Preview Exam Wrapper ── */
        .preview-exam-wrapper {
          padding: 1.5rem;
          background: var(--bg-primary);
        }

        .preview-top-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .preview-branding {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .preview-subject-badge {
          background: #2563eb;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-sm);
          letter-spacing: 0.04em;
        }

        .preview-titles {
          display: flex;
          flex-direction: column;
        }

        .preview-main-title {
          font-weight: 800;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .preview-sub-title {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .preview-controls {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .preview-cbt-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          background: var(--bg-glass-strong);
          border: 1px solid var(--border-medium);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          color: var(--text-primary);
        }

        .cbt-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
        }

        .preview-lang-badge {
          font-size: 0.75rem;
          background: var(--bg-glass-strong);
          border: 1px solid var(--border-subtle);
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          font-weight: 600;
        }

        .preview-theme-icon {
          font-size: 0.85rem;
          padding: 0.25rem 0.5rem;
          background: var(--bg-glass);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        /* ── Arena Layout ── */
        .preview-arena {
          display: grid;
          grid-template-columns: 1fr 260px;
          gap: 1.25rem;
          align-items: start;
        }

        /* ── Left Question Area ── */
        .preview-question-area {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .preview-q-card {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }

        .q-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .q-badge-pill {
          background: rgba(37, 99, 235, 0.12);
          color: #3b82f6;
          border: 1px solid rgba(37, 99, 235, 0.25);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.25rem 0.7rem;
          border-radius: var(--radius-full);
        }

        .q-subject-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .q-marks-pill {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .pos-marks { color: #22c55e; }
        .neg-marks { color: #ef4444; }

        .q-question-text {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }

        .q-options-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .q-option-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--bg-glass);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          color: var(--text-secondary);
          transition: all 0.15s ease;
        }

        .q-option-item.selected {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.08);
          color: var(--text-primary);
          font-weight: 600;
        }

        .q-radio-circle {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid var(--border-medium);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .q-radio-circle.checked {
          border-color: #2563eb;
        }

        .q-radio-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2563eb;
        }

        .q-opt-label {
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .selected .q-opt-label {
          color: #2563eb;
        }

        .preview-bottom-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding-top: 0.25rem;
        }

        .bar-left, .bar-right {
          display: flex;
          gap: 0.5rem;
        }

        .preview-btn {
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-sm);
          border: none;
          cursor: pointer;
        }

        .btn-review {
          background: #7c3aed;
          color: #ffffff;
        }

        .btn-clear {
          background: var(--bg-glass-strong);
          color: var(--text-secondary);
          border: 1px solid var(--border-medium);
        }

        .btn-prev {
          background: var(--bg-glass-strong);
          color: var(--text-muted);
          border: 1px solid var(--border-subtle);
          opacity: 0.6;
        }

        .btn-next {
          background: #2563eb;
          color: #ffffff;
        }

        /* ── Right Side Panel ── */
        .preview-side-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          box-shadow: var(--shadow-sm);
        }

        .preview-timer-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: var(--radius-md);
          padding: 0.65rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .timer-label {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #64748b;
        }

        .timer-clock {
          font-family: monospace;
          font-size: 1.3rem;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: 0.06em;
        }

        .preview-legend-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.4rem;
        }

        .legend-badge-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.68rem;
          font-weight: 700;
        }

        .badge-green { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
        .badge-red { background: rgba(239, 68, 68, 0.12); color: #dc2626; }
        .badge-gray { background: var(--bg-glass-strong); color: var(--text-muted); }
        .badge-purple { background: rgba(168, 85, 247, 0.12); color: #9333ea; }
        .badge-ans-purple {
          grid-column: span 2;
          background: rgba(168, 85, 247, 0.12);
          color: #9333ea;
        }

        .l-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          border-radius: 3px;
          background: currentColor;
          color: #fff;
          font-size: 0.62rem;
        }

        .preview-palette-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-primary);
          padding: 0 2px;
        }

        .palette-count {
          color: #2563eb;
          font-size: 0.7rem;
        }

        .preview-bubble-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.35rem;
          padding: 2px;
        }

        .b-bubble {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
          background: var(--nav-bubble-default-bg);
          color: var(--nav-bubble-default-text);
          border: 1px solid var(--nav-bubble-default-border);
        }

        .b-bubble.b-active {
          border: 2px solid #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.3);
          font-weight: 800;
          color: #2563eb;
        }

        .b-bubble.b-answered {
          background: #22c55e;
          color: #ffffff;
          border-color: #16a34a;
        }

        .b-bubble.b-marked {
          background: #a855f7;
          color: #ffffff;
          border-color: #9333ea;
        }

        .preview-finish-btn {
          background: #16a34a;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 0.65rem;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(22, 163, 74, 0.25);
          text-align: center;
        }

        @media (max-width: 900px) {
          .preview-arena {
            grid-template-columns: 1fr;
          }
          .preview-side-panel {
            display: none;
          }
          .preview-sub-title, .preview-cbt-badge {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}

'use client';

export default function ProductShowcase() {
  return (
    <section className="showcase-section">
      <div className="showcase-header">
        <span className="showcase-tag">Live Interface Preview</span>
        <h2 className="showcase-title">Experience the Real Test Environment</h2>
        <p className="showcase-desc">
          Designed for maximum focus. Take tests with real-time countdown timers, interactive question navigators, and multi-language support.
        </p>
      </div>

      <div className="showcase-frame">
        <div className="browser-header">
          <div className="browser-dots">
            <span className="dot dot-red"></span>
            <span className="dot dot-yellow"></span>
            <span className="dot dot-green"></span>
          </div>
          <div className="browser-url">abhyas.app/exam/music-theory-serial-1</div>
        </div>

        <div className="preview-content">
          <div className="preview-exam-header">
            <div className="exam-info">
              <span className="preview-title">Music Practice Test 1</span>
              <span className="preview-badge">Music</span>
              <span className="preview-lang">English</span>
            </div>
            <div className="preview-timer">
              ⏱️ 01:19:45
            </div>
          </div>

          <div className="preview-body">
            <div className="preview-main">
              <div className="preview-q-number">Q1</div>
              <h3 className="preview-question">What is the standard pitch frequency for musical note A4 (Concert Pitch)?</h3>

              <div className="preview-options">
                <div className="preview-option">
                  <span className="opt-letter">(A)</span> 432 Hz
                </div>
                <div className="preview-option selected">
                  <span className="opt-letter selected-letter">(B)</span> 440 Hz <span className="check">✓</span>
                </div>
                <div className="preview-option">
                  <span className="opt-letter">(C)</span> 444 Hz
                </div>
                <div className="preview-option">
                  <span className="opt-letter">(D)</span> 452 Hz
                </div>
              </div>
            </div>

            <div className="preview-nav">
              <div className="nav-title">Question Navigator</div>
              <div className="nav-grid-mini">
                <span className="mini-bubble current">1</span>
                <span className="mini-bubble answered">2</span>
                <span className="mini-bubble answered">3</span>
                <span className="mini-bubble default">4</span>
                <span className="mini-bubble marked">5</span>
                <span className="mini-bubble default">6</span>
                <span className="mini-bubble default">7</span>
                <span className="mini-bubble default">8</span>
              </div>
              <div className="nav-status-summary">
                <span className="status-item"><span className="dot green"></span> 2 Answered</span>
                <span className="status-item"><span className="dot purple"></span> 1 Marked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .showcase-section {
          margin: 3rem 0;
        }

        .showcase-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .showcase-tag {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent-light);
          background: var(--accent-glow);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .showcase-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }

        .showcase-desc {
          font-size: 0.95rem;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto;
        }

        .showcase-frame {
          background: #0f0f15;
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }

        .browser-header {
          display: flex;
          align-items: center;
          background: #181820;
          padding: 0.6rem 1rem;
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
          color: #9898a8;
          background: #0a0a0f;
          padding: 0.2rem 1rem;
          border-radius: var(--radius-sm);
          flex: 1;
          max-width: 320px;
        }

        .preview-content {
          padding: 1.5rem;
        }

        .preview-exam-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 1rem;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .exam-info {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .preview-title {
          font-weight: 700;
          font-size: 1.05rem;
          color: #ffffff;
        }

        .preview-badge {
          font-size: 0.7rem;
          background: var(--accent-glow);
          color: var(--accent-light);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
          font-weight: 700;
        }

        .preview-lang {
          font-size: 0.7rem;
          background: rgba(255, 255, 255, 0.08);
          color: #9898a8;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
        }

        .preview-timer {
          background: #1e1b4b;
          border: 1px solid #6366f1;
          color: #ffffff;
          padding: 0.35rem 0.85rem;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.9rem;
        }

        .preview-body {
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 1.5rem;
        }

        .preview-q-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.2rem;
          height: 2.2rem;
          background: var(--accent-glow);
          color: var(--accent-light);
          font-weight: 800;
          border-radius: var(--radius-sm);
          margin-bottom: 0.75rem;
        }

        .preview-question {
          font-size: 1.05rem;
          color: #ffffff;
          margin-bottom: 1.25rem;
          font-weight: 600;
          line-height: 1.5;
        }

        .preview-options {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .preview-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          color: #d1d5db;
        }

        .preview-option.selected {
          background: rgba(139, 92, 246, 0.12);
          border-color: var(--accent);
          color: #ffffff;
        }

        .opt-letter {
          font-weight: 700;
          font-size: 0.8rem;
          color: #9898a8;
        }

        .selected-letter {
          color: var(--accent-light);
        }

        .check {
          margin-left: auto;
          color: var(--accent-light);
          font-weight: 800;
        }

        .preview-nav {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 1rem;
        }

        .nav-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 0.75rem;
        }

        .nav-grid-mini {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.4rem;
          margin-bottom: 1rem;
        }

        .mini-bubble {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 30px;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .mini-bubble.current {
          background: rgba(99, 102, 241, 0.3);
          border: 1px solid #6366f1;
          color: #a5b4fc;
        }

        .mini-bubble.answered {
          background: rgba(34, 197, 94, 0.25);
          color: #4ade80;
          border: 1px solid #22c55e;
        }

        .mini-bubble.marked {
          background: rgba(168, 85, 247, 0.25);
          color: #c084fc;
          border: 1px solid #a855f7;
        }

        .mini-bubble.default {
          background: rgba(255, 255, 255, 0.05);
          color: #9898a8;
        }

        .nav-status-summary {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-size: 0.72rem;
          color: #9898a8;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .dot.green { background: #22c55e; width: 6px; height: 6px; }
        .dot.purple { background: #a855f7; width: 6px; height: 6px; }

        @media (max-width: 768px) {
          .preview-body {
            grid-template-columns: 1fr;
          }
          .preview-nav {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}

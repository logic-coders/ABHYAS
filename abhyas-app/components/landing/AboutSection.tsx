'use client';

export default function AboutSection() {
  return (
    <section className="about-section">
      <div className="glass-card about-card">
        <div className="about-badge">About Abhyas</div>
        <h2 className="about-title">Empowering Associates to Achieve Exam Excellence</h2>
        <p className="about-text">
          <strong>Abhyas</strong> is a modern test & exam practice platform designed to help associates and candidates master their certification and assessment goals. Practice with authentic test papers across multiple subjects, experience real-time timed exam simulations, and receive instant score reports with detailed answer breakdowns.
        </p>
        
        <div className="about-highlights">
          <div className="highlight-item">
            <span className="highlight-icon">⏱️</span>
            <div>
              <strong>Timed Exam Mode</strong>
              <p>Practice under realistic exam time constraints</p>
            </div>
          </div>
          <div className="highlight-item">
            <span className="highlight-icon">📊</span>
            <div>
              <strong>Instant Analytics</strong>
              <p>Get immediate score breakdowns & answer keys</p>
            </div>
          </div>
          <div className="highlight-item">
            <span className="highlight-icon">🎯</span>
            <div>
              <strong>Goal Oriented</strong>
              <p>Tailored for skill validation & certification success</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .about-section {
          margin: 2.5rem 0;
        }

        .about-card {
          padding: 2.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
        }

        .about-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent);
          background: var(--accent-glow);
          border-radius: var(--radius-full);
          margin-bottom: 1rem;
        }

        .about-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .about-text {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 900px;
        }

        .about-highlights {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          border-top: 1px solid var(--border-subtle);
          padding-top: 1.5rem;
        }

        .highlight-item {
          display: flex;
          align-items: flex-start;
          gap: 0.85rem;
        }

        .highlight-icon {
          font-size: 1.5rem;
          line-height: 1;
        }

        .highlight-item strong {
          display: block;
          color: var(--text-primary);
          font-size: 0.95rem;
          margin-bottom: 0.15rem;
        }

        .highlight-item p {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .about-card {
            padding: 1.5rem;
          }
          .about-title {
            font-size: 1.35rem;
          }
        }
      `}</style>
    </section>
  );
}

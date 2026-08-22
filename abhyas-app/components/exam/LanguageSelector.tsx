'use client';

import { Language } from '@/lib/types';

interface LanguageSelectorProps {
  onSelect: (language: Language) => void;
}

export default function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  return (
    <div className="lang-overlay">
      <div className="lang-modal">
        <div className="lang-header">
          <div className="lang-icon">🌐</div>
          <h2 className="lang-title">Choose Test Mode</h2>
          <p className="lang-subtitle">
            Select the language for your exam questions
          </p>
        </div>

        <div className="lang-options">
          <button
            className="lang-btn lang-btn-en"
            onClick={() => onSelect('en')}
            type="button"
          >
            <span className="lang-name">English</span>
            <span className="lang-native">English</span>
          </button>

          <button
            className="lang-btn lang-btn-hi"
            onClick={() => onSelect('hi')}
            type="button"
          >
            <span className="lang-name">Hindi</span>
            <span className="lang-native">हिंदी</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .lang-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(12px);
          animation: fadeIn 0.3s ease;
        }

        .lang-modal {
          background: var(--bg-secondary);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          max-width: 480px;
          width: 90%;
          text-align: center;
          animation: scaleIn 0.35s ease;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
        }

        .lang-header {
          margin-bottom: 2rem;
        }

        .lang-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .lang-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }

        .lang-subtitle {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .lang-options {
          display: flex;
          gap: 1rem;
        }

        .lang-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
          padding: 1.5rem 1rem;
          background: var(--bg-glass);
          border: 2px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          cursor: pointer;
          font-family: inherit;
          transition: all 0.25s ease;
        }

        .lang-btn:hover {
          background: var(--bg-glass-strong);
          border-color: var(--accent);
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
        }

        .lang-btn:active {
          transform: translateY(-2px);
        }

        .lang-flag {
          font-size: 2.2rem;
        }

        .lang-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .lang-native {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        @media (max-width: 480px) {
          .lang-modal {
            padding: 1.5rem;
          }

          .lang-options {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

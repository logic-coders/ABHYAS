'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TestSeries, Subject } from '@/lib/types';
import SubjectFilter from '@/components/SubjectFilter';
import TestSeriesCard from '@/components/TestSeriesCard';

export default function PrevYearPage() {
  const router = useRouter();
  const [series, setSeries] = useState<TestSeries[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      const res = await fetch('/api/test-series');
      if (!res.ok) throw new Error('Failed to fetch');
      const data: TestSeries[] = await res.json();
      // On Prev Year page, populate long-form tests (150 Qs / 2.5h, not random practice or quiz)
      const prevYearOnly = data.filter((s) => !s.isQuiz && s.format !== 'quiz' && !s.isRandom);
      setSeries(prevYearOnly);
    } catch (err) {
      console.error(err);
      setError('Failed to load previous year tests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered =
    selectedSubject === 'All'
      ? series
      : series.filter((s) => s.subject === selectedSubject);

  return (
    <div className="container">
      {/* Dashboard Header */}
      <section className="dashboard-header">
        <div className="header-badge">📜 AUTHENTIC PAPERS</div>
        <h1 className="header-title">Previous Year Exam Papers</h1>
        <p className="header-desc">
          Official full-length examination papers formatted with 150 questions and a 2.5-hour (150 mins) simulation timer.
        </p>

        {/* Feature highlight bar */}
        <div className="features-bar">
          <div className="feature-item">
            <span className="feature-icon">📋</span>
            <span className="feature-text">150 Questions</span>
          </div>
          <div className="feature-dot" />
          <div className="feature-item">
            <span className="feature-icon">⏱️</span>
            <span className="feature-text">150 Minutes (2.5 Hours)</span>
          </div>
          <div className="feature-dot" />
          <div className="feature-item">
            <span className="feature-icon">🌐</span>
            <span className="feature-text">Bilingual (English & Hindi)</span>
          </div>
          <div className="feature-dot" />
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <span className="feature-text">CBT Fullscreen Mode</span>
          </div>
        </div>
      </section>

      {/* Subject Filter */}
      <SubjectFilter selected={selectedSubject} onChange={setSelectedSubject} />

      {/* Content Grid */}
      {isLoading ? (
        <div className="card-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ height: '220px' }} />
          ))}
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <p className="empty-state-text">{error}</p>
          <button className="btn btn-primary" onClick={fetchSeries}>
            Try Again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-text">
            {selectedSubject === 'All'
              ? 'No previous year tests available yet'
              : `No previous year tests for ${selectedSubject}`}
          </p>
          <p className="empty-state-hint">
            Ask your admin to upload full-length previous year papers from the Admin panel.
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map((s, idx) => (
            <TestSeriesCard key={s.id} series={s} index={idx} />
          ))}
        </div>
      )}

      {/* Bottom spacer */}
      <div style={{ height: '4rem' }} />

      <style jsx>{`
        .dashboard-header {
          margin-top: 3rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .header-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--accent);
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.75rem;
        }

        .header-title {
          font-size: 2.1rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.6rem;
          letter-spacing: -0.02em;
        }

        .header-desc {
          font-size: 1rem;
          color: var(--text-muted);
          max-width: 650px;
          margin: 0 auto 1.5rem auto;
          line-height: 1.5;
        }

        .features-bar {
          display: inline-flex;
          align-items: center;
          gap: 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-full);
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-sm);
          flex-wrap: wrap;
          justify-content: center;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .feature-dot {
          width: 4px;
          height: 4px;
          background: var(--border-medium);
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .header-title {
            font-size: 1.65rem;
          }
          .features-bar {
            border-radius: var(--radius-md);
            gap: 0.75rem;
            padding: 0.75rem 1rem;
          }
          .feature-dot {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

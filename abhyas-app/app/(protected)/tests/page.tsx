'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TestSeries, Subject, PRACTICE_SUBJECTS } from '@/lib/types';
import SubjectFilter from '@/components/exam/SubjectFilter';
import TestSeriesCard from '@/components/exam/TestSeriesCard';

export default function TestsPage() {
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
      // On Practice page, populate randomly generated practice tests (or isRandom tests)
      const practiceOnly = data.filter((s) => !s.isQuiz && s.format !== 'quiz' && s.isRandom);
      setSeries(practiceOnly);
    } catch (err) {
      console.error(err);
      setError('Failed to load practice tests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to specific subject quiz on dedicated Quiz page
  const handleSubjectQuizClick = (subject: Subject) => {
    router.push(`/quiz?subject=${subject}`);
  };

  const filtered =
    selectedSubject === 'All'
      ? series
      : series.filter((s) => s.subject === selectedSubject);

  return (
    <div className="container">
      {/* Dashboard Header */}
      <section className="dashboard-header">
        <h1 className="header-title">Practice Tests</h1>
        <p className="header-desc">
          Select a practice test series below to begin your comprehensive timed simulation.
        </p>

        {/* Instant Speed Quiz Banner (Read-only description, subject buttons redirect to specific quiz on Quiz page) */}
        <div className="instant-quiz-banner">
          <div className="banner-left">
            <span className="banner-badge">⚡ INSTANT SPEED QUIZ</span>
            <h2 className="banner-title">Take a 20-Question Blitz (30s / Question)</h2>
            <p className="banner-desc">
              Select a subject to instantly generate a 20-question rapid quiz:
            </p>
          </div>
          <div className="banner-actions">
            {PRACTICE_SUBJECTS.map((subj) => (
              <button
                key={subj}
                className="btn btn-instant-quiz"
                onClick={() => handleSubjectQuizClick(subj)}
                type="button"
              >
                ⚡ {subj}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Subject Filter */}
      <SubjectFilter selected={selectedSubject} onChange={setSelectedSubject} subjects={PRACTICE_SUBJECTS} />

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
              ? 'No practice tests available yet'
              : `No practice tests for ${selectedSubject}`}
          </p>
          <p className="empty-state-hint">
            Ask your admin to create full test series from the Admin page.
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

        .header-title {
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .header-desc {
          font-size: 0.95rem;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto 2rem auto;
        }

        /* ── Instant Quiz Banner ── */
        .instant-quiz-banner {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(236, 72, 153, 0.08));
          border: 1px solid rgba(245, 158, 11, 0.25);
          border-radius: var(--radius-xl);
          padding: 1.75rem 2rem;
          margin: 0 auto 2.5rem auto;
          max-width: 860px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          text-align: left;
        }

        .banner-left {
          flex: 1;
          min-width: 280px;
        }

        .banner-badge {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.15);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-bottom: 0.4rem;
        }

        .banner-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .banner-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
        }

        .banner-actions {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .btn-instant-quiz {
          background: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border-medium);
          padding: 0.6rem 1rem;
          font-size: 0.88rem;
          font-weight: 700;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }

        .btn-instant-quiz:hover {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
        }

        @media (max-width: 768px) {
          .instant-quiz-banner {
            flex-direction: column;
            text-align: center;
            padding: 1.25rem;
          }
          .banner-actions {
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

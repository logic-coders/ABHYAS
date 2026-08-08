'use client';

import { useState, useEffect } from 'react';
import { TestSeries, Subject } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import SubjectFilter from '@/components/SubjectFilter';
import TestSeriesCard from '@/components/TestSeriesCard';

export default function LandingPage() {
  const { user } = useAuth();
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
      const data = await res.json();
      setSeries(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load test series. Please try again.');
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
      {/* Hero Section */}
      <section className="hero">
        {user && (
          <p className="hero-greeting" style={{
            fontSize: '0.95rem',
            color: 'var(--accent-light)',
            fontWeight: 600,
            marginBottom: '0.5rem',
            animation: 'fadeInUp 0.4s ease',
          }}>
            Welcome back, {user.name}! 👋
          </p>
        )}
        <h1 className="hero-title">Master Your Exams with Abhyas</h1>
        <p className="hero-subtitle">
          Practice with real test papers. Choose a subject, take the exam, and
          get instant results with detailed answer breakdowns.
        </p>
      </section>

      {/* Subject Filter */}
      <SubjectFilter selected={selectedSubject} onChange={setSelectedSubject} />

      {/* Content */}
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
              ? 'No test series available yet'
              : `No test series for ${selectedSubject}`}
          </p>
          <p className="empty-state-hint">
            Ask your admin to create test series from the Admin page.
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
    </div>
  );
}

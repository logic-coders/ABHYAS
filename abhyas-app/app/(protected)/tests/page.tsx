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
      {/* Dashboard Header */}
      <section className="dashboard-header" style={{ marginTop: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Available Practice Tests
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Select a test series below to begin your practice exam.
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

'use client';

import { useState } from 'react';
import { TestResultSummary } from '@/lib/result-store';
import { SUBJECT_COLORS, SUBJECT_ICONS, ExamResult } from '@/lib/types';
import ResultModal from '@/components/ResultModal';

interface ProfileHistoryProps {
  results: TestResultSummary[];
}

export default function ProfileHistory({ results }: ProfileHistoryProps) {
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  if (results.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>You haven't taken any tests yet.</p>
        <a href="/tests" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Browse Tests
        </a>
      </div>
    );
  }

  const handleResultClick = (result: TestResultSummary) => {
    // Convert TestResultSummary to ExamResult
    const examResult: ExamResult = {
      seriesId: result.seriesId,
      seriesTitle: result.seriesTitle,
      subject: result.subject,
      totalQuestions: result.totalQuestions,
      correct: result.correct ?? result.score, // fallback
      incorrect: result.incorrect ?? 0,
      unanswered: result.unanswered ?? 0,
      percentage: result.percentage,
      breakdown: result.breakdown ?? [], // handle legacy without breakdown
    };
    setSelectedResult(examResult);
  };

  return (
    <>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {results.map((result) => {
          const subjectColor = SUBJECT_COLORS[result.subject] || 'var(--accent-light)';
          const icon = SUBJECT_ICONS[result.subject] || '📝';
          
          return (
            <div 
              key={result.id} 
              className="glass-card result-card" 
              onClick={() => handleResultClick(result)}
              style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                borderLeft: `4px solid ${subjectColor}`,
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  <span style={{ marginRight: '0.5rem' }}>{icon}</span>
                  {result.seriesTitle}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Taken on: {new Date(result.date).toLocaleDateString()} at {new Date(result.date).toLocaleTimeString()}
                </p>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: result.percentage >= 70 ? 'var(--color-correct)' : 'var(--text-primary)'
                  }}>
                    {result.percentage}%
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {result.score} / {result.totalQuestions} correct
                  </p>
                </div>
                <div className="arrow-icon" style={{ color: 'var(--text-muted)' }}>
                  ➔
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedResult && (
        <ResultModal 
          result={selectedResult} 
          onClose={() => setSelectedResult(null)} 
        />
      )}

      <style jsx>{`
        .result-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .result-card:hover .arrow-icon {
          color: var(--accent-light) !important;
          transform: translateX(4px);
        }
        .arrow-icon {
          transition: all 0.2s ease;
        }
      `}</style>
    </>
  );
}

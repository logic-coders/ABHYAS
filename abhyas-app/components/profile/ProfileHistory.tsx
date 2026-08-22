'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TestResultSummary } from '@/lib/db/result-store';
import { SUBJECT_COLORS, SUBJECT_ICONS, ExamResult } from '@/lib/types';
import ResultModal from '@/components/results/ResultModal';

interface ProfileHistoryProps {
  results: TestResultSummary[];
}

export default function ProfileHistory({ results }: ProfileHistoryProps) {
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'tests' | 'quizzes'>('all');

  const testResults = results.filter(
    (r) => r.format === 'test' || (!r.format && r.totalQuestions > 20)
  );
  const quizResults = results.filter(
    (r) => r.format === 'quiz' || (!r.format && r.totalQuestions <= 20)
  );

  const displayedResults =
    activeTab === 'tests'
      ? testResults
      : activeTab === 'quizzes'
      ? quizResults
      : results;

  // Stats calculation
  const testAvg =
    testResults.length > 0
      ? Math.round(
          testResults.reduce((acc, r) => acc + (r.percentage || 0), 0) /
            testResults.length
        )
      : 0;

  const quizAvg =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce((acc, r) => acc + (r.percentage || 0), 0) /
            quizResults.length
        )
      : 0;

  const handleResultClick = (result: TestResultSummary) => {
    const isQuiz = result.format === 'quiz' || result.totalQuestions <= 20;
    const examResult: ExamResult = {
      seriesId: result.seriesId,
      seriesTitle: result.seriesTitle,
      subject: result.subject,
      totalQuestions: result.totalQuestions,
      correct: result.correct ?? result.score,
      incorrect: result.incorrect ?? 0,
      unanswered: result.unanswered ?? 0,
      percentage: result.percentage,
      format: isQuiz ? 'quiz' : 'test',
      breakdown: result.breakdown ?? [],
    };
    setSelectedResult(examResult);
  };

  if (results.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
          You haven&apos;t taken any tests or quizzes yet.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link href="/tests" className="btn btn-primary">
            Browse Practice Tests 📝
          </Link>
          <Link href="/quiz" className="btn btn-secondary">
            Take Speed Quiz ⚡
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="history-wrapper">
      {/* Quick Stats Overview */}
      <div className="stats-overview-grid">
        <div className="glass-card stat-card" onClick={() => setActiveTab('tests')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrap test-icon-bg">📝</div>
          <div className="stat-info">
            <span className="stat-label">Full Tests Completed</span>
            <div className="stat-values">
              <span className="stat-count">{testResults.length}</span>
              {testResults.length > 0 && (
                <span className="stat-badge badge-blue">Avg: {testAvg}%</span>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card stat-card" onClick={() => setActiveTab('quizzes')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrap quiz-icon-bg">⚡</div>
          <div className="stat-info">
            <span className="stat-label">Speed Quizzes Completed</span>
            <div className="stat-values">
              <span className="stat-count">{quizResults.length}</span>
              {quizResults.length > 0 && (
                <span className="stat-badge badge-amber">Avg: {quizAvg}%</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Format Filter Tabs */}
      <div className="history-tabs-bar">
        <div className="history-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Attempts ({results.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            📝 Practice & Exams ({testResults.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            ⚡ Speed Quizzes ({quizResults.length})
          </button>
        </div>
      </div>

      {/* Results List */}
      {displayedResults.length === 0 ? (
        <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', marginTop: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {activeTab === 'tests'
              ? 'No Practice Tests taken yet.'
              : 'No Speed Quizzes taken yet.'}
          </p>
          <Link
            href={activeTab === 'tests' ? '/tests' : '/quiz'}
            className="btn btn-primary btn-sm"
          >
            {activeTab === 'tests' ? 'Start Practice 📝' : 'Start a Quiz ⚡'}
          </Link>
        </div>
      ) : (
        <div className="results-list">
          {displayedResults.map((result) => {
            const isQuiz = result.format === 'quiz' || result.totalQuestions <= 20;
            const subjectColor = isQuiz
              ? '#f59e0b'
              : SUBJECT_COLORS[result.subject] || 'var(--accent-light)';
            const icon = isQuiz ? '⚡' : SUBJECT_ICONS[result.subject] || '📝';

            return (
              <div
                key={result.id}
                className="glass-card result-card"
                onClick={() => handleResultClick(result)}
                style={{
                  borderLeft: `4px solid ${subjectColor}`,
                }}
              >
                <div>
                  <div className="card-top-meta">
                    <span className={isQuiz ? 'badge-quiz' : 'badge-test'}>
                      {isQuiz ? '⚡ SPEED QUIZ' : '📝 FULL TEST'}
                    </span>
                    <span className="subject-meta-text">• {result.subject}</span>
                  </div>
                  <h3 className="result-card-title">
                    <span style={{ marginRight: '0.4rem' }}>{icon}</span>
                    {result.seriesTitle}
                  </h3>
                  <p className="result-card-date">
                    Taken on: {new Date(result.date).toLocaleDateString()} at{' '}
                    {new Date(result.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="result-card-right">
                  <div>
                    <div
                      className="score-percentage"
                      style={{
                        color:
                          result.percentage >= 70
                            ? 'var(--color-correct)'
                            : result.percentage >= 40
                            ? '#f59e0b'
                            : 'var(--text-primary)',
                      }}
                    >
                      {result.percentage}%
                    </div>
                    <p className="score-detail">
                      {result.score} / {result.totalQuestions} correct
                    </p>
                  </div>
                  <div className="arrow-icon">➔</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedResult && (
        <ResultModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}

      <style jsx>{`
        .history-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* ── Stats Overview Grid ── */
        .stats-overview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .stat-card {
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .test-icon-bg {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .quiz-icon-bg {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .stat-values {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-count {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .stat-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
        }

        .badge-blue {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .badge-amber {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        /* ── Tabs Bar ── */
        .history-tabs-bar {
          display: flex;
          justify-content: flex-start;
        }

        .history-tabs {
          display: inline-flex;
          background: var(--bg-glass-strong);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-full);
          padding: 0.3rem;
          gap: 0.3rem;
        }

        .tab-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.45rem 1.15rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          background: var(--accent-gradient);
          color: #ffffff;
          box-shadow: var(--shadow-sm);
        }

        /* ── Results List ── */
        .results-list {
          display: grid;
          gap: 0.85rem;
        }

        .result-card {
          padding: 1.35rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .result-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .result-card:hover .arrow-icon {
          color: var(--accent) !important;
          transform: translateX(4px);
        }

        .card-top-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
        }

        .badge-quiz {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.15);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
        }

        .badge-test {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.15);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
        }

        .subject-meta-text {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .result-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }

        .result-card-date {
          font-size: 0.82rem;
          color: var(--text-secondary);
        }

        .result-card-right {
          text-align: right;
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .score-percentage {
          font-size: 1.45rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .score-detail {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin-top: 0.2rem;
        }

        .arrow-icon {
          color: var(--text-muted);
          font-size: 1.1rem;
          transition: all 0.2s ease;
        }

        @media (max-width: 640px) {
          .stats-overview-grid {
            grid-template-columns: 1fr;
          }
          .result-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .result-card-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}

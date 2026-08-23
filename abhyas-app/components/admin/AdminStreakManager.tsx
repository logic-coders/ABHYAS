'use client';

import { useState, useEffect } from 'react';
import { Subject, SUBJECTS, SUBJECT_ICONS, SUBJECT_COLORS } from '@/lib/types';

export default function AdminStreakManager() {
  const [todaySubject, setTodaySubject] = useState<Subject>('Music');
  const [streakDate, setStreakDate] = useState('');
  const [streakQuiz, setStreakQuiz] = useState<{ id: string; title: string; subject: Subject } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchStreakStatus();
  }, []);

  const fetchStreakStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/streak');
      if (!res.ok) throw new Error('Failed to fetch streak info');
      const data = await res.json();
      setTodaySubject(data.todaySubject);
      setStreakDate(data.streakDate);
      setStreakQuiz(data.streakQuiz);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateStreakQuiz = async (subjectOverride?: Subject) => {
    setIsGenerating(true);
    try {
      const targetSubj = subjectOverride || todaySubject;
      const res = await fetch(`/api/admin/generate-streak-quiz?subject=${targetSubj}`, {
        method: 'POST',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate streak quiz');
      }

      const data = await res.json();
      setStreakQuiz(data.quiz);
      showToast('success', `Generated 20-question Daily Streak Quiz for ${targetSubj}!`);
    } catch (err) {
      console.error(err);
      showToast('error', err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="streak-manager">
      <div className="streak-hero-card">
        <div className="hero-top">
          <div className="streak-badge">🔥 DAILY STREAK ENGINE</div>
          <span className="date-badge">📅 {streakDate || new Date().toISOString().split('T')[0]}</span>
        </div>

        <h2 className="hero-title">Daily Rotating Streak Quiz</h2>
        <p className="hero-desc">
          Every day features one rotating subject. Users who complete the 20-question blitz build their consecutive streak counter on their profile.
        </p>

        {/* Rotating Cycle Indicator */}
        <div className="cycle-container">
          <span className="cycle-label">Daily Rotation Sequence:</span>
          <div className="cycle-pills">
            {SUBJECTS.map((s) => {
              const isToday = s === todaySubject;
              return (
                <div
                  key={s}
                  className={`cycle-pill ${isToday ? 'active-today' : ''}`}
                  style={{
                    borderColor: isToday ? SUBJECT_COLORS[s] : 'var(--border-medium)',
                  }}
                >
                  <span className="pill-icon">{SUBJECT_ICONS[s]}</span>
                  <span className="pill-name">{s}</span>
                  {isToday && <span className="today-tag">TODAY</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Active Quiz Status */}
        <div className="status-box">
          <div className="status-header">
            <span className="status-label">Today's Streak Quiz Status:</span>
            {isLoading ? (
              <span className="status-val loading">Checking...</span>
            ) : streakQuiz ? (
              <span className="status-val active">✅ ACTIVE & READY</span>
            ) : (
              <span className="status-val pending">⏳ NOT GENERATED YET</span>
            )}
          </div>

          {streakQuiz && (
            <div className="active-quiz-info">
              <strong>{streakQuiz.title}</strong> ({streakQuiz.subject} • 20 Questions • 30s/Q)
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-row">
            <button
              className="btn btn-primary btn-lg"
              type="button"
              onClick={() => handleGenerateStreakQuiz()}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <span className="spinner" /> Sourcing 20 Questions...
                </>
              ) : streakQuiz ? (
                '🔄 Refresh Today\'s Streak Quiz'
              ) : (
                '⚡ Auto-Generate Today\'s Streak Quiz'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Manual Override for other subjects */}
      <div className="override-box">
        <h3 className="override-title">Or Force-Generate for a Specific Subject:</h3>
        <p className="override-desc">Need to test or override today's subject? Click any subject to generate a 20-question streak quiz for that subject right away:</p>
        <div className="override-buttons">
          {SUBJECTS.map((subj) => (
            <button
              key={subj}
              className="btn btn-secondary btn-sm"
              type="button"
              disabled={isGenerating}
              onClick={() => handleGenerateStreakQuiz(subj)}
            >
              {SUBJECT_ICONS[subj]} Generate {subj} Quiz
            </button>
          ))}
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert">
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      <style jsx>{`
        .streak-manager {
          max-width: 780px;
          animation: fadeInUp 0.4s ease;
        }

        .streak-hero-card {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08));
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: var(--radius-xl);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .hero-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .streak-badge {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.15);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
        }

        .date-badge {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .hero-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.4rem;
        }

        .hero-desc {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        /* ── Cycle Sequence ── */
        .cycle-container {
          margin-bottom: 1.75rem;
        }

        .cycle-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .cycle-pills {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .cycle-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }

        .cycle-pill.active-today {
          background: rgba(245, 158, 11, 0.15);
          color: var(--text-primary);
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
        }

        .today-tag {
          font-size: 0.65rem;
          font-weight: 800;
          background: #ef4444;
          color: #ffffff;
          padding: 0.1rem 0.4rem;
          border-radius: var(--radius-full);
          margin-left: 0.2rem;
        }

        /* ── Status Box ── */
        .status-box {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .status-label {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .status-val {
          font-size: 0.82rem;
          font-weight: 800;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
        }

        .status-val.active {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .status-val.pending {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .status-val.loading {
          color: var(--text-muted);
        }

        .active-quiz-info {
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
          padding: 0.6rem 0.85rem;
          background: var(--bg-glass);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .action-row {
          display: flex;
          gap: 1rem;
        }

        /* ── Override Box ── */
        .override-box {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }

        .override-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.35rem;
        }

        .override-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .override-buttons {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        @media (max-width: 640px) {
          .streak-hero-card {
            padding: 1.25rem;
          }
          .hero-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.4rem;
          }
          .hero-title {
            font-size: 1.4rem;
          }
          .cycle-pills {
            overflow-x: auto;
            width: 100%;
            padding-bottom: 0.5rem;
            -webkit-overflow-scrolling: touch;
          }
          .action-row button,
          .override-buttons button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

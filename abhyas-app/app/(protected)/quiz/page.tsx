'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Subject, TestSeries } from '@/lib/types';
import MiniStreakCalendar from '@/components/MiniStreakCalendar';
import SubjectFilter from '@/components/SubjectFilter';

function QuizDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSubject = searchParams.get('subject') as Subject | null;
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>(urlSubject || 'All');

  // Streak state
  const [streakData, setStreakData] = useState<{
    streak: {
      currentStreak: number;
      longestStreak: number;
      lastStreakDate: string | null;
      streakHistory: string[];
      isTodayCompleted: boolean;
    };
    todaySubject: Subject;
    streakDate: string;
    streakQuiz: { id: string; title: string; subject: Subject; durationPerQuestion: number } | null;
  } | null>(null);

  const [streakQuizzes, setStreakQuizzes] = useState<TestSeries[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [streakRes, quizzesRes] = await Promise.all([
        fetch('/api/streak'),
        fetch('/api/test-series?streakOnly=true')
      ]);
      
      if (streakRes.ok) {
        setStreakData(await streakRes.json());
      }
      if (quizzesRes.ok) {
        const data = await quizzesRes.json();
        // Sort by streakDate descending
        data.sort((a: any, b: any) => {
          if (!a.streakDate) return 1;
          if (!b.streakDate) return -1;
          return new Date(b.streakDate).getTime() - new Date(a.streakDate).getTime();
        });
        setStreakQuizzes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuizzes = selectedSubject === 'All'
    ? streakQuizzes
    : streakQuizzes.filter(q => q.subject === selectedSubject);

  return (
    <div className="container">
      {/* Quiz Dashboard Header */}
      <section className="quiz-header-section">
        <div className="quiz-pill-tag">🔥 DAILY STREAK ARENA</div>
        <h1 className="header-title">Daily Streak Quiz</h1>
        <p className="header-desc">
          Complete your daily 20-question challenge to build and maintain your streak.
          Each day brings a new subject — stay consistent, stay sharp.
        </p>

        {/* Loading State */}
        {isLoading && (
          <div className="streak-loading">
            <div className="skeleton" style={{ height: '180px', borderRadius: 'var(--radius-xl)', maxWidth: '960px', margin: '0 auto' }} />
          </div>
        )}

        {/* ── Daily Streak Banner ── */}
        {!isLoading && streakData && (
          <div className="daily-streak-banner">
            <div className="streak-left">
              <div className="streak-tag-row">
                <span className="streak-pill">🔥 DAILY STREAK QUIZ</span>
                <span className="streak-subject-tag">Today: {streakData.todaySubject}</span>
              </div>
              <h2 className="streak-title">
                {streakData.streakQuiz ? streakData.streakQuiz.title : `Today's ${streakData.todaySubject} Challenge`}
              </h2>
              <p className="streak-desc">
                {streakData.streak.isTodayCompleted
                  ? '🎉 Streak completed for today! Keep the momentum alive tomorrow.'
                  : `Complete today's 20 questions to maintain your ${streakData.streak.currentStreak}-day streak!`}
              </p>

              {/* Streak Stats Inline */}
              <div className="streak-stats-row">
                <div className="streak-stat">
                  <span className="stat-num">{streakData.streak.currentStreak}</span>
                  <span className="stat-label-small">Current Streak</span>
                </div>
                <div className="streak-stat">
                  <span className="stat-num">{streakData.streak.longestStreak}</span>
                  <span className="stat-label-small">Longest Streak</span>
                </div>
                <div className="streak-stat">
                  <span className="stat-num">{streakData.streak.streakHistory?.length || 0}</span>
                  <span className="stat-label-small">Total Days</span>
                </div>
              </div>

              <div className="cta-wrapper">
                {streakData.streakQuiz ? (
                  <Link
                    href={`/quiz/${streakData.streakQuiz.id}`}
                    className={`btn ${streakData.streak.isTodayCompleted ? 'btn-secondary' : 'btn-streak-cta'}`}
                  >
                    {streakData.streak.isTodayCompleted ? '🔁 Retake Streak Quiz' : '⚡ Start Streak Quiz →'}
                  </Link>
                ) : (
                  <div className="no-streak-notice">
                    <span className="notice-icon">📋</span>
                    <p>Today&apos;s streak quiz hasn&apos;t been generated yet.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="streak-right">
              <div className="mini-cal-container">
                <MiniStreakCalendar completedDates={streakData.streak.streakHistory || []} />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Streak Quizzes List ── */}
      {!isLoading && streakQuizzes.length > 0 && (
        <section className="quizzes-list-section">
          <SubjectFilter selected={selectedSubject} onChange={setSelectedSubject} />

          <div className="quiz-table-wrapper">
            <table className="quiz-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Status</th>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.length > 0 ? (
                  filteredQuizzes.map((quiz) => {
                    const isCompleted = streakData?.streak.streakHistory.includes(quiz.streakDate || '');
                    return (
                      <tr key={quiz.id}>
                        <td style={{ textAlign: 'center' }}>
                          {isCompleted ? (
                            <span className="status-icon done">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                            </span>
                          ) : (
                            <span className="status-icon pending">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                              </svg>
                            </span>
                          )}
                        </td>
                        <td>
                          <Link href={`/quiz/${quiz.id}`} className="quiz-title-link">
                            {quiz.title}
                          </Link>
                          <div className="mobile-meta">
                            {quiz.subject} • {quiz.streakDate ? new Date(quiz.streakDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown'}
                          </div>
                        </td>
                        <td>
                          <span className="quiz-subject">{quiz.subject}</span>
                        </td>
                        <td>
                          <span className="quiz-date">
                            {quiz.streakDate ? new Date(quiz.streakDate).toLocaleDateString('en-GB') : 'Unknown'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link href={`/quiz/${quiz.id}`} className="btn-table-action">
                            {isCompleted ? 'Retake' : 'Start'}
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                      <p style={{ color: 'var(--text-muted)' }}>No quizzes found for {selectedSubject}.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Bottom spacer */}
      <div style={{ height: '4rem' }} />

      <style jsx>{`
        .quiz-header-section {
          margin-top: 3rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .quiz-pill-tag {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.75rem;
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
          line-height: 1.6;
        }

        /* ── Daily Streak Banner ── */
        .daily-streak-banner {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08));
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-radius: var(--radius-xl);
          padding: 2rem 2.25rem;
          margin: 0 auto 1.5rem auto;
          max-width: 960px;
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2rem;
          text-align: left;
        }

        .streak-left {
          flex: 1;
          min-width: 320px;
          display: flex;
          flex-direction: column;
        }

        .streak-tag-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .streak-pill {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.15);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
        }

        .streak-subject-tag {
          font-size: 0.72rem;
          font-weight: 800;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.15);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
        }

        .streak-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.35rem;
        }

        .streak-desc {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin: 0 0 1.25rem 0;
          line-height: 1.5;
        }

        /* Inline Stats */
        .streak-stats-row {
          display: flex;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .streak-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.6rem 1rem;
          min-width: 85px;
        }

        .stat-num {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label-small {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-top: 0.25rem;
        }

        .cta-wrapper {
          margin-top: auto;
        }

        .btn-streak-cta {
          background: linear-gradient(135deg, #ef4444, #f59e0b);
          color: #ffffff;
          border: none;
          padding: 0.85rem 1.75rem;
          font-size: 1rem;
          font-weight: 800;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }

        .btn-streak-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        .no-streak-notice {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 0.85rem 1.25rem;
          display: inline-flex;
        }

        .notice-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .no-streak-notice p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.4;
        }

        .streak-right {
          display: flex;
          align-items: center;
          justify-content: center;
          border-left: 1px solid var(--border-subtle);
          padding-left: 2rem;
        }

        .mini-cal-container {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          box-shadow: var(--shadow-sm);
        }

        /* ── Quizzes List ── */
        .quizzes-list-section {
          max-width: 960px;
          margin: 2rem auto 0 auto;
        }

        .quiz-table-wrapper {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .quiz-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .quiz-table th {
          background: rgba(255, 255, 255, 0.02);
          padding: 1rem 1.25rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border-subtle);
        }

        .quiz-table td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          vertical-align: middle;
        }

        .quiz-table tbody tr:last-child td {
          border-bottom: none;
        }

        .quiz-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .status-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
        }

        .status-icon.done {
          color: #3b82f6; /* Blue check */
        }

        .status-icon.pending {
          color: var(--text-muted);
        }

        .status-icon svg {
          width: 100%;
          height: 100%;
        }

        .quiz-title-link {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .quiz-title-link:hover {
          color: #3b82f6;
        }

        .mobile-meta {
          display: none;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .quiz-subject {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .quiz-date {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .btn-table-action {
          display: inline-block;
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
          font-weight: 700;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-table-action:hover {
          background: rgba(255, 255, 255, 0.15);
          color: var(--text-primary);
        }

        @media (max-width: 768px) {
          .daily-streak-banner {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
          }
          .streak-tag-row {
            justify-content: center;
          }
          .streak-stats-row {
            justify-content: center;
          }
          .streak-right {
            border-left: none;
            border-top: 1px solid var(--border-subtle);
            padding-left: 0;
            padding-top: 1.5rem;
          }
          .quiz-table th:nth-child(3),
          .quiz-table td:nth-child(3),
          .quiz-table th:nth-child(4),
          .quiz-table td:nth-child(4) {
            display: none;
          }
          .mobile-meta {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}

export default function QuizDashboardPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading Quiz Dashboard...</div>}>
      <QuizDashboardContent />
    </Suspense>
  );
}

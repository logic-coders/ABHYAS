'use client';

import Link from 'next/link';

interface ProfileViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
  };
  streak: {
    currentStreak: number;
    longestStreak: number;
    lastStreakDate: string | null;
    isCompletedToday: boolean;
  };
}

export default function ProfileView({ user, streak }: ProfileViewProps) {
  const { currentStreak, longestStreak, lastStreakDate, isCompletedToday } = streak;

  return (
    <div className="container page-wrapper">
      <div className="profile-layout">
        {/* Profile Card */}
        <div className="glass-card profile-card">
          <div className="profile-header-section">
            <div className="avatar-circle">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="profile-title">{user.name}</h1>
              <span className="role-tag">{user.role.toUpperCase()}</span>
            </div>
          </div>

          <div className="profile-fields">
            <div className="profile-field">
              <span className="field-label">Email Address</span>
              <span className="field-value">{user.email}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Account Status</span>
              <span className="status-badge-approved">APPROVED</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Member Since</span>
              <span className="field-value">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB') : 'August 2026'}
              </span>
            </div>
          </div>
        </div>

        {/* Daily Streak Card */}
        <div className="glass-card streak-card">
          <div className="streak-card-top">
            <span className="streak-badge">🔥 DAILY STREAK</span>
            {isCompletedToday ? (
              <span className="badge-done">✅ Completed Today</span>
            ) : (
              <span className="badge-pending">⏳ Available Today</span>
            )}
          </div>

          <div className="streak-stat-main">
            <div className="streak-flame-icon">🔥</div>
            <div className="streak-count-wrapper">
              <span className="streak-count-number">{currentStreak}</span>
              <span className="streak-count-label">
                {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
              </span>
            </div>
          </div>

          <p className="streak-encouragement">
            {currentStreak === 0
              ? 'Start your learning momentum today by taking the Daily Streak Quiz!'
              : currentStreak > 5
              ? 'Incredible dedication! Keep the fire burning!'
              : 'Great work! Complete tomorrow\'s quiz to extend your streak.'}
          </p>

          <div className="streak-stats-row">
            <div className="sub-stat">
              <span className="sub-stat-label">Best Record</span>
              <span className="sub-stat-value">🏆 {longestStreak} {longestStreak === 1 ? 'Day' : 'Days'}</span>
            </div>
            <div className="sub-stat">
              <span className="sub-stat-label">Last Active</span>
              <span className="sub-stat-value">
                {lastStreakDate ? new Date(lastStreakDate).toLocaleDateString('en-GB') : 'No attempts yet'}
              </span>
            </div>
          </div>

          {!isCompletedToday ? (
            <Link href="/quiz" className="btn btn-primary streak-cta-btn">
              ⚡ Take Today&apos;s Streak Quiz →
            </Link>
          ) : (
            <div className="streak-complete-msg">
              🎉 You have kept your streak alive for today! Come back tomorrow for the next subject.
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .profile-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          max-width: 960px;
          margin: 0 auto;
          animation: fadeInUp 0.4s ease;
        }

        .profile-card,
        .streak-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        /* ── Profile Left ── */
        .profile-header-section {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .avatar-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--accent-gradient);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
        }

        .profile-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .role-tag {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          background: rgba(124, 58, 237, 0.15);
          color: var(--accent-light);
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
        }

        .profile-fields {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .profile-field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .field-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .field-value {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .status-badge-approved {
          font-size: 0.78rem;
          font-weight: 800;
          color: #10b981;
          background: rgba(16, 185, 129, 0.12);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          width: fit-content;
        }

        /* ── Streak Card Right ── */
        .streak-card {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(245, 158, 11, 0.06));
          border-color: rgba(245, 158, 11, 0.25);
        }

        .streak-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .streak-badge {
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #ef4444;
          background: rgba(239, 68, 68, 0.12);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
        }

        .badge-done {
          font-size: 0.78rem;
          font-weight: 800;
          color: #10b981;
          background: rgba(16, 185, 129, 0.12);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
        }

        .badge-pending {
          font-size: 0.78rem;
          font-weight: 800;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.12);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
        }

        .streak-stat-main {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 1rem;
        }

        .streak-flame-icon {
          font-size: 3.5rem;
          animation: pulse 2s infinite ease-in-out;
        }

        .streak-count-wrapper {
          display: flex;
          flex-direction: column;
        }

        .streak-count-number {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1;
          color: var(--text-primary);
          background: linear-gradient(135deg, #ef4444, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .streak-count-label {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .streak-encouragement {
          font-size: 0.92rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .streak-stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 0.85rem 1rem;
          background: var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
        }

        .sub-stat {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .sub-stat-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .sub-stat-value {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .streak-cta-btn {
          text-align: center;
          padding: 0.85rem;
          font-weight: 800;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #ef4444, #f59e0b);
          border: none;
          color: #ffffff;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .streak-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(239, 68, 68, 0.35);
        }

        .streak-complete-msg {
          font-size: 0.88rem;
          color: #10b981;
          font-weight: 600;
          text-align: center;
          padding: 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: var(--radius-md);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }

        @media (max-width: 768px) {
          .profile-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

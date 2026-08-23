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
}

export default function ProfileView({ user }: ProfileViewProps) {
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

          <div className="profile-actions">
            <Link href="/test-history" className="btn btn-primary history-btn">
              <span>View Test History 📊</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          max-width: 600px;
          margin: 0 auto;
          animation: fadeInUp 0.4s ease;
        }

        .profile-card {
          padding: 2rem;
          display: flex;
          flex-direction: column;
        }

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
          flex-shrink: 0;
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

        .profile-actions {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }

        .history-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        @media (max-width: 640px) {
          .profile-card {
            padding: 1.5rem 1.25rem;
          }
          .profile-header-section {
            gap: 1rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1.25rem;
          }
          .avatar-circle {
            width: 52px;
            height: 52px;
            font-size: 1.5rem;
          }
          .profile-title {
            font-size: 1.3rem;
          }
          .field-value {
            word-break: break-all;
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}

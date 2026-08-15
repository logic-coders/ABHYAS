'use client';

import { useState } from 'react';
import AdminForm from '@/components/AdminForm';
import AdminQuizManager from '@/components/admin/AdminQuizManager';
import AdminStreakManager from '@/components/admin/AdminStreakManager';
import UserApprovals from '@/components/UserApprovals';
import UserDatabase from '@/components/admin/UserDatabase';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'tests' | 'quiz' | 'streak' | 'users' | 'database'>('quiz');

  return (
    <div className="container page-wrapper">
      <div className="admin-header">
        <h1 className="section-heading" style={{ marginBottom: '0.25rem' }}>
          ⚙️ Admin Dashboard
        </h1>
        <p className="admin-description">
          Create test series & speed quizzes, manage daily streaks, and administer user registrations.
        </p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          📝 Create Test Series
        </button>
        <button 
          className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
        >
          ⚡ Create Quiz
        </button>
        <button 
          className={`tab-btn ${activeTab === 'streak' ? 'active' : ''}`}
          onClick={() => setActiveTab('streak')}
        >
          🔥 Daily Streak
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Approvals
        </button>
        <button 
          className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          🗄️ User Database
        </button>
      </div>

      {activeTab === 'tests' && <AdminForm />}
      {activeTab === 'quiz' && <AdminQuizManager />}
      {activeTab === 'streak' && <AdminStreakManager />}
      {activeTab === 'users' && <UserApprovals />}
      {activeTab === 'database' && <UserDatabase />}

      <style jsx>{`
        .admin-header {
          margin-bottom: 2rem;
          max-width: 650px;
          animation: fadeInUp 0.5s ease;
        }

        .admin-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .admin-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.5rem;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 0.6rem 1rem;
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-muted);
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          white-space: nowrap;
          border-radius: var(--radius-sm);
        }

        .tab-btn:hover {
          color: var(--text-primary);
          background: var(--bg-card);
        }

        .tab-btn.active {
          color: var(--accent-light);
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -0.6rem;
          left: 0.5rem;
          right: 0.5rem;
          height: 3px;
          background: var(--accent-gradient);
          border-radius: 3px 3px 0 0;
        }
      `}</style>
    </div>
  );
}

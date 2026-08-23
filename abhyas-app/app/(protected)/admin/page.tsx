'use client';

import { useState } from 'react';
import AdminForm from '@/components/admin/AdminForm';
import AdminTestManager from '@/components/admin/AdminTestManager';
import AdminQuizManager from '@/components/admin/AdminQuizManager';
import AdminStreakManager from '@/components/admin/AdminStreakManager';
import UserApprovals from '@/components/profile/UserApprovals';
import UserDatabase from '@/components/admin/UserDatabase';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'manage-tests' | 'tests' | 'quiz' | 'streak' | 'users' | 'database'>('manage-tests');

  return (
    <div className="container page-wrapper">
      <div className="admin-header">
        <h1 className="section-heading" style={{ marginBottom: '0.25rem' }}>
          ⚙️ Admin Dashboard
        </h1>
        <p className="admin-description">
          Manage & create test series, generate practice quizzes, administer daily streaks, and review users.
        </p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'manage-tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage-tests')}
        >
          📋 Manage Tests
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          📝 Create Test
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

      {activeTab === 'manage-tests' && <AdminTestManager />}
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
          padding: 0.25rem 0.25rem 0.65rem 0.25rem;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }

        .admin-tabs::-webkit-scrollbar {
          display: none;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 0.55rem 0.9rem;
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-muted);
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          white-space: nowrap;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
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
          bottom: -0.65rem;
          left: 0.5rem;
          right: 0.5rem;
          height: 3px;
          background: var(--accent-gradient);
          border-radius: 3px 3px 0 0;
        }

        @media (max-width: 768px) {
          .admin-header {
            margin-bottom: 1.5rem;
          }
          .admin-description {
            font-size: 0.88rem;
          }
          .tab-btn {
            font-size: 0.85rem;
            padding: 0.5rem 0.75rem;
          }
        }
      `}</style>
    </div>
  );
}

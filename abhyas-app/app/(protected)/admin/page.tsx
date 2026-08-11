'use client';

import { useState } from 'react';
import AdminForm from '@/components/AdminForm';
import UserApprovals from '@/components/UserApprovals';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'tests' | 'users'>('tests');

  return (
    <div className="container page-wrapper">
      <div className="admin-header">
        <h1 className="section-heading" style={{ marginBottom: '0.25rem' }}>
          ⚙️ Admin Dashboard
        </h1>
        <p className="admin-description">
          Manage test series and user registrations.
        </p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          Create Test Series
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Approvals
        </button>
      </div>

      {activeTab === 'tests' ? <AdminForm /> : <UserApprovals />}

      <style jsx>{`
        .admin-header {
          margin-bottom: 2rem;
          max-width: 600px;
          animation: fadeInUp 0.5s ease;
        }

        .admin-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .admin-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 0.5rem;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          position: relative;
          transition: color 0.2s ease;
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          color: var(--accent-light);
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -0.6rem;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent-gradient);
          border-radius: 3px 3px 0 0;
        }
      `}</style>
    </div>
  );
}

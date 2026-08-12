'use client';

import { useState, useEffect } from 'react';
import { SafeUser } from '@/lib/types';
import { TestResultSummary } from '@/lib/result-store';

interface UserWithResults extends SafeUser {
  results: TestResultSummary[];
}

export default function UserDatabase() {
  const [users, setUsers] = useState<UserWithResults[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const fetchDatabase = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/database');
      if (!res.ok) throw new Error('Failed to fetch user database');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabase();
  }, []);

  const toggleExpand = (userId: string) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  if (isLoading) return <div className="skeleton" style={{ height: '400px' }} />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-database">
      <h3>User Database ({users.length})</h3>
      {users.length === 0 ? (
        <p className="empty-text">No users found.</p>
      ) : (
        <div className="db-list">
          {users.map(user => (
            <div key={user.id} className={`db-card ${expandedUserId === user.id ? 'expanded' : ''}`}>
              <div className="db-header" onClick={() => toggleExpand(user.id)}>
                <div className="db-user-info">
                  <div className="db-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{user.name}</strong>
                    <div className="db-meta">
                      <span>{user.email}</span>
                      <span className="divider">•</span>
                      <span className="role">{user.role}</span>
                      <span className="divider">•</span>
                      <span>{user.results.length} tests taken</span>
                    </div>
                  </div>
                </div>
                <div className="db-toggle">
                  {expandedUserId === user.id ? 'Hide Details ▲' : 'View Details ▼'}
                </div>
              </div>
              
              {expandedUserId === user.id && (
                <div className="db-details">
                  <h4>Test History</h4>
                  {user.results.length === 0 ? (
                    <p className="empty-text" style={{ margin: 0 }}>This user hasn't taken any tests yet.</p>
                  ) : (
                    <div className="test-history-grid">
                      {user.results.map(result => (
                        <div key={result.id} className="test-result-item">
                          <div className="test-title">{result.seriesTitle}</div>
                          <div className="test-subject">{result.subject}</div>
                          <div className="test-stats">
                            <span className="score">Score: {result.score}/{result.totalQuestions} ({Math.round(result.percentage)}%)</span>
                            <span className="date">{new Date(result.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .user-database {
          animation: fadeIn 0.4s ease;
        }
        h3 {
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }
        .empty-text {
          color: var(--text-muted);
          font-size: 0.95rem;
          font-style: italic;
        }
        .db-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .db-card {
          background: var(--bg-glass);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: border-color 0.2s ease;
        }
        .db-card.expanded {
          border-color: var(--accent-light);
        }
        .db-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .db-header:hover {
          background: rgba(255,255,255,0.03);
        }
        .db-user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .db-avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: var(--accent-gradient);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.1rem;
        }
        .db-user-info strong {
          display: block;
          color: var(--text-primary);
          font-size: 1.05rem;
          margin-bottom: 0.25rem;
        }
        .db-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .db-meta .role {
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: bold;
          color: var(--accent-light);
        }
        .divider {
          color: var(--border-medium);
        }
        .db-toggle {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        
        .db-details {
          border-top: 1px solid var(--border-subtle);
          padding: 1.25rem;
          background: rgba(0,0,0,0.2);
        }
        .db-details h4 {
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }
        
        .test-history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        .test-result-item {
          background: var(--bg-glass);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-sm);
          padding: 1rem;
        }
        .test-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          font-size: 0.95rem;
        }
        .test-subject {
          font-size: 0.8rem;
          color: var(--accent-light);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .test-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          color: var(--text-secondary);
          border-top: 1px dashed var(--border-subtle);
          padding-top: 0.5rem;
        }
        .test-stats .score {
          font-weight: 600;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

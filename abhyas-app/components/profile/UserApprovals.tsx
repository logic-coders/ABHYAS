'use client';

import { useState, useEffect } from 'react';
import { SafeUser } from '@/lib/types';

export default function UserApprovals() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, accountStatus: status as any } : u));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to completely delete the user ${userName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      // Update local state
      setUsers(users.filter(u => u.id !== userId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const pendingUsers = users.filter(u => u.accountStatus === 'PENDING' && u.role !== 'admin');
  const otherUsers = users.filter(u => u.accountStatus !== 'PENDING' && u.role !== 'admin');

  if (isLoading) return <div className="skeleton" style={{ height: '200px' }} />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-approvals">
      <h3>Pending Approvals ({pendingUsers.length})</h3>
      {pendingUsers.length === 0 ? (
        <p className="empty-text">No pending registrations.</p>
      ) : (
        <div className="users-list">
          {pendingUsers.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-info">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
              <div className="user-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleUpdateStatus(user.id, 'APPROVED')}
                >
                  Approve
                </button>
                <button 
                  className="btn btn-ghost"
                  onClick={() => handleUpdateStatus(user.id, 'REJECTED')}
                  style={{ color: 'var(--color-incorrect)' }}
                >
                  Reject
                </button>
                <button 
                  className="btn btn-ghost"
                  onClick={() => handleDeleteUser(user.id, user.name)}
                  style={{ color: 'var(--color-incorrect)', background: 'rgba(239,68,68,0.1)' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: '2rem' }}>All Users</h3>
      <div className="users-list">
        {otherUsers.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span className={`status-badge status-${user.accountStatus?.toLowerCase()}`}>
                {user.accountStatus}
              </span>
            </div>
            {user.accountStatus === 'REJECTED' && (
              <div className="user-actions">
                <button 
                  className="btn btn-ghost"
                  onClick={() => handleUpdateStatus(user.id, 'APPROVED')}
                >
                  Approve
                </button>
              </div>
            )}
            {user.accountStatus === 'APPROVED' && (
              <div className="user-actions">
                <button 
                  className="btn btn-ghost"
                  onClick={() => handleUpdateStatus(user.id, 'REJECTED')}
                  style={{ color: 'var(--color-incorrect)' }}
                >
                  Revoke
                </button>
                <button 
                  className="btn btn-ghost"
                  onClick={() => handleDeleteUser(user.id, user.name)}
                  style={{ color: 'var(--color-incorrect)', background: 'rgba(239,68,68,0.1)' }}
                >
                  Delete
                </button>
              </div>
            )}
            {user.accountStatus === 'REJECTED' && (
              <div className="user-actions">
                <button 
                  className="btn btn-ghost"
                  onClick={() => handleUpdateStatus(user.id, 'APPROVED')}
                >
                  Approve
                </button>
                <button 
                  className="btn btn-ghost"
                  onClick={() => handleDeleteUser(user.id, user.name)}
                  style={{ color: 'var(--color-incorrect)', background: 'rgba(239,68,68,0.1)' }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .user-approvals {
          animation: fadeIn 0.4s ease;
        }
        h3 {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }
        .empty-text {
          color: var(--text-muted);
          font-size: 0.95rem;
          font-style: italic;
        }
        .users-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .user-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--bg-glass);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
        }
        .user-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .user-info strong {
          color: var(--text-primary);
        }
        .user-info span {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }
        .user-actions {
          display: flex;
          gap: 0.75rem;
        }
        .status-badge {
          display: inline-block;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          margin-top: 0.5rem;
          width: fit-content;
        }
        .status-approved {
          background: rgba(34, 197, 94, 0.15);
          color: var(--color-correct);
        }
        .status-rejected {
          background: rgba(239, 68, 68, 0.15);
          color: var(--color-incorrect);
        }
        .status-pending {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        @media (max-width: 640px) {
          .user-card {
            flex-direction: column;
            align-items: stretch;
            gap: 0.85rem;
            padding: 0.85rem;
          }
          .user-actions {
            display: flex;
            flex-wrap: wrap;
            justify-content: stretch;
            gap: 0.4rem;
            border-top: 1px dashed var(--border-subtle);
            padding-top: 0.65rem;
            width: 100%;
          }
          .user-actions button {
            flex: 1;
            min-width: 75px;
            padding: 0.4rem 0.5rem;
            font-size: 0.8rem;
            text-align: center;
            justify-content: center;
          }
          .user-info span {
            word-break: break-all;
          }
        }
      `}</style>
    </div>
  );
}

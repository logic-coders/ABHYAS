'use client';

import { useState, useEffect } from 'react';
import { TestSeries, Subject, SUBJECTS, SUBJECT_ICONS, SUBJECT_COLORS } from '@/lib/types';

export default function AdminTestManager() {
  const [tests, setTests] = useState<TestSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');
  const [filterType, setFilterType] = useState<'all' | 'prev-year' | 'practice'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Rename modal state
  const [editingTest, setEditingTest] = useState<TestSeries | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/test-series');
      if (!res.ok) throw new Error('Failed to fetch tests');
      const data: TestSeries[] = await res.json();
      setTests(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load test series');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRename = (test: TestSeries) => {
    setEditingTest(test);
    setNewTitle(test.title);
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTest || !newTitle.trim()) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/test-series/${editingTest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to rename test');
      }

      setTests((prev) =>
        prev.map((t) => (t.id === editingTest.id ? { ...t, title: newTitle.trim() } : t))
      );
      showToast('success', `Test renamed to "${newTitle.trim()}"`);
      setEditingTest(null);
    } catch (err) {
      console.error(err);
      showToast('error', err instanceof Error ? err.message : 'Rename failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (test: TestSeries) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${test.title}"? This cannot be undone.`
    );
    if (!confirmDelete) return;

    setDeletingId(test.id);
    try {
      const res = await fetch(`/api/test-series/${test.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete test');
      }

      setTests((prev) => prev.filter((t) => t.id !== test.id));
      showToast('success', `Test "${test.title}" deleted successfully.`);
    } catch (err) {
      console.error(err);
      showToast('error', err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTests = tests.filter((t) => {
    // Subject filter
    if (selectedSubject !== 'All' && t.subject !== selectedSubject) return false;

    // Type filter
    const isPrevYear = !t.isQuiz && !t.isRandom;
    const isPractice = t.isRandom && !t.isQuiz;
    if (filterType === 'prev-year' && !isPrevYear) return false;
    if (filterType === 'practice' && !isPractice) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = t.title.toLowerCase().includes(q);
      const matchesSubject = t.subject.toLowerCase().includes(q);
      if (!matchesTitle && !matchesSubject) return false;
    }

    return true;
  });

  return (
    <div className="admin-test-manager">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert">
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="controls-container">
        <div className="search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search tests by title or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')} type="button">
              ✕
            </button>
          )}
        </div>

        <div className="filter-group">
          <div className="type-pills">
            <button
              className={`type-pill ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
              type="button"
            >
              All Tests ({tests.length})
            </button>
            <button
              className={`type-pill ${filterType === 'prev-year' ? 'active' : ''}`}
              onClick={() => setFilterType('prev-year')}
              type="button"
            >
              📜 Prev Year ({tests.filter((t) => !t.isQuiz && !t.isRandom).length})
            </button>
            <button
              className={`type-pill ${filterType === 'practice' ? 'active' : ''}`}
              onClick={() => setFilterType('practice')}
              type="button"
            >
              🎯 Practice ({tests.filter((t) => t.isRandom && !t.isQuiz).length})
            </button>
          </div>
        </div>
      </div>

      {/* Subject Filter Pills */}
      <div className="subject-pills-bar">
        <button
          className={`subject-pill ${selectedSubject === 'All' ? 'active' : ''}`}
          onClick={() => setSelectedSubject('All')}
          type="button"
        >
          All Subjects
        </button>
        {SUBJECTS.map((subj) => (
          <button
            key={subj}
            className={`subject-pill ${selectedSubject === subj ? 'active' : ''}`}
            onClick={() => setSelectedSubject(subj)}
            type="button"
          >
            {SUBJECT_ICONS[subj]} {subj}
          </button>
        ))}
      </div>

      {/* Tests Table */}
      {isLoading ? (
        <div className="skeleton-container">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ height: '64px', marginBottom: '0.75rem', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-text">No test series found</p>
          <span className="empty-state-hint">Try adjusting your filters or search query</span>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="tests-table">
            <thead>
              <tr>
                <th>Test Title</th>
                <th>Subject</th>
                <th>Type</th>
                <th>Questions</th>
                <th>Duration</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.map((test) => {
                const isPrevYear = !test.isQuiz && !test.isRandom;
                const isPractice = test.isRandom && !test.isQuiz;
                const subjColor = SUBJECT_COLORS[test.subject] || '#6366f1';
                const qCount = test.isQuiz
                  ? 20
                  : test.isRandom
                  ? (test.randomQuestions?.length || 80)
                  : (test.endQuestion && test.startQuestion ? test.endQuestion - test.startQuestion + 1 : 150);

                return (
                  <tr key={test.id} className="test-row">
                    <td>
                      <div className="title-cell">
                        <span className="test-title-text">{test.title}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="subject-tag"
                        style={{
                          color: subjColor,
                          borderColor: `${subjColor}33`,
                          background: `${subjColor}15`,
                        }}
                      >
                        {SUBJECT_ICONS[test.subject]} {test.subject}
                      </span>
                    </td>
                    <td>
                      {isPrevYear ? (
                        <span className="badge badge-prev-year">Prev Year</span>
                      ) : isPractice ? (
                        <span className="badge badge-practice">Practice</span>
                      ) : (
                        <span className="badge badge-quiz">Speed Quiz</span>
                      )}
                    </td>
                    <td>
                      <span className="meta-text">📋 {qCount} Qs</span>
                    </td>
                    <td>
                      <span className="meta-text">
                        {isPrevYear ? '⏱️ 150m (2.5h)' : isPractice ? '⏱️ 80m' : '⏱️ 30s/Q'}
                      </span>
                    </td>
                    <td>
                      <span className="date-text">
                        {new Date(test.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn-action btn-rename"
                          onClick={() => handleOpenRename(test)}
                          title="Rename Test"
                          type="button"
                        >
                          ✏️ Rename
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(test)}
                          disabled={deletingId === test.id}
                          title="Delete Test"
                          type="button"
                        >
                          {deletingId === test.id ? 'Deleting...' : '🗑️ Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rename Modal */}
      {editingTest && (
        <div className="modal-backdrop" onClick={() => setEditingTest(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Rename Test Series</h3>
              <button className="modal-close-btn" onClick={() => setEditingTest(null)} type="button">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveRename}>
              <div className="modal-body">
                <label className="form-label" htmlFor="rename-input">
                  Test Display Title:
                </label>
                <input
                  id="rename-input"
                  type="text"
                  className="form-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter new test title"
                  autoFocus
                  required
                />
                <p className="modal-hint">
                  Subject: <strong>{editingTest.subject}</strong> • Type:{' '}
                  <strong>{!editingTest.isRandom && !editingTest.isQuiz ? 'Prev Year' : 'Practice'}</strong>
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEditingTest(null)}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                  {isUpdating ? 'Saving...' : 'Save Title'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-test-manager {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          animation: fadeInUp 0.4s ease;
        }

        .controls-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          padding: 0.5rem 0.85rem;
          flex: 1;
          min-width: 260px;
          color: var(--text-primary);
        }

        .search-bar input {
          background: none;
          border: none;
          outline: none;
          color: inherit;
          font-size: 0.92rem;
          width: 100%;
        }

        .clear-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.85rem;
        }

        .type-pills {
          display: flex;
          gap: 0.4rem;
          background: var(--bg-card);
          padding: 0.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }

        .type-pill {
          background: none;
          border: none;
          padding: 0.4rem 0.8rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .type-pill:hover {
          color: var(--text-primary);
        }

        .type-pill.active {
          background: var(--accent-gradient);
          color: #fff;
        }

        .subject-pills-bar {
          display: flex;
          gap: 0.4rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
          scrollbar-width: none;
        }

        .subject-pill {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          padding: 0.4rem 0.85rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .subject-pill:hover {
          border-color: var(--border-medium);
          color: var(--text-primary);
        }

        .subject-pill.active {
          border-color: var(--accent);
          background: rgba(99, 102, 241, 0.12);
          color: var(--accent);
        }

        /* Table */
        .table-wrapper {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          overflow-x: auto;
          box-shadow: var(--shadow-sm);
        }

        .tests-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.92rem;
        }

        .tests-table th {
          background: var(--bg-glass);
          padding: 0.85rem 1rem;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border-medium);
        }

        .test-row {
          border-bottom: 1px solid var(--border-subtle);
          transition: background 0.15s ease;
        }

        .test-row:last-child {
          border-bottom: none;
        }

        .test-row:hover {
          background: var(--bg-glass);
        }

        .test-row td {
          padding: 0.9rem 1rem;
          vertical-align: middle;
        }

        .test-title-text {
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.35;
        }

        .subject-tag {
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          border: 1px solid;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          white-space: nowrap;
        }

        .badge {
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-full);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .badge-prev-year {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.3);
        }

        .badge-practice {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .badge-quiz {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .meta-text {
          font-size: 0.85rem;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        .date-text {
          font-size: 0.8rem;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .actions-cell {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .btn-action {
          padding: 0.35rem 0.65rem;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s ease;
          border: 1px solid transparent;
        }

        .btn-rename {
          background: var(--bg-glass);
          color: var(--text-primary);
          border-color: var(--border-medium);
        }

        .btn-rename:hover {
          background: rgba(99, 102, 241, 0.12);
          border-color: var(--accent);
          color: var(--accent);
        }

        .btn-delete {
          background: rgba(239, 68, 68, 0.08);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.2);
        }

        .btn-delete:hover {
          background: rgba(239, 68, 68, 0.18);
          border-color: #ef4444;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-card {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          width: 100%;
          max-width: 500px;
          overflow: hidden;
          animation: scaleUp 0.2s ease;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .modal-close-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.1rem;
          cursor: pointer;
        }

        .modal-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .modal-hint {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin: 0;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-glass);
        }

        @keyframes scaleUp {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

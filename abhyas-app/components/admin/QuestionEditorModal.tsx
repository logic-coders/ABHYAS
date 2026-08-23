'use client';

import { useState, useEffect, useMemo } from 'react';
import { TestSeries, BilingualQuestion } from '@/lib/types';

interface QuestionEditorModalProps {
  test: TestSeries;
  onClose: () => void;
  onSaved?: () => void;
}

export default function QuestionEditorModal({ test, onClose, onSaved }: QuestionEditorModalProps) {
  const [questions, setQuestions] = useState<BilingualQuestion[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<BilingualQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLangTab, setActiveLangTab] = useState<'both' | 'en' | 'hi'>('both');

  // Track which questions have been modified
  const [modifiedIndices, setModifiedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchQuestions();
  }, [test.id]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tests/${test.id}/questions`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to load test questions');
      }
      const data = await res.json();
      const loaded: BilingualQuestion[] = data.test.questions || [];
      setQuestions(loaded);
      // Deep copy to track modifications
      setOriginalQuestions(JSON.parse(JSON.stringify(loaded)));
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const currentQ = questions[currentIndex] || null;

  // Handle question field update
  const handleUpdateCurrent = (updater: (prevQ: BilingualQuestion) => BilingualQuestion) => {
    if (!currentQ) return;
    setQuestions((prev) => {
      const updated = [...prev];
      updated[currentIndex] = updater(updated[currentIndex]);
      return updated;
    });

    setModifiedIndices((prev) => new Set(prev).add(currentIndex));
  };

  const handleTextChange = (lang: 'english' | 'hindi', value: string) => {
    handleUpdateCurrent((q) => ({
      ...q,
      [lang]: {
        ...q[lang],
        text: value,
      },
    }));
  };

  const handleOptionChange = (lang: 'english' | 'hindi', optIdx: number, value: string) => {
    handleUpdateCurrent((q) => {
      const opts = [...(q[lang]?.options || [])];
      opts[optIdx] = value;
      return {
        ...q,
        [lang]: {
          ...q[lang],
          options: opts,
        },
      };
    });
  };

  const handleCorrectAnswerChange = (ansLetter: string) => {
    handleUpdateCurrent((q) => ({
      ...q,
      correctAnswer: ansLetter.toUpperCase(),
    }));
  };

  const handleAddOption = () => {
    handleUpdateCurrent((q) => {
      const enOpts = [...(q.english?.options || []), `Option ${String.fromCharCode(65 + (q.english?.options?.length || 0))}`];
      const hiOpts = [...(q.hindi?.options || []), `विकल्प ${String.fromCharCode(65 + (q.hindi?.options?.length || 0))}`];
      return {
        ...q,
        english: { ...q.english, options: enOpts },
        hindi: { ...q.hindi, options: hiOpts },
      };
    });
  };

  const handleRemoveOption = (optIdx: number) => {
    handleUpdateCurrent((q) => {
      const enOpts = (q.english?.options || []).filter((_, i) => i !== optIdx);
      const hiOpts = (q.hindi?.options || []).filter((_, i) => i !== optIdx);
      return {
        ...q,
        english: { ...q.english, options: enOpts },
        hindi: { ...q.hindi, options: hiOpts },
      };
    });
  };

  const handleResetCurrentQuestion = () => {
    if (!originalQuestions[currentIndex]) return;
    setQuestions((prev) => {
      const updated = [...prev];
      updated[currentIndex] = JSON.parse(JSON.stringify(originalQuestions[currentIndex]));
      return updated;
    });
    setModifiedIndices((prev) => {
      const next = new Set(prev);
      next.delete(currentIndex);
      return next;
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tests/${test.id}/questions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save changes');
      }

      // Notify parent to display success toast & refresh test list, then close modal
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Save failed');
      setIsSaving(false);
    }
  };

  // Filter questions by search query
  const filteredIndices = useMemo(() => {
    if (!searchQuery.trim()) {
      return questions.map((_, idx) => idx);
    }
    const q = searchQuery.toLowerCase().trim();
    return questions
      .map((item, idx) => ({ item, idx }))
      .filter(({ item, idx }) => {
        const qNumMatch = String(item.number || idx + 1) === q || `q${item.number || idx + 1}` === q;
        const enMatch = item.english?.text?.toLowerCase().includes(q);
        const hiMatch = item.hindi?.text?.toLowerCase().includes(q);
        const ansMatch = item.correctAnswer?.toLowerCase() === q;
        return qNumMatch || enMatch || hiMatch || ansMatch;
      })
      .map(({ idx }) => idx);
  }, [questions, searchQuery]);

  const maxOptionsCount = useMemo(() => {
    if (!currentQ) return 4;
    return Math.max(
      currentQ.english?.options?.length || 4,
      currentQ.hindi?.options?.length || 4
    );
  }, [currentQ]);

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="question-editor-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-info">
            <div className="title-row">
              <span className="badge-subject">{test.subject}</span>
              <h2 className="test-title">Editing: {test.title}</h2>
            </div>
            <p className="subtitle">
              {questions.length} Questions &bull; Changes automatically update English, Hindi, and Answer Keys
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn-save-all"
              onClick={handleSaveAll}
              disabled={isSaving || isLoading}
            >
              {isSaving ? '💾 Saving...' : `💾 Save All Changes ${modifiedIndices.size > 0 ? `(${modifiedIndices.size})` : ''}`}
            </button>
            <button className="btn-close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        {saveStatus && <div className="status-banner success">{saveStatus}</div>}
        {error && <div className="status-banner error">❌ {error}</div>}

        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading questions for {test.title}...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="empty-state">
            <p>No questions found in this test.</p>
          </div>
        ) : (
          <div className="modal-body-layout">
            {/* Left Sidebar: Question Navigator */}
            <aside className="question-nav-sidebar">
              <div className="sidebar-search">
                <input
                  type="text"
                  placeholder="Search Q# or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="nav-grid">
                {filteredIndices.map((idx) => {
                  const q = questions[idx];
                  const isActive = idx === currentIndex;
                  const isModified = modifiedIndices.has(idx);
                  return (
                    <button
                      key={idx}
                      className={`nav-btn ${isActive ? 'active' : ''} ${isModified ? 'modified' : ''}`}
                      onClick={() => setCurrentIndex(idx)}
                      title={`Jump to Question ${q.number || idx + 1}`}
                    >
                      <span className="nav-q-num">Q{q.number || idx + 1}</span>
                      <span className="nav-ans-badge">{q.correctAnswer || '?'}</span>
                      {isModified && <span className="mod-dot" title="Unsaved edit" />}
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Main Editing Area */}
            <main className="question-editor-main">
              {currentQ && (
                <>
                  {/* Question Top Controls */}
                  <div className="q-editor-header">
                    <div className="q-title-badge">
                      <h3>Question {currentQ.number || currentIndex + 1} of {questions.length}</h3>
                      {modifiedIndices.has(currentIndex) && (
                        <span className="unsaved-tag">Unsaved Edits</span>
                      )}
                    </div>

                    <div className="lang-tabs">
                      <button
                        className={`tab-btn ${activeLangTab === 'both' ? 'active' : ''}`}
                        onClick={() => setActiveLangTab('both')}
                      >
                        🌐 Bilingual View
                      </button>
                      <button
                        className={`tab-btn ${activeLangTab === 'en' ? 'active' : ''}`}
                        onClick={() => setActiveLangTab('en')}
                      >
                        🇬🇧 English Only
                      </button>
                      <button
                        className={`tab-btn ${activeLangTab === 'hi' ? 'active' : ''}`}
                        onClick={() => setActiveLangTab('hi')}
                      >
                        🇮🇳 Hindi Only
                      </button>
                    </div>
                  </div>

                  {/* Statements Section */}
                  <div className={`statements-grid ${activeLangTab}`}>
                    {(activeLangTab === 'both' || activeLangTab === 'en') && (
                      <div className="field-box">
                        <label className="field-label">
                          <span className="flag">🇬🇧</span> English Question Statement
                        </label>
                        <textarea
                          rows={4}
                          value={currentQ.english?.text || ''}
                          onChange={(e) => handleTextChange('english', e.target.value)}
                          placeholder="Type or paste question in English..."
                          className="editor-textarea"
                        />
                      </div>
                    )}

                    {(activeLangTab === 'both' || activeLangTab === 'hi') && (
                      <div className="field-box">
                        <label className="field-label">
                          <span className="flag">🇮🇳</span> Hindi Question Statement (हिंदी प्रश्न)
                        </label>
                        <textarea
                          rows={4}
                          value={currentQ.hindi?.text || ''}
                          onChange={(e) => handleTextChange('hindi', e.target.value)}
                          placeholder="हिंदी में प्रश्न दर्ज करें..."
                          className="editor-textarea hindi-font"
                        />
                      </div>
                    )}
                  </div>

                  {/* Options Section */}
                  <div className="options-section">
                    <div className="options-header">
                      <h4>Answer Options</h4>
                      <div className="options-actions">
                        {maxOptionsCount < 6 && (
                          <button
                            type="button"
                            className="btn-add-opt"
                            onClick={handleAddOption}
                          >
                            + Add Option ({optionLetters[maxOptionsCount]})
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="options-list">
                      {Array.from({ length: maxOptionsCount }).map((_, optIdx) => {
                        const letter = optionLetters[optIdx] || `Opt ${optIdx + 1}`;
                        const isCorrect = (currentQ.correctAnswer || '').toUpperCase() === letter;
                        const enVal = currentQ.english?.options?.[optIdx] || '';
                        const hiVal = currentQ.hindi?.options?.[optIdx] || '';

                        return (
                          <div key={optIdx} className={`option-row ${isCorrect ? 'correct-row' : ''}`}>
                            <button
                              type="button"
                              className={`opt-letter-btn ${isCorrect ? 'is-correct' : ''}`}
                              onClick={() => handleCorrectAnswerChange(letter)}
                              title={`Set ${letter} as Correct Answer`}
                            >
                              <span className="letter-badge">{letter}</span>
                              {isCorrect ? <span className="check-icon">✓ Correct</span> : <span className="make-correct">Set Ans</span>}
                            </button>

                            <div className="opt-inputs">
                              {(activeLangTab === 'both' || activeLangTab === 'en') && (
                                <input
                                  type="text"
                                  placeholder={`English Option ${letter}...`}
                                  value={enVal}
                                  onChange={(e) => handleOptionChange('english', optIdx, e.target.value)}
                                  className="opt-input"
                                />
                              )}
                              {(activeLangTab === 'both' || activeLangTab === 'hi') && (
                                <input
                                  type="text"
                                  placeholder={`विकल्प ${letter} (हिंदी)...`}
                                  value={hiVal}
                                  onChange={(e) => handleOptionChange('hindi', optIdx, e.target.value)}
                                  className="opt-input hindi-font"
                                />
                              )}
                            </div>

                            {maxOptionsCount > 2 && (
                              <button
                                type="button"
                                className="btn-remove-opt"
                                onClick={() => handleRemoveOption(optIdx)}
                                title="Remove Option"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Correct Answer Bar */}
                  <div className="answer-selection-bar">
                    <span className="ans-label">Verified Correct Answer:</span>
                    <div className="ans-pills">
                      {Array.from({ length: maxOptionsCount }).map((_, optIdx) => {
                        const letter = optionLetters[optIdx];
                        const isSelected = (currentQ.correctAnswer || '').toUpperCase() === letter;
                        return (
                          <button
                            key={letter}
                            type="button"
                            className={`ans-pill ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleCorrectAnswerChange(letter)}
                          >
                            Option {letter}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Navigation & Reset Footer */}
                  <div className="q-footer">
                    <button
                      type="button"
                      className="btn-nav"
                      disabled={currentIndex === 0}
                      onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    >
                      ← Previous Question
                    </button>

                    <button
                      type="button"
                      className="btn-reset-q"
                      onClick={handleResetCurrentQuestion}
                      disabled={!modifiedIndices.has(currentIndex)}
                    >
                      ↺ Reset Question
                    </button>

                    <button
                      type="button"
                      className="btn-nav btn-next"
                      disabled={currentIndex === questions.length - 1}
                      onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    >
                      Next Question →
                    </button>
                  </div>
                </>
              )}
            </main>
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 2rem 1.5rem;
          animation: fadeIn 0.2s ease;
          overflow: hidden;
        }

        .question-editor-modal {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          width: 95vw;
          max-width: 1200px;
          height: 88vh;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
          overflow: hidden;
          position: relative;
          z-index: 100000;
        }

        /* Header */
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: rgba(30, 41, 59, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .badge-subject {
          background: #7c3aed;
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: 9999px;
          text-transform: uppercase;
        }

        .test-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #f8fafc;
          margin: 0;
        }

        .subtitle {
          font-size: 0.82rem;
          color: #94a3b8;
          margin: 0.25rem 0 0 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .btn-save-all {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 0.6rem 1.25rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
        }

        .btn-save-all:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
        }

        .btn-save-all:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-close {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        /* Status Banners */
        .status-banner {
          padding: 0.6rem 1.5rem;
          font-size: 0.88rem;
          font-weight: 600;
          text-align: center;
          flex-shrink: 0;
        }

        .status-banner.success {
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          border-bottom: 1px solid rgba(34, 197, 94, 0.3);
        }

        .status-banner.error {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          border-bottom: 1px solid rgba(239, 68, 68, 0.3);
        }

        /* Layout */
        .modal-body-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          grid-template-rows: minmax(0, 1fr);
          flex: 1;
          overflow: hidden;
          min-height: 0;
          height: 100%;
        }

        /* Sidebar */
        .question-nav-sidebar {
          background: rgba(15, 23, 42, 0.6);
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
          height: 100%;
        }

        .sidebar-search {
          padding: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        .search-input {
          width: 100%;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          color: #f8fafc;
          font-size: 0.82rem;
          outline: none;
        }

        .search-input:focus {
          border-color: #a855f7;
        }

        .nav-grid {
          padding: 0.75rem;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.4rem;
          min-height: 0;
          flex: 1;
          scrollbar-width: thin;
          scrollbar-color: rgba(168, 85, 247, 0.4) rgba(15, 23, 42, 0.4);
          -webkit-overflow-scrolling: touch;
        }

        .nav-btn {
          position: relative;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 0.4rem 0.2rem;
          color: #cbd5e1;
          font-size: 0.78rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.15rem;
          transition: all 0.15s ease;
        }

        .nav-btn:hover {
          background: rgba(51, 65, 85, 0.8);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .nav-btn.active {
          background: #7c3aed;
          color: white;
          border-color: #a855f7;
          font-weight: 700;
          box-shadow: 0 0 10px rgba(124, 58, 237, 0.4);
        }

        .nav-btn.modified {
          border-color: #f59e0b;
        }

        .nav-ans-badge {
          font-size: 0.68rem;
          font-weight: 700;
          opacity: 0.85;
        }

        .mod-dot {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: #f59e0b;
        }

        /* Main Editor */
        .question-editor-main {
          padding: 1.25rem 1.5rem 3.5rem 1.5rem;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          min-height: 0;
          height: 100%;
          max-height: 100%;
          scrollbar-width: thin;
          scrollbar-color: rgba(168, 85, 247, 0.5) rgba(15, 23, 42, 0.4);
          -webkit-overflow-scrolling: touch;
        }

        .question-editor-main::-webkit-scrollbar {
          width: 8px;
        }

        .question-editor-main::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 4px;
        }

        .question-editor-main::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
        }

        .q-editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 0.75rem;
          flex-shrink: 0;
        }

        .q-title-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .q-title-badge h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #f8fafc;
          font-weight: 700;
        }

        .unsaved-tag {
          font-size: 0.75rem;
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .lang-tabs {
          display: flex;
          gap: 0.3rem;
          background: rgba(30, 41, 59, 0.8);
          padding: 0.25rem;
          border-radius: 8px;
        }

        .tab-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .tab-btn.active {
          background: #3b82f6;
          color: white;
        }

        /* Statements Grid */
        .statements-grid {
          display: grid;
          gap: 1rem;
        }

        .statements-grid.both {
          grid-template-columns: 1fr 1fr;
        }

        .statements-grid.en, .statements-grid.hi {
          grid-template-columns: 1fr;
        }

        .field-box {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .field-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .editor-textarea {
          width: 100%;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 0.75rem;
          color: #f8fafc;
          font-size: 0.92rem;
          line-height: 1.5;
          outline: none;
          resize: vertical;
          transition: border-color 0.2s;
        }

        .editor-textarea:focus {
          border-color: #a855f7;
          background: rgba(15, 23, 42, 1);
        }

        .hindi-font {
          font-family: system-ui, -apple-system, 'Noto Sans Devanagari', sans-serif;
        }

        /* Options Section */
        .options-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .options-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .options-header h4 {
          margin: 0;
          font-size: 0.95rem;
          color: #e2e8f0;
          font-weight: 600;
        }

        .btn-add-opt {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.3rem 0.6rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-add-opt:hover {
          background: rgba(59, 130, 246, 0.25);
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .option-row {
          display: grid;
          grid-template-columns: 100px 1fr auto;
          gap: 0.75rem;
          align-items: center;
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          transition: all 0.2s;
        }

        .option-row.correct-row {
          border-color: rgba(34, 197, 94, 0.4);
          background: rgba(34, 197, 94, 0.08);
        }

        .opt-letter-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 0.4rem 0.6rem;
          cursor: pointer;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 700;
          transition: all 0.15s;
        }

        .opt-letter-btn.is-correct {
          background: #16a34a;
          color: white;
          border-color: #22c55e;
        }

        .letter-badge {
          font-size: 0.88rem;
        }

        .opt-inputs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
        }

        .opt-input {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 0.45rem 0.65rem;
          color: #f8fafc;
          font-size: 0.88rem;
          outline: none;
        }

        .opt-input:focus {
          border-color: #a855f7;
        }

        .btn-remove-opt {
          background: transparent;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.4rem;
          border-radius: 4px;
        }

        .btn-remove-opt:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        /* Answer Selection Bar */
        .answer-selection-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 0.75rem 1rem;
        }

        .ans-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #e2e8f0;
        }

        .ans-pills {
          display: flex;
          gap: 0.4rem;
        }

        .ans-pill {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          color: #cbd5e1;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .ans-pill.selected {
          background: #22c55e;
          color: white;
          border-color: #4ade80;
          box-shadow: 0 0 10px rgba(34, 197, 94, 0.4);
        }

        /* Footer */
        .q-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 1.25rem;
          margin-top: 1.25rem;
          flex-shrink: 0;
        }

        .btn-nav {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          color: #f8fafc;
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-nav:hover:not(:disabled) {
          background: rgba(51, 65, 85, 1);
        }

        .btn-nav.btn-next {
          background: #3b82f6;
          border-color: #60a5fa;
        }

        .btn-nav.btn-next:hover:not(:disabled) {
          background: #2563eb;
        }

        .btn-nav:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn-reset-q {
          background: transparent;
          border: 1px solid rgba(245, 158, 11, 0.4);
          color: #fbbf24;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 6px;
          padding: 0.4rem 0.8rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .btn-reset-q:hover:not(:disabled) {
          background: rgba(245, 158, 11, 0.15);
        }

        .btn-reset-q:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          color: #94a3b8;
          gap: 1rem;
        }

        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top-color: #a855f7;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 768px) {
          .modal-container {
            width: 100vw;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
          }
          .modal-body-layout {
            grid-template-columns: 1fr;
          }
          .question-nav-sidebar {
            max-height: 150px;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }
          .question-nav-grid {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            padding: 0.5rem;
          }
          .nav-btn {
            min-width: 44px;
            flex-shrink: 0;
          }
          .option-row {
            grid-template-columns: 1fr auto;
            gap: 0.5rem;
          }
          .opt-inputs {
            grid-column: 1 / -1;
          }
          .modal-footer {
            flex-direction: column;
            gap: 0.6rem;
          }
          .footer-left,
          .footer-right {
            width: 100%;
            justify-content: space-between;
          }
          .btn-save-all {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

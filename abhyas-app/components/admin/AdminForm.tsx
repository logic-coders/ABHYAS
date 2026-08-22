'use client';

import { useState } from 'react';
import { Subject, SUBJECTS, SUBJECT_ICONS, BilingualQuestion } from '@/lib/types';
import { MatchingSummary } from '@/lib/parsers/question-matcher';

type Step = 'upload' | 'review';

export default function AdminForm() {
  const [step, setStep] = useState<Step>('upload');

  // Metadata
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('Music');
  const [testType, setTestType] = useState<'prev-year' | 'practice' | 'quiz'>('prev-year');
  const [customDuration, setCustomDuration] = useState('150');

  // Files
  const [englishFile, setEnglishFile] = useState<File | null>(null);
  const [hindiFile, setHindiFile] = useState<File | null>(null);
  const [answerKeyFile, setAnswerKeyFile] = useState<File | null>(null);

  // Parsing & Verification state
  const [isParsing, setIsParsing] = useState(false);
  const [parseStepMessage, setParseStepMessage] = useState('Parsing files...');
  const [questions, setQuestions] = useState<BilingualQuestion[]>([]);
  const [summary, setSummary] = useState<MatchingSummary | null>(null);

  // Review filters & search
  const [filterMode, setFilterMode] = useState<'all' | 'issues' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Help modal
  const [showFormatHelp, setShowFormatHelp] = useState(false);

  // Toast alert
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Step 1: Parse and Verify ---
  const handleParseAndVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return showToast('error', 'Please enter a test title');
    if (!englishFile) return showToast('error', 'Please upload the English questions TXT file');
    if (!hindiFile) return showToast('error', 'Please upload the Hindi questions TXT file');

    setIsParsing(true);
    setParseStepMessage('Reading & parsing TXT files and answer key...');

    try {
      const formData = new FormData();
      formData.append('englishFile', englishFile);
      formData.append('hindiFile', hindiFile);
      if (answerKeyFile) {
        formData.append('answerKeyFile', answerKeyFile);
      }

      setParseStepMessage('Matching English-Hindi questions, validating answer key & AI verification...');

      const res = await fetch('/api/admin/parse-txt', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse TXT files');
      }

      const data = await res.json();
      setQuestions(data.questions);
      setSummary(data.summary);
      setStep('review');

      if (data.summary?.errorCount > 0) {
        showToast('warning', `Parsed ${data.questions.length} questions. Found ${data.summary.errorCount} issue(s) to review.`);
      } else {
        showToast('success', `Successfully verified ${data.questions.length} bilingual questions with answer key!`);
      }
    } catch (err) {
      console.error(err);
      showToast('error', err instanceof Error ? err.message : 'Parsing error occurred');
    } finally {
      setIsParsing(false);
    }
  };

  // --- Question Manipulation ---
  const handleUpdateEnglishText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].english.text = text;
    setQuestions(updated);
  };

  const handleUpdateHindiText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].hindi.text = text;
    setQuestions(updated);
  };

  const handleUpdateEnglishOption = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].english.options[optIdx] = text;
    setQuestions(updated);
  };

  const handleUpdateHindiOption = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...questions];
    updated[qIdx].hindi.options[optIdx] = text;
    setQuestions(updated);
  };

  const handleSetCorrectAnswer = (qIdx: number, ans: string) => {
    const updated = [...questions];
    updated[qIdx].correctAnswer = updated[qIdx].correctAnswer === ans ? undefined : ans;
    setQuestions(updated);
  };

  const handleAddOption = (qIdx: number) => {
    const updated = [...questions];
    if (updated[qIdx].english.options.length >= 5) {
      return showToast('warning', 'Maximum 5 options (a-e) supported per question');
    }
    updated[qIdx].english.options.push('');
    updated[qIdx].hindi.options.push('');
    setQuestions(updated);
  };

  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    if (updated[qIdx].english.options.length <= 2) {
      return showToast('warning', 'Minimum 2 options required');
    }
    updated[qIdx].english.options.splice(optIdx, 1);
    updated[qIdx].hindi.options.splice(optIdx, 1);
    setQuestions(updated);
  };

  const handleDeleteQuestion = (qIdx: number) => {
    if (questions.length <= 1) {
      return showToast('error', 'Test must have at least one question');
    }
    const confirm = window.confirm(`Are you sure you want to delete Question ${questions[qIdx].number}?`);
    if (!confirm) return;

    const updated = questions.filter((_, i) => i !== qIdx);
    const renumbered = updated.map((q, i) => ({ ...q, number: i + 1 }));
    setQuestions(renumbered);
  };

  const handleAddNewQuestion = () => {
    const newQ: BilingualQuestion = {
      number: questions.length + 1,
      english: {
        text: '',
        options: ['', '', '', '', ''],
      },
      hindi: {
        text: '',
        options: ['', '', '', '', ''],
      },
      correctAnswer: 'A',
      status: 'verified',
      issues: [],
    };
    setQuestions([...questions, newQ]);
  };

  // --- Step 2: Final Confirmation & Save ---
  const handleSaveTest = async () => {
    if (!title.trim()) return showToast('error', 'Test title is required');
    if (questions.length === 0) return showToast('error', 'No questions to save');

    // Basic validity check
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.english.text.trim()) {
        return showToast('error', `Question ${q.number}: English text is empty`);
      }
      if (!q.hindi.text.trim()) {
        return showToast('error', `Question ${q.number}: Hindi text is empty`);
      }
      if (q.english.options.length === 0 || q.hindi.options.length === 0) {
        return showToast('error', `Question ${q.number}: Options cannot be empty`);
      }
    }

    setIsSaving(true);
    try {
      const durationNum = parseInt(customDuration, 10) || 150;
      const isQuiz = testType === 'quiz';

      const res = await fetch('/api/admin/create-test-txt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          subject,
          testType: isQuiz ? 'practice' : testType,
          format: isQuiz ? 'quiz' : 'test',
          durationMinutes: durationNum,
          questions,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save test');
      }

      showToast('success', `🎉 Test "${title}" created and published with ${questions.length} bilingual questions & answer key!`);

      // Reset to initial
      setTimeout(() => {
        setStep('upload');
        setTitle('');
        setEnglishFile(null);
        setHindiFile(null);
        setAnswerKeyFile(null);
        setQuestions([]);
        setSummary(null);
        const enInput = document.getElementById('en-txt-upload') as HTMLInputElement;
        const hiInput = document.getElementById('hi-txt-upload') as HTMLInputElement;
        const ansInput = document.getElementById('ans-txt-upload') as HTMLInputElement;
        if (enInput) enInput.value = '';
        if (hiInput) hiInput.value = '';
        if (ansInput) ansInput.value = '';
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast('error', err instanceof Error ? err.message : 'Failed to save test');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter questions for review
  const filteredQuestions = questions.filter((q) => {
    // Filter mode
    if (filterMode === 'issues' && q.status === 'verified') return false;
    if (filterMode === 'verified' && q.status !== 'verified') return false;

    // Search query
    if (searchQuery.trim()) {
      const qNumMatch = String(q.number) === searchQuery.trim();
      const qEnMatch = q.english.text.toLowerCase().includes(searchQuery.toLowerCase());
      const qHiMatch = q.hindi.text.toLowerCase().includes(searchQuery.toLowerCase());
      if (!qNumMatch && !qEnMatch && !qHiMatch) return false;
    }

    return true;
  });

  const optionLetters = ['a', 'b', 'c', 'd', 'e'];

  return (
    <div className="admin-txt-container">
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert">
          {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'} {toast.message}
        </div>
      )}

      {/* Header Intro */}
      <div className="section-intro">
        <div className="intro-badge">⚡ Bilingual Question & Answer Key Importer</div>
        <h2 className="intro-title">TXT Test Creator with Answer Key</h2>
        <p className="intro-desc">
          Upload English Questions, Hindi Questions, and Answer Key <code>.txt</code> files for 100% exact text extraction, sequential matching, automated answer mapping, and AI verification.
        </p>
      </div>

      {/* ── STEP 1: UPLOAD & CONFIGURE ── */}
      {step === 'upload' && (
        <form className="upload-form" onSubmit={handleParseAndVerify}>
          {/* Metadata Grid */}
          <div className="form-row-grid">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="txt-test-title" className="form-label">
                Test Display Title *
              </label>
              <input
                id="txt-test-title"
                className="form-input"
                type="text"
                placeholder="e.g., 2024 UP Police Constable Official Paper"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Subject */}
            <div className="form-group">
              <label htmlFor="txt-test-subject" className="form-label">
                Subject (7 Subjects) *
              </label>
              <select
                id="txt-test-subject"
                className="form-select"
                value={subject}
                onChange={(e) => setSubject(e.target.value as Subject)}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {SUBJECT_ICONS[s]} {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-grid">
            {/* Test Type */}
            <div className="form-group">
              <label htmlFor="txt-test-type" className="form-label">
                Test Category & Format
              </label>
              <select
                id="txt-test-type"
                className="form-select"
                value={testType}
                onChange={(e) => {
                  const t = e.target.value as any;
                  setTestType(t);
                  if (t === 'prev-year') setCustomDuration('150');
                  else if (t === 'practice') setCustomDuration('80');
                  else setCustomDuration('10');
                }}
              >
                <option value="prev-year">📜 Previous Year Paper (Full Length — 150 Qs / 150 Mins)</option>
                <option value="practice">🎯 Practice Simulation (80 Mins)</option>
                <option value="quiz">⚡ Speed Quiz (30s per Question)</option>
              </select>
            </div>

            {/* Duration */}
            <div className="form-group">
              <label htmlFor="txt-test-duration" className="form-label">
                Duration (Minutes)
              </label>
              <input
                id="txt-test-duration"
                className="form-input"
                type="number"
                min="1"
                max="300"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                required
              />
            </div>
          </div>

          {/* TXT Files 3-Card Upload Grid */}
          <div className="upload-cards-grid-3">
            {/* English File Box */}
            <div className={`file-drop-box ${englishFile ? 'has-file' : ''}`}>
              <div className="drop-icon">🇬🇧</div>
              <div className="drop-title">English Questions TXT</div>
              <p className="drop-hint">Questions & options (a–e)</p>
              
              <input
                id="en-txt-upload"
                type="file"
                accept=".txt,text/plain"
                onChange={(e) => setEnglishFile(e.target.files?.[0] ?? null)}
                required
              />
              
              <label htmlFor="en-txt-upload" className="drop-action-btn">
                {englishFile ? `📄 ${englishFile.name} (${(englishFile.size / 1024).toFixed(1)} KB)` : 'Browse English .TXT'}
              </label>
            </div>

            {/* Hindi File Box */}
            <div className={`file-drop-box ${hindiFile ? 'has-file' : ''}`}>
              <div className="drop-icon">🇮🇳</div>
              <div className="drop-title">Hindi Questions TXT</div>
              <p className="drop-hint">Matching Hindi questions (a–e)</p>
              
              <input
                id="hi-txt-upload"
                type="file"
                accept=".txt,text/plain"
                onChange={(e) => setHindiFile(e.target.files?.[0] ?? null)}
                required
              />
              
              <label htmlFor="hi-txt-upload" className="drop-action-btn">
                {hindiFile ? `📄 ${hindiFile.name} (${(hindiFile.size / 1024).toFixed(1)} KB)` : 'Browse Hindi .TXT'}
              </label>
            </div>

            {/* Answer Key File Box */}
            <div className={`file-drop-box ${answerKeyFile ? 'has-file' : ''}`}>
              <div className="drop-icon">🔑</div>
              <div className="drop-title">Answer Key TXT</div>
              <p className="drop-hint">e.g., <code>1. A</code>, <code>2. C</code>, <code>3. D</code></p>
              
              <input
                id="ans-txt-upload"
                type="file"
                accept=".txt,text/plain"
                onChange={(e) => setAnswerKeyFile(e.target.files?.[0] ?? null)}
              />
              
              <label htmlFor="ans-txt-upload" className="drop-action-btn">
                {answerKeyFile ? `📄 ${answerKeyFile.name} (${(answerKeyFile.size / 1024).toFixed(1)} KB)` : 'Browse Answer Key .TXT'}
              </label>
            </div>
          </div>

          {/* Quick Format Help Bar */}
          <div className="format-bar">
            <span>💡 All 3 files are automatically synchronized by Question Number (1, 2, 3...)</span>
            <button
              type="button"
              className="btn-format-help"
              onClick={() => setShowFormatHelp(true)}
            >
              View 3-File Format Guide ↗
            </button>
          </div>

          {/* Action Button */}
          <button className="btn btn-primary btn-lg submit-parse-btn" type="submit" disabled={isParsing}>
            {isParsing ? (
              <div className="loading-state">
                <span className="spinner" />
                <span>{parseStepMessage}</span>
              </div>
            ) : (
              '⚡ Parse, Match & Verify All 3 Files'
            )}
          </button>
        </form>
      )}

      {/* ── STEP 2: REVIEW & MANUAL EDIT ── */}
      {step === 'review' && (
        <div className="review-container">
          {/* Summary Banner */}
          <div className="review-summary-banner">
            <div className="summary-info-col">
              <h3 className="summary-test-title">
                {SUBJECT_ICONS[subject]} {title}
              </h3>
              <p className="summary-test-meta">
                Subject: <strong>{subject}</strong> • Total Matched: <strong>{questions.length} Questions</strong> • Duration: <strong>{customDuration} Mins</strong>
              </p>
            </div>

            <div className="summary-badges-col">
              <span className="summary-pill pill-total">📋 {questions.length} Questions</span>
              {summary?.totalAnswers ? (
                <span className={`summary-pill ${summary.answerKeyStatus === 'valid' ? 'pill-ans-valid' : 'pill-warning'}`}>
                  🔑 {summary.totalAnswers} Answers Mapped {summary.answerKeyStatus === 'valid' ? '✅' : '⚠️'}
                </span>
              ) : null}
              <span className="summary-pill pill-verified">
                ✅ {summary?.verifiedCount ?? 0} Verified
              </span>
              {(summary?.warningCount ?? 0) > 0 && (
                <span className="summary-pill pill-warning">
                  ⚠️ {summary?.warningCount} Warnings
                </span>
              )}
              {(summary?.errorCount ?? 0) > 0 && (
                <span className="summary-pill pill-error">
                  ❌ {summary?.errorCount} Errors
                </span>
              )}
            </div>
          </div>

          {/* Global Warnings Alert if any */}
          {summary?.globalIssues && summary.globalIssues.length > 0 && (
            <div className="global-issues-box">
              <strong>⚠️ Verification & Answer Key Notices:</strong>
              <ul>
                {summary.globalIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Controls Bar: Search, Filters, Add */}
          <div className="review-controls-bar">
            <div className="controls-left">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  className="form-input review-search-input"
                  placeholder="Search Q# or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="clear-search-btn" onClick={() => setSearchQuery('')} type="button">
                    ✕
                  </button>
                )}
              </div>

              <div className="filter-buttons-group">
                <button
                  type="button"
                  className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterMode('all')}
                >
                  All ({questions.length})
                </button>
                <button
                  type="button"
                  className={`filter-btn ${filterMode === 'issues' ? 'active' : ''}`}
                  onClick={() => setFilterMode('issues')}
                >
                  Issues ({(summary?.warningCount ?? 0) + (summary?.errorCount ?? 0)})
                </button>
                <button
                  type="button"
                  className={`filter-btn ${filterMode === 'verified' ? 'active' : ''}`}
                  onClick={() => setFilterMode('verified')}
                >
                  Verified ({summary?.verifiedCount ?? 0})
                </button>
              </div>
            </div>

            <div className="controls-right">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setStep('upload')}
              >
                ← Back to Upload
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddNewQuestion}
              >
                + Add Question
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="questions-list-wrapper">
            {filteredQuestions.length === 0 ? (
              <div className="empty-filter-state">
                <p>No questions match the current filter or search criteria.</p>
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const qIdx = questions.findIndex((item) => item.number === q.number);
                if (qIdx === -1) return null;

                const maxOptions = Math.max(q.english.options.length, q.hindi.options.length, 4);

                return (
                  <div key={q.number} className={`question-edit-card status-${q.status || 'verified'}`}>
                    {/* Card Top Header */}
                    <div className="card-top-header">
                      <div className="card-top-left">
                        <span className="q-number-badge">Question {q.number}</span>
                        {q.status === 'verified' && (
                          <span className="status-badge verified">✅ Verified</span>
                        )}
                        {q.status === 'warning' && (
                          <span className="status-badge warning">⚠️ Warning</span>
                        )}
                        {q.status === 'error' && (
                          <span className="status-badge error">❌ Error</span>
                        )}
                      </div>

                      <div className="card-top-right">
                        {/* Correct Answer Selector */}
                        <div className="correct-ans-selector">
                          <span className="correct-ans-label">Correct Answer:</span>
                          <div className="ans-radio-pills">
                            {['A', 'B', 'C', 'D', 'E'].map((letter) => (
                              <button
                                key={letter}
                                type="button"
                                className={`ans-pill ${q.correctAnswer === letter ? 'selected' : ''}`}
                                onClick={() => handleSetCorrectAnswer(qIdx, letter)}
                              >
                                {letter}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          className="btn-delete-question"
                          onClick={() => handleDeleteQuestion(qIdx)}
                          title="Delete Question"
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </div>

                    {/* Issue Messages if any */}
                    {q.issues && q.issues.length > 0 && (
                      <div className="question-issues-alert">
                        {q.issues.map((iss, iIdx) => (
                          <span key={iIdx} className="issue-item">
                            • {iss}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Dual Column Editor: English vs Hindi */}
                    <div className="dual-editor-grid">
                      {/* English Column */}
                      <div className="lang-editor-col english-col">
                        <div className="lang-col-header">
                          <span>🇬🇧 English Question</span>
                        </div>
                        <textarea
                          className="form-textarea q-statement-input"
                          rows={3}
                          placeholder="English question statement..."
                          value={q.english.text}
                          onChange={(e) => handleUpdateEnglishText(qIdx, e.target.value)}
                        />

                        <div className="options-edit-list">
                          <div className="options-col-label">Options (a–e):</div>
                          {Array.from({ length: maxOptions }).map((_, optIdx) => {
                            const letter = optionLetters[optIdx] || `${optIdx + 1}`;
                            return (
                              <div key={optIdx} className="option-edit-row">
                                <span className={`opt-letter-tag ${q.correctAnswer === letter.toUpperCase() ? 'opt-tag-correct' : ''}`}>
                                  ({letter})
                                </span>
                                <input
                                  type="text"
                                  className={`form-input opt-text-input ${q.correctAnswer === letter.toUpperCase() ? 'opt-input-correct' : ''}`}
                                  placeholder={`English Option ${letter}...`}
                                  value={q.english.options[optIdx] || ''}
                                  onChange={(e) => handleUpdateEnglishOption(qIdx, optIdx, e.target.value)}
                                />
                                {optIdx >= 4 && (
                                  <button
                                    type="button"
                                    className="btn-remove-opt"
                                    onClick={() => handleRemoveOption(qIdx, optIdx)}
                                    title="Remove option"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Hindi Column */}
                      <div className="lang-editor-col hindi-col">
                        <div className="lang-col-header">
                          <span>🇮🇳 Hindi Question (हिंदी)</span>
                        </div>
                        <textarea
                          className="form-textarea q-statement-input hindi-font"
                          rows={3}
                          placeholder="हिंदी प्रश्न कथन..."
                          value={q.hindi.text}
                          onChange={(e) => handleUpdateHindiText(qIdx, e.target.value)}
                        />

                        <div className="options-edit-list">
                          <div className="options-col-label">विकल्प (a–e):</div>
                          {Array.from({ length: maxOptions }).map((_, optIdx) => {
                            const letter = optionLetters[optIdx] || `${optIdx + 1}`;
                            return (
                              <div key={optIdx} className="option-edit-row">
                                <span className={`opt-letter-tag ${q.correctAnswer === letter.toUpperCase() ? 'opt-tag-correct' : ''}`}>
                                  ({letter})
                                </span>
                                <input
                                  type="text"
                                  className={`form-input opt-text-input hindi-font ${q.correctAnswer === letter.toUpperCase() ? 'opt-input-correct' : ''}`}
                                  placeholder={`हिंदी विकल्प ${letter}...`}
                                  value={q.hindi.options[optIdx] || ''}
                                  onChange={(e) => handleUpdateHindiOption(qIdx, optIdx, e.target.value)}
                                />
                                {optIdx >= 4 && (
                                  <button
                                    type="button"
                                    className="btn-remove-opt"
                                    onClick={() => handleRemoveOption(qIdx, optIdx)}
                                    title="Remove option"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Add option */}
                    {maxOptions < 5 && (
                      <div className="card-actions-bar">
                        <button
                          type="button"
                          className="btn-add-opt-link"
                          onClick={() => handleAddOption(qIdx)}
                        >
                          + Add 5th Option (e)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Sticky Bottom Save Bar */}
          <div className="sticky-publish-bar">
            <div className="publish-meta-text">
              Ready to publish <strong>{questions.length} Questions</strong> to <strong>{subject}</strong> ({testType.toUpperCase()})
            </div>
            <button
              type="button"
              className="btn btn-primary btn-lg btn-publish-final"
              onClick={handleSaveTest}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner" /> Saving & Publishing Test...
                </>
              ) : (
                '🚀 Confirm & Publish Test Series'
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── FORMAT HELP MODAL ── */}
      {showFormatHelp && (
        <div className="modal-backdrop" onClick={() => setShowFormatHelp(false)}>
          <div className="modal-card format-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📄 TXT 3-File Format Guide</h3>
              <button className="modal-close-btn" onClick={() => setShowFormatHelp(false)} type="button">
                ✕
              </button>
            </div>
            <div className="modal-body format-modal-body">
              <p>Upload 3 separate <code>.txt</code> files containing matching questions and answer keys:</p>
              
              <div className="format-example-grid-3">
                <div className="format-col">
                  <h4>1. English (.txt)</h4>
                  <pre>{`1. What is the capital of India?

(a) Mumbai
(b) New Delhi
(c) Kolkata
(d) Chennai
(e) None of the above

2. Which planet is the Red Planet?

(a) Venus
(b) Mars
(c) Jupiter
(d) Saturn`}</pre>
                </div>

                <div className="format-col">
                  <h4>2. Hindi (.txt)</h4>
                  <pre>{`1. भारत की राजधानी क्या है?

(a) मुंबई
(b) नई दिल्ली
(c) कोलकाता
(d) चेन्नई
(e) उपर्युक्त में से कोई नहीं

2. किस ग्रह को लाल ग्रह कहते हैं?

(a) शुक्र
(b) मंगल
(c) बृहस्पति
(d) शनि`}</pre>
                </div>

                <div className="format-col">
                  <h4>3. Answer Key (.txt)</h4>
                  <pre>{`1. B
2. B
3. A
4. C
5. D
6. E
7. A
8. C`}</pre>
                </div>
              </div>
              
              <div className="format-rules-list">
                <strong>Key Guidelines:</strong>
                <ul>
                  <li><strong>Answer Key Format:</strong> <code>1. B</code>, <code>2. A</code>, <code>3. D</code> (One line per question number and option letter).</li>
                  <li><strong>Questions Format:</strong> <code>1. Statement</code> followed by <code>(a) Option</code> to <code>(e) Option</code>.</li>
                  <li><strong>Automatic Validation:</strong> The system automatically verifies that every question has a valid answer in the Answer Key matching the available options (A–E).</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setShowFormatHelp(false)}>
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-txt-container {
          animation: fadeInUp 0.4s ease;
        }

        .intro-badge {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--accent-light);
          background: rgba(124, 58, 237, 0.12);
          border: 1px solid rgba(124, 58, 237, 0.3);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.5rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .intro-title {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.35rem;
          color: var(--text-primary);
        }

        .intro-desc {
          color: var(--text-secondary);
          font-size: 0.92rem;
          line-height: 1.55;
          margin-bottom: 1.75rem;
          max-width: 780px;
        }

        .intro-desc code {
          background: var(--bg-card);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          border: 1px solid var(--border-subtle);
          color: var(--accent-light);
        }

        /* Upload Form */
        .upload-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 860px;
        }

        .form-row-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .upload-cards-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }

        .file-drop-box {
          background: var(--bg-card);
          border: 2px dashed var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.75rem 1.25rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.25s ease;
          position: relative;
        }

        .file-drop-box:hover {
          border-color: var(--accent);
          background: rgba(124, 58, 237, 0.04);
        }

        .file-drop-box.has-file {
          border-color: #10b981;
          border-style: solid;
          background: rgba(16, 185, 129, 0.04);
        }

        .drop-icon {
          font-size: 2rem;
          margin-bottom: 0.4rem;
        }

        .drop-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .drop-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .file-drop-box input[type='file'] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .drop-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--bg-glass);
          border: 1px solid var(--border-medium);
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
          pointer-events: none;
          max-width: 95%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .format-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--text-secondary);
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .btn-format-help {
          background: none;
          border: none;
          color: var(--accent-light);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0;
        }

        .btn-format-help:hover {
          text-decoration: underline;
        }

        .submit-parse-btn {
          margin-top: 0.5rem;
          padding: 0.95rem;
          font-size: 1.05rem;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        /* ── Review Mode ── */
        .review-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .review-summary-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .summary-test-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .summary-test-meta {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
        }

        .summary-test-meta strong {
          color: var(--text-primary);
        }

        .summary-badges-col {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .summary-pill {
          font-size: 0.82rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          border: 1px solid;
        }

        .pill-total {
          background: var(--bg-glass);
          border-color: var(--border-medium);
          color: var(--text-primary);
        }

        .pill-ans-valid {
          background: rgba(139, 92, 246, 0.12);
          border-color: rgba(139, 92, 246, 0.3);
          color: #a78bfa;
        }

        .pill-verified {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.3);
          color: #34d399;
        }

        .pill-warning {
          background: rgba(245, 158, 11, 0.12);
          border-color: rgba(245, 158, 11, 0.3);
          color: #fbbf24;
        }

        .pill-error {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.3);
          color: #f87171;
        }

        .global-issues-box {
          background: rgba(245, 158, 11, 0.08);
          border-left: 3px solid #f59e0b;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          padding: 0.85rem 1.25rem;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .global-issues-box ul {
          margin: 0.35rem 0 0 1.25rem;
          padding: 0;
        }

        /* Review Controls */
        .review-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .controls-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          flex: 1;
        }

        .search-input-wrapper {
          position: relative;
          min-width: 220px;
        }

        .review-search-input {
          padding: 0.45rem 0.8rem;
          font-size: 0.88rem;
        }

        .clear-search-btn {
          position: absolute;
          right: 0.6rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .filter-buttons-group {
          display: flex;
          gap: 0.35rem;
          background: var(--bg-card);
          padding: 0.25rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
        }

        .filter-btn {
          background: none;
          border: none;
          padding: 0.35rem 0.75rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn.active {
          background: var(--accent-gradient);
          color: #fff;
        }

        .controls-right {
          display: flex;
          gap: 0.5rem;
        }

        /* Questions List */
        .questions-list-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .question-edit-card {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          transition: all 0.2s ease;
        }

        .question-edit-card.status-warning {
          border-color: rgba(245, 158, 11, 0.4);
        }

        .question-edit-card.status-error {
          border-color: rgba(239, 68, 68, 0.5);
          background: rgba(239, 68, 68, 0.02);
        }

        .card-top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .card-top-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .q-number-badge {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--accent-light);
          background: rgba(124, 58, 237, 0.12);
          padding: 0.3rem 0.75rem;
          border-radius: var(--radius-full);
        }

        .status-badge {
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
        }

        .status-badge.verified {
          color: #34d399;
          background: rgba(16, 185, 129, 0.1);
        }

        .status-badge.warning {
          color: #fbbf24;
          background: rgba(245, 158, 11, 0.1);
        }

        .status-badge.error {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .card-top-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .correct-ans-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .correct-ans-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .ans-radio-pills {
          display: flex;
          gap: 0.25rem;
        }

        .ans-pill {
          background: var(--bg-glass);
          border: 1px solid var(--border-subtle);
          padding: 0.25rem 0.6rem;
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .ans-pill.selected {
          background: #10b981;
          color: #fff;
          border-color: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
        }

        .btn-delete-question {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .btn-delete-question:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .question-issues-alert {
          background: rgba(239, 68, 68, 0.08);
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.85rem;
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .issue-item {
          font-size: 0.82rem;
          color: #ef4444;
          font-weight: 600;
        }

        /* Dual Editor */
        .dual-editor-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .lang-editor-col {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .lang-col-header {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .q-statement-input {
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .hindi-font {
          font-family: inherit;
          line-height: 1.6;
        }

        .options-edit-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .options-col-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .option-edit-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .opt-letter-tag {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-muted);
          width: 24px;
          text-align: right;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .opt-tag-correct {
          color: #10b981;
          font-weight: 900;
        }

        .opt-text-input {
          padding: 0.45rem 0.75rem;
          font-size: 0.9rem;
          flex: 1;
        }

        .opt-input-correct {
          border-color: rgba(16, 185, 129, 0.4);
          background: rgba(16, 185, 129, 0.03);
        }

        .btn-remove-opt {
          background: none;
          border: none;
          color: #ef4444;
          font-size: 0.8rem;
          cursor: pointer;
          padding: 0.2rem;
        }

        .card-actions-bar {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px dashed var(--border-subtle);
        }

        .btn-add-opt-link {
          background: none;
          border: none;
          color: var(--accent-light);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }

        .btn-add-opt-link:hover {
          text-decoration: underline;
        }

        /* Sticky Save Bar */
        .sticky-publish-bar {
          position: sticky;
          bottom: 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-xl);
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.4);
          z-index: 100;
          backdrop-filter: blur(12px);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .publish-meta-text {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .publish-meta-text strong {
          color: var(--text-primary);
        }

        .btn-publish-final {
          padding: 0.75rem 1.75rem;
          font-size: 1rem;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .format-modal {
          max-width: 820px;
        }

        .format-modal-body {
          max-height: 70vh;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .format-example-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0.85rem;
        }

        .format-col h4 {
          font-size: 0.88rem;
          margin-bottom: 0.4rem;
          color: var(--accent-light);
        }

        .format-col pre {
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          font-size: 0.75rem;
          color: var(--text-primary);
          overflow-x: auto;
          line-height: 1.45;
          margin: 0;
        }

        .format-rules-list {
          background: var(--bg-glass);
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .format-rules-list ul {
          margin: 0.4rem 0 0 1.25rem;
          padding: 0;
        }

        @media (max-width: 768px) {
          .form-row-grid,
          .dual-editor-grid,
          .format-example-grid-3 {
            grid-template-columns: 1fr;
          }
          .sticky-publish-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .btn-publish-final {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

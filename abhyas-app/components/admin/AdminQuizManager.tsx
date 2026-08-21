'use client';

import { useState } from 'react';
import { Subject, SUBJECTS, SUBJECT_ICONS, ManualQuestion } from '@/lib/types';
import { CURATED_STREAK_QUESTIONS } from '@/lib/streak-pool';

export default function AdminQuizManager() {
  const [method, setMethod] = useState<'random-practice' | 'manual' | 'pdf'>('random-practice');

  // --- Random Practice Test State ---
  const [randomSubject, setRandomSubject] = useState<Subject>('Music');
  const [isGeneratingPractice, setIsGeneratingPractice] = useState(false);

  // --- PDF Method State ---
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfSubject, setPdfSubject] = useState<Subject>('Music');
  const [pdfStartQ, setPdfStartQ] = useState('1');
  const [pdfEndQ, setPdfEndQ] = useState('20');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  // --- Manual Method State ---
  const [manualTitle, setManualTitle] = useState('');
  const [manualSubject, setManualSubject] = useState<Subject>('Music');
  const [manualQuestions, setManualQuestions] = useState<ManualQuestion[]>([
    {
      number: 1,
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 'A',
    },
  ]);
  const [isManualLoading, setIsManualLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // --- Handle Random Practice Test Generation ---
  const handleGenerateRandomPractice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingPractice(true);
    try {
      const res = await fetch('/api/admin/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: randomSubject }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate practice test');
      }

      const data = await res.json();
      showToast('success', `Practice test "${data.title}" (80 Questions) generated and published to Practice page!`);
    } catch (err) {
      console.error(err);
      showToast('error', err instanceof Error ? err.message : 'Failed to generate practice test');
    } finally {
      setIsGeneratingPractice(false);
    }
  };

  // --- Handle PDF Submission ---
  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfTitle.trim()) return showToast('error', 'Quiz title is required');
    if (!pdfFile) return showToast('error', 'Please upload a PDF file');
    if (!pdfStartQ || !pdfEndQ) return showToast('error', 'Question range is required');
    if (Number(pdfStartQ) >= Number(pdfEndQ)) {
      return showToast('error', 'Start question must be less than end question');
    }

    setIsPdfLoading(true);

    try {
      // Step 1: Upload PDF to S3
      const formData = new FormData();
      formData.append('file', pdfFile);

      const uploadRes = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Failed to upload PDF');
      }

      const { s3Key } = await uploadRes.json();

      // Step 2: Create Speed Quiz series
      const createRes = await fetch('/api/test-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: pdfTitle.trim(),
          subject: pdfSubject,
          s3Key,
          startQuestion: Number(pdfStartQ),
          endQuestion: Number(pdfEndQ),
          format: 'quiz',
          isQuiz: true,
          durationPerQuestion: 30,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error || 'Failed to create speed quiz');
      }

      showToast('success', `Speed Quiz "${pdfTitle}" created successfully from PDF!`);

      // Reset
      setPdfTitle('');
      setPdfStartQ('1');
      setPdfEndQ('20');
      setPdfFile(null);
      const fileInput = document.getElementById('quiz-pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error(err);
      showToast('error', err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsPdfLoading(false);
    }
  };

  // --- Handle Manual Question Actions ---
  const addQuestion = () => {
    if (manualQuestions.length >= 20) {
      return showToast('error', 'A speed quiz is capped at 20 questions');
    }
    setManualQuestions([
      ...manualQuestions,
      {
        number: manualQuestions.length + 1,
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 'A',
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (manualQuestions.length <= 1) {
      return showToast('error', 'Must have at least one question');
    }
    const updated = manualQuestions.filter((_, i) => i !== index);
    const renumbered = updated.map((q, i) => ({ ...q, number: i + 1 }));
    setManualQuestions(renumbered);
  };

  const updateQuestionText = (index: number, text: string) => {
    const updated = [...manualQuestions];
    updated[index].text = text;
    setManualQuestions(updated);
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].options[optIndex] = text;
    setManualQuestions(updated);
  };

  const updateCorrectAnswer = (qIndex: number, ans: string) => {
    const updated = [...manualQuestions];
    updated[qIndex].correctAnswer = ans;
    setManualQuestions(updated);
  };

  const handleFillSample = () => {
    const sample = CURATED_STREAK_QUESTIONS[manualSubject] || CURATED_STREAK_QUESTIONS.Music;
    const formatted = sample.map((q, idx) => ({
      number: idx + 1,
      text: q.text,
      options: q.options.map((opt) => opt.replace(/^[A-E]\.\s*/, '')),
      correctAnswer: q.correctAnswer,
    }));
    setManualQuestions(formatted);
    if (!manualTitle) {
      setManualTitle(`${manualSubject} 20-Question Challenge`);
    }
    showToast('success', `Loaded 20 sample questions for ${manualSubject}!`);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!manualTitle.trim()) return showToast('error', 'Quiz title is required');
    if (manualQuestions.length === 0) return showToast('error', 'Add at least 1 question');

    // Format options to standard "A. ...", "B. ..."
    const formattedQuestions = manualQuestions.map((q, idx) => {
      const letters = ['A', 'B', 'C', 'D'];
      const formattedOptions = q.options.map((opt, oIdx) => {
        const clean = opt.replace(/^[A-E]\.\s*/, '').trim();
        return `${letters[oIdx]}. ${clean}`;
      });
      return {
        number: idx + 1,
        text: q.text.trim(),
        options: formattedOptions,
        correctAnswer: q.correctAnswer,
      };
    });

    // Validate
    for (let i = 0; i < formattedQuestions.length; i++) {
      const q = formattedQuestions[i];
      if (!q.text) return showToast('error', `Question ${i + 1} text cannot be empty`);
      for (let j = 0; j < q.options.length; j++) {
        if (!manualQuestions[i].options[j].trim()) {
          return showToast('error', `Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is empty`);
        }
      }
    }

    setIsManualLoading(true);

    try {
      const res = await fetch('/api/admin/create-quiz-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: manualTitle.trim(),
          subject: manualSubject,
          questions: formattedQuestions,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create quiz');
      }

      showToast('success', `Manual Speed Quiz "${manualTitle}" created with ${formattedQuestions.length} questions!`);

      // Reset form
      setManualTitle('');
      setManualQuestions([
        {
          number: 1,
          text: '',
          options: ['', '', '', ''],
          correctAnswer: 'A',
        },
      ]);
    } catch (err) {
      console.error(err);
      showToast('error', err instanceof Error ? err.message : 'Failed to create manual quiz');
    } finally {
      setIsManualLoading(false);
    }
  };

  return (
    <div className="quiz-manager">
      {/* Sub Method Toggle */}
      <div className="method-toggle-container">
        <button
          type="button"
          className={`method-btn ${method === 'random-practice' ? 'active' : ''}`}
          onClick={() => setMethod('random-practice')}
        >
          🎯 Generate Practice Test
        </button>
        <button
          type="button"
          className={`method-btn ${method === 'manual' ? 'active' : ''}`}
          onClick={() => setMethod('manual')}
        >
          ✍️ Manual Quiz Builder
        </button>
        <button
          type="button"
          className={`method-btn ${method === 'pdf' ? 'active' : ''}`}
          onClick={() => setMethod('pdf')}
        >
          📄 Upload PDF Speed Quiz
        </button>
      </div>

      {/* ── METHOD 0: RANDOM PRACTICE TEST GENERATION ── */}
      {method === 'random-practice' && (
        <form className="admin-form" onSubmit={handleGenerateRandomPractice}>
          <div className="form-info-box">
            <p>
              <strong>Generate Full Practice Test:</strong> Randomly selects 80 questions from previously uploaded papers for the selected subject. The test is auto-named as <code>&#123;Subject&#125; Practice Test - S.N</code> and published directly to the <strong>Practice</strong> page with an 80-minute simulation timer.
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="practice-subject" className="form-label">
              Select Subject (7 Subjects)
            </label>
            <select
              id="practice-subject"
              className="form-select"
              value={randomSubject}
              onChange={(e) => setRandomSubject(e.target.value as Subject)}
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {SUBJECT_ICONS[s]} {s}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={isGeneratingPractice}>
            {isGeneratingPractice ? (
              <>
                <span className="spinner" /> Generating 80-Question Practice Test...
              </>
            ) : (
              'Generate & Publish Practice Test'
            )}
          </button>
        </form>
      )}

      {/* ── METHOD 1: PDF UPLOAD ── */}
      {method === 'pdf' && (
        <form className="admin-form" onSubmit={handlePdfSubmit}>
          <div className="form-info-box">
            <p>
              Upload a PDF containing questions and specify a 20-question range. The quiz will run in speed format (30 seconds per question).
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="pdf-quiz-title" className="form-label">
              Speed Quiz Title
            </label>
            <input
              id="pdf-quiz-title"
              className="form-input"
              type="text"
              placeholder="e.g., Music Fast Track — Quiz 1"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="pdf-quiz-subject" className="form-label">
              Subject
            </label>
            <select
              id="pdf-quiz-subject"
              className="form-select"
              value={pdfSubject}
              onChange={(e) => setPdfSubject(e.target.value as Subject)}
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {SUBJECT_ICONS[s]} {s}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Upload PDF</label>
            <div className="file-input-wrapper">
              <input
                id="quiz-pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                required
              />
              <div className="file-input-label">
                {pdfFile ? (
                  <span>
                    📄 <span>{pdfFile.name}</span> ({(pdfFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                ) : (
                  <span>
                    Drop your PDF here or <span>browse</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="range-group">
            <div className="form-group">
              <label htmlFor="pdf-start-q" className="form-label">
                Start Question No.
              </label>
              <input
                id="pdf-start-q"
                className="form-input"
                type="number"
                min="1"
                placeholder="1"
                value={pdfStartQ}
                onChange={(e) => setPdfStartQ(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="pdf-end-q" className="form-label">
                End Question No.
              </label>
              <input
                id="pdf-end-q"
                className="form-input"
                type="number"
                min="1"
                placeholder="20"
                value={pdfEndQ}
                onChange={(e) => setPdfEndQ(e.target.value)}
                required
              />
            </div>
          </div>

          {pdfStartQ && pdfEndQ && Number(pdfEndQ) > Number(pdfStartQ) && (
            <p className="range-info">
              ⚡ This speed quiz will have <strong>{Number(pdfEndQ) - Number(pdfStartQ) + 1}</strong> questions (30 seconds per question).
            </p>
          )}

          <button className="btn btn-primary btn-lg" type="submit" disabled={isPdfLoading}>
            {isPdfLoading ? (
              <>
                <span className="spinner" /> Creating Speed Quiz...
              </>
            ) : (
              'Create Speed Quiz (PDF)'
            )}
          </button>
        </form>
      )}

      {/* ── METHOD 2: MANUAL ENTRY BUILDER ── */}
      {method === 'manual' && (
        <form className="manual-form" onSubmit={handleManualSubmit}>
          <div className="form-info-box">
            <p>
              Directly type in each question, options (A–D), and mark the correct answer. No PDF required.
            </p>
          </div>

          <div className="header-inputs-grid">
            <div className="form-group">
              <label htmlFor="manual-quiz-title" className="form-label">
                Quiz Title
              </label>
              <input
                id="manual-quiz-title"
                className="form-input"
                type="text"
                placeholder="e.g., World Geography Speed Blitz"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="manual-quiz-subject" className="form-label">
                Subject
              </label>
              <select
                id="manual-quiz-subject"
                className="form-select"
                value={manualSubject}
                onChange={(e) => setManualSubject(e.target.value as Subject)}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {SUBJECT_ICONS[s]} {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="builder-controls">
            <div className="controls-summary">
              <strong>{manualQuestions.length} / 20</strong> Questions Configured
            </div>
            <div className="controls-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleFillSample}
              >
                ⚡ Fill 20 Sample Questions
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={addQuestion}
                disabled={manualQuestions.length >= 20}
              >
                + Add Question
              </button>
            </div>
          </div>

          {/* Question Cards List */}
          <div className="questions-container">
            {manualQuestions.map((q, qIdx) => (
              <div key={qIdx} className="question-card">
                <div className="question-card-header">
                  <span className="q-badge">Question {qIdx + 1}</span>
                  {manualQuestions.length > 1 && (
                    <button
                      type="button"
                      className="btn-delete-q"
                      onClick={() => removeQuestion(qIdx)}
                      title="Remove question"
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                {/* Question Text */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label-sub">Question Statement</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder={`Type question ${qIdx + 1} here...`}
                    value={q.text}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    required
                  />
                </div>

                {/* Options Grid */}
                <div className="options-grid">
                  {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                    <div key={letter} className="option-field">
                      <div className="option-label-wrapper">
                        <span className="opt-letter">{letter}</span>
                        <label className="correct-radio-label">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctAnswer === letter}
                            onChange={() => updateCorrectAnswer(qIdx, letter)}
                          />
                          <span>Correct</span>
                        </label>
                      </div>
                      <input
                        className={`form-input opt-input ${q.correctAnswer === letter ? 'opt-correct' : ''}`}
                        type="text"
                        placeholder={`Option ${letter}`}
                        value={q.options[optIdx] || ''}
                        onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit bar */}
          <div className="submit-bar">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={addQuestion}
              disabled={manualQuestions.length >= 20}
            >
              + Add Another Question ({manualQuestions.length}/20)
            </button>
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={isManualLoading || manualQuestions.length === 0}
            >
              {isManualLoading ? (
                <>
                  <span className="spinner" /> Saving Manual Quiz...
                </>
              ) : (
                `Publish Speed Quiz (${manualQuestions.length} Questions)`
              )}
            </button>
          </div>
        </form>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert">
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      <style jsx>{`
        .quiz-manager {
          animation: fadeInUp 0.4s ease;
        }

        .method-toggle-container {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          background: var(--bg-card);
          padding: 0.4rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
          max-width: 600px;
        }

        .method-btn {
          flex: 1;
          background: transparent;
          border: none;
          padding: 0.65rem 1rem;
          font-size: 0.92rem;
          font-weight: 700;
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .method-btn:hover {
          color: var(--text-primary);
        }

        .method-btn.active {
          background: var(--accent-gradient);
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }

        .form-info-box {
          background: rgba(124, 58, 237, 0.08);
          border-left: 3px solid var(--accent-light);
          padding: 0.85rem 1.1rem;
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
          max-width: 780px;
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 600px;
        }

        .manual-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 780px;
        }

        .header-inputs-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1rem;
        }

        .range-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .range-info {
          font-size: 0.88rem;
          color: var(--text-secondary);
          padding: 0.6rem 0.85rem;
          background: var(--bg-glass);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .range-info strong {
          color: var(--accent-light);
        }

        /* ── Builder Controls ── */
        .builder-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
        }

        .controls-summary {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }

        .controls-summary strong {
          color: var(--accent-light);
          font-size: 1.1rem;
        }

        .controls-actions {
          display: flex;
          gap: 0.6rem;
        }

        /* ── Questions List ── */
        .questions-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .question-card {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          transition: border-color 0.2s ease;
        }

        .question-card:hover {
          border-color: rgba(124, 58, 237, 0.4);
        }

        .question-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.85rem;
        }

        .q-badge {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--accent-light);
          background: rgba(124, 58, 237, 0.12);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
        }

        .btn-delete-q {
          background: transparent;
          border: none;
          color: #ef4444;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
        }

        .btn-delete-q:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .form-label-sub {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 0.35rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
          background: var(--bg-input);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.95rem;
          resize: vertical;
        }

        .form-textarea:focus {
          outline: none;
          border-color: var(--accent-light);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.2);
        }

        /* Options Grid */
        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        .option-field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .option-label-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .opt-letter {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-muted);
        }

        .correct-radio-label {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .correct-radio-label input {
          cursor: pointer;
          accent-color: #10b981;
        }

        .opt-input.opt-correct {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        /* Submit Bar */
        .submit-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }

        @media (max-width: 600px) {
          .header-inputs-grid,
          .options-grid,
          .submit-bar {
            grid-template-columns: 1fr;
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

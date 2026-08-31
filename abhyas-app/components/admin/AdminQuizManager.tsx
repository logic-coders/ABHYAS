'use client';

import { useState } from 'react';
import { Subject, PRACTICE_SUBJECTS, SUBJECT_ICONS, BilingualQuestion } from '@/lib/types';

type GenerateStep = 'idle' | 'generating' | 'reviewing' | 'publishing' | 'done';
type EditingField = 'en-text' | 'hi-text' | 'correct';

export default function AdminQuizManager() {
  const [selectedSubject, setSelectedSubject] = useState<Subject>('Music');
  const [step, setStep] = useState<GenerateStep>('idle');
  const [genProgress, setGenProgress] = useState('');
  const [previewQuestions, setPreviewQuestions] = useState<BilingualQuestion[]>([]);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [publishedTitle, setPublishedTitle] = useState('');

  const showToast = (type: 'success' | 'error' | 'warning', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  };

  // ── Generation ──
  const handleGenerate = async () => {
    setStep('generating');
    setPreviewQuestions([]);
    setExpandedQ(null);

    try {
      setGenProgress('🔗 Connecting to Gemini AI...');
      await delay(600);

      setGenProgress('📝 Generating 80 STET/BPSC TRE-level questions in English...');
      const res = await fetch('/api/admin/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: selectedSubject }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed');
      }

      setGenProgress('🌐 Translating questions to Hindi...');
      const data = await res.json();
      const questions: BilingualQuestion[] = data.questions;

      setGenProgress(`✅ Ready! ${questions.length} bilingual questions generated.`);
      await delay(500);

      setPreviewQuestions(questions);
      setStep('reviewing');
    } catch (err) {
      console.error(err);
      showToast('error', err instanceof Error ? err.message : 'AI generation failed. Please try again.');
      setStep('idle');
    }
  };

  // ── Editing helpers ──
  const updateEnglishText = (idx: number, text: string) => {
    const updated = [...previewQuestions];
    updated[idx] = { ...updated[idx], english: { ...updated[idx].english, text } };
    setPreviewQuestions(updated);
  };

  const updateHindiText = (idx: number, text: string) => {
    const updated = [...previewQuestions];
    updated[idx] = { ...updated[idx], hindi: { ...updated[idx].hindi, text } };
    setPreviewQuestions(updated);
  };

  const updateEnglishOption = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...previewQuestions];
    const opts = [...updated[qIdx].english.options];
    opts[optIdx] = text;
    updated[qIdx] = { ...updated[qIdx], english: { ...updated[qIdx].english, options: opts } };
    setPreviewQuestions(updated);
  };

  const updateHindiOption = (qIdx: number, optIdx: number, text: string) => {
    const updated = [...previewQuestions];
    const opts = [...updated[qIdx].hindi.options];
    opts[optIdx] = text;
    updated[qIdx] = { ...updated[qIdx], hindi: { ...updated[qIdx].hindi, options: opts } };
    setPreviewQuestions(updated);
  };

  const updateCorrectAnswer = (qIdx: number, ans: string) => {
    const updated = [...previewQuestions];
    updated[qIdx] = { ...updated[qIdx], correctAnswer: ans };
    setPreviewQuestions(updated);
  };

  const updateEnglishExplanation = (qIdx: number, text: string) => {
    const updated = [...previewQuestions];
    updated[qIdx] = {
      ...updated[qIdx],
      english: { ...updated[qIdx].english, explanation: text },
    };
    setPreviewQuestions(updated);
  };

  const updateHindiExplanation = (qIdx: number, text: string) => {
    const updated = [...previewQuestions];
    updated[qIdx] = {
      ...updated[qIdx],
      hindi: { ...updated[qIdx].hindi, explanation: text },
    };
    setPreviewQuestions(updated);
  };

  // ── Publish ──
  const handleApproveAndPublish = async () => {
    if (previewQuestions.length === 0) return;
    setStep('publishing');

    try {
      const res = await fetch('/api/admin/generate-test/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: selectedSubject, questions: previewQuestions }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to publish');
      }

      const data = await res.json();
      setPublishedTitle(data.title || `${selectedSubject} Practice Test`);
      setStep('done');
    } catch (err) {
      console.error(err);
      showToast('error', err instanceof Error ? err.message : 'Failed to publish. Please try again.');
      setStep('reviewing');
    }
  };

  const handleReset = () => {
    setStep('idle');
    setPreviewQuestions([]);
    setExpandedQ(null);
    setGenProgress('');
    setPublishedTitle('');
  };

  const optionLetters = ['a', 'b', 'c', 'd', 'e'];

  return (
    <div className="ai-practice-manager">
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert">
          {toast.type === 'success' ? '✅' : toast.type === 'warning' ? '⚠️' : '❌'} {toast.message}
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="section-intro">
        <div className="intro-badge">🤖 AI Practice Test Generator</div>
        <h2 className="intro-title">Generate AI-Powered Practice Tests</h2>
        <p className="intro-desc">
          Select a subject and click Generate. Gemini AI will create 80 bilingual STET/BPSC TRE-level MCQs
          with 5 options (a–e) and an answer key. Review and edit before publishing.
        </p>
      </div>

      {/* ── STEP: IDLE / CONFIGURE ── */}
      {(step === 'idle') && (
        <div className="generate-panel">
          <div className="gen-subject-row">
            <label htmlFor="ai-practice-subject" className="form-label">
              Select Subject for Practice Test
            </label>
            <select
              id="ai-practice-subject"
              className="form-select gen-select"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value as Subject)}
            >
              {PRACTICE_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {SUBJECT_ICONS[s]} {s}
                </option>
              ))}
            </select>
          </div>

          <div className="gen-info-card">
            <div className="gen-info-row">
              <span className="gen-chip">📋 80 Questions</span>
              <span className="gen-chip">🌐 English + Hindi</span>
              <span className="gen-chip">5️⃣ Options (a–e)</span>
              <span className="gen-chip">🔑 Answer Key Included</span>
              <span className="gen-chip">⏱️ 80 Min Timer</span>
            </div>
            <p className="gen-info-note">
              Questions are generated at <strong>STET Paper II / BPSC TRE</strong> difficulty level. You can review
              and edit any question before publishing.
            </p>
          </div>

          <button
            className="btn btn-primary btn-generate"
            onClick={handleGenerate}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Generate AI Practice Test — {SUBJECT_ICONS[selectedSubject]} {selectedSubject}
          </button>
        </div>
      )}

      {/* ── STEP: GENERATING ── */}
      {step === 'generating' && (
        <div className="generating-panel">
          <div className="gen-animation">
            <div className="gen-orb" />
            <div className="gen-orb gen-orb-2" />
            <div className="gen-orb gen-orb-3" />
          </div>
          <div className="gen-status">
            <div className="gen-spinner" />
            <p className="gen-progress-text">{genProgress}</p>
          </div>
          <div className="gen-steps">
            <div className="gen-step gen-step-done">✓ Initialized AI model</div>
            <div className={`gen-step ${genProgress.includes('Hindi') || genProgress.includes('Ready') ? 'gen-step-done' : 'gen-step-active'}`}>
              {genProgress.includes('Hindi') || genProgress.includes('Ready') ? '✓' : '⟳'} Generating 80 English questions
            </div>
            <div className={`gen-step ${genProgress.includes('Ready') ? 'gen-step-done' : genProgress.includes('Hindi') ? 'gen-step-active' : ''}`}>
              {genProgress.includes('Ready') ? '✓' : genProgress.includes('Hindi') ? '⟳' : '○'} Translating to Hindi
            </div>
            <div className={`gen-step ${genProgress.includes('Ready') ? 'gen-step-active' : ''}`}>
              {genProgress.includes('Ready') ? '⟳' : '○'} Preparing review panel
            </div>
          </div>
          <p className="gen-eta">This usually takes 45–90 seconds. Please wait…</p>
        </div>
      )}

      {/* ── STEP: REVIEWING ── */}
      {step === 'reviewing' && (
        <div className="review-panel">
          <div className="review-header">
            <div className="review-header-left">
              <span className="review-badge">📋 Review Mode</span>
              <h3 className="review-title">
                {SUBJECT_ICONS[selectedSubject]} {selectedSubject} — {previewQuestions.length} Questions Generated
              </h3>
              <p className="review-hint">
                Expand any question to edit text, options, or correct answer. Once satisfied, click Approve &amp; Publish.
              </p>
            </div>
            <div className="review-actions-top">
              <button className="btn btn-outline btn-sm" onClick={handleReset} type="button">
                🔄 Regenerate
              </button>
              <button className="btn btn-success btn-lg" onClick={handleApproveAndPublish} type="button">
                ✅ Approve &amp; Publish
              </button>
            </div>
          </div>

          <div className="review-questions-list">
            {previewQuestions.map((q, qIdx) => {
              const isOpen = expandedQ === qIdx;
              return (
                <div key={qIdx} className={`review-q-card ${isOpen ? 'review-q-open' : ''}`}>
                  <button
                    className="review-q-header"
                    onClick={() => setExpandedQ(isOpen ? null : qIdx)}
                    type="button"
                  >
                    <div className="review-q-meta">
                      <span className="review-q-num">Q{q.number}</span>
                      <span className="review-q-text-preview">
                        {q.english.text.length > 90 ? q.english.text.slice(0, 90) + '…' : q.english.text}
                      </span>
                    </div>
                    <div className="review-q-right">
                      <span className="review-ans-badge">
                        Ans: <strong>{(q.correctAnswer || '?').toUpperCase()}</strong>
                      </span>
                      <span className="review-chevron">{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="review-q-body">
                      {/* English text */}
                      <div className="bilingual-edit-row">
                        <div className="lang-block">
                          <label className="lang-label">🇬🇧 English Question</label>
                          <textarea
                            className="form-textarea"
                            rows={3}
                            value={q.english.text}
                            onChange={(e) => updateEnglishText(qIdx, e.target.value)}
                          />
                        </div>
                        <div className="lang-block">
                          <label className="lang-label">🇮🇳 Hindi Question</label>
                          <textarea
                            className="form-textarea"
                            rows={3}
                            value={q.hindi.text}
                            onChange={(e) => updateHindiText(qIdx, e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Options */}
                      <div className="options-section">
                        <p className="options-section-label">Options — click radio to set correct answer</p>
                        {optionLetters.map((letter, optIdx) => {
                          const enOpt = q.english.options[optIdx] || '';
                          const hiOpt = q.hindi.options[optIdx] || '';
                          const isCorrect = (q.correctAnswer || '').toLowerCase() === letter;
                          return (
                            <div key={letter} className={`opt-row ${isCorrect ? 'opt-row-correct' : ''}`}>
                              <div className="opt-row-label">
                                <input
                                  type="radio"
                                  name={`correct-ai-${qIdx}`}
                                  checked={isCorrect}
                                  onChange={() => updateCorrectAnswer(qIdx, letter)}
                                  title={`Mark ${letter.toUpperCase()} as correct`}
                                />
                                <span className="opt-letter-badge">{letter.toUpperCase()}</span>
                              </div>
                              <div className="opt-inputs">
                                <input
                                  className="form-input opt-input-small"
                                  type="text"
                                  placeholder={`English option ${letter.toUpperCase()}`}
                                  value={enOpt.replace(/^[a-e]\.\s*/i, '')}
                                  onChange={(e) => updateEnglishOption(qIdx, optIdx, `${letter}. ${e.target.value}`)}
                                />
                                <input
                                  className="form-input opt-input-small"
                                  type="text"
                                  placeholder={`Hindi option ${letter.toUpperCase()}`}
                                  value={hiOpt.replace(/^[a-e]\.\s*/i, '')}
                                  onChange={(e) => updateHindiOption(qIdx, optIdx, `${letter}. ${e.target.value}`)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Detailed Step-by-Step Explanations */}
                      <div className="explanation-section">
                        <p className="options-section-label">💡 Detailed Step-by-Step Solutions (विस्तृत चरणबद्ध समाधान)</p>
                        <div className="bilingual-edit-row">
                          <div className="lang-block">
                            <label className="lang-label">🇬🇧 English Detailed Solution</label>
                            <textarea
                              className="form-textarea"
                              rows={4}
                              placeholder="Step 1: Formula...\nStep 2: Values...\nStep 3: Calculation...\nCorrect option is (X)."
                              value={q.english.explanation || ''}
                              onChange={(e) => updateEnglishExplanation(qIdx, e.target.value)}
                            />
                          </div>
                          <div className="lang-block">
                            <label className="lang-label">🇮🇳 Hindi Detailed Solution (विस्तृत समाधान)</label>
                            <textarea
                              className="form-textarea"
                              rows={4}
                              placeholder="चरण 1: सूत्र...\nचरण 2: मान रखने पर...\nचरण 3: गणना...\nसही विकल्प (x) है।"
                              value={q.hindi.explanation || ''}
                              onChange={(e) => updateHindiExplanation(qIdx, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sticky bottom bar */}
          <div className="review-sticky-bar">
            <span className="review-count-label">{previewQuestions.length} bilingual questions ready</span>
            <div className="review-bar-actions">
              <button className="btn btn-outline" onClick={handleReset} type="button">
                🔄 Regenerate
              </button>
              <button className="btn btn-success btn-lg" onClick={handleApproveAndPublish} type="button">
                ✅ Approve &amp; Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP: PUBLISHING ── */}
      {step === 'publishing' && (
        <div className="publishing-panel">
          <div className="gen-spinner large-spinner" />
          <p className="gen-progress-text">Publishing practice test to the Practice page…</p>
        </div>
      )}

      {/* ── STEP: DONE ── */}
      {step === 'done' && (
        <div className="done-panel">
          <div className="done-icon">🎉</div>
          <h3 className="done-title">Practice Test Published!</h3>
          <p className="done-subtitle">
            <strong>"{publishedTitle}"</strong> is now live on the Practice page with {previewQuestions.length} bilingual questions.
          </p>
          <div className="done-actions">
            <button className="btn btn-primary btn-lg" onClick={handleReset} type="button">
              + Generate Another Test
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .ai-practice-manager {
          animation: fadeInUp 0.4s ease;
          position: relative;
        }

        .section-intro {
          margin-bottom: 2rem;
        }

        .intro-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--accent-light);
          background: rgba(124, 58, 237, 0.12);
          border: 1px solid rgba(124, 58, 237, 0.25);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.6rem;
        }

        .intro-title {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .intro-desc {
          font-size: 0.92rem;
          color: var(--text-muted);
          max-width: 700px;
          line-height: 1.6;
        }

        /* ── Generate Panel ── */
        .generate-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 680px;
        }

        .gen-subject-row {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .gen-select {
          max-width: 360px;
          font-size: 1rem;
        }

        .gen-info-card {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.06), rgba(16, 185, 129, 0.06));
          border: 1px solid rgba(124, 58, 237, 0.2);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
        }

        .gen-info-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.85rem;
        }

        .gen-chip {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.3rem 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-full);
          color: var(--text-primary);
        }

        .gen-info-note {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .btn-generate {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.9rem 2rem;
          font-size: 1rem;
          font-weight: 800;
          border-radius: var(--radius-lg);
          max-width: 420px;
          background: var(--accent-gradient);
          color: #fff;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 20px rgba(124, 58, 237, 0.35);
        }

        .btn-generate:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(124, 58, 237, 0.45);
        }

        /* ── Generating Panel ── */
        .generating-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          text-align: center;
          gap: 1.5rem;
        }

        .gen-animation {
          position: relative;
          width: 80px;
          height: 80px;
          margin-bottom: 0.5rem;
        }

        .gen-orb {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #7c3aed;
          animation: spin 1.2s linear infinite;
        }

        .gen-orb-2 {
          inset: 10px;
          border-top-color: #10b981;
          animation-duration: 0.9s;
          animation-direction: reverse;
        }

        .gen-orb-3 {
          inset: 20px;
          border-top-color: #3b82f6;
          animation-duration: 1.5s;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .gen-status {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .gen-spinner {
          width: 20px;
          height: 20px;
          border: 2.5px solid rgba(124, 58, 237, 0.2);
          border-top-color: #7c3aed;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        .large-spinner {
          width: 40px;
          height: 40px;
          border-width: 4px;
        }

        .gen-progress-text {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .gen-steps {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: left;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          min-width: 320px;
        }

        .gen-step {
          font-size: 0.88rem;
          color: var(--text-muted);
          padding: 0.2rem 0;
        }

        .gen-step-active {
          color: var(--accent-light);
          font-weight: 700;
        }

        .gen-step-done {
          color: #10b981;
          font-weight: 600;
        }

        .gen-eta {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-style: italic;
        }

        /* ── Review Panel ── */
        .review-panel {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding-bottom: 5rem;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          flex-wrap: wrap;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
        }

        .review-header-left {
          flex: 1;
          min-width: 260px;
        }

        .review-badge {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.12);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-bottom: 0.4rem;
        }

        .review-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 0.3rem;
        }

        .review-hint {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
        }

        .review-actions-top {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-shrink: 0;
        }

        /* Review question cards */
        .review-questions-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .review-q-card {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .review-q-card:hover {
          border-color: rgba(124, 58, 237, 0.35);
        }

        .review-q-open {
          border-color: rgba(124, 58, 237, 0.5);
          box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.15);
        }

        .review-q-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 1.1rem;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          gap: 0.75rem;
        }

        .review-q-meta {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          flex: 1;
          min-width: 0;
        }

        .review-q-num {
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--accent-light);
          background: rgba(124, 58, 237, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-full);
          flex-shrink: 0;
          white-space: nowrap;
        }

        .review-q-text-preview {
          font-size: 0.88rem;
          color: var(--text-primary);
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .review-q-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .review-ans-badge {
          font-size: 0.78rem;
          color: #10b981;
          font-weight: 600;
          background: rgba(16, 185, 129, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          white-space: nowrap;
        }

        .review-chevron {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Review question body (expanded) */
        .review-q-body {
          padding: 1rem 1.1rem 1.25rem;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .bilingual-edit-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .lang-block {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .lang-label {
          font-size: 0.78rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .form-textarea {
          width: 100%;
          padding: 0.7rem 0.9rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-medium);
          background: var(--bg-input);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.9rem;
          resize: vertical;
          line-height: 1.5;
        }

        .form-textarea:focus {
          outline: none;
          border-color: var(--accent-light);
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
        }

        /* Options section */
        .options-section,
        .explanation-section {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .explanation-section {
          margin-top: 0.5rem;
          padding-top: 0.8rem;
          border-top: 1px dashed var(--border-subtle);
        }

        .options-section-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .opt-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          background: var(--bg-glass);
          transition: border-color 0.2s;
        }

        .opt-row-correct {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .opt-row-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-shrink: 0;
        }

        .opt-row-label input[type="radio"] {
          accent-color: #10b981;
          cursor: pointer;
          width: 16px;
          height: 16px;
        }

        .opt-letter-badge {
          font-size: 0.78rem;
          font-weight: 900;
          color: var(--text-primary);
          min-width: 18px;
        }

        .opt-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          flex: 1;
          min-width: 0;
        }

        .opt-input-small {
          font-size: 0.85rem;
          padding: 0.4rem 0.65rem;
        }

        /* Sticky bottom bar */
        .review-sticky-bar {
          position: sticky;
          bottom: 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: var(--bg-card);
          border-top: 1px solid var(--border-medium);
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
          z-index: 100;
          gap: 1rem;
          margin-top: 1rem;
        }

        .review-count-label {
          font-size: 0.88rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .review-bar-actions {
          display: flex;
          gap: 0.75rem;
        }

        /* Buttons */
        .btn-success {
          background: linear-gradient(135deg, #059669, #10b981);
          color: #fff;
          border: none;
          padding: 0.7rem 1.5rem;
          font-weight: 800;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
          font-size: 0.9rem;
        }

        .btn-success:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(16, 185, 129, 0.4);
        }

        .btn-outline {
          background: transparent;
          color: var(--text-secondary);
          border: 1px solid var(--border-medium);
          padding: 0.65rem 1.25rem;
          font-weight: 700;
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.88rem;
          transition: border-color 0.2s, color 0.2s;
        }

        .btn-outline:hover {
          border-color: var(--accent-light);
          color: var(--accent-light);
        }

        /* Publishing Panel */
        .publishing-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          gap: 1.5rem;
          text-align: center;
        }

        /* Done Panel */
        .done-panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          gap: 1rem;
          text-align: center;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(124, 58, 237, 0.06));
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: var(--radius-xl);
        }

        .done-icon {
          font-size: 3rem;
          animation: bounceIn 0.5s ease;
        }

        @keyframes bounceIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }

        .done-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .done-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.5;
          max-width: 480px;
          margin: 0;
        }

        .done-actions {
          margin-top: 0.5rem;
        }

        /* Toast */
        .toast {
          position: fixed;
          bottom: 6rem;
          right: 1.5rem;
          padding: 0.85rem 1.25rem;
          border-radius: var(--radius-lg);
          font-size: 0.9rem;
          font-weight: 600;
          z-index: 10000;
          max-width: 380px;
          animation: slideInRight 0.3s ease;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .toast-success { background: #064e3b; color: #6ee7b7; border: 1px solid #059669; }
        .toast-error   { background: #450a0a; color: #fca5a5; border: 1px solid #dc2626; }
        .toast-warning { background: #451a03; color: #fdba74; border: 1px solid #ea580c; }

        @media (max-width: 640px) {
          .review-header {
            flex-direction: column;
          }
          .review-actions-top {
            width: 100%;
            justify-content: space-between;
          }
          .bilingual-edit-row {
            grid-template-columns: 1fr;
          }
          .opt-inputs {
            grid-template-columns: 1fr;
          }
          .review-sticky-bar {
            flex-direction: column;
            padding: 0.85rem 1rem;
          }
          .review-bar-actions {
            width: 100%;
            justify-content: space-between;
          }
          .btn-generate {
            max-width: 100%;
            width: 100%;
            justify-content: center;
          }
          .gen-select {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

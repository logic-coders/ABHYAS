'use client';

import { useState } from 'react';
import { Subject, SUBJECTS, SUBJECT_ICONS } from '@/lib/types';

export default function AdminForm() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('Math');
  const [startQ, setStartQ] = useState('');
  const [endQ, setEndQ] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // State for random test generation
  const [randomSubject, setRandomSubject] = useState<Subject>('Math');
  const [isGenerating, setIsGenerating] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) return showToast('error', 'Title is required');
    if (!file) return showToast('error', 'Please upload a PDF file');
    if (!startQ || !endQ) return showToast('error', 'Question range is required');
    if (Number(startQ) >= Number(endQ))
      return showToast('error', 'Start question must be less than end question');

    setIsLoading(true);

    try {
      // Step 1: Upload PDF to S3
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Failed to upload PDF');
      }

      const { s3Key } = await uploadRes.json();

      // Step 2: Create test series
      const createRes = await fetch('/api/test-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          subject,
          s3Key,
          startQuestion: Number(startQ),
          endQuestion: Number(endQ),
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error || 'Failed to create test series');
      }

      showToast('success', `Test series "${title}" created successfully!`);

      // Reset form
      setTitle('');
      setSubject('Math');
      setStartQ('');
      setEndQ('');
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Submit error:', error);
      showToast('error', error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRandomTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: randomSubject }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate test');
      }

      showToast('success', `Random test generated successfully for ${randomSubject}!`);
    } catch (error) {
      console.error('Generate error:', error);
      showToast('error', error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <form className="admin-form" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label htmlFor="series-title" className="form-label">
            Test Series Title
          </label>
          <input
            id="series-title"
            className="form-input"
            type="text"
            placeholder="e.g., Music Theory — Chapter 3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Subject */}
        <div className="form-group">
          <label htmlFor="series-subject" className="form-label">
            Subject
          </label>
          <select
            id="series-subject"
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

        {/* PDF Upload */}
        <div className="form-group">
          <label className="form-label">Upload PDF</label>
          <div className="file-input-wrapper">
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
            <div className="file-input-label">
              {file ? (
                <span>
                  📄 <span>{file.name}</span> ({(file.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              ) : (
                <span>
                  Drop your PDF here or <span>browse</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Question Range */}
        <div className="range-group">
          <div className="form-group">
            <label htmlFor="start-question" className="form-label">
              Start Question No.
            </label>
            <input
              id="start-question"
              className="form-input"
              type="number"
              min="1"
              placeholder="e.g., 1"
              value={startQ}
              onChange={(e) => setStartQ(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="end-question" className="form-label">
              End Question No.
            </label>
            <input
              id="end-question"
              className="form-input"
              type="number"
              min="1"
              placeholder="e.g., 25"
              value={endQ}
              onChange={(e) => setEndQ(e.target.value)}
              required
            />
          </div>
        </div>

        {startQ && endQ && Number(endQ) > Number(startQ) && (
          <p className="range-info">
            📋 This test will have <strong>{Number(endQ) - Number(startQ) + 1}</strong> questions (Q
            {startQ} – Q{endQ})
          </p>
        )}

        {/* Submit */}
        <button className="btn btn-primary btn-lg" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner" /> Uploading & Creating...
            </>
          ) : (
            'Create Test Series'
          )}
        </button>
      </form>

      <div style={{ margin: '3rem 0', height: '1px', background: 'var(--border-subtle)' }} />

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Generate Random Test</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Creates a new test series with 80 random questions selected from all previously uploaded PDFs for the selected subject.
      </p>

      <form className="admin-form" onSubmit={handleGenerateRandomTest}>
        <div className="form-group">
          <label htmlFor="random-subject" className="form-label">
            Subject
          </label>
          <select
            id="random-subject"
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
        <button className="btn btn-secondary btn-lg" type="submit" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <span className="spinner" /> Generating...
            </>
          ) : (
            'Generate 80-Question Test'
          )}
        </button>
      </form>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert">
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      <style jsx>{`
        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 600px;
          animation: fadeInUp 0.5s ease;
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

        @media (max-width: 480px) {
          .range-group {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

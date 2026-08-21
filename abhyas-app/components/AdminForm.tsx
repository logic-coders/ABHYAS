'use client';

import { useState } from 'react';
import { Subject, SUBJECTS, SUBJECT_ICONS } from '@/lib/types';

export default function AdminForm() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('Music');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) return showToast('error', 'Title is required');
    if (!file) return showToast('error', 'Please upload a PDF file');

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

      // Step 2: Create full Prev Year test series (1 to 150 questions, 150 minutes)
      const createRes = await fetch('/api/test-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          subject,
          s3Key,
          startQuestion: 1,
          endQuestion: 150,
          testType: 'prev-year',
          durationMinutes: 150,
        }),
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err.error || 'Failed to create test series');
      }

      showToast('success', `Previous Year test "${title}" (150 Questions, 150 Mins) created and published to Prev Year page!`);

      // Reset form
      setTitle('');
      setSubject('Music');
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

  return (
    <>
      <div className="section-intro">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          📜 Create Full Previous Year Test
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Upload an official question paper PDF. The system will automatically extract questions <strong>1 to 150</strong> in both English & Hindi, set a <strong>150-minute (2.5 hr)</strong> timer, and publish directly to the <strong>Prev Year</strong> page.
        </p>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label htmlFor="series-title" className="form-label">
            Test Title (Display Name)
          </label>
          <input
            id="series-title"
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
          <label htmlFor="series-subject" className="form-label">
            Subject (7 Subjects)
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
          <label className="form-label">Upload Question Paper PDF (150 Questions)</label>
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

        <div className="preset-info-badge">
          <span>⚡ <strong>Fixed Format:</strong> 150 Questions • 150 Minutes (2.5 Hours) • Sequential Numbering (1–150) • Bilingual Support</span>
        </div>

        {/* Submit */}
        <button className="btn btn-primary btn-lg" type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner" /> Uploading & Creating...
            </>
          ) : (
            'Publish 150-Question Prev Year Test'
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

        .preset-info-badge {
          font-size: 0.88rem;
          color: var(--text-secondary);
          padding: 0.75rem 1rem;
          background: rgba(99, 102, 241, 0.08);
          border-radius: var(--radius-md);
          border: 1px solid rgba(99, 102, 241, 0.25);
          line-height: 1.45;
        }

        .preset-info-badge strong {
          color: var(--accent);
        }
      `}</style>
    </>
  );
}

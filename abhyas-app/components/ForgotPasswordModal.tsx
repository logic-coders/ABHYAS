'use client';

import { useState } from 'react';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP');
        return;
      }
      
      setSuccess('OTP sent successfully (check the terminal log if testing locally).');
      setStep(2);
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }
      
      setSuccess('Password reset successfully! You can now log in.');
      setStep(3);
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card">
        <button className="close-btn" onClick={onClose}>&times;</button>
        
        <h2 className="modal-title">Reset Password</h2>
        
        {error && <div className="error-msg">❌ {error}</div>}
        {success && <div className="success-msg">✅ {success}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="modal-form">
            <p className="modal-desc">Enter your registered email address to receive a one-time password (OTP).</p>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyReset} className="modal-form">
            <p className="modal-desc">Enter the 6-digit OTP sent to <strong>{email}</strong></p>
            <div className="form-group">
              <label className="form-label">OTP</label>
              <input
                type="text"
                className="form-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                minLength={6}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="modal-form" style={{ textAlign: 'center' }}>
            <button onClick={onClose} className="btn btn-primary">
              Back to Login
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .modal-content {
          width: 90%;
          max-width: 400px;
          padding: 2rem;
          position: relative;
          background: var(--bg-primary);
          border: 1px solid var(--border-medium);
        }

        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .close-btn:hover {
          color: var(--text-primary);
        }

        .modal-title {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .modal-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .error-msg {
          padding: 0.75rem;
          background: var(--color-incorrect-bg);
          color: var(--color-incorrect);
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
        .success-msg {
          padding: 0.75rem;
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}

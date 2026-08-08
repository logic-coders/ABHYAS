'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(result.error || 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        {/* Header */}
        <div className="auth-header">
          <Link href="/" className="auth-logo" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <span className="logo-icon" style={{ fontSize: '2.5rem' }}>📖</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginLeft: '0.75rem', letterSpacing: '-0.03em' }}>Abhyas</span>
          </Link>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join us and start practicing</p>
        </div>

        {/* Error */}
        {error && (
          <div className="auth-error">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name" className="form-label">Full Name</label>
            <input
              id="reg-name"
              className="form-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              minLength={2}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email</label>
            <input
              id="reg-email"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">Password</label>
            <input
              id="reg-password"
              className="form-input"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
            <input
              id="reg-confirm"
              className="form-input"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" /> Creating account...
              </>
            ) : (
              '🚀 Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Already have an account?{' '}
          <Link href="/login" className="auth-link">Sign in</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: calc(100vh - var(--header-height));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-lg);
        }

        .auth-card {
          width: 100%;
          max-width: 420px;
          padding: 2.5rem;
          animation: scaleIn 0.4s ease;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-icon {
          font-size: 2.5rem;
          display: block;
          margin-bottom: 0.75rem;
        }

        .auth-title {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.35rem;
        }

        .auth-subtitle {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .auth-error {
          padding: 0.75rem 1rem;
          margin-bottom: 1.25rem;
          font-size: 0.88rem;
          background: var(--color-incorrect-bg);
          color: var(--color-incorrect);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          animation: fadeInUp 0.25s ease;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .auth-submit {
          width: 100%;
          margin-top: 0.5rem;
        }

        .auth-footer {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .auth-link {
          color: var(--accent-light);
          font-weight: 600;
        }

        .auth-link:hover {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}

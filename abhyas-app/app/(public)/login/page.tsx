'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Redirect based on role — the middleware will handle it on next navigation,
      // but let's check the user from the auth context
      router.push('/tests');
      router.refresh();
    } else {
      setError(result.error || 'Login failed');
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
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
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
            <label htmlFor="login-email" className="form-label">Email</label>
            <input
              id="login-email"
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
            <label htmlFor="login-password" className="form-label">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              minLength={6}
            />
          </div>

          <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" /> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="auth-link">Create one</Link>
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

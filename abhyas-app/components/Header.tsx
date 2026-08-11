'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Header() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  // Hide global header on exam pages for distraction-free exam mode
  if (pathname?.startsWith('/exam')) {
    return null;
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <img
            src="/logo.png"
            alt="Abhyas Logo"
            style={{ height: '32px', marginRight: '8px' }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '1.65rem', letterSpacing: '-0.02em' }}>ABHYAS</span>
        </Link>

        <nav>
          <ul className="nav-links">
            {isLoading ? (
              <li>
                <span className="nav-link" style={{ opacity: 0.5 }}>Loading...</span>
              </li>
            ) : user ? (
              <>
                <li>
                  <Link href="/" className="nav-link">
                    Tests
                  </Link>
                </li>
                {user.role === 'admin' && (
                  <li>
                    <Link href="/admin" className="nav-link">
                      Admin
                    </Link>
                  </li>
                )}
                <li>
                  <div className="user-menu">
                    <Link href="/profile" className="user-badge" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="user-name">{user.name}</span>
                      {user.role === 'admin' && (
                        <span className="role-tag">Admin</span>
                      )}
                    </Link>
                    <button className="btn btn-ghost btn-sm" onClick={logout}>
                      Logout
                    </button>
                  </div>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className="nav-link">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="btn btn-primary btn-sm">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      <style jsx>{`
        .user-menu {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .user-avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #fff;
          background: var(--accent-gradient);
          border-radius: var(--radius-full);
        }

        .user-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .role-tag {
          padding: 0.15rem 0.45rem;
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--accent-light);
          background: var(--accent-glow);
          border-radius: var(--radius-full);
        }

        .btn-sm {
          padding: 0.4rem 0.85rem;
          font-size: 0.82rem;
        }

        @media (max-width: 640px) {
          .user-name {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}

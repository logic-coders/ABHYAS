'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide global header on exam/quiz taking pages for distraction-free mode
  if (pathname?.startsWith('/exam') || (pathname?.startsWith('/quiz/') && pathname !== '/quiz')) {
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
            {/* Theme Toggle Button */}
            <li>
              <button
                type="button"
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
            </li>

            {isLoading ? (
              <li>
                <span className="nav-link" style={{ opacity: 0.5 }}>Loading...</span>
              </li>
            ) : user ? (
              <>
                <li className="desktop-only">
                  <Link href="/tests" className={`nav-link ${pathname === '/tests' ? 'active' : ''}`}>
                    Practice
                  </Link>
                </li>
                <li className="desktop-only">
                  <Link href="/prev-year" className={`nav-link ${pathname === '/prev-year' ? 'active' : ''}`}>
                    Prev Year
                  </Link>
                </li>
                <li className="desktop-only">
                  <Link href="/quiz" className={`nav-link ${pathname?.startsWith('/quiz') ? 'active' : ''}`}>
                    Quiz
                  </Link>
                </li>
                {user.role === 'admin' && (
                  <li className="desktop-only">
                    <Link href="/admin" className={`nav-link ${pathname?.startsWith('/admin') ? 'active' : ''}`}>
                      Admin
                    </Link>
                  </li>
                )}
                <li>
                  <div className="user-menu" ref={dropdownRef}>
                    <button
                      className="user-badge"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      aria-label="User profile menu"
                    >
                      <span className="user-avatar" title={user.name}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </button>
                    
                    {dropdownOpen && (
                      <div className="dropdown-menu">
                        <div className="dropdown-header">
                          <span className="dropdown-header-avatar">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="dropdown-user-info">
                            <span className="dropdown-username">{user.name}</span>
                            <span className="dropdown-role">{user.role.toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="dropdown-divider"></div>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            setDropdownOpen(false);
                            router.push('/profile');
                          }}
                        >
                          <svg className="dropdown-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                          <span>Profile</span>
                        </button>
                        <button
                          type="button"
                          className="dropdown-item"
                          onClick={() => {
                            setDropdownOpen(false);
                            router.push('/test-history');
                          }}
                        >
                          <svg className="dropdown-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                          <span>Test History</span>
                        </button>
                        <div className="dropdown-divider"></div>
                        <button
                          type="button"
                          className="dropdown-item logout-btn"
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                        >
                          <svg className="dropdown-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              </>
            ) : (
              <>
                <li className="desktop-only">
                  <Link href="/login" className="nav-link">
                    Login
                  </Link>
                </li>
                <li className="desktop-only">
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
          position: relative;
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
          width: 2.1rem;
          height: 2.1rem;
          font-size: 0.85rem;
          font-weight: 700;
          color: #fff;
          background: var(--accent-gradient);
          border-radius: var(--radius-full);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .user-badge:hover .user-avatar {
          transform: scale(1.05);
          box-shadow: 0 0 10px var(--accent-glow);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          width: 250px;
          background: var(--dropdown-bg);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding: 0.6rem 0;
          z-index: 200;
          animation: slideInDown 0.2s ease forwards;
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1.25rem;
        }

        .dropdown-header-avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          background: var(--accent-gradient);
          border-radius: var(--radius-full);
          flex-shrink: 0;
        }

        .dropdown-user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          line-height: 1.4;
        }

        .dropdown-username {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dropdown-role {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 0.05em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item,
        .dropdown-item:link,
        .dropdown-item:visited {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.65rem 1.25rem;
          font-size: 0.98rem;
          font-weight: 500;
          color: var(--text-primary) !important;
          text-decoration: none !important;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s ease, color 0.2s ease;
          width: 100%;
        }

        .dropdown-icon {
          color: var(--text-muted) !important;
          flex-shrink: 0;
          transition: color 0.2s ease;
        }

        .dropdown-item:hover,
        .dropdown-item:hover:visited {
          background: var(--dropdown-hover) !important;
          color: var(--text-primary) !important;
        }
        
        .dropdown-item:hover .dropdown-icon {
          color: var(--text-primary) !important;
        }
        
        .dropdown-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 0.35rem 0;
        }
        
        .logout-btn,
        .logout-btn:link,
        .logout-btn:visited {
          color: #ef4444 !important;
        }
        .logout-btn .dropdown-icon {
          color: #ef4444 !important;
        }
        .logout-btn:hover,
        .logout-btn:hover:visited {
          background: rgba(239, 68, 68, 0.12) !important;
          color: #dc2626 !important;
        }
        .logout-btn:hover .dropdown-icon {
          color: #dc2626 !important;
        }

        .btn-sm {
          padding: 0.4rem 0.85rem;
          font-size: 0.82rem;
        }
      `}</style>
    </header>
  );
}

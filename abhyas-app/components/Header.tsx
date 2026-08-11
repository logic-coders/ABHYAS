'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  
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
                  <div className="user-menu" ref={dropdownRef}>
                    <button
                      className="user-badge"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <span className="user-avatar" title={user.name}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      {user.role === 'admin' && (
                        <>
                          <span className="user-name">{user.name}</span>
                          <span className="role-tag">Admin</span>
                        </>
                      )}
                    </button>
                    
                    {dropdownOpen && (
                      <div className="dropdown-menu">
                        <Link href="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          Profile
                        </Link>
                        <Link href="/test-history" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          Test History
                        </Link>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item logout-btn" onClick={() => { setDropdownOpen(false); logout(); }}>
                          Logout
                        </button>
                      </div>
                    )}
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
          width: 2rem;
          height: 2rem;
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
          width: 180px;
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-md);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          padding: 0.5rem 0;
          z-index: 200;
          animation: slideInDown 0.2s ease forwards;
        }
        
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
          color: var(--text-primary);
          text-decoration: none;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s ease;
        }

        .dropdown-item:hover {
          background: var(--bg-glass-strong);
        }
        
        .dropdown-divider {
          height: 1px;
          background: var(--border-subtle);
          margin: 0.4rem 0;
        }
        
        .logout-btn {
          color: var(--color-incorrect);
        }
        .logout-btn:hover {
          background: var(--color-incorrect-bg);
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

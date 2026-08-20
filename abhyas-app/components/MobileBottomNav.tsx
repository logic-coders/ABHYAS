'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Do not show on exam pages
  if (pathname?.startsWith('/exam')) {
    return null;
  }

  // Determine active states
  const isHome = pathname === '/';
  const isTests = pathname === '/tests';
  const isQuiz = pathname?.startsWith('/quiz');
  const isProfile = pathname?.startsWith('/profile') || pathname?.startsWith('/admin');

  return (
    <nav className="mobile-bottom-nav">
      <ul className="nav-items">
        <li className="nav-item">
          <Link href="/" className={`nav-link ${isHome ? 'active' : ''}`}>
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span>Home</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link href="/tests" className={`nav-link ${isTests ? 'active' : ''}`}>
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <span>Tests</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link href="/quiz" className={`nav-link ${isQuiz ? 'active' : ''}`}>
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path>
              </svg>
            </div>
            <span>Quiz</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link href={user?.role === 'admin' ? '/admin' : '/profile'} className={`nav-link ${isProfile ? 'active' : ''}`}>
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span>{user?.role === 'admin' ? 'Admin' : 'Profile'}</span>
          </Link>
        </li>
      </ul>

      <style jsx>{`
        .mobile-bottom-nav {
          display: none; /* Hidden on desktop by default */
        }

        @media (max-width: 767px) {
          .mobile-bottom-nav {
            display: block;
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 92%;
            max-width: 400px;
            background: var(--bg-card);
            border: 1px solid var(--border-medium);
            border-radius: 2rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
            padding: 0.5rem 1rem;
            z-index: 1000;
            backdrop-filter: blur(10px);
          }

          .nav-items {
            display: flex;
            justify-content: space-between;
            align-items: center;
            list-style: none;
            padding: 0;
            margin: 0;
            width: 100%;
          }

          .nav-item {
            flex: 1;
            display: flex;
            justify-content: center;
          }

          .nav-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: var(--text-muted);
            font-size: 0.7rem;
            font-weight: 600;
            gap: 0.25rem;
            transition: all 0.2s ease;
            width: 100%;
          }

          .icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            transition: all 0.2s ease;
          }

          .icon-wrapper svg {
            width: 20px;
            height: 20px;
            stroke-width: 2.2;
          }

          .nav-link.active {
            color: #6366f1; /* Purple/Indigo color matching screenshot */
          }

          .nav-link.active .icon-wrapper {
            background-color: rgba(99, 102, 241, 0.15); /* Purple pill background */
            color: #6366f1;
          }
        }
      `}</style>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Do not show on exam/quiz taking pages
  if (pathname?.startsWith('/exam') || (pathname?.startsWith('/quiz/') && pathname !== '/quiz')) {
    return null;
  }

  // Determine active states
  const isHome = pathname === '/';
  const isPractice = pathname === '/tests';
  const isPrevYear = pathname === '/prev-year';
  const isQuiz = pathname?.startsWith('/quiz');
  const isAdmin = pathname?.startsWith('/admin');
  const isHistory = pathname === '/test-history';

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
          <Link href="/tests" className={`nav-link ${isPractice ? 'active' : ''}`}>
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <span>Practice</span>
          </Link>
        </li>

        <li className="nav-item">
          <Link href="/prev-year" className={`nav-link ${isPrevYear ? 'active' : ''}`}>
            <div className="icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <span>Prev Year</span>
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
          {user?.role === 'admin' ? (
            <Link href="/admin" className={`nav-link ${isAdmin ? 'active' : ''}`}>
              <div className="icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <span>Admin</span>
            </Link>
          ) : (
            <Link href="/test-history" className={`nav-link ${isHistory ? 'active' : ''}`}>
              <div className="icon-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4l3 3"></path>
                  <circle cx="12" cy="12" r="9"></circle>
                </svg>
              </div>
              <span>History</span>
            </Link>
          )}
        </li>
      </ul>

      <style jsx>{`
        .mobile-bottom-nav {
          display: none; /* Hidden on desktop by default */
        }

        @media (max-width: 768px) {
          .mobile-bottom-nav {
            display: block;
            position: fixed;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%);
            width: calc(100% - 1.5rem);
            max-width: 420px;
            background: var(--bg-card);
            border: 1px solid var(--border-medium);
            border-radius: 2rem;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.15);
            padding: 0.35rem 0.5rem;
            z-index: 1000;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-sizing: border-box;
          }

          .nav-items {
            display: flex;
            justify-content: space-around;
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
            min-width: 0;
          }

          .nav-link {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            color: var(--text-muted);
            font-size: 0.68rem;
            font-weight: 600;
            gap: 0.15rem;
            transition: all 0.2s ease;
            width: 100%;
            padding: 0.15rem 0;
          }

          .icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            transition: all 0.2s ease;
          }

          .icon-wrapper svg {
            width: 19px;
            height: 19px;
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

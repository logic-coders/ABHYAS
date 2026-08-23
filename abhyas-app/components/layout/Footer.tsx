'use client';

import { usePathname } from 'next/navigation';

import Image from 'next/image';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on exam and quiz pages for distraction-free arena
  if (pathname?.startsWith('/exam') || pathname?.startsWith('/quiz')) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <Image
            src="/logo.png"
            alt="Abhyas Logo"
            width={32}
            height={32}
            className="footer-logo"
            style={{ width: 'auto', height: '32px' }}
          />
          <p>&copy; {new Date().getFullYear()} ABHYAS, Inc.</p>
        </div>
        
        <ul className="footer-links">
          <li><a href="mailto:chandansingh1510200@gmail.com">Contact Admin</a></li>
        </ul>
      </div>

      <style jsx>{`
        .footer {
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-primary);
          padding: 2rem 0 3rem 0;
          margin-top: auto;
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .footer-logo {
          height: 24px;
          opacity: 0.6;
          filter: grayscale(100%);
          transition: opacity 0.2s ease, filter 0.2s ease;
        }

        .footer-logo:hover {
          opacity: 1;
          filter: grayscale(0%);
        }

        .footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .footer-links a {
          color: var(--text-link);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-links a:hover {
          color: var(--text-primary);
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .footer-inner {
            flex-direction: column;
            justify-content: center;
            text-align: center;
          }
          
          .footer-left {
            justify-content: center;
            width: 100%;
            margin-bottom: 0.5rem;
          }
          
          .footer-links {
            justify-content: center;
            gap: 1rem;
          }
        }
      `}</style>
    </footer>
  );
}

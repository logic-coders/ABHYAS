'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on exam pages for distraction-free exam mode
  if (pathname?.startsWith('/exam')) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>&copy; {new Date().getFullYear()} ABHYAS. All rights reserved.</p>
      </div>

      <style jsx>{`
        .footer {
          border-top: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          padding: var(--space-lg) 0;
          margin-top: auto;
          color: var(--text-muted);
          font-size: 0.85rem;
          text-align: center;
        }

        .footer-inner {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </footer>
  );
}

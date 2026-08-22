import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/context/auth-context';
import { ThemeProvider } from '@/lib/context/theme-context';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Abhyas — Test Exam Platform',
  description:
    'Browse available tests, take exams, and review your results with Abhyas — a modern test exam platform.',
  keywords: ['test', 'exam', 'quiz', 'education', 'practice'],
  icons: {
    icon: '/logo.png',
  },
};

import MobileBottomNav from '@/components/layout/MobileBottomNav';

const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('abhyas_theme');
      var theme = saved === 'light' || saved === 'dark' ? saved : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <main style={{ flex: '1 0 auto' }}>{children}</main>
              <Footer />
              <MobileBottomNav />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

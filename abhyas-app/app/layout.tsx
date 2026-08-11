import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import Header from '@/components/Header';

import Footer from '@/components/Footer';

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: '1 0 auto' }}>{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

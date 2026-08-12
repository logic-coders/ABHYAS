'use client';

import AboutSection from '@/components/AboutSection';
import ProductShowcase from '@/components/ProductShowcase';
import TestimonialsSection from '@/components/TestimonialsSection';
import Link from 'next/link';

import { useAuth } from '@/lib/auth-context';

export default function PublicLandingPage() {
  const { user } = useAuth();

  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">Master Your Exams with Abhyas</h1>
        <p className="hero-subtitle">
          Practice with real test papers. Choose a subject, take the exam, and
          get instant results with detailed answer breakdowns.
        </p>
        {user ? (
          <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Choose your test and start your test now
            </p>
            <Link href="/tests" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Go to Tests</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>
        ) : (
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Login
            </Link>
          </div>
        )}
      </section>

      {/* About Abhyas Section */}
      <AboutSection />

      {/* Product Screenshot Showcase */}
      <ProductShowcase />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Bottom spacer */}
      <div style={{ height: '3rem' }} />
    </div>
  );
}

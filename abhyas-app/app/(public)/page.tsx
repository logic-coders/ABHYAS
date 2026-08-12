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
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {user ? (
            <Link href="/tests" className="btn btn-primary btn-lg">
              Go to Tests
            </Link>
          ) : (
            <>
              <Link href="/register" className="btn btn-primary btn-lg">
                Get Started Free
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg">
                Login
              </Link>
            </>
          )}
        </div>
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

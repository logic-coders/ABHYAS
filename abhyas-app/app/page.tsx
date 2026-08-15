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
      {/* Funky Hero Section */}
      <section className="funky-hero">
        
        {/* Floating Decorative Elements */}
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        
        <div className="hero-content">
          <h1 className="hero-title animated-gradient-text">
            Master Your Exams<br/>with <span className="highlight-abhyas">Abhyas</span>
          </h1>
          <p className="hero-subtitle typewriter-fade">
            Practice with real test papers. Choose a subject, take the exam, and
            get instant results with detailed answer breakdowns.
          </p>

          {user ? (
            <div className="logged-in-ticket-container">
              <div className="exam-pass-card">
                <div className="pass-header">
                  <span className="pass-badge">VIP ACCESS</span>
                </div>
                <div className="pass-body">
                  <p className="pass-title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Welcome back, {user.name} 👋</p>
                  <p className="pass-subtitle" style={{ fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: '1.5' }}>&ldquo;Success is the sum of small efforts, repeated day in and day out.&rdquo;</p>
                  <Link href="/tests" className="btn btn-primary btn-lg pass-btn">
                    <span>Enter Exam Arena</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                  </Link>
                </div>
                <div className="pass-barcode">
                  |||| ||| ||||| ||| | ||| ||
                </div>
              </div>
            </div>
          ) : (
            <div className="funky-buttons">
              <div className="glowing-wrapper">
                <Link href="/register" className="btn btn-primary btn-lg pulse-btn">
                  Get Started Free
                </Link>
              </div>
              <div className="glowing-wrapper secondary">
                <Link href="/login" className="btn btn-secondary btn-lg float-btn">
                  Login
                </Link>
              </div>
            </div>
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

      <style jsx>{`
        .funky-hero {
          position: relative;
          padding: 6rem 1rem 8rem 1rem;
          text-align: center;
          overflow: hidden;
          background: radial-gradient(circle at center, rgba(139,92,246,0.08) 0%, transparent 60%);
          border-radius: var(--radius-lg);
          margin-bottom: 4rem;
        }

        .hero-content {
          position: relative;
          z-index: 10;
          max-width: 800px;
          margin: 0 auto;
        }

        /* Floating Background Shapes */
        .floating-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          z-index: 1;
          opacity: 0.35;
          animation: float 10s infinite ease-in-out alternate;
        }
        .shape-1 {
          width: 250px;
          height: 250px;
          background: rgba(139, 92, 246, 0.35);
          top: -50px;
          left: -100px;
          animation-duration: 12s;
        }
        .shape-2 {
          width: 300px;
          height: 300px;
          background: rgba(14, 165, 233, 0.25);
          bottom: -100px;
          right: -100px;
          animation-duration: 15s;
          animation-delay: -5s;
        }
        .shape-3 {
          width: 150px;
          height: 150px;
          background: rgba(236, 72, 153, 0.25);
          top: 40%;
          left: 50%;
          animation-duration: 9s;
          animation-delay: -2s;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.1); }
          100% { transform: translate(-20px, 20px) scale(0.9); }
        }

        /* Animated Typography */
        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.03em;
        }
        .animated-gradient-text {
          background: linear-gradient(270deg, #8b5cf6, #3b82f6, #ec4899, #8b5cf6);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 6s ease infinite;
        }
        .highlight-abhyas {
          position: relative;
          display: inline-block;
        }
        .highlight-abhyas::after {
          content: '';
          position: absolute;
          bottom: 5px;
          left: 0;
          width: 100%;
          height: 12px;
          background: rgba(236, 72, 153, 0.35);
          z-index: -1;
          transform: skewX(-15deg);
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .typewriter-fade {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto 3rem auto;
          line-height: 1.6;
          opacity: 0;
          animation: fadeInUp 1s ease 0.5s forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Ticket Card for Logged In User */
        .logged-in-ticket-container {
          perspective: 1000px;
          display: flex;
          justify-content: center;
          margin-top: 3rem;
        }
        .exam-pass-card {
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border-medium);
          border-radius: 20px;
          padding: 2rem;
          max-width: 400px;
          width: 100%;
          box-shadow: var(--shadow-lg);
          transform-style: preserve-3d;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          animation: fadeInUp 1s ease 0.8s forwards;
          opacity: 0;
        }
        .exam-pass-card:hover {
          transform: rotateX(5deg) rotateY(-5deg) translateY(-10px);
          box-shadow: var(--shadow-glow), var(--shadow-lg);
        }

        .pass-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          border-bottom: 1px dashed var(--border-medium);
          padding-bottom: 1rem;
        }
        .pass-badge {
          background: var(--accent-glow);
          color: var(--accent);
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .pass-body {
          margin-bottom: 1.5rem;
        }
        .pass-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }
        .pass-subtitle {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .pass-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: var(--accent-gradient);
          border: none;
          box-shadow: 0 4px 15px var(--accent-glow);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .pass-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 6px 20px var(--accent-glow);
        }

        .pass-barcode {
          font-family: monospace;
          font-size: 1.5rem;
          color: var(--text-muted);
          letter-spacing: 2px;
          text-align: center;
          background: var(--bg-glass);
          padding: 0.5rem;
          border-radius: 8px;
        }

        /* Funky Buttons for Logged out */
        .funky-buttons {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 2rem;
          opacity: 0;
          animation: fadeInUp 1s ease 0.8s forwards;
        }
        .glowing-wrapper {
          position: relative;
          border-radius: var(--radius-md);
        }
        .glowing-wrapper::before {
          content: '';
          position: absolute;
          inset: -3px;
          background: linear-gradient(90deg, #8b5cf6, #3b82f6, #ec4899, #8b5cf6);
          background-size: 200% 200%;
          border-radius: calc(var(--radius-md) + 2px);
          z-index: -1;
          animation: rotateBorder 3s linear infinite;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }
        .glowing-wrapper:hover::before {
          opacity: 1;
          filter: blur(8px);
        }
        .glowing-wrapper.secondary::before {
          background: linear-gradient(90deg, var(--border-medium), var(--border-accent), var(--border-medium));
          opacity: 0.4;
        }

        @keyframes rotateBorder {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .pulse-btn {
          border: none;
          transition: all 0.2s ease;
          position: relative;
          z-index: 1;
        }
        .pulse-btn:hover {
          transform: scale(1.05);
        }
        .float-btn {
          background: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border-medium);
          transition: all 0.2s ease;
          position: relative;
          z-index: 1;
        }
        .float-btn:hover {
          transform: scale(1.05);
          background: var(--bg-card-hover);
        }

        @media (max-width: 640px) {
          .funky-buttons {
            flex-direction: column;
            width: 100%;
            padding: 0 2rem;
          }
          .glowing-wrapper {
            width: 100%;
          }
          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

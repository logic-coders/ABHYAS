'use client';

import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import ProductShowcase from '@/components/landing/ProductShowcase';
import TestimonialsSection from '@/components/landing/TestimonialsSection';

export default function PublicLandingPage() {
  return (
    <div className="container">
      {/* Interactive Hero */}
      <HeroSection />

      {/* About Abhyas Feature Cards */}
      <AboutSection />

      {/* Real Product Interface Showcase */}
      <ProductShowcase />

      {/* Student Testimonials */}
      <TestimonialsSection />

      {/* Bottom Spacer */}
      <div style={{ height: '3rem' }} />
    </div>
  );
}

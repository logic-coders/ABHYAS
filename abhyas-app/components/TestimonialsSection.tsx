'use client';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Mukesh Kumar',
    role: 'Associate Engineer Candidate',
    quote: 'The timed exam environment on Abhyas prepared me to manage time efficiently under pressure. The detailed score breakdowns made my preparation focused and effective.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Amit Singh',
    role: 'Certification Aspirant',
    quote: 'Being able to practice authentic test papers with instant feedback gave me complete confidence before my actual assessment.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Rahul Mohanti',
    role: 'Theory & Skill Assessment Student',
    quote: 'Clean distraction-free interface and seamless bilingual support. Exactly what I needed for systematic exam practice.',
    rating: 5,
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

export default function TestimonialsSection({ testimonials = DEFAULT_TESTIMONIALS }: TestimonialsSectionProps) {
  return (
    <section className="testimonials-section">
      <div className="testimonials-header">
        <span className="testimonials-tag">User Feedback</span>
        <h2 className="testimonials-title">Trusted by Candidates & Associates</h2>
        <p className="testimonials-desc">
          See how practicing with Abhyas helped candidates achieve their exam and certification goals.
        </p>
      </div>

      <div className="testimonials-grid">
        {testimonials.map((t) => (
          <div key={t.id} className="glass-card testimonial-card">
            <div className="rating-stars">
              {'★'.repeat(t.rating)}
            </div>
            <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
            <div className="testimonial-author">
              <div className="author-avatar">
                {t.name.charAt(0).toUpperCase()}
              </div>
              <div className="author-details">
                <strong className="author-name">{t.name}</strong>
                <span className="author-role">{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .testimonials-section {
          margin: 3.5rem 0 2rem 0;
        }

        .testimonials-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .testimonials-tag {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent-light);
          background: var(--accent-glow);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .testimonials-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.5rem;
        }

        .testimonials-desc {
          font-size: 0.95rem;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto;
        }

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .testimonial-card {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-lg);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
          border-color: var(--border-accent);
        }

        .rating-stars {
          color: #f59e0b;
          font-size: 1.1rem;
          margin-bottom: 1rem;
          letter-spacing: 0.1em;
        }

        .testimonial-quote {
          font-size: 0.95rem;
          color: #d1d5db;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .author-avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.4rem;
          height: 2.4rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: #fff;
          background: var(--accent-gradient);
          border-radius: var(--radius-full);
          flex-shrink: 0;
        }

        .author-details {
          display: flex;
          flex-direction: column;
        }

        .author-name {
          font-size: 0.92rem;
          color: #ffffff;
          font-weight: 700;
        }

        .author-role {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
      `}</style>
    </section>
  );
}

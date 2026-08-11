'use client';

import Link from 'next/link';
import { TestSeries, SUBJECT_ICONS, SUBJECT_COLORS } from '@/lib/types';

interface TestSeriesCardProps {
  series: TestSeries;
  index: number;
}

export default function TestSeriesCard({ series, index }: TestSeriesCardProps) {
  const subjectColor = SUBJECT_COLORS[series.subject];
  const icon = SUBJECT_ICONS[series.subject];
  const questionCount = series.isRandom
    ? (series.randomQuestions?.length || 80)
    : (series.endQuestion - series.startQuestion + 1);

  // Strip any trailing date strings (e.g. "- 8/10/2026") from title
  const cleanTitle = series.title.replace(/\s*-\s*\d{1,2}\/\d{1,2}\/\d{4}/, '');

  return (
    <Link href={`/exam/${series.id}`} className="card-link">
      <div
        className="glass-card test-card"
        style={
          {
            '--subject-color': subjectColor,
            animationDelay: `${index * 0.08}s`,
          } as React.CSSProperties
        }
      >
        {/* Subject glow accent */}
        <div className="card-glow" />

        {/* Header */}
        <div className="card-header">
          <span className="card-icon">{icon}</span>
          <span
            className="badge"
            style={{
              color: subjectColor,
              borderColor: `${subjectColor}33`,
              background: `${subjectColor}15`,
            }}
          >
            {series.subject}
          </span>
        </div>

        {/* Title */}
        <h3 className="card-title">{cleanTitle}</h3>

        {/* Meta */}
        <div className="card-meta">
          <span className="meta-item">
            📋 {questionCount} questions
          </span>
          <span className="meta-item">
            ⏱️ 1h 20m
          </span>
        </div>

        {/* CTA */}
        <div className="card-cta">
          <span className="cta-text">Start Exam</span>
          <span className="cta-arrow">→</span>
        </div>
      </div>

      <style jsx>{`
        .card-link {
          text-decoration: none;
          color: inherit;
        }

        .test-card {
          position: relative;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          overflow: hidden;
          animation: fadeInUp 0.5s ease both;
          cursor: pointer;
        }

        .card-glow {
          position: absolute;
          top: -40%;
          right: -20%;
          width: 60%;
          height: 80%;
          background: radial-gradient(
            circle,
            var(--subject-color) 0%,
            transparent 70%
          );
          opacity: 0.06;
          pointer-events: none;
          transition: opacity var(--transition-base);
        }

        .test-card:hover .card-glow {
          opacity: 0.12;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-icon {
          font-size: 1.8rem;
        }

        .card-title {
          font-size: 1.12rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: var(--text-primary);
          line-height: 1.35;
        }

        .card-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .meta-item {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .card-cta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.25rem;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-subtle);
        }

        .cta-text {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--subject-color);
        }

        .cta-arrow {
          font-size: 1rem;
          color: var(--subject-color);
          transition: transform var(--transition-fast);
        }

        .test-card:hover .cta-arrow {
          transform: translateX(4px);
        }
      `}</style>
    </Link>
  );
}

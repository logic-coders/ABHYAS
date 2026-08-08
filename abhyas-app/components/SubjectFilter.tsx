'use client';

import { Subject, SUBJECTS, SUBJECT_ICONS } from '@/lib/types';

interface SubjectFilterProps {
  selected: Subject | 'All';
  onChange: (subject: Subject | 'All') => void;
}

export default function SubjectFilter({ selected, onChange }: SubjectFilterProps) {
  return (
    <div className="subject-filter">
      <button
        className={`filter-pill ${selected === 'All' ? 'filter-pill-active' : ''}`}
        onClick={() => onChange('All')}
      >
        🎯 All
      </button>
      {SUBJECTS.map((subject) => (
        <button
          key={subject}
          className={`filter-pill ${selected === subject ? 'filter-pill-active' : ''}`}
          onClick={() => onChange(subject)}
          data-subject={subject.toLowerCase()}
        >
          {SUBJECT_ICONS[subject]} {subject}
        </button>
      ))}

      <style jsx>{`
        .subject-filter {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          margin-bottom: 2rem;
          animation: fadeInUp 0.5s ease 0.2s both;
        }

        .filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.2rem;
          font-family: inherit;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-glass);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-base);
          white-space: nowrap;
        }

        .filter-pill:hover {
          color: var(--text-primary);
          background: var(--bg-glass-strong);
          border-color: var(--border-medium);
        }

        .filter-pill-active {
          color: #fff;
          background: var(--accent-gradient);
          border-color: transparent;
          box-shadow: 0 2px 12px var(--accent-glow);
        }

        .filter-pill-active:hover {
          color: #fff;
        }

        /* Subject-specific active colors */
        .filter-pill-active[data-subject='music'] {
          background: var(--color-music);
          box-shadow: 0 2px 12px rgba(168, 85, 247, 0.3);
        }
        .filter-pill-active[data-subject='math'] {
          background: var(--color-math);
          box-shadow: 0 2px 12px rgba(59, 130, 246, 0.3);
        }
        .filter-pill-active[data-subject='history'] {
          background: var(--color-history);
          box-shadow: 0 2px 12px rgba(245, 158, 11, 0.3);
        }
        .filter-pill-active[data-subject='geography'] {
          background: var(--color-geography);
          box-shadow: 0 2px 12px rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </div>
  );
}

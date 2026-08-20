'use client';

import { useMemo } from 'react';

interface MiniStreakCalendarProps {
  completedDates: string[];
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function MiniStreakCalendar({ completedDates }: MiniStreakCalendarProps) {
  const today = new Date();
  const completedSet = useMemo(() => new Set(completedDates), [completedDates]);

  const month = today.getMonth();
  const year = today.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthName = today.toLocaleString('default', { month: 'short' });

  const cells: { day: number | null; isToday: boolean; isCompleted: boolean; isFuture: boolean }[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ day: null, isToday: false, isCompleted: false, isFuture: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = d === today.getDate();
    const isCompleted = completedSet.has(dateStr);
    const cellDate = new Date(year, month, d);
    const isFuture = cellDate > today;
    cells.push({ day: d, isToday, isCompleted, isFuture });
  }

  return (
    <div className="mini-cal">
      <div className="mini-cal-header">
        <span className="mini-cal-month">{monthName} {year}</span>
        <span className="mini-cal-day-count">Day {today.getDate()}</span>
      </div>

      <div className="mini-cal-grid weekday-row">
        {WEEKDAYS.map((wd, i) => (
          <div key={i} className="mini-wd">{wd}</div>
        ))}
      </div>

      <div className="mini-cal-grid">
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className={`mini-day ${
              cell.day === null ? 'empty' : ''
            } ${cell.isToday && !cell.isCompleted ? 'is-today' : ''} ${
              cell.isCompleted ? 'is-done' : ''
            } ${cell.isFuture ? 'is-future' : ''}`}
          >
            {cell.day !== null && (
              <>
                {cell.isCompleted ? (
                  <div className="check-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                ) : (
                  <>
                    <span className="mini-day-num">{cell.day}</span>
                    {!cell.isFuture && !cell.isToday && (
                      <span className="mini-dot miss-dot" />
                    )}
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        .mini-cal {
          min-width: 220px;
          max-width: 260px;
        }

        .mini-cal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.6rem;
        }

        .mini-cal-month {
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .mini-cal-day-count {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
        }

        .mini-cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }

        .weekday-row {
          margin-bottom: 2px;
        }

        .mini-wd {
          text-align: center;
          font-size: 0.62rem;
          font-weight: 800;
          color: var(--text-muted);
          padding: 2px 0;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .mini-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1;
          border-radius: 4px;
          position: relative;
          gap: 1px;
        }

        .mini-day.empty {
          pointer-events: none;
        }

        .mini-day.is-future {
          opacity: 0.25;
        }

        .mini-day-num {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-secondary);
          line-height: 1;
        }

        .mini-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
        }

        .miss-dot {
          background: #ef4444;
          opacity: 0.8;
        }

        /* Check Icon */
        .check-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1.5px solid #3b82f6; /* Blue ring */
          color: #3b82f6;
        }

        .check-icon svg {
          width: 12px;
          height: 12px;
        }

        /* Today */
        .mini-day.is-today {
          background: #10b981;
          border-radius: 50%;
        }

        .mini-day.is-today .mini-day-num {
          color: #ffffff;
          font-weight: 800;
        }

        .mini-day.is-today .mini-dot {
          display: none;
        }
      `}</style>
    </div>
  );
}

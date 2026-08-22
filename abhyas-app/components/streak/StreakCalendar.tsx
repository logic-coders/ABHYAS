'use client';

import { useState, useMemo } from 'react';

interface StreakCalendarProps {
  completedDates: string[]; // Array of "YYYY-MM-DD" strings
  currentStreak: number;
  longestStreak: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function StreakCalendar({ completedDates, currentStreak, longestStreak }: StreakCalendarProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const completedSet = useMemo(() => new Set(completedDates), [completedDates]);

  // Get the days in the current view month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Navigate months
  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToToday = () => {
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  };

  const isCurrentMonth = viewMonth === today.getMonth() && viewYear === today.getFullYear();

  // Count completions in this view month
  const monthCompletions = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (completedSet.has(dateStr)) count++;
    }
    return count;
  }, [viewYear, viewMonth, daysInMonth, completedSet]);

  // Build the calendar grid
  const calendarCells: { day: number | null; dateStr: string; isToday: boolean; isCompleted: boolean; isFuture: boolean }[] = [];

  // Empty cells before the first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push({ day: null, dateStr: '', isToday: false, isCompleted: false, isFuture: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = d === today.getDate() && isCurrentMonth;
    const isCompleted = completedSet.has(dateStr);
    const cellDate = new Date(viewYear, viewMonth, d);
    const isFuture = cellDate > today;
    calendarCells.push({ day: d, dateStr, isToday, isCompleted, isFuture });
  }

  return (
    <div className="streak-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-title-row">
          <h3 className="calendar-heading">📅 Streak Calendar</h3>
          <span className="calendar-month-completions">
            {monthCompletions} / {daysInMonth} days completed
          </span>
        </div>

        <div className="calendar-nav">
          <button
            type="button"
            className="cal-nav-btn"
            onClick={goToPrevMonth}
            aria-label="Previous month"
          >
            ‹
          </button>

          <button
            type="button"
            className="cal-month-label"
            onClick={goToToday}
            title="Go to current month"
          >
            {MONTH_NAMES[viewMonth]} {viewYear}
          </button>

          <button
            type="button"
            className="cal-nav-btn"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="calendar-grid weekday-header">
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="weekday-cell">{wd}</div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="calendar-grid day-grid">
        {calendarCells.map((cell, idx) => (
          <div
            key={idx}
            className={`day-cell ${
              cell.day === null ? 'empty' : ''
            } ${cell.isToday ? 'today' : ''} ${
              cell.isCompleted ? 'completed' : ''
            } ${cell.isFuture ? 'future' : ''}`}
            title={
              cell.day
                ? cell.isCompleted
                  ? `✅ Completed on ${cell.dateStr}`
                  : cell.isToday
                  ? "Today's challenge"
                  : cell.isFuture
                  ? 'Upcoming'
                  : `Missed — ${cell.dateStr}`
                : undefined
            }
          >
            {cell.day !== null && (
              <>
                <span className="day-number">{cell.day}</span>
                {cell.isCompleted && <span className="day-dot">🔥</span>}
                {cell.isToday && !cell.isCompleted && <span className="day-dot today-dot">●</span>}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot completed-legend" />
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot today-legend" />
          <span>Today</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot missed-legend" />
          <span>Missed</span>
        </div>
      </div>

      <style jsx>{`
        .streak-calendar {
          background: var(--bg-card);
          border: 1px solid var(--border-medium);
          border-radius: var(--radius-xl);
          padding: 1.75rem 2rem;
          animation: fadeInUp 0.5s ease;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .calendar-title-row {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .calendar-heading {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .calendar-month-completions {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .calendar-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cal-nav-btn {
          background: transparent;
          border: 1px solid var(--border-medium);
          color: var(--text-primary);
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          font-size: 1.3rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          line-height: 1;
        }

        .cal-nav-btn:hover {
          background: var(--bg-card-hover);
          border-color: var(--accent);
        }

        .cal-month-label {
          background: transparent;
          border: none;
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-primary);
          cursor: pointer;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          transition: background 0.15s ease;
          font-family: inherit;
        }

        .cal-month-label:hover {
          background: var(--bg-card-hover);
        }

        /* Grid */
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 3px;
        }

        .weekday-header {
          margin-bottom: 4px;
        }

        .weekday-cell {
          text-align: center;
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.4rem 0;
        }

        .day-cell {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-sm);
          position: relative;
          transition: all 0.15s ease;
          cursor: default;
          gap: 1px;
        }

        .day-cell.empty {
          pointer-events: none;
        }

        .day-cell.future {
          opacity: 0.3;
        }

        .day-number {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-secondary);
          line-height: 1;
        }

        .day-dot {
          font-size: 0.55rem;
          line-height: 1;
        }

        .today-dot {
          color: #3b82f6;
          font-size: 0.6rem;
        }

        /* Completed */
        .day-cell.completed {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .day-cell.completed .day-number {
          color: #ef4444;
          font-weight: 800;
        }

        /* Today */
        .day-cell.today {
          background: rgba(59, 130, 246, 0.12);
          border: 2px solid rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.15);
        }

        .day-cell.today .day-number {
          color: #3b82f6;
          font-weight: 800;
        }

        .day-cell.today.completed {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15));
          border-color: rgba(239, 68, 68, 0.5);
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
        }

        .day-cell.today.completed .day-number {
          color: #ef4444;
        }

        /* Past non-completed (missed) — subtle styling */
        .day-cell:not(.completed):not(.today):not(.empty):not(.future):hover {
          background: var(--bg-card-hover);
        }

        /* Legend */
        .calendar-legend {
          display: flex;
          gap: 1.25rem;
          margin-top: 1rem;
          padding-top: 0.85rem;
          border-top: 1px solid var(--border-subtle);
          justify-content: center;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .completed-legend {
          background: #ef4444;
        }

        .today-legend {
          background: #3b82f6;
        }

        .missed-legend {
          background: var(--bg-glass-strong);
          border: 1px solid var(--border-medium);
        }

        @media (max-width: 640px) {
          .streak-calendar {
            padding: 1.25rem;
          }

          .calendar-header {
            flex-direction: column;
            text-align: center;
          }

          .day-number {
            font-size: 0.7rem;
          }

          .day-dot {
            font-size: 0.45rem;
          }
        }
      `}</style>
    </div>
  );
}

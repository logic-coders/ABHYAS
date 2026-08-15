'use client';

import { useState, useEffect, useRef } from 'react';

interface ExamTimerProps {
  seriesId: string;
  onTimeUp: () => void;
}

const EXAM_DURATION_MS = 80 * 60 * 1000; // 1 hour 20 minutes

export default function ExamTimer({ seriesId, onTimeUp }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(EXAM_DURATION_MS);
  
  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    // Check if end time is already set
    const storageKey = `exam_end_time_${seriesId}`;
    let endTimeStr = sessionStorage.getItem(storageKey);
    let endTime: number;

    const now = Date.now();
    if (endTimeStr) {
      const parsed = parseInt(endTimeStr, 10);
      // If valid and still in the future, use it. Otherwise reset stale timer.
      if (!isNaN(parsed) && parsed > now) {
        endTime = parsed;
      } else {
        sessionStorage.removeItem(storageKey);
        endTime = now + EXAM_DURATION_MS;
        sessionStorage.setItem(storageKey, endTime.toString());
      }
    } else {
      // Set end time for the first time
      endTime = now + EXAM_DURATION_MS;
      sessionStorage.setItem(storageKey, endTime.toString());
    }

    // Update timer every second
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        onTimeUpRef.current();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    // Initial check
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      setTimeLeft(0);
      onTimeUpRef.current();
    } else {
      setTimeLeft(remaining);
    }

    return () => clearInterval(interval);
  }, [seriesId]);

  // Format time (HH:MM:SS or MM:SS)
  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':');
    }
    
    return [
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  const isCritical = timeLeft < 2 * 60 * 1000; // Less than 2 minutes
  const isWarning = timeLeft < 5 * 60 * 1000; // Less than 5 minutes

  return (
    <div className={`timer-card ${isCritical ? 'timer-critical' : isWarning ? 'timer-warning' : ''}`}>
      <div className="timer-label">TIME REMAINING</div>
      <div className="timer-display">
        <span className="timer-digits">{formatTime(timeLeft)}</span>
      </div>
      
      <style jsx>{`
        .timer-card {
          background: #0f172a;
          border: 2px solid #3b82f6;
          border-radius: var(--radius-md);
          padding: 0.75rem 1.25rem;
          text-align: center;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
          width: 100%;
        }

        .timer-label {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 0.2rem;
        }

        .timer-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .timer-digits {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 1.65rem;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: 0.05em;
          line-height: 1.1;
        }

        .timer-warning {
          background: #451a03;
          border-color: #f97316;
          box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35);
        }

        .timer-warning .timer-digits {
          color: #fdba74;
        }

        .timer-warning .timer-label {
          color: #fed7aa;
        }

        .timer-critical {
          background: #450a0a;
          border-color: #ef4444;
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.5);
          animation: timerPulse 1.2s infinite;
        }

        .timer-critical .timer-digits {
          color: #fca5a5;
        }

        .timer-critical .timer-label {
          color: #fecaca;
        }

        @keyframes timerPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
          50% { transform: scale(1.02); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}

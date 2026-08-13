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

  // Format time (HH:MM:SS)
  const formatTime = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };

  const isCritical = timeLeft < 2 * 60 * 1000; // Less than 2 minutes
  const isWarning = timeLeft < 5 * 60 * 1000; // Less than 5 minutes

  return (
    <div className={`exam-timer ${isCritical ? 'timer-critical' : isWarning ? 'timer-warning' : ''}`}>
      <span className="timer-icon">⏱️</span>
      <span className="timer-text">{formatTime(timeLeft)}</span>
      
      <style jsx>{`
        .exam-timer {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.6rem 1.2rem;
          background: #1e1b4b;
          border: 2px solid #6366f1;
          border-radius: var(--radius-md);
          font-variant-numeric: tabular-nums;
          font-weight: 800;
          font-size: 1.15rem;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
          letter-spacing: 0.05em;
        }

        .timer-warning {
          background: #7c2d12;
          border-color: #f97316;
          color: #ffedd5;
          box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);
        }

        .timer-critical {
          background: #7f1d1d;
          border-color: #ef4444;
          color: #fee2e2;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
          50% { transform: scale(1.03); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}

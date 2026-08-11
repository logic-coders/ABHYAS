'use client';

import { useState, useEffect } from 'react';

interface ExamTimerProps {
  seriesId: string;
  onTimeUp: () => void;
}

const EXAM_DURATION_MS = 80 * 60 * 1000; // 1 hour 20 minutes

export default function ExamTimer({ seriesId, onTimeUp }: ExamTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(EXAM_DURATION_MS);
  
  useEffect(() => {
    // Check if end time is already set
    const storageKey = `exam_end_time_${seriesId}`;
    let endTimeStr = sessionStorage.getItem(storageKey);
    let endTime: number;

    if (endTimeStr) {
      endTime = parseInt(endTimeStr, 10);
    } else {
      // Set end time for the first time
      endTime = Date.now() + EXAM_DURATION_MS;
      sessionStorage.setItem(storageKey, endTime.toString());
    }

    // Update timer every second
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        onTimeUp();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    // Initial check
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      setTimeLeft(0);
      onTimeUp();
    } else {
      setTimeLeft(remaining);
    }

    return () => clearInterval(interval);
  }, [seriesId, onTimeUp]);

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

  const isWarning = timeLeft < 5 * 60 * 1000; // Less than 5 minutes

  return (
    <div className={`exam-timer ${isWarning ? 'timer-warning' : ''}`}>
      <span className="timer-icon">⏱️</span>
      <span className="timer-text">{formatTime(timeLeft)}</span>
      
      <style jsx>{`
        .exam-timer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-glass-strong);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-variant-numeric: tabular-nums;
          font-weight: 700;
          color: var(--text-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .timer-warning {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.4);
          color: var(--color-incorrect);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
}

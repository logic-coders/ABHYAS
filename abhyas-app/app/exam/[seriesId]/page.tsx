'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Question } from '@/lib/types';
import QuestionView from '@/components/QuestionView';
import Pagination from '@/components/Pagination';

interface ExamData {
  seriesId: string;
  seriesTitle: string;
  subject: string;
  totalQuestions: number;
  questions: Question[];
}

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const seriesId = params.seriesId as string;

  const [examData, setExamData] = useState<ExamData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/exam/${seriesId}/questions`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to load exam');
        }
        const data = await res.json();
        setExamData(data);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load exam');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExam();
  }, [seriesId]);

  const handleSelect = useCallback(
    (option: string) => {
      if (!examData) return;
      const question = examData.questions[currentIndex];
      setAnswers((prev) => ({ ...prev, [question.number]: option }));
    },
    [examData, currentIndex]
  );

  const handleSubmit = async () => {
    if (!examData) return;
    setIsSubmitting(true);

    try {
      const answerPayload = Object.entries(answers).map(([qNum, option]) => ({
        questionNumber: Number(qNum),
        selectedOption: option,
      }));

      const res = await fetch(`/api/exam/${seriesId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerPayload }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit exam');
      }

      const result = await res.json();

      // Store result in sessionStorage for the result page
      sessionStorage.setItem(`result-${seriesId}`, JSON.stringify(result));
      router.push(`/result/${seriesId}`);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container page-wrapper">
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="skeleton" style={{ height: '2rem', width: '40%', marginBottom: '1.5rem' }} />
          <div className="skeleton" style={{ height: '3rem', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: '1.5rem', width: '80%', marginBottom: '2rem' }} />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '3.5rem', marginBottom: '0.75rem' }} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !examData) {
    return (
      <div className="container page-wrapper">
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <p className="empty-state-text">{error || 'Exam not found'}</p>
          <button className="btn btn-primary" onClick={() => router.push('/')}>
            ← Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = examData.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="container page-wrapper">
      <div className="exam-container">
        {/* Exam Header */}
        <div className="exam-header">
          <button className="btn btn-ghost" onClick={() => router.push('/')}>
            ← Back
          </button>
          <div className="exam-title-area">
            <h1 className="exam-title">{examData.seriesTitle}</h1>
            <span className="badge">{examData.subject}</span>
          </div>
        </div>

        {/* Question */}
        <QuestionView
          question={currentQuestion}
          selectedOption={answers[currentQuestion.number] || ''}
          onSelect={handleSelect}
        />

        {/* Pagination */}
        <Pagination
          current={currentIndex}
          total={examData.questions.length}
          onPrevious={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          onNext={() => setCurrentIndex((i) => Math.min(examData.questions.length - 1, i + 1))}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          answeredCount={answeredCount}
        />
      </div>

      <style jsx>{`
        .exam-container {
          max-width: 720px;
          margin: 0 auto;
        }

        .exam-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .exam-title-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .exam-title {
          font-size: 1.3rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}

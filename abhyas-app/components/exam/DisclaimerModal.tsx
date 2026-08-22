'use client';

interface DisclaimerModalProps {
  onAccept: () => void;
  onCancel: () => void;
}

export default function DisclaimerModal({ onAccept, onCancel }: DisclaimerModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content disclaimer-modal">
        <h2 className="modal-title">⚠️ Important Exam Rules</h2>
        
        <div className="disclaimer-body">
          <p>Before you begin the test, please read the following rules carefully:</p>
          <ul>
            <li><strong>Timer Starts Immediately:</strong> The timer will start as soon as you click the button below.</li>
            <li><strong>Time Limit:</strong> You have exactly <strong>1 hour 20 minutes</strong> to complete this test.</li>
            <li><strong>Auto-Submit:</strong> When the timer reaches 0:00, the test will be automatically submitted.</li>
            <li><strong>No Changes After Time is Up:</strong> Once time expires, you cannot answer any more questions or change your answers.</li>
          </ul>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onAccept}>
            I Understand & Start Test
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 2rem;
          width: 90%;
          max-width: 550px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease;
        }

        .modal-title {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .disclaimer-body {
          margin-bottom: 2rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        
        .disclaimer-body ul {
          margin-top: 1rem;
          padding-left: 1.5rem;
        }
        
        .disclaimer-body li {
          margin-bottom: 0.75rem;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

import AdminForm from '@/components/AdminForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — Create Test Series | Abhyas',
  description: 'Create a new test series by uploading a PDF and defining the question range.',
};

export default function AdminPage() {
  return (
    <div className="container page-wrapper">
      <div className="admin-header">
        <h1 className="section-heading" style={{ marginBottom: '0.25rem' }}>
          ⚙️ Admin Dashboard
        </h1>
        <p className="admin-description">
          Upload a PDF containing questions and answers, define the question range,
          and publish a new test series for students.
        </p>
      </div>

      <AdminForm />

      <style>{`
        .admin-header {
          margin-bottom: 2rem;
          max-width: 600px;
          animation: fadeInUp 0.5s ease;
        }

        .admin-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

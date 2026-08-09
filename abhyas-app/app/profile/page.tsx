import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getResultsByUser } from '@/lib/result-store';
import Link from 'next/link';
import { SUBJECT_COLORS, SUBJECT_ICONS } from '@/lib/types';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    redirect('/login');
  }

  const results = await getResultsByUser(user.id);

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>User Profile</h1>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user.role}</span></p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Test History</h2>
      {results.length === 0 ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't taken any tests yet.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            Browse Tests
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {results.map((result) => {
            const subjectColor = SUBJECT_COLORS[result.subject] || 'var(--accent-light)';
            const icon = SUBJECT_ICONS[result.subject] || '📝';
            return (
              <div 
                key={result.id} 
                className="glass-card" 
                style={{ 
                  padding: '1.5rem', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderLeft: `4px solid ${subjectColor}`
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    <span style={{ marginRight: '0.5rem' }}>{icon}</span>
                    {result.seriesTitle}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Taken on: {new Date(result.date).toLocaleDateString()} at {new Date(result.date).toLocaleTimeString()}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: result.percentage >= 70 ? 'var(--color-correct)' : 'var(--text-primary)'
                  }}>
                    {result.percentage}%
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {result.score} / {result.totalQuestions} correct
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

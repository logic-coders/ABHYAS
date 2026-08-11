import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container page-wrapper">
      <div className="glass-card" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>Profile Information</h1>
        
        <div style={{ display: 'grid', gap: '1rem', fontSize: '1.1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Name:</strong>
            <span>{user.name}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Email:</strong>
            <span>{user.email}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Role:</strong>
            <span>
              <span className="role-tag" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
                {user.role}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

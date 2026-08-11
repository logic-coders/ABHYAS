import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getResultsByUser } from '@/lib/result-store';
import ProfileHistory from '@/components/ProfileHistory';

export default async function TestHistoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    redirect('/login');
  }

  const results = await getResultsByUser(user.id);

  return (
    <div className="container page-wrapper">
      <h1 className="section-heading" style={{ marginBottom: '2rem' }}>Test History</h1>
      <ProfileHistory results={results} />
    </div>
  );
}

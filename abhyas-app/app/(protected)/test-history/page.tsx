import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME, isAdminEmail } from '@/lib/utils/auth';
import { getResultsByUser, clearAdminResultsOlderThanToday } from '@/lib/db/result-store';
import ProfileHistory from '@/components/profile/ProfileHistory';

export default async function TestHistoryPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  if (!user) {
    redirect('/login');
  }

  // If user is admin, automatically clear prior days' test history
  if (user.role === 'admin' || isAdminEmail(user.email)) {
    await clearAdminResultsOlderThanToday(user.id);
  }

  const results = await getResultsByUser(user.id);

  return (
    <div className="container page-wrapper">
      <h1 className="section-heading" style={{ marginBottom: '2rem' }}>Test History</h1>
      <ProfileHistory results={results} />
    </div>
  );
}

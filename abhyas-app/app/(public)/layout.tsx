import { redirect } from 'next/navigation';
import { getUser } from '@/lib/utils/auth';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (user) {
    if (user.role === 'admin') {
      redirect('/admin');
    } else {
      redirect('/');
    }
  }

  return <>{children}</>;
}

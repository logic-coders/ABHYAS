import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getUserById } from '@/lib/user-store';
import ProfileView from '@/components/ProfileView';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const authUser = token ? await verifyToken(token) : null;

  if (!authUser) {
    redirect('/login');
  }

  const user = await getUserById(authUser.id);

  return (
    <ProfileView
      user={{
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        role: authUser.role,
        createdAt: user?.createdAt,
      }}
    />
  );
}

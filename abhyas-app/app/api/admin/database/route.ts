import { NextResponse, NextRequest } from 'next/server';
import { getAllUsers } from '@/lib/db/user-store';
import { getAllResults } from '@/lib/db/result-store';
import { getCurrentUser, toSafeUser } from '@/lib/utils/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allUsers = await getAllUsers();
    const safeUsers = allUsers.map(toSafeUser);
    const allResults = await getAllResults();

    const usersWithResults = safeUsers.map(user => {
      const userResults = allResults.filter(r => r.userId === user.id);
      return {
        ...user,
        results: userResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      };
    });

    return NextResponse.json(usersWithResults, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch user database:', error);
    return NextResponse.json({ error: 'Failed to fetch user database' }, { status: 500 });
  }
}

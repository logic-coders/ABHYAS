import { NextResponse, NextRequest } from 'next/server';
import { getAllUsers, updateUserStatus } from '@/lib/user-store';
import { getCurrentUser, toSafeUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allUsers = await getAllUsers();
    // Return all users safely without passwords
    const safeUsers = allUsers.map(toSafeUser);
    
    return NextResponse.json(safeUsers, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json({ error: 'Invalid user ID or status' }, { status: 400 });
    }

    await updateUserStatus(userId, status);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to update user status:', error);
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
  }
}

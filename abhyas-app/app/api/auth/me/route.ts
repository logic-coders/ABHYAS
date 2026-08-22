import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/utils/auth';

/**
 * GET /api/auth/me
 * Returns the currently authenticated user, or 401.
 * Used by the client to hydrate auth state on page load.
 */
export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  return NextResponse.json({ user });
}

import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/utils/auth';

/**
 * POST /api/auth/logout
 * Clears the auth cookie.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  clearAuthCookie(response);
  return response;
}

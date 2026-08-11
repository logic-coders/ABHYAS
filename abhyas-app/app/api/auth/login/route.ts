import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/user-store';
import { createToken, setAuthCookie, toSafeUser } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';

/**
 * POST /api/auth/login
 * Authenticates a user with email + password.
 * Returns SafeUser + sets HttpOnly JWT cookie.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check account status
    const status = user.accountStatus || 'PENDING';
    if (status === 'PENDING') {
      return NextResponse.json(
        { error: 'Your account is pending admin approval' },
        { status: 403 }
      );
    }
    if (status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Your account registration was rejected' },
        { status: 403 }
      );
    }

    // Create token & set cookie
    const safeUser = toSafeUser(user);
    const token = await createToken(safeUser);

    const response = NextResponse.json({ user: safeUser }, { status: 200 });
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { addUser } from '@/lib/user-store';
import { createToken, setAuthCookie, toSafeUser } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { User } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/auth/register
 * Creates a new user account (role: 'user' only).
 * Admins must be seeded via the CLI script.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);

    const user: User = {
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'user', // Always 'user' — admins are seeded via CLI
      accountStatus: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await addUser(user);

    // No auto-login since account is PENDING
    const safeUser = toSafeUser(user);

    return NextResponse.json(
      { message: 'Registration successful. Account pending admin approval.', user: safeUser },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    console.error('Registration error:', message);

    // Return user-friendly error for known issues (duplicate email, cap reached)
    if (message.includes('already exists') || message.includes('cap reached')) {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}

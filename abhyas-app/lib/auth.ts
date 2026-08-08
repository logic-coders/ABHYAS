import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { SafeUser, User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'abhyas-dev-secret-change-in-production';
const COOKIE_NAME = 'abhyas-token';
const TOKEN_EXPIRY = '7d'; // 7 days

/* ─── Password utilities ─── */

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/* ─── JWT utilities ─── */

export function createToken(user: SafeUser): string {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

export function verifyToken(token: string): SafeUser | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & SafeUser;
    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/* ─── Cookie utilities ─── */

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/* ─── Request helpers ─── */

/**
 * Extract the current user from the request's auth cookie.
 * Returns null if not authenticated or token is invalid.
 */
export function getCurrentUser(request: NextRequest): SafeUser | null {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Strip sensitive fields from a User to produce a SafeUser.
 */
export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export { COOKIE_NAME };

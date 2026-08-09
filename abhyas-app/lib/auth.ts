import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
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

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'abhyas-dev-secret-change-in-production';
  return new TextEncoder().encode(secret);
};

export async function createToken(user: SafeUser): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getJwtSecretKey());
}

export async function verifyToken(token: string): Promise<SafeUser | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'user',
    };
  } catch (err) {
    console.error("verifyToken error:", err);
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
export async function getCurrentUser(request: NextRequest): Promise<SafeUser | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
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

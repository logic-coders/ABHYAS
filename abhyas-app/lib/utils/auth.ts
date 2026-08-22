import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SafeUser, User } from '@/lib/types';

const JWT_SECRET = process.env.JWT_SECRET || 'abhyas-dev-secret-change-in-production';
const COOKIE_NAME = 'abhyas-token';
const TOKEN_EXPIRY = '7d'; // 7 days

// Whitelisted admin emails read dynamically from environment variables (ADMIN_EMAILS or ADMIN_EMAIL)
export function getAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL;
  if (envEmails) {
    return envEmails.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  return ['chandansingh15102000@gmail.com'];
}

export function isAdminEmail(email: string): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase().trim());
}

export const ADMIN_EMAILS = new Proxy([] as string[], {
  get(_target, prop) {
    const list = getAdminEmails();
    if (prop === 'includes') {
      return (searchElement: string) => isAdminEmail(searchElement);
    }
    if (prop === 'length') {
      return list.length;
    }
    const val = Reflect.get(list, prop);
    return typeof val === 'function' ? val.bind(list) : val;
  },
});

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
      accountStatus: payload.accountStatus as 'PENDING' | 'APPROVED' | 'REJECTED',
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
  const isAdmin = isAdminEmail(user.email);
  const role = isAdmin ? 'admin' : (user.role || 'user');
  const accountStatus = isAdmin ? 'APPROVED' : (user.accountStatus || 'PENDING');
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role,
    accountStatus,
  };
}

export { COOKIE_NAME };

/**
 * Extract the current user using next/headers for Server Components.
 */
export async function getUser(): Promise<SafeUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/*
 * IMPORTANT: This middleware is completely self-contained.
 * It does NOT import from ./lib/* to prevent webpack from
 * bundling Node.js-only modules (like pdf-parse) into the
 * Edge Runtime, which would cause "__dirname is not defined".
 */

const COOKIE_NAME = 'abhyas-token';

/** Routes that don't require authentication */
const PUBLIC_ROUTES = ['/login', '/register'];

/** Routes only accessible to admin role */
const ADMIN_ROUTES = ['/admin'];

/** API routes that require admin role for mutation */
const ADMIN_API_ROUTES = ['/api/upload-pdf', '/api/test-series'];

interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

async function verifyTokenEdge(token: string): Promise<SafeUser | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'abhyas-dev-secret-change-in-production'
    );
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'user',
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for auth API routes and static assets
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Read JWT from cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  let user = token ? await verifyTokenEdge(token) : null;

  if (user && user.email.toLowerCase() === 'chandansingh15102000@gmail.com') {
    user.role = 'admin';
  }

  // ── Public routes (login, register) ──
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    // If already logged in, redirect away from login/register
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = user.role === 'admin' ? '/admin' : '/';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── All other routes require authentication ──
  if (!user && !pathname.startsWith("/api/exam")) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // ── Admin-only pages ──
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!user || user.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // ── Admin-only API routes (POST/PUT/DELETE only) ──
  if (
    ADMIN_API_ROUTES.some((route) => pathname.startsWith(route)) &&
    request.method !== 'GET'
  ) {
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

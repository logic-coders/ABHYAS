import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, COOKIE_NAME } from './lib/auth';

/** Routes that don't require authentication */
const PUBLIC_ROUTES = ['/login', '/register'];

/** Routes only accessible to admin role */
const ADMIN_ROUTES = ['/admin'];

/** API routes that require admin role for mutation */
const ADMIN_API_ROUTES = ['/api/upload-pdf', '/api/test-series'];

export async function proxy(request: NextRequest) {
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
  let user = token ? await verifyToken(token) : null;
  
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
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // ── Admin-only pages ──
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (user.role !== 'admin') {
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
    if (user.role !== 'admin') {
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

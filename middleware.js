import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

function verifyToken(token) {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const payload = Buffer.from(parts[0], 'base64url').toString();
    const expected = crypto.createHmac('sha256', ADMIN_PASS || '').update(payload).digest('base64url');
    return expected === parts[1];
  } catch (e) {
    return false;
  }
}

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const protectedPaths = pathname.startsWith('/admin') || pathname.startsWith('/api/admin-candidatures') || pathname.startsWith('/api/media-url');
  if (!protectedPaths) return NextResponse.next();

  // Allow static assets under /admin to pass
  if (pathname.startsWith('/admin/') && pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|map)$/)) return NextResponse.next();

  // Check cookie first
  const token = req.cookies.get('qh_admin')?.value;
  if (token && verifyToken(token)) return NextResponse.next();

  // Not authenticated -> redirect to login page
  const loginUrl = new URL('/admin/login', req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin-candidatures/:path*', '/api/media-url/:path*', '/admin']
};

import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

function signPayload(payload) {
  const h = crypto.createHmac('sha256', ADMIN_PASS || '').update(payload).digest('base64url');
  return `${Buffer.from(payload).toString('base64url')}.${h}`;
}

function verifyToken(token) {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  try {
    const payload = Buffer.from(parts[0], 'base64url').toString();
    const expected = crypto.createHmac('sha256', ADMIN_PASS || '').update(payload).digest('base64url');
    return expected === parts[1];
  } catch (e) {
    return false;
  }
}

export async function POST(req) {
  try {
    const { user, pass } = await req.json();
    if (!user || !pass) return NextResponse.json({ error: 'Missing' }, { status: 400 });
    if (user !== ADMIN_USER || pass !== ADMIN_PASS) return NextResponse.json({ error: 'Invalid' }, { status: 401 });

    const payload = JSON.stringify({ user, iat: Date.now() });
    const token = signPayload(payload);
    const res = NextResponse.json({ ok: true });
    // set HttpOnly cookie
    res.cookies.set('qh_admin', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 8 });
    return res;
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function GET(req) {
  // used by middleware to verify token if needed
  const token = req.cookies.get('qh_admin')?.value;
  return NextResponse.json({ valid: verifyToken(token) });
}

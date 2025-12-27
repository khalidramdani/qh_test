import crypto from 'crypto';

const ADMIN_PASS = process.env.ADMIN_PASS || '';

export function verifyToken(token) {
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const payload = Buffer.from(parts[0], 'base64url').toString();
    const expected = crypto.createHmac('sha256', ADMIN_PASS).update(payload).digest('base64url');
    return expected === parts[1];
  } catch (e) {
    return false;
  }
}

export function requireAdminAuth(request) {
  const token = request.cookies.get('qh_admin')?.value;
  if (token && verifyToken(token)) return true;
  const res = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  throw res;
}

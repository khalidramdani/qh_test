const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

if (!ADMIN_USER || !ADMIN_PASS) {
  console.error('ADMIN_USER or ADMIN_PASS not set in .env.local');
  process.exit(1);
}

const payload = JSON.stringify({ user: ADMIN_USER, iat: Date.now() });
const sig = crypto.createHmac('sha256', ADMIN_PASS || '').update(payload).digest('base64url');
console.log(`${Buffer.from(payload).toString('base64url')}.${sig}`);

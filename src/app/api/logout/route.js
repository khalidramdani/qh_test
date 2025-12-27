import { NextResponse } from 'next/server';

export async function POST(req) {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('qh_admin');
  return res;
}
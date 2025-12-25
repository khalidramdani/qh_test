import { saveCandidatAndMediasServer } from '../../../lib/supabase-server';

function hasSubmittedCookie(req) {
  const cookie = req.headers.get('cookie') || '';
  return cookie.includes('qh_submitted=');
}

export async function POST(req) {
  try {
    // Reject if this device already submitted (cookie present)
    if (hasSubmittedCookie(req)) {
      return new Response(JSON.stringify({ error: 'Submission already made from this device' }), { status: 409 });
    }

    const body = await req.json();
    const { nom, prenom, age, ville, email, whatssap, tiktok, instagram, motivation, medias } = body;
    const candidat = await saveCandidatAndMediasServer({ nom, prenom, age, ville, email, whatssap, tiktok, instagram, motivation, medias });

    // Set a long-lived HttpOnly cookie to mark this device as having submitted
    const oneYear = 60 * 60 * 24 * 365;
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Set-Cookie', `qh_submitted=1; Path=/; Max-Age=${oneYear}; HttpOnly; SameSite=Lax; Secure`);

    return new Response(JSON.stringify({ success: true, candidat }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

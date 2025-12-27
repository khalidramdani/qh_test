import { saveCandidatAndMediasServer } from '../../../lib/supabase-server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { nom, prenom, age, ville, sexe, email, whatssap, tiktok, instagram, motivation, medias } = body;
    const candidat = await saveCandidatAndMediasServer({ nom, prenom, age, ville, sexe, email, whatssap, tiktok, instagram, motivation, medias });

    return new Response(JSON.stringify({ success: true, candidat }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

import { insertMediasForCandidate } from '../../../lib/supabase-server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { candidateId, medias } = body;
    if (!candidateId) return new Response(JSON.stringify({ error: 'candidateId missing' }), { status: 400 });
    await insertMediasForCandidate(candidateId, medias || []);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseServer() {
  if (!supabaseUrl || !supabaseServiceKey) {
    const msg = 'SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL missing in server environment';
    console.error(msg);
    throw new Error(msg);
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Lazy client getter to avoid throwing at module import time
export function supabaseServer() {
  return getSupabaseServer();
}

export async function saveCandidatAndMediasServer({
  nom, prenom, age, ville, sexe, email, whatssap, tiktok, instagram, motivation, medias
}) {
  // 1. Insérer le candidat
  const client = getSupabaseServer();
  const { data: candidat, error: candidatError } = await client
    .from('CANDIDAT')
    .insert([
      { nom, prenom, age, ville, sexe, email, whatssap, tiktok, insta: instagram, motivation }
    ])
    .select()
    .single();
  if (candidatError) throw candidatError;
  // 2. Insérer les médias liés
  if (medias && medias.length > 0) {
    const mediasToInsert = medias.map(m => ({
      id_candidat: candidat.id,
      filename: m.filename,
      filetype: m.filetype
    }));
    const { error: mediaError } = await client
      .from('MEDIA')
      .insert(mediasToInsert);
    if (mediaError) throw mediaError;
  }
  return candidat;
}

export async function insertMediasForCandidate(candidateId, medias = []) {
  if (!medias || medias.length === 0) return;
  const client = getSupabaseServer();
  const mediasToInsert = medias.map(m => ({
    id_candidat: candidateId,
    filename: m.filename,
    filetype: m.filetype
  }));
  const { error } = await client.from('MEDIA').insert(mediasToInsert);
  if (error) throw error;
  return true;
}

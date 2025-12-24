import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Debug: ensure service role key is present on server
if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in environment (server).');
} else {
  const masked = supabaseServiceKey.slice(0, 6) + '...' + supabaseServiceKey.slice(-4);
  console.log('SUPABASE_SERVICE_ROLE_KEY present (masked):', masked);
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);

export async function saveCandidatAndMediasServer({
  nom, prenom, age, ville, email, whatssap, tiktok, instagram, motivation, medias
}) {
  // 1. Insérer le candidat
  const { data: candidat, error: candidatError } = await supabaseServer
    .from('CANDIDAT')
    .insert([
      { nom, prenom, age, ville, email, whatssap, tiktok, insta: instagram, motivation }
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
    const { error: mediaError } = await supabaseServer
      .from('MEDIA')
      .insert(mediasToInsert);
    if (mediaError) throw mediaError;
  }
  return candidat;
}

export async function insertMediasForCandidate(candidateId, medias = []) {
  if (!medias || medias.length === 0) return;
  const mediasToInsert = medias.map(m => ({
    id_candidat: candidateId,
    filename: m.filename,
    filetype: m.filetype
  }));
  const { error } = await supabaseServer.from('MEDIA').insert(mediasToInsert);
  if (error) throw error;
  return true;
}

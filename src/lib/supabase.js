import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour enregistrer un candidat et ses médias (adaptée pour tables en majuscules)
export async function saveCandidatAndMedias({
  nom, prenom, age, ville, email, whatssap, tiktok, instagram, motivation, medias
}) {
  // 1. Insérer le candidat
  const { data: candidat, error: candidatError } = await supabase
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
      filetype: m.filetype // true=image, false=video ou inverse selon ta logique
    }));
    const { error: mediaError } = await supabase
      .from('MEDIA')
      .insert(mediasToInsert);
    if (mediaError) throw mediaError;
  }
  return candidat;
}

import { supabase } from '../../lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const data = await req.json();
    // Insérer la candidature sans les médias
    const { data: insertData, error } = await supabase
      .from('candidatures')
      .insert([
        {
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          whatssap: data.whatssap,
          tiktok: data.tiktok,
          instagram: data.instagram,
          age: data.age,
          ville: data.ville,
          presentation: data.presentation,
        },
      ])
      .select();
    if (error) throw error;
    // Retourner l'id de la candidature
    return NextResponse.json({ candidatureId: insertData[0].id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

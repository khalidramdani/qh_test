import { supabaseServer } from '../../../lib/supabase-server';
import { requireAdminAuth } from '../../../../src/lib/admin-auth';
import B2 from 'backblaze-b2';

const B2_KEY_ID = process.env.B2_MASTER_KEY_ID;
const B2_APP_KEY = process.env.B2_MASTER_APP_KEY;
const B2_BUCKET_ID = process.env.B2_BUCKET_ID;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;

// Debug logs (server only)
console.log('SUPABASE_SERVICE_ROLE_KEY present:', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY));
console.log('NEXT_PUBLIC_SUPABASE_URL present:', Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL));

export async function GET(request) {
  try {
    try { requireAdminAuth(request); } catch (res) { return res; }
    const client = supabaseServer();
    const { data, error } = await client
      .from('CANDIDAT')
      .select('id, nom, prenom, ville, sexe, motivation, whatssap, tiktok, insta, medias:MEDIA(filename, filetype), favoris:FAVORIS(id), acontacter:ACONTACTER(id)')
      .order('id', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Authorize B2 to build public URLs for files and allow generating download authorizations
    let b2DownloadBase = null;
    let b2Client = null;
    try {
      if (B2_KEY_ID && B2_APP_KEY && B2_BUCKET_ID) {
        b2Client = new B2({ applicationKeyId: B2_KEY_ID, applicationKey: B2_APP_KEY });
        const auth = await b2Client.authorize();
        b2DownloadBase = auth?.data?.downloadUrl || null;
      }
    } catch (e) {
      console.warn('Failed to authorize B2 for image URLs', e?.message || e);
      b2DownloadBase = null;
      b2Client = null;
    }

    // For each candidate, pick the primary image:
    // Prefer a filename starting with `${id}-img-1`, otherwise the first media with filetype=true

    // Helper function to resolve media URL
    const resolveMediaUrl = async (filename) => {
      if (!filename || !b2DownloadBase || !(B2_BUCKET_NAME || B2_BUCKET_ID)) {
        return filename;
      }

      const bucketForUrl = B2_BUCKET_NAME || B2_BUCKET_ID;
      const variants = [];
      // original
      variants.push(filename);
      // replace first `-img-` or `-vid-` with `/img-` or `/vid-`
      variants.push(filename.replace(/-(img|vid)-/, '/$1-'));
      // replace all dashes with slashes
      variants.push(filename.replace(/-/g, '/'));
      // candidate id / rest (if filename starts with id-...)
      const parts = String(filename).split('-');
      if (parts.length > 1) variants.push(`${parts[0]}/${parts.slice(1).join('-')}`);

      for (const v of variants) {
        try {
          const url = `${b2DownloadBase}/file/${bucketForUrl}/${encodeURIComponent(v)}`;
          // try HEAD to see if object exists / is accessible (public bucket)
          try {
            const head = await fetch(url, { method: 'HEAD' });
            if (head.ok) {
              return url;
            }
          } catch (e) {
            // continue to try download-auth fallback
          }

          // If public HEAD failed and we have an authorized B2 client, try a download authorization
          if (b2Client && B2_BUCKET_ID) {
            try {
              const da = await b2Client.getDownloadAuthorization({ bucketId: B2_BUCKET_ID, fileNamePrefix: v, validDurationInSeconds: 3600 });
              const token = da?.data?.authorizationToken;
              if (token) {
                const authUrl = url + '?Authorization=' + encodeURIComponent(token);
                try {
                  const head2 = await fetch(authUrl, { method: 'HEAD' });
                  if (head2.ok) {
                    return authUrl;
                  }
                } catch (e) {
                  // ignore and try next variant
                }
              }
            } catch (e) {
              // failed to get download authorization; ignore and continue
            }
          }
        } catch (e) {
          // ignore and try next variant
        }
      }
      // fallback to returning the raw filename if no variant worked
      return filename;
    };

    const normalized = await Promise.all((data || []).map(async c => {
      const medias = c.medias || [];
      const primary = medias.find(m => m.filetype && m.filename && m.filename.startsWith(`${c.id}-img-1`))
        || medias.find(m => m.filetype)
        || null;

      // Resolve URLs for all medias
      const resolvedMedias = await Promise.all(medias.map(async m => ({
        filename: m.filename,
        filetype: m.filetype,
        url: await resolveMediaUrl(m.filename)
      })));

      // build full URL for primary image when possible
      let imageUrl = null;
      if (primary) {
        imageUrl = resolvedMedias.find(m => m.filename === primary.filename)?.url || primary.filename;
      }

      return {
        id: c.id,
        nom: c.nom,
        prenom: c.prenom,
        ville: c.ville,
        sexe: c.sexe,
        tiktok: c.tiktok,
        insta: c.insta,
        motivation: c.motivation,
        whatssap: c.whatssap,
        medias: resolvedMedias,
        favoris: Array.isArray(c.favoris) ? c.favoris.length > 0 : Boolean(c.favoris),
        acontacter: Array.isArray(c.acontacter) ? c.acontacter.length > 0 : Boolean(c.acontacter),
        image: imageUrl,
      };
    }));

    return new Response(JSON.stringify(normalized), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unhandled error in GET /api/admin-candidatures', err);
    return new Response(JSON.stringify({ error: String(err), stack: err.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request) {
  try { requireAdminAuth(request); } catch (res) { return res; }
  const { id, field, value } = await request.json();
  if (!id || !["favoris", "acontacter"].includes(field)) {
    return new Response(JSON.stringify({ error: "Invalid request" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const client = supabaseServer();
  let error = null;
    if (field === 'favoris' || field === 'acontacter') {
    const tableName = field === 'favoris' ? 'FAVORIS' : 'ACONTACTER';
    if (value) {
      // avoid duplicate inserts: check if a row already exists
      try {
        const { data: existing, error: selErr } = await client.from(tableName).select('id').eq('candidat_id', id).maybeSingle();
        if (selErr) {
          error = selErr;
        } else if (!existing) {
          const { error: insertError } = await client.from(tableName).insert([{ candidat_id: id }]);
          error = insertError;
        }
      } catch (e) {
        console.error('Error checking/inserting', e);
        error = e;
      }
    } else {
      // delete rows for this candidate
      const { error: delError } = await client.from(tableName).delete().eq('candidat_id', id);
      error = delError;
    }
  } else {
    const res = await client
      .from('CANDIDAT')
      .update({ [field]: value })
      .eq('id', id);
    error = res.error;
  }
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
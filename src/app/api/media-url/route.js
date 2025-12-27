import B2 from 'backblaze-b2';
import { requireAdminAuth } from '../../../../src/lib/admin-auth';

const B2_KEY_ID = process.env.B2_KEY_ID_READ;
const B2_APP_KEY = process.env.B2_APP_KEY_READ;
const B2_BUCKET_ID = process.env.B2_BUCKET_ID;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;

export async function GET(req) {
  try {
    try { requireAdminAuth(req); } catch (res) { return res; }
    const url = new URL(req.url);
    const file = url.searchParams.get('file');
    if (!file) return new Response(JSON.stringify({ error: 'file param required' }), { status: 400 });

    if (!B2_KEY_ID || !B2_APP_KEY || !(B2_BUCKET_ID || B2_BUCKET_NAME)) {
      return new Response(JSON.stringify({ error: 'B2 config missing' }), { status: 500 });
    }

    const bucketForUrl = B2_BUCKET_NAME || B2_BUCKET_ID;
    const b2 = new B2({ applicationKeyId: B2_KEY_ID, applicationKey: B2_APP_KEY });
    const auth = await b2.authorize();
    const downloadBase = auth?.data?.downloadUrl;

        // Try several filename variants (same logic as admin-candidatures) to locate the object
        const variants = [];
        variants.push(file);
        variants.push(file.replace(/-(img|vid)-/, '/$1-'));
        variants.push(file.replace(/-/g, '/'));
        const parts = String(file).split('-');
        if (parts.length > 1) variants.push(`${parts[0]}/${parts.slice(1).join('-')}`);

        for (const v of variants) {
          const filePath = v.replace(/^(\d+)-/, '$1/');
          const publicUrl = `${downloadBase}/file/${bucketForUrl}/${encodeURIComponent(filePath)}`;
          // try public
          try {
            const head = await fetch(publicUrl, { method: 'HEAD' });
              if (head.ok) return new Response(null, { status: 302, headers: { Location: publicUrl } });
          } catch (e) {
            // continue
          }

          // try download auth if available
          try {
            if (b2 && B2_BUCKET_ID) {
              try {
                const da = await b2.getDownloadAuthorization({ bucketId: B2_BUCKET_ID, fileNamePrefix: v, validDurationInSeconds: 3600 });
                const token = da?.data?.authorizationToken;
                  if (token) {
                    const authUrl = publicUrl + '?Authorization=' + encodeURIComponent(token);
                    return new Response(null, { status: 302, headers: { Location: authUrl } });
                  }
              } catch (e) {
                // permission or other error — continue to next variant
              }
            }
          } catch (e) {
            // ignore and continue
          }
        }

        // fallback: return the raw filename so client can attempt other strategies
        return new Response(JSON.stringify({ url: file }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

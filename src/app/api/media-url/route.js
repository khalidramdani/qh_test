import B2 from 'backblaze-b2';
import { requireAdminAuth } from '../../../../src/lib/admin-auth';

const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APP_KEY = process.env.B2_APP_KEY;
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

    const filePath = file.replace(/^(\d+)-/, '$1/');
    const imageUrl = `${downloadBase}/file/${bucketForUrl}/${encodeURIComponent(filePath)}`;
    return new Response(JSON.stringify({ url: imageUrl }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}

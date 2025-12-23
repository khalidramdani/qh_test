import { NextResponse } from 'next/server';
import B2 from 'backblaze-b2';
// ...existing code...

const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APP_KEY = process.env.B2_APP_KEY;
const B2_BUCKET_ID = process.env.B2_BUCKET_ID;

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const candidatureId = formData.get('candidatureId');
    const mediaType = formData.get('mediaType'); // 'img' ou 'vid'
    const mediaIndex = formData.get('mediaIndex'); // 1, 2, ...
    if (!file || !candidatureId || !mediaType || !mediaIndex) {
      return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 });
    }
    const fileName = `${candidatureId}/${mediaType}${mediaIndex}`;
    const contentType = file.type || 'application/octet-stream';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const b2 = new B2({
      applicationKeyId: B2_KEY_ID,
      applicationKey: B2_APP_KEY,
    });
    await b2.authorize();
    const uploadUrlRes = await b2.getUploadUrl({ bucketId: B2_BUCKET_ID });
    const uploadRes = await b2.uploadFile({
      uploadUrl: uploadUrlRes.data.uploadUrl,
      uploadAuthToken: uploadUrlRes.data.authorizationToken,
      fileName,
      data: buffer,
      mime: contentType,
      hash: 'do_not_verify',
    });
    const fileUrl = `https://f003.backblazeb2.com/file/${B2_BUCKET_ID}/${encodeURIComponent(fileName)}`;
    // ...supabase supprimé...
      .from('candidature_medias')
      .insert([
        {
          candidature_id: candidatureId,
          type: mediaType,
          index: mediaIndex,
          url: fileUrl,
        },
      ]);
    if (error) throw error;
    return NextResponse.json({ fileUrl });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

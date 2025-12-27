
import { NextResponse } from 'next/server';
import B2 from 'backblaze-b2';

const B2_KEY_ID = process.env.B2_KEY_ID_WRITE;
const B2_APP_KEY = process.env.B2_APP_KEY_WRITE;
const B2_BUCKET_ID = process.env.B2_BUCKET_ID;

// Pour parser le formData côté serveur
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    // Parse le formData
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
    }
    const fileName = formData.get('fileName') || file.name || 'upload';
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
    // Générer l'URL de téléchargement public si le bucket est public
    const fileUrl = `https://f003.backblazeb2.com/file/${B2_BUCKET_ID}/${encodeURIComponent(fileName)}`;
    return NextResponse.json({
      fileName,
      fileUrl,
      b2FileId: uploadRes.data.fileId,
      b2Response: uploadRes.data,
    });
  } catch (error) {
    console.error('B2 API error:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}

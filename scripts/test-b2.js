const fs = require('fs');
const path = require('path');
const B2 = require('backblaze-b2');

function loadEnv(envPath) {
  try {
    const txt = fs.readFileSync(envPath, 'utf8');
    const lines = txt.split(/\r?\n/);
    const out = {};
    for (const l of lines) {
      const line = l.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq === -1) continue;
      const k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      // Remove surrounding quotes
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      out[k] = v;
    }
    return out;
  } catch (e) {
    console.error('Failed to read env file:', e.message || e);
    return {};
  }
}

(async function main(){
  const envPath = path.resolve(__dirname, '..', '.env.local');
  console.log('Loading', envPath);
  const env = loadEnv(envPath);
  const B2_KEY_ID = env.B2_MASTER_KEY_ID;
  const B2_APP_KEY = env.B2_MASTER_APP_KEY;
  const B2_BUCKET_ID = env.B2_BUCKET_ID;
  console.log('B2_KEY_ID present:', Boolean(B2_KEY_ID));
  console.log('B2_APP_KEY present:', Boolean(B2_APP_KEY));
  console.log('B2_BUCKET_ID present:', Boolean(B2_BUCKET_ID));

  if (!B2_KEY_ID || !B2_APP_KEY) {
    console.error('Missing B2 credentials in .env.local');
    process.exit(1);
  }

  try {
    const b2 = new B2({ applicationKeyId: B2_KEY_ID, applicationKey: B2_APP_KEY });
    const auth = await b2.authorize();
    console.log('authorize OK. downloadUrl=', auth?.data?.downloadUrl);

    if (!B2_BUCKET_ID) {
      console.warn('No B2_BUCKET_ID provided; skipping getDownloadAuthorization test.');
      return;
    }

    try {
      const prefix = '123-img-1.jpg';
      console.log('Requesting download authorization for prefix:', prefix);
      const da = await b2.getDownloadAuthorization({ bucketId: B2_BUCKET_ID, fileNamePrefix: prefix, validDurationInSeconds: 3600 });
      console.log('getDownloadAuthorization OK:', JSON.stringify(da.data, null, 2));
    } catch (e) {
      console.error('getDownloadAuthorization ERROR:');
      if (e?.response?.data) console.error(JSON.stringify(e.response.data, null, 2));
      else console.error(e.message || e);
    }
  } catch (err) {
    console.error('authorize ERROR:');
    if (err?.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
    else console.error(err.message || err);
  }
})();

// Exemple d'upload côté client avec l'URL temporaire B2
export async function uploadToB2(file, fileNameOverride = null) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileNameOverride || file.name);
  const res = await fetch('/api/b2-upload', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Erreur upload B2');
  return await res.json();
}

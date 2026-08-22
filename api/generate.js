export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST kabul edilir' });
  }
  let rawKey = process.env.FAL_KEY || '';
  let cleanKey = rawKey.replace(/[\r\n\t]/g, '').trim();
  if (!cleanKey) {
    return res.status(500).json({ error: 'FAL_KEY Vercel üzerinde bulunamadı!' });
  }
  const authHeader = cleanKey.startsWith('Key ') ? cleanKey : `Key ${cleanKey}`;
  const { image_url } = req.body;
  if (!image_url) {
    return res.status(400).json({ error: 'Lütfen bir fotoğraf yükleyin!' });
  }
  try {
    // Fotoğrafı profesyonelce güzelleştiren ve yüzü koruyan model
    const response = await fetch('https://fal.run/fal-ai/esrgan', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_url: image_url }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.detail || 'Görsel işlenemedi.' });
    }
    // ESRGAN bazen farklı format dönebilir, kontrol ediyoruz
    return res.status(200).json(data.images ? data : { images: [{ url: data.image_url }] });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

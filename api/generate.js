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
  const { prompt, image_url } = req.body;
  try {
    // Fotoğraf yüklendiyse yüzü koruyup düzenleyen model, yüklenmediyse sıfırdan üreten model
    const endpoint = image_url
      ? 'https://fal.run/fal-ai/flux/dev/image-to-image'
      : 'https://fal.run/fal-ai/flux/schnell';
    const bodyData = image_url
      ? {
          prompt: `${prompt}, photorealistic, studio portrait, shot on 35mm lens, highly detailed, realistic skin texture`,
          image_url: image_url,
          strength: 0.35 // Yüz hatlarının bozulmaması için dengeli değişim oranı
        }
      : { prompt };
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.detail || 'Görsel işlenemedi.' });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

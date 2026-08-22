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
    const endpoint = image_url
      ? 'https://fal.run/fal-ai/flux/dev/image-to-image'
      : 'https://fal.run/fal-ai/flux/schnell';
    // Fotoğrafın çok fazla değişip yapay durmasını engellemek için strength değerini 0.45 yapıyoruz.
    // Bu sayede yüzün tam sen kalır, sadece ışık ve kalite profesyonelleşir.
    const bodyData = image_url
      ? {
          prompt: `${prompt}, natural skin texture, realistic human skin pores, professional photography, shot on 35mm lens, f/1.8, soft studio lighting, sharp focus, 8k, highly detailed`,
          image_url: image_url,
          strength: 0.45
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

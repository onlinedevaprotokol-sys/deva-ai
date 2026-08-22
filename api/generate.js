export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST kabul edilir' });
  }
  // API anahtarındaki gizli görünmez karakterleri ve boşlukları tamamen temizliyoruz
  let rawKey = process.env.FAL_KEY || '';
  let cleanKey = rawKey.replace(/[\r\n\t]/g, '').trim();
  if (!cleanKey) {
    return res.status(500).json({ error: 'FAL_KEY Vercel üzerinde bulunamadı!' });
  }
  const authHeader = cleanKey.startsWith('Key ') ? cleanKey : `Key ${cleanKey}`;
  try {
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: req.body.prompt }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.detail || 'Fal.ai bir hata döndürdü.' });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

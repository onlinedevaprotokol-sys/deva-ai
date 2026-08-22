export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST kabul edilir' });
  }
  // Vercel'e eklenen anahtar kontrolü
  let apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'FAL_KEY Vercel üzerinde bulunamadı!' });
  }
  // Anahtarın başında Key kelimesi yoksa ekleyelim
  apiKey = apiKey.trim();
  const authHeader = apiKey.startsWith('Key ') ? apiKey : `Key ${apiKey}`;
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
      return res.status(response.status).json({ error: data.detail || 'Fal.ai yanıt vermedi.' });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

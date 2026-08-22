export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST kabul edilir' });
  }
  let rawKey = process.env.FAL_KEY || '';
  let cleanKey = rawKey.replace(/[\r\n\t]/g, '').trim();
  if (!cleanKey) {
    return res.status(500).json({ error: 'FAL_KEY eksik!' });
  }
  const authHeader = cleanKey.startsWith('Key ') ? cleanKey : `Key ${cleanKey}`;
  const { type, message, prompt, image_url } = req.body;
  try {
    if (type === 'chat') {
      const response = await fetch('https://fal.run/fal-ai/any-llm', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Sen DEVA-Aİ adında son derece akıllı, espirili, samimi ve kanka gibi konuşan bir yapay zekasın. Kesinlikle resmi dil kullanma. Türkçe cevap ver.\n\nKullanıcı: ${message}\nDEVA-Aİ:`,
          model: "meta-llama/llama-3.2-11b-vision-instruct"
        }),
      });
      const data = await response.json();
      const replyText = data.output || data.text || data.generated_text || "Bir an dalmışım kanka, ne dedin?";
      return res.status(200).json({ reply: replyText });
    }
    const endpoint = image_url
      ? 'https://fal.run/fal-ai/flux/dev/image-to-image'
      : 'https://fal.run/fal-ai/flux/schnell';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(image_url ? { prompt: `${prompt}, high quality`, image_url, strength: 0.35 } : { prompt }),
    });
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

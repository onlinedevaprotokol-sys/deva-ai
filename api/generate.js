export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST kabul edilir' });
  }
  let rawKey = process.env.FAL_KEY || '';
  let cleanKey = rawKey.replace(/[\r\n\t]/g, '').trim();
  if (!cleanKey) {
    return res.status(500).json({ error: 'FAL_KEY bulunamadı!' });
  }
  const authHeader = cleanKey.startsWith('Key ') ? cleanKey : `Key ${cleanKey}`;
  const { type, message, prompt, image_url } = req.body;
  try {
    if (type === 'chat') {
      // Doğrudan fal.ai üzerinden çalışan Llama 3.2 modeli
      const response = await fetch('https://fal.run/fal-ai/any-llm', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.2-3b-instruct",
          messages: [
            { role: "system", content: "Sen DEVA-Aİ adında çok samimi, esprili, kanka gibi konuşan bir yapay zekasın. Kesinlikle resmi olma, 'siz' deme, Türkçe konuş." },
            { role: "user", content: message }
          ]
        }),
      });
      const data = await response.json();
     
      // Yanıtı farklı formatlardan güvenle ayıklıyoruz
      const replyText = data.output || data.choices?.[0]?.message?.content || data.text || "Eyvallah kanka, ne diyorsun?";
      return res.status(200).json({ reply: replyText });
    }
    // Resim modu
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

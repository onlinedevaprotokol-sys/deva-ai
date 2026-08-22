export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST kabul edilir' });
  }
  const { type, message, prompt, image_url } = req.body;
  // GROQ İLE AKICI VE GERÇEK SOHBET
  if (type === 'chat') {
    let apiKey = process.env.GROQ_API_KEY || '';
    apiKey = apiKey.replace(/[\r\n\t]/g, '').trim();
    if (!apiKey) {
      return res.status(500).json({ reply: 'GROQ_API_KEY Vercel üzerinde bulunamadı kanka!' });
    }
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Sen DEVA-Aİ adında samimi, esprili, zeki ve tam bir kanka gibi konuşan bir yapay zekasın. Kesinlikle resmi olma, 'siz' deme. Kullanıcının mesajına birebir uygun, asla kendini tekrarlamayan, doğal Türkçe cevaplar ver."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      });
      const data = await response.json();
      const replyText = data.choices?.[0]?.message?.content;
      if (replyText) {
        return res.status(200).json({ reply: replyText.trim() });
      } else {
        return res.status(200).json({ reply: "Anlayamadım kanka, tekrar söylesene?" });
      }
    } catch (err) {
      return res.status(500).json({ reply: "Bağlantı koptu kanka!" });
    }
  }
  // RESİM ÇİZME (FAL_KEY)
  let rawKey = process.env.FAL_KEY || '';
  let cleanKey = rawKey.replace(/[\r\n\t]/g, '').trim();
  const authHeader = cleanKey.startsWith('Key ') ? cleanKey : `Key ${cleanKey}`;
  try {
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

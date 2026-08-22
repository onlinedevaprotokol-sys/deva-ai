javascript

export default async function h if (req.method !== 'POST') { return res.status(405).json }

const { prompt } = req.body; const apikey process.env.FA

if (!apiKey) { } return res.status(500).json

try {

const response await fetc method: 'POST', headers: { }, 'Authorization': 'Key $ 'Content-Type': 'applic

body: JSON.stringify({ pr });

const data await response return res.status(200).json } catch (error) { return res.status(500).json }}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { transcription, propertyType } = req.body;

  if (!transcription) {
    return res.status(400).json({ error: 'Transcription is required' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Tu es un expert en rédaction d'annonces immobilières de luxe. Transforme ces notes vocales en une description professionnelle et attractive pour un(e) ${propertyType || 'bien immobilier'}.

Notes vocales:
${transcription}

Règles:
- Rédige une description fluide et élégante en 3-5 paragraphes
- Mets en valeur les points forts (vue, surface, équipements)
- Utilise un ton professionnel mais chaleureux
- N'invente AUCUNE information non mentionnée
- Termine par une phrase d'appel à l'action

Description:`
        }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return res.status(500).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const description = data.content[0]?.text || '';

    return res.status(200).json({ description });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

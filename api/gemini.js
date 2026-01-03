// Vercel Serverless Function - Proxy per Google Gemini API
// La chiave API è nelle Environment Variables di Vercel (GEMINI_API_KEY)

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Solo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metodo non consentito' });
    }

    // Verifica API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY non configurata');
        return res.status(500).json({ 
            error: 'API Key non configurata sul server',
            message: 'Contatta l\'amministratore per configurare GEMINI_API_KEY su Vercel'
        });
    }

    try {
        const { model, contents } = req.body;

        if (!model || !contents) {
            return res.status(400).json({ 
                error: 'Parametri mancanti',
                message: 'Richiesti: model, contents'
            });
        }

        // Chiama Gemini API
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 16384,
                    responseMimeType: "application/json"
                }
            })
        });

        const data = await geminiResponse.json();

        // Gestione errori Gemini
        if (!geminiResponse.ok) {
            console.error('❌ Errore Gemini:', data);
            
            // Errore 429 - Rate limit
            if (geminiResponse.status === 429) {
                return res.status(429).json({
                    error: 'Rate limit raggiunto',
                    message: 'Troppe richieste. Attendi qualche secondo e riprova.',
                    retryAfter: 5
                });
            }

            return res.status(geminiResponse.status).json({
                error: 'Errore API Gemini',
                message: data.error?.message || 'Errore sconosciuto'
            });
        }

        // Successo
        return res.status(200).json(data);

    } catch (error) {
        console.error('❌ Errore server:', error);
        return res.status(500).json({
            error: 'Errore interno del server',
            message: error.message
        });
    }
}

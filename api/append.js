// Vercel serverless function proxy to avoid CORS issues with Google Apps Script
// Expects POST JSON: { service, row, token }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const incoming = req.body && typeof req.body === 'object' ? { ...req.body } : {};
    const targetUrl = process.env.REACT_APP_SHEET_APPEND_URL;
    if (!targetUrl) {
      res.status(500).json({ error: 'Target URL not configured' });
      return;
    }

    // If client didn't include a token (common when using proxy), inject the server-side token
    if (!incoming.token) {
      const serverToken = process.env.REACT_APP_SHEET_APPEND_TOKEN;
      if (serverToken) incoming.token = serverToken;
    }

    const fetchRes = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incoming)
    });

    const text = await fetchRes.text();
    try {
      const json = JSON.parse(text);
      res.status(fetchRes.status).json(json);
    } catch (e) {
      res.status(fetchRes.status).send(text);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'internal error' });
  }
}

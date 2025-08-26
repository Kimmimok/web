// Vercel Serverless Function: /api/append
// - GET: forwards to Apps Script ?sheet=...&range=...; if no values, falls back to Google Sheets API
// - POST: injects server token and forwards to Apps Script for appends

const pick = (obj, keys) => keys.reduce((acc, k) => { if (obj && obj[k] !== undefined) acc[k] = obj[k]; return acc; }, {});

export default async function handler(req, res) {
  try {
    const method = req.method || 'GET';
    const targetUrl = process.env.SHEET_APPEND_URL || process.env.REACT_APP_SHEET_APPEND_URL;

    if (method === 'GET') {
      if (!targetUrl) return res.status(500).json({ error: 'Target URL not configured' });
      const { sheet, range } = pick(req.query, ['sheet','range']);
      const url = new URL(targetUrl);
      if (sheet) url.searchParams.set('sheet', sheet);
      if (range) url.searchParams.set('range', range);

      // Try Apps Script first
      let asJson = null, asText = '';
      try {
        const r = await fetch(url.toString(), { method: 'GET' });
        asText = await r.text();
        try { asJson = JSON.parse(asText); } catch (_) { asJson = null; }
        if (asJson && (asJson.values || asJson.success)) {
          // If Apps Script returns values or at least a structured JSON, pass through
          return res.status(r.status).json(asJson);
        }
      } catch (_) { /* proceed to fallback */ }

      // Fallback to Google Sheets API for reads
      const SHEET_ID = process.env.SHEET_ID || process.env.REACT_APP_SHEET_ID || '';
      const API_KEY = process.env.SHEETS_API_KEY || process.env.REACT_APP_API_KEY || '';
      if (!SHEET_ID || !API_KEY || !sheet) {
        // Return whatever we had from Apps Script (may be health/info)
        if (asJson) return res.status(200).json(asJson);
        return res.status(200).send(asText || '');
      }

      try {
        if (sheet === '__names__') {
          const namesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`;
          const rr = await fetch(namesUrl, { method: 'GET' });
          const data = await rr.json();
          const names = (data.sheets || []).map(sh => sh.properties && sh.properties.title).filter(Boolean);
          return res.status(200).json({ values: [names] });
        }
        const a1 = range ? `${sheet}!${range}` : sheet;
        const enc = encodeURIComponent(a1);
        const valuesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${enc}?key=${API_KEY}`;
        const rr = await fetch(valuesUrl, { method: 'GET' });
        const data = await rr.json();
        return res.status(200).json({ values: data.values || [] });
      } catch (fbErr) {
        return res.status(502).json({ error: 'fallback failed', detail: fbErr?.message });
      }
    }

    if (method === 'POST') {
      if (!targetUrl) return res.status(500).json({ error: 'Target URL not configured' });
      const incoming = (req.body && typeof req.body === 'object') ? { ...req.body } : {};
      // Inject server token if not provided
      if (!incoming.token) {
        const serverToken = process.env.SHEET_APPEND_TOKEN || process.env.REACT_APP_SHEET_APPEND_TOKEN || '';
        if (serverToken) incoming.token = serverToken;
      }
      const r = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incoming)
      });
      const text = await r.text();
      try {
        const json = JSON.parse(text);
        return res.status(r.status).json(json);
      } catch (_) {
        return res.status(r.status).send(text);
      }
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'server error' });
  }
}
// Vercel serverless function proxy to avoid CORS issues with Google Apps Script
// Expects POST JSON: { service, row, token }

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    // Allow GET for safe reads: proxy GET?s=newsheet&range=A1:B10
    if (req.method === 'GET') {
      try {
        const targetUrl = process.env.REACT_APP_SHEET_APPEND_URL;
        if (!targetUrl) return res.status(500).json({ error: 'Target URL not configured' });
        const qs = [];
        if (req.query && req.query.sheet) qs.push('sheet=' + encodeURIComponent(req.query.sheet));
        if (req.query && req.query.range) qs.push('range=' + encodeURIComponent(req.query.range));
        const getUrl = targetUrl + (qs.length ? ('?' + qs.join('&')) : '');
        const fetchRes = await fetch(getUrl, { method: 'GET' });
        const text = await fetchRes.text();
        try { return res.status(fetchRes.status).json(JSON.parse(text)); } catch (e) { return res.status(fetchRes.status).send(text); }
      } catch (err) { console.error(err); return res.status(500).json({ error: err.message || 'internal error' }); }
    }
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

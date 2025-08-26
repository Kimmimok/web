// CRA(dev) 전용 프록시: /api/append 요청을 Apps Script로 포워딩하며 토큰을 주입합니다.
// 개발환경에서만 동작(CRA dev server). 프로덕션은 Vercel의 /api/append 함수를 사용하세요.

let fetchFn = global.fetch;
if (!fetchFn) {
  try { fetchFn = require('node-fetch'); } catch (e) {
    throw new Error('Global fetch is unavailable. Use Node >= 18 or install node-fetch.');
  }
}

module.exports = function(app) {
  // JSON body 파싱 미들웨어 (필요 시)
  app.use(require('express').json());

  app.get('/api/append', async (req, res) => {
    try {
      const targetUrl = process.env.REACT_APP_SHEET_APPEND_URL;
      if (!targetUrl) return res.status(500).json({ error: 'Target URL not configured' });
      const params = new URLSearchParams();
      if (req.query.sheet) params.set('sheet', req.query.sheet);
      if (req.query.range) params.set('range', req.query.range);
      const url = targetUrl + (params.toString() ? `?${params.toString()}` : '');
      const r = await fetchFn(url, { method: 'GET' });
      const text = await r.text();
      try { return res.status(r.status).json(JSON.parse(text)); } catch (_) { return res.status(r.status).send(text); }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || 'internal error' });
    }
  });

  app.post('/api/append', async (req, res) => {
    try {
      const targetUrl = process.env.REACT_APP_SHEET_APPEND_URL;
      if (!targetUrl) return res.status(500).json({ error: 'Target URL not configured' });
      const incoming = req.body && typeof req.body === 'object' ? { ...req.body } : {};
      if (!incoming.token) {
        const serverToken = process.env.REACT_APP_SHEET_APPEND_TOKEN;
        if (serverToken) incoming.token = serverToken;
      }
      const r = await fetchFn(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incoming)
      });
      const text = await r.text();
      try { return res.status(r.status).json(JSON.parse(text)); } catch (_) { return res.status(r.status).send(text); }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message || 'internal error' });
    }
  });
};

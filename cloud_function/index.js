// Cloud Function: appendRow to Google Sheets using service account credentials
// Expects environment variables: TARGET_SPREADSHEET_ID, APP_SECRET_TOKEN, ALLOWED_SHEETS

const {google} = require('googleapis');
const sheets = google.sheets('v4');

const TARGET_SPREADSHEET_ID = process.env.TARGET_SPREADSHEET_ID;
const SECRET_TOKEN = process.env.APP_SECRET_TOKEN;
const ALLOWED_SHEETS = (process.env.ALLOWED_SHEETS || 'SH_H,SH_T,SH_RCAR').split(',');

async function authClient() {
  return await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
}

exports.appendRow = async (req, res) => {
  try {
    // allow simple health check
    if (req.method === 'GET') return res.json({ ok: true });

    const token = (req.get('x-app-token') || req.body.token || '').toString();
    if (!token || token !== SECRET_TOKEN) {
      return res.status(401).json({ success: false, error: 'invalid token' });
    }

    const payload = req.body || {};
    const sheet = (payload.sheet || 'SH_H').toString();
    if (!ALLOWED_SHEETS.includes(sheet)) {
      return res.status(403).json({ success: false, error: 'forbidden sheet' });
    }

    const row = payload.row;
    if (!Array.isArray(row) || row.length === 0) {
      return res.status(400).json({ success: false, error: 'row must be non-empty array' });
    }

    const auth = await authClient();
    const response = await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: TARGET_SPREADSHEET_ID,
      range: sheet,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    });

    console.log('append result:', response.status || response.statusText || 'OK');
    return res.json({ success: true });
  } catch (err) {
    console.error('append error', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

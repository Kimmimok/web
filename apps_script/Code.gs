// Apps Script webapp to receive POST from client and append to appropriate sheet
// Production-ready: robust token handling, minimal logging (no token values), whitelist

const DEFAULT_SHEET = 'SH_M';
const LOG_SHEET = 'APPEND_LOG';

const SERVICE_SHEET_MAP = {
  hotel: 'SH_H',
  tour: 'SH_T',
  rcar: 'SH_RC',
  car: 'SH_C',
  cruise: 'SH_R',
  airport: 'SH_P',
  user: 'SH_M',
  users: 'SH_M'
};

function _getProp(key, fallback) {
  try { return PropertiesService.getScriptProperties().getProperty(key) || fallback; } catch (e) { return fallback; }
}

function _setScriptPropsForDeploy() {
  const DEFAULT_SCRIPT_PROPS = {
    'TARGET_SHEET_ID': 'YOUR_SPREADSHEET_ID',
    'ALLOWED_SHEETS': 'SH_H,SH_T,SH_RC,SH_C,SH_R,SH_P,SH_M',
    'ALLOWED_TOKEN': 'REPLACE_WITH_GLOBAL_TOKEN',
    'TOKEN_CRUISE': '',
    'TOKEN_CAR': '',
    'TOKEN_RCAR': '',
    'TOKEN_HOTEL': '',
    'TOKEN_USER': ''
  };
  PropertiesService.getScriptProperties().setProperties(DEFAULT_SCRIPT_PROPS);
  return ContentService.createTextOutput(JSON.stringify({ success:true, set: Object.keys(DEFAULT_SCRIPT_PROPS) })).setMimeType(ContentService.MimeType.JSON);
}

function _log(ss, service, sheetName, row, ok, msg) {
  try {
    let log = ss.getSheetByName(LOG_SHEET);
    if (!log) {
      log = ss.insertSheet(LOG_SHEET);
      log.appendRow(['timestamp','service','sheet','ok','message','row_preview']);
    }
    const preview = Array.isArray(row) ? JSON.stringify(row).slice(0,1000) : String(row);
    log.appendRow([new Date(), service||'', sheetName||'', ok ? 'OK' : 'ERR', msg||'', preview]);
  } catch (e) { console.error('log failed', e); }
}

function doPost(e) {
  try {
    let body = {};
    try { body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {}; } catch (err) { return _json({ success:false, error:'invalid json' }); }

    const payload = body || {};
    const service = (payload.service || '').toString().toLowerCase();
    const row = payload.row || [];

    const targetId = _getProp('TARGET_SHEET_ID', _getProp('REACT_APP_SHEET_ID', ''));
    if (!targetId) return _json({ success:false, error:'no target sheet id' });

    let ss;
    try { ss = SpreadsheetApp.openById(targetId); } catch (errOpen) { return _json({ success:false, error: 'openById failed' }); }

    if (!service || !SERVICE_SHEET_MAP.hasOwnProperty(service)) { _log(ss, service, '', row, false, 'unknown service'); return _json({ success:false, error:'unknown service' }); }
    const sheetName = SERVICE_SHEET_MAP[service];

    const allowedSheetsProp = _getProp('ALLOWED_SHEETS', 'SH_H,SH_T,SH_RC,SH_C,SH_R,SH_P,SH_M');
    const allowed = allowedSheetsProp.split(',').map(s=>s.trim());
    if (allowed.indexOf(sheetName) === -1) { _log(ss, service, sheetName, row, false, 'forbidden sheet'); return _json({ success:false, error:'forbidden sheet' }); }

    // header detection (case-insensitive) and support X-Api-Key
    let headerAuth = '';
    if (e.headers) {
      for (var hk in e.headers) {
        if (!e.headers.hasOwnProperty(hk)) continue;
        var lk = hk.toString().toLowerCase();
        if (lk === 'authorization' || lk === 'x-api-key') { headerAuth = e.headers[hk]; break; }
      }
    }
    var headerToken = '';
    if (headerAuth) { var m = headerAuth.match(/Bearer\s+(.+)/i); headerToken = m ? m[1] : headerAuth; }

    var token = (headerToken || (e.parameter && e.parameter.token) || payload.token || '').toString().trim();
    token = token.replace(/^['\"]|['\"]$/g, '').trim();
    const serviceTokenProp = (_getProp('TOKEN_' + service.toUpperCase(), '') || '').toString().trim();
    const globalToken = (_getProp('ALLOWED_TOKEN', '') || '').toString().trim();
    const expected = globalToken || serviceTokenProp;
    if (!expected) { _log(ss, service, sheetName, row, false, 'no expected token configured'); return _json({ success:false, error:'invalid token' }); }
    if (token.length === 0 || token !== expected) { _log(ss, service, sheetName, row, false, 'invalid token'); return _json({ success:false, error:'invalid token' }); }

    if (!Array.isArray(row) || row.length === 0) { _log(ss, service, sheetName, row, false, 'invalid row'); return _json({ success:false, error:'invalid row' }); }

    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) { _log(ss, service, sheetName, row, false, 'sheet not found'); return _json({ success:false, error:'sheet not found' }); }
      sheet.appendRow(row);
      _log(ss, service, sheetName, row, true, 'appended');
      return _json({ success:true });
    } catch (err) { _log(ss, service, sheetName, row, false, err.message); return _json({ success:false, error:err.message }); }

  } catch (errOuter) { Logger.log('doPost unexpected error: %s', errOuter); return _json({ success:false, error: 'server error' }); }
}

function doGet(e) {
  try { return _json({ success: true, time: new Date(), info: 'Apps Script webapp ready' }); } catch (err) { return _json({ success: false, error: err.message }); }
}

function _json(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }

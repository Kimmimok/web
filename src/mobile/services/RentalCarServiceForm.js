import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FIXED_HEADERS = [
  { key: 'ID', label: 'ID', type: 'text', required: false },
  { key: '주문ID', label: '주문ID', type: 'text', required: true },
  { key: '차량코드', label: '차량코드', type: 'text', required: false },
  { key: '구분', label: '구분', type: 'text', required: false },
  { key: '분류', label: '분류', type: 'text', required: false },
  { key: '경로', label: '경로', type: 'text', required: false },
  { key: '차량종류', label: '차량종류', type: 'text', required: false },
  { key: '차량대수', label: '차량대수', type: 'number', required: false },
  { key: '승차일자', label: '승차일자', type: 'date', required: false },
  { key: '승차시간', label: '승차시간', type: 'text', required: false },
  { key: '목적지', label: '목적지', type: 'text', required: false },
  { key: '경유지', label: '경유지', type: 'text', required: false },
  { key: '승차인원', label: '승차인원', type: 'number', required: false },
  { key: '사용기간', label: '사용기간', type: 'text', required: false },
  { key: '금액', label: '금액', type: 'number', required: false },
  { key: '합계', label: '합계', type: 'number', required: false },
  { key: 'Email', label: '이메일 주소', type: 'email', required: true }
];

function RentalCarServiceForm({ formData, setFormData }) {
  // 컬럼별 아이콘 매핑
  const iconMap = {
    차량코드: <span role="img" aria-label="code">🔑</span>,
    구분: <span role="img" aria-label="type">🔄</span>,
    분류: <span role="img" aria-label="category">🏷️</span>,
    경로: <span role="img" aria-label="route">🛣️</span>,
    차량종류: <span role="img" aria-label="car">🚗</span>,
    차량대수: <span role="img" aria-label="count">#️⃣</span>,
    승차인원: <span role="img" aria-label="person">👤</span>,
    승차일자: <span role="img" aria-label="date">📅</span>,
    승차시간: <span role="img" aria-label="time">⏰</span>,
    승차장소: <span role="img" aria-label="place">📍</span>,
    캐리어갯수: <span role="img" aria-label="luggage">🧳</span>,
    목적지: <span role="img" aria-label="destination">🎯</span>,
    경유지: <span role="img" aria-label="stop">🛑</span>,
    사용기간: <span role="img" aria-label="period">📆</span>,
    금액: <span role="img" aria-label="money">💰</span>,
    합계: <span role="img" aria-label="sum">➕</span>,
    Email: <span role="img" aria-label="email">✉️</span>
  };
  // 승차인원 1 이상으로 제한
  const handlePassengerChange = value => {
    const num = Number(value);
    setFormData(prev => ({ ...prev, 승차인원: num < 1 ? 1 : num }));
  };
  // 차량코드 자동입력 (구분/분류/경로/차량종류)
  useEffect(() => {
    async function fetchCarCode() {
      try {
  const SHEET_ID = process.env.REACT_APP_SHEET_ID;
  const API_KEY = process.env.REACT_APP_API_KEY;
  const useProxy = (process.env.REACT_APP_USE_PROXY === 'true') || (process.env.NODE_ENV !== 'production');
  const readUrl = useProxy ? `/api/append?sheet=rcar` : `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/rcar?key=${API_KEY}`;
  const res = await fetch(readUrl);
        const data = await res.json();
        const rows = data.values || [];
        if (rows.length < 2) return setFormData(prev => ({ ...prev, 차량코드: '' }));
        const header = rows[0];
        const idxCode = header.indexOf('코드');
        const idxGubun = header.indexOf('구분');
        const idxBunryu = header.indexOf('분류');
        const idxRoute = header.indexOf('경로');
        const idxType = header.indexOf('차종');
        if ([idxCode, idxGubun, idxBunryu, idxRoute, idxType].includes(-1)) return setFormData(prev => ({ ...prev, 차량코드: '' }));
        const found = rows.slice(1).find(row => {
          return row[idxGubun] === formData['구분'] &&
                 row[idxBunryu] === formData['분류'] &&
                 row[idxRoute] === formData['경로'] &&
                 row[idxType] === formData['차량종류'];
        });
        if (found) {
          setFormData(prev => ({ ...prev, 차량코드: found[idxCode] }));
        } else {
          setFormData(prev => ({ ...prev, 차량코드: '' }));
        }
      } catch (e) {
        setFormData(prev => ({ ...prev, 차량코드: '' }));
      }
    }
    if (formData['구분'] && formData['분류'] && formData['경로'] && formData['차량종류']) {
      fetchCarCode();
    } else {
      setFormData(prev => ({ ...prev, 차량코드: '' }));
    }
  }, [formData['구분'], formData['분류'], formData['경로'], formData['차량종류']]);
  const [carTypeOptions, setCarTypeOptions] = useState([]);
  // 차량종류 옵션 동적 생성 (구분/분류/경로 조건)
  useEffect(() => {
    async function fetchCarTypeOptions() {
      try {
  const SHEET_ID = process.env.REACT_APP_SHEET_ID;
  const API_KEY = process.env.REACT_APP_API_KEY;
  const useProxy = (process.env.REACT_APP_USE_PROXY === 'true') || (process.env.NODE_ENV !== 'production');
  const readUrl = useProxy ? `/api/append?sheet=rcar` : `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/rcar?key=${API_KEY}`;
  const res = await fetch(readUrl);
        const data = await res.json();
        const rows = data.values || [];
        if (rows.length < 2) return setCarTypeOptions([]);
        const header = rows[0];
        const idxType = header.indexOf('차종');
        const idxGubun = header.indexOf('구분');
        const idxBunryu = header.indexOf('분류');
        const idxRoute = header.indexOf('경로');
        if (idxType === -1 || idxGubun === -1 || idxBunryu === -1 || idxRoute === -1) return setCarTypeOptions([]);
        // 조건 필터링
        let filtered = rows.slice(1).filter(row => {
          return row[idxGubun] === formData['구분'] && row[idxBunryu] === formData['분류'] && row[idxRoute] === formData['경로'];
        });
        const typeRaw = filtered.map(row => row[idxType]).filter(v => v);
        setCarTypeOptions(Array.from(new Set(typeRaw)));
      } catch (e) {
        setCarTypeOptions([]);
      }
    }
    if (formData['구분'] && formData['분류'] && formData['경로']) {
      fetchCarTypeOptions();
    } else {
      setCarTypeOptions([]);
    }
  }, [formData['구분'], formData['분류'], formData['경로']]);
  const [routeOptions, setRouteOptions] = useState([]);
  // 경로 옵션 동적 생성 (구분/분류 조건)
  useEffect(() => {
    async function fetchRouteOptions() {
      try {
        const SHEET_ID = process.env.REACT_APP_SHEET_ID;
        const API_KEY = process.env.REACT_APP_API_KEY;
  const useProxy = (process.env.REACT_APP_USE_PROXY === 'true') || (process.env.NODE_ENV !== 'production');
        const readUrl = useProxy ? `/api/append?sheet=rcar` : `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/rcar?key=${API_KEY}`;
        const res = await fetch(readUrl);
        const data = await res.json();
        const rows = data.values || [];
        if (rows.length < 2) return setRouteOptions([]);
        const header = rows[0];
        const idxRoute = header.indexOf('경로');
        const idxGubun = header.indexOf('구분');
        const idxBunryu = header.indexOf('분류');
        if (idxRoute === -1 || idxGubun === -1 || idxBunryu === -1) return setRouteOptions([]);
        // 조건 필터링
        let filtered = rows.slice(1).filter(row => {
          return row[idxGubun] === formData['구분'] && row[idxBunryu] === formData['분류'];
        });
        const routeRaw = filtered.map(row => row[idxRoute]).filter(v => v);
        setRouteOptions(Array.from(new Set(routeRaw)));
      } catch (e) {
        setRouteOptions([]);
      }
    }
    if (formData['구분'] && formData['분류']) {
      fetchRouteOptions();
    } else {
      setRouteOptions([]);
    }
  }, [formData['구분'], formData['분류']]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 구분 기본값 왕복, 차량대수 기본값 1
  useEffect(() => {
    const cachedOrderId = window.localStorage.getItem('reservation_orderId') || `ORD-${Date.now()}`;
    const cachedEmail = window.localStorage.getItem('user_email') || '';
    setFormData(prev => ({
      ...prev,
      서비스ID: process.env.REACT_APP_SHEET_ID,
      주문ID: cachedOrderId,
      Email: cachedEmail,
      구분: prev['구분'] || '왕복',
      분류: prev['구분'] === '편도' ? '없음' : (prev['분류'] || ''),
      차량대수: prev['차량대수'] || 1
    }));
  }, []);

  // 구분 변경 시 분류 자동 처리
  useEffect(() => {
    if (formData['구분'] === '편도') {
      setFormData(prev => ({ ...prev, 분류: '없음' }));
    } else if (formData['구분'] === '왕복' && (prev => prev['분류'] === '없음')) {
      setFormData(prev => ({ ...prev, 분류: '' }));
    }
  }, [formData['구분']]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const rowData = FIXED_HEADERS.map(col => formData[col.key] || '');
      // ensure Email is plain string
      const emailIdx = FIXED_HEADERS.findIndex(h => h.key === 'Email');
      if (emailIdx !== -1) {
        const val = rowData[emailIdx];
        rowData[emailIdx] = (val && typeof val === 'object') ? (val.toString ? val.toString() : JSON.stringify(val)) : String(val || '');
      }
      const appendUrl = process.env.REACT_APP_SHEET_APPEND_URL;
      const appendToken = process.env.REACT_APP_SHEET_APPEND_TOKEN;
  const useProxy = (process.env.REACT_APP_USE_PROXY === 'true') || (process.env.NODE_ENV !== 'production');
      const targetUrl = useProxy ? '/api/append' : appendUrl;
      if (!targetUrl) throw new Error('Append URL not configured. Set REACT_APP_SHEET_APPEND_URL in .env');
      const payload = { service: 'rcar', row: rowData };
      if (!useProxy && appendToken) payload.token = appendToken;
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json || !json.success) throw new Error(json && json.error ? json.error : 'Append failed');
      alert('렌트카 서비스 정보가 저장되었습니다.');
      setFormData({});
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-info">
      <h2 className="step-title">렌트카 서비스 정보</h2>
      <form className="sheet-columns-form" onSubmit={handleSubmit}>
        {FIXED_HEADERS
          .filter(col => col.key !== '서비스ID' && col.key !== '주문ID' && col.key !== 'ID' && col.key !== '차량코드' && col.key !== '사용기간' && col.key !== '금액' && col.key !== '합계')
          .map((col, idx) => (
            <div className="form-group" key={idx}>
              <label htmlFor={`shrc_${col.key}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {iconMap[col.key]}{col.label}
              </label>
              {col.key === '구분' ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['왕복', '편도'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      style={{
                        backgroundColor: formData['구분'] === opt ? '#007bff' : '#f0f0f0',
                        color: formData['구분'] === opt ? '#fff' : '#333',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '6px 16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleInputChange('구분', opt)}
                    >{opt}</button>
                  ))}
                </div>
              ) : col.key === '분류' ? (
                formData['구분'] === '왕복' ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['당일', '다른날'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        style={{
                          backgroundColor: formData['분류'] === opt ? '#007bff' : '#f0f0f0',
                          color: formData['분류'] === opt ? '#fff' : '#333',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '6px 16px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleInputChange('분류', opt)}
                      >{opt}</button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    id={`shrc_분류`}
                    value={formData['분류'] || '없음'}
                    readOnly
                    placeholder="없음"
                  />
                )
              ) : col.key === '경로' ? (
                <select
                  id={`shrc_경로`}
                  value={formData['경로'] || ''}
                  onChange={e => handleInputChange('경로', e.target.value)}
                  required={col.required}
                  disabled={routeOptions.length === 0}
                >
                  <option value="">경로 선택</option>
                  {routeOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : col.key === '차량종류' ? (
                <select
                  id={`shrc_차량종류`}
                  value={formData['차량종류'] || ''}
                  onChange={e => handleInputChange('차량종류', e.target.value)}
                  required={col.required}
                  disabled={carTypeOptions.length === 0}
                >
                  <option value="">차량종류 선택</option>
                  {carTypeOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : col.key === '차량대수' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1,2,3,4,5,6,7].map(num => (
                    <button
                      key={num}
                      type="button"
                      style={{
                        backgroundColor: formData['차량대수'] == num ? '#007bff' : '#f0f0f0',
                        color: formData['차량대수'] == num ? '#fff' : '#333',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleInputChange('차량대수', num)}
                    >{num}</button>
                  ))}
                </div>
              ) : col.key === '승차인원' ? (
                <input
                  type="number"
                  id={`shrc_승차인원`}
                  value={formData['승차인원'] || 1}
                  min={1}
                  onChange={e => handlePassengerChange(e.target.value)}
                  placeholder={col.label}
                  required={col.required}
                />
              ) : col.key === '승차시간' ? (
                <input
                  type="time"
                  id={`shrc_승차시간`}
                  value={formData['승차시간'] || ''}
                  onChange={e => handleInputChange('승차시간', e.target.value)}
                  placeholder={col.label}
                  required={col.required}
                />
              ) : col.key === 'Email' ? (
                <input
                  type={col.type}
                  id={`shrc_${col.key}`}
                  value={formData[col.key] || ''}
                  readOnly
                  placeholder={col.label}
                  required={col.required}
                />
              ) : (
                <input
                  type={col.type}
                  id={`shrc_${col.key}`}
                  value={formData[col.key] || ''}
                  onChange={e => handleInputChange(col.key, e.target.value)}
                  placeholder={col.label}
                  required={col.required}
                />
              )}
            </div>
          ))}
        <div className="form-footer-row" style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
          <button
            type="button"
            style={{
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 18px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}
            onClick={() => window.location.href = '/reservation'}
          >홈</button>
          <button
            type="submit"
            style={{
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 18px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
            }}
            disabled={loading}
          >
            {loading ? '저장중...' : '저장 및 전송'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default RentalCarServiceForm;

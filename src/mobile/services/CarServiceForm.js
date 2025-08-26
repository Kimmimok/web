import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FIXED_HEADERS = [
  { key: 'ID', label: 'ID', type: 'text', required: false },
  { key: '주문ID', label: '주문ID', type: 'text', required: true },
  { key: '구분', label: '구분', type: 'text', required: false },
  { key: '분류', label: '분류', type: 'text', required: false },
  { key: '크루즈', label: '크루즈', type: 'text', required: false },
  { key: '차량종류', label: '차량종류', type: 'text', required: false },
  { key: '차량코드', label: '차량코드', type: 'text', required: false },
  { key: '차량수', label: '차량수', type: 'number', required: false },
  { key: '승차인원', label: '승차인원', type: 'number', required: false },
  { key: '승차일시', label: '승차일시', type: 'date', required: false },
  { key: '승차위치', label: '승차위치', type: 'text', required: false },
  { key: '하차위치', label: '하차위치', type: 'text', required: false },
  { key: '수량', label: '수량', type: 'number', required: false },
  { key: '금액', label: '금액', type: 'number', required: false },
  { key: '합계', label: '합계', type: 'number', required: false },
  { key: 'Email', label: '이메일 주소', type: 'email', required: true }
];

const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const API_KEY = process.env.REACT_APP_API_KEY;

function CarServiceForm({ formData, setFormData }) {
  // 차량수 기본값 1로 설정
  useEffect(() => {
    if (!formData['차량수']) {
      setFormData(prev => ({ ...prev, 차량수: 1 }));
    }
  }, []);
  // 금액 자동입력: 구분, 일정(캐시), 크루즈, 종류, 승차인원 5가지 조건 만족하는 금액
  useEffect(() => {
    async function fetchCarAmount() {
      try {
        const code = formData['차량코드'] || '';
        if (!code) {
          setFormData(prev => ({ ...prev, 금액: '' }));
          return;
        }
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/car?key=${API_KEY}`);
        const data = await res.json();
        const rows = data.values || [];
        if (rows.length < 2) {
          setFormData(prev => ({ ...prev, 금액: '' }));
          return;
        }
        const header = rows[0];
        const idxCode = header.indexOf('코드');
        const idxAmount = header.indexOf('금액');
        const found = rows.slice(1).find(row => row[idxCode] === code);
        setFormData(prev => ({ ...prev, 금액: found ? found[idxAmount] : '' }));
      } catch (e) {
        setFormData(prev => ({ ...prev, 금액: '' }));
      }
    }
    fetchCarAmount();
  }, [formData['차량코드']]);
  // 차량코드 자동입력: 구분, 일정(캐시), 크루즈, 종류 4가지 조건 만족하는 코드
  useEffect(() => {
    async function fetchCarCode() {
      try {
        const cachedSchedule = window.localStorage.getItem('schedule_value') || '';
        const cruise = formData['크루즈'] || '';
        const gubun = formData['구분'] || '';
        const type = formData['차량종류'] || '';
        if (!gubun || !cachedSchedule || !cruise || !type) {
          setFormData(prev => ({ ...prev, 차량코드: '' }));
          return;
        }
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/car?key=${API_KEY}`);
        const data = await res.json();
        const rows = data.values || [];
        if (rows.length < 2) {
          setFormData(prev => ({ ...prev, 차량코드: '' }));
          return;
        }
        const header = rows[0];
        const idxGubun = header.indexOf('구분');
        const idxSchedule = header.indexOf('일정');
        const idxCruise = header.indexOf('크루즈');
        const idxType = header.indexOf('종류');
        const idxCode = header.indexOf('코드');
        const found = rows.slice(1).find(row =>
          row[idxGubun] === gubun &&
          row[idxSchedule] === cachedSchedule &&
          row[idxCruise] === cruise &&
          row[idxType] === type
        );
        setFormData(prev => ({ ...prev, 차량코드: found ? found[idxCode] : '' }));
      } catch (e) {
        setFormData(prev => ({ ...prev, 차량코드: '' }));
      }
    }
    fetchCarCode();
  }, [formData['구분'], formData['크루즈'], formData['차량종류']]);
  const [carTypeOptions, setCarTypeOptions] = useState([]);

  // 차량종류 목록 fetch: 구분, 일정(캐시), 크루즈 조건 만족하는 유일값만
  useEffect(() => {
    async function fetchCarTypes() {
      try {
        const cachedSchedule = window.localStorage.getItem('schedule_value') || '';
        const cruise = formData['크루즈'] || '';
        const gubun = formData['구분'] || '';
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/car?key=${API_KEY}`);
        const data = await res.json();
        const rows = data.values || [];
        if (rows.length < 2) return setCarTypeOptions([]);
        const header = rows[0];
        const idxGubun = header.indexOf('구분');
        const idxSchedule = header.indexOf('일정');
        const idxCruise = header.indexOf('크루즈');
        const idxType = header.indexOf('종류');
        let filtered = rows.slice(1);
        if (idxGubun !== -1 && gubun) filtered = filtered.filter(row => row[idxGubun] === gubun);
        if (idxSchedule !== -1 && cachedSchedule) filtered = filtered.filter(row => row[idxSchedule] === cachedSchedule);
        if (idxCruise !== -1 && cruise) filtered = filtered.filter(row => row[idxCruise] === cruise);
        if (idxType !== -1) {
          const types = filtered.map(row => row[idxType]).filter(v => v);
          setCarTypeOptions(Array.from(new Set(types)));
        } else {
          setCarTypeOptions([]);
        }
      } catch (e) {
        setCarTypeOptions([]);
      }
    }
    fetchCarTypes();
  }, [formData['구분'], formData['크루즈']]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 캐시에서 주문ID, 이메일 자동 입력
    const cachedOrderId = window.localStorage.getItem('reservation_orderId') || `ORD-${Date.now()}`;
    const cachedEmail = window.localStorage.getItem('user_email') || '';
    const cachedCruise = window.localStorage.getItem('cruise_value') || '';
    setFormData(prev => ({
      ...prev,
      서비스ID: SHEET_ID,
      주문ID: cachedOrderId,
      Email: cachedEmail,
      크루즈: prev['크루즈'] || cachedCruise
    }));
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const rowData = FIXED_HEADERS.map(col => formData[col.key] || '');
      const appendUrl = process.env.REACT_APP_SHEET_APPEND_URL;
      const appendToken = process.env.REACT_APP_SHEET_APPEND_TOKEN;
      const useProxy = process.env.REACT_APP_USE_PROXY === 'true';
      const targetUrl = useProxy ? '/api/append' : appendUrl;
      if (!targetUrl) throw new Error('Append URL not configured. Set REACT_APP_SHEET_APPEND_URL in .env');
      const payload = { service: 'car', row: rowData };
      if (!useProxy && appendToken) payload.token = appendToken;
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json || !json.success) throw new Error(json && json.error ? json.error : 'Append failed');
      alert('차량 서비스 정보가 저장되었습니다.');
      setFormData({});
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-info">
      <h2 className="step-title">크루즈 차량 정보</h2>
      <form className="sheet-columns-form" onSubmit={handleSubmit}>
        {FIXED_HEADERS
            .filter(col => col.key !== '서비스ID' && col.key !== '주문ID' && col.key !== 'ID' && col.key !== '차량코드' && col.key !== '금액' && col.key !== '합계')
          .map((col, idx) => (
            <div className="form-group" key={idx}>
              <label htmlFor={`shc_${col.key}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* 심플 아이콘 조건별 표시 */}
                {col.key === '구분' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="4" y="4" width="8" height="8" rx="2" stroke="#6f42c1" strokeWidth="2"/></svg>
                )}
                {col.key === '분류' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#007bff" strokeWidth="2"/></svg>
                )}
                {col.key === '크루즈' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="10" rx="6" ry="3" stroke="#17a2b8" strokeWidth="2"/><rect x="6" y="3" width="4" height="5" rx="2" fill="#17a2b8"/></svg>
                )}
                {col.key === '차량종류' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="6" rx="2" stroke="#ffc107" strokeWidth="2"/><rect x="6" y="4" width="4" height="3" rx="1.5" fill="#ffc107"/></svg>
                )}
                {col.key === '차량코드' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" rx="2" stroke="#343a40" strokeWidth="2"/></svg>
                )}
                {col.key === '차량수' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="6" rx="2" stroke="#007bff" strokeWidth="2"/><rect x="7" y="4" width="4" height="3" rx="1.5" fill="#007bff"/></svg>
                )}
                {col.key === '승차인원' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="4" y="4" width="8" height="8" rx="2" stroke="#28a745" strokeWidth="2"/><text x="8" y="11" textAnchor="middle" fontSize="8" fill="#28a745">승</text></svg>
                )}
                {col.key === '승차일시' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="10" rx="2" stroke="#007bff" strokeWidth="2"/><rect x="5" y="1" width="6" height="2" rx="1" fill="#007bff"/></svg>
                )}
                {col.key === '승차위치' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#fd7e14" strokeWidth="2"/><rect x="7" y="7" width="2" height="2" rx="1" fill="#fd7e14"/></svg>
                )}
                {col.key === '하차위치' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#20c997" strokeWidth="2"/><rect x="7" y="7" width="2" height="2" rx="1" fill="#20c997"/></svg>
                )}
                {col.key === '수량' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="6" rx="2" stroke="#007bff" strokeWidth="2"/></svg>
                )}
                {col.key === '금액' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#28a745" strokeWidth="2"/><text x="8" y="11" textAnchor="middle" fontSize="8" fill="#28a745">₩</text></svg>
                )}
                {col.key === '합계' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="4" y="4" width="8" height="8" rx="2" stroke="#343a40" strokeWidth="2"/><text x="8" y="11" textAnchor="middle" fontSize="8" fill="#343a40">Σ</text></svg>
                )}
                {col.key === 'Email' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="8" rx="2" stroke="#343a40" strokeWidth="2"/><path d="M2 4l6 5 6-5" stroke="#343a40" strokeWidth="2"/></svg>
                )}
                {col.label}
              </label>
              {col.key === '구분' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    style={{
                      backgroundColor: formData['구분'] === '왕복' ? '#007bff' : '#f0f0f0',
                      color: formData['구분'] === '왕복' ? '#fff' : '#333',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '6px 16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleInputChange('구분', '왕복')}
                  >왕복</button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: formData['구분'] === '편도' ? '#007bff' : '#f0f0f0',
                      color: formData['구분'] === '편도' ? '#fff' : '#333',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '6px 16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleInputChange('구분', '편도')}
                  >편도</button>
                </div>
              ) : col.key === '분류' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    style={{
                      backgroundColor: formData['분류'] === '픽업' ? '#007bff' : '#f0f0f0',
                      color: formData['분류'] === '픽업' ? '#fff' : '#333',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '6px 16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleInputChange('분류', '픽업')}
                  >픽업</button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: formData['분류'] === '드랍' ? '#007bff' : '#f0f0f0',
                      color: formData['분류'] === '드랍' ? '#fff' : '#333',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '6px 16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleInputChange('분류', '드랍')}
                  >드랍</button>
                </div>
              ) : col.key === '차량종류' ? (
                <select
                  id={`shc_차량종류`}
                  value={formData['차량종류'] || ''}
                  onChange={e => handleInputChange('차량종류', e.target.value)}
                  required={col.required}
                >
                  <option value="">차량종류 선택</option>
                  {carTypeOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : col.key === '금액' ? (
                <input
                  type={col.type}
                  id={`shc_금액`}
                  value={String(formData['금액'])}
                  readOnly
                  placeholder={col.label}
                  required={col.required}
                  style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: 'bold' }}
                />
              ) : col.key === '차량수' || col.key === '승차인원' ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1,2,3,4,5,6,7].map(num => (
                    <button
                      key={num}
                      type="button"
                      style={{
                        backgroundColor: formData[col.key] == num ? '#007bff' : '#f0f0f0',
                        color: formData[col.key] == num ? '#fff' : '#333',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleInputChange(col.key, num)}
                    >{num}</button>
                  ))}
                </div>
              ) : (
                <input
                  type={col.type}
                  id={`shc_${col.key}`}
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

export default CarServiceForm;

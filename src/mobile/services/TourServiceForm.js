import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const API_KEY = process.env.REACT_APP_API_KEY;

const FIXED_HEADERS = [
  { key: 'ID', label: 'ID', type: 'text', required: false },
  { key: '주문ID', label: '주문ID', type: 'text', required: true },
  { key: '투어코드', label: '투어코드', type: 'text', required: false },
  { key: '투어명', label: '투어명', type: 'text', required: false },
  { key: '투어종류', label: '투어종류', type: 'text', required: false },
  { key: '상세구분', label: '상세구분', type: 'text', required: false },
  { key: '수량', label: '수량', type: 'number', required: false },
  { key: '시작일자', label: '시작일자', type: 'date', required: false },
  { key: '종료일자', label: '종료일자', type: 'date', required: false },
  { key: '투어인원', label: '투어인원', type: 'number', required: false },
  { key: '배차', label: '배차', type: 'text', required: false },
  { key: '픽업위치', label: '픽업위치', type: 'text', required: false },
  { key: '드랍위치', label: '드랍위치', type: 'text', required: false },
  { key: '금액', label: '금액', type: 'number', required: false },
  { key: '합계', label: '합계', type: 'number', required: false },
  { key: 'Email', label: '이메일 주소', type: 'email', required: true },
  { key: '투어비고', label: '투어비고', type: 'text', required: false }
];

function TourServiceForm({ formData, setFormData }) {
  // 컬럼별 아이콘 매핑
  const iconMap = {
    투어코드: <span role="img" aria-label="code">🔑</span>,
    투어명: <span role="img" aria-label="tour">🗺️</span>,
    투어종류: <span role="img" aria-label="type">🏷️</span>,
    상세구분: <span role="img" aria-label="detail">🔎</span>,
    수량: <span role="img" aria-label="count">#️⃣</span>,
    시작일자: <span role="img" aria-label="start">📅</span>,
    종료일자: <span role="img" aria-label="end">📅</span>,
    투어인원: <span role="img" aria-label="person">👤</span>,
    배차: <span role="img" aria-label="car">🚗</span>,
    픽업위치: <span role="img" aria-label="pickup">📍</span>,
    드랍위치: <span role="img" aria-label="drop">📍</span>,
    금액: <span role="img" aria-label="money">💰</span>,
    합계: <span role="img" aria-label="sum">➕</span>,
    Email: <span role="img" aria-label="email">✉️</span>,
    투어비고: <span role="img" aria-label="memo">📝</span>
  };
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 캐시에서 주문ID, 이메일 자동 입력
    const cachedOrderId = window.localStorage.getItem('reservation_orderId') || `ORD-${Date.now()}`;
    const cachedEmail = window.localStorage.getItem('user_email') || '';
    setFormData(prev => ({
      ...prev,
      서비스ID: SHEET_ID,
      주문ID: cachedOrderId,
      Email: cachedEmail
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
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/SH_T!A1:append?valueInputOption=USER_ENTERED&key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [rowData] })
        }
      );
      alert('투어 서비스 정보가 저장되었습니다.');
      setFormData({});
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-info">
      <h2 className="step-title">투어 서비스 정보</h2>
      <form className="sheet-columns-form" onSubmit={handleSubmit}>
        {FIXED_HEADERS
          .filter(col => col.key !== '서비스ID' && col.key !== '주문ID' && col.key !== 'ID')
          .map((col, idx) => (
            <div className="form-group" key={idx}>
              <label htmlFor={`sht_${col.key}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {iconMap[col.key]}{col.label}
              </label>
              <input
                type={col.type}
                id={`sht_${col.key}`}
                value={formData[col.key] || ''}
                onChange={e => handleInputChange(col.key, e.target.value)}
                placeholder={col.label}
                required={col.required}
              />
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

export default TourServiceForm;

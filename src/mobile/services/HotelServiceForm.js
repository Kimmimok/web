import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const API_KEY = process.env.REACT_APP_API_KEY;

const FIXED_HEADERS = [
  { key: 'ID', label: 'ID', type: 'text', required: false },
  { key: '주문ID', label: '주문ID', type: 'text', required: true },
  { key: '호텔코드', label: '호텔코드', type: 'text', required: false },
  { key: '호텔명', label: '호텔명', type: 'text', required: false },
  { key: '객실명', label: '객실명', type: 'text', required: false },
  { key: '객실종류', label: '객실종류', type: 'text', required: false },
  { key: '객실수', label: '객실수', type: 'number', required: false },
  { key: '일정', label: '일정', type: 'text', required: false },
  { key: '체크인날짜', label: '체크인날짜', type: 'date', required: false },
  { key: '체크아웃날짜', label: '체크아웃날짜', type: 'date', required: false },
  { key: '조식서비스', label: '조식서비스', type: 'text', required: false },
  { key: 'ADULT', label: '성인수', type: 'number', required: false },
  { key: 'CHILD', label: '아동수', type: 'number', required: false },
  { key: 'TOODLER', label: '유아수', type: 'number', required: false },
  { key: '엑스트라베드', label: '엑스트라베드', type: 'number', required: false },
  { key: '투숙인원 비고', label: '투숙인원 비고', type: 'text', required: false },
  { key: '금액', label: '금액', type: 'number', required: false },
  { key: '합계', label: '합계', type: 'number', required: false },
  { key: 'Email', label: '이메일 주소', type: 'email', required: true }
];

function HotelServiceForm({ formData, setFormData }) {
  // 컬럼별 아이콘 매핑
  const iconMap = {
    호텔코드: <span role="img" aria-label="code">🔑</span>,
    호텔명: <span role="img" aria-label="hotel">🏨</span>,
    객실명: <span role="img" aria-label="room">🚪</span>,
    객실종류: <span role="img" aria-label="type">🏷️</span>,
    객실수: <span role="img" aria-label="count">#️⃣</span>,
    일정: <span role="img" aria-label="schedule">🗓️</span>,
    체크인날짜: <span role="img" aria-label="checkin">📅</span>,
    체크아웃날짜: <span role="img" aria-label="checkout">📅</span>,
    조식서비스: <span role="img" aria-label="breakfast">🥐</span>,
    ADULT: <span role="img" aria-label="adult">🧑</span>,
    CHILD: <span role="img" aria-label="child">🧒</span>,
    TOODLER: <span role="img" aria-label="baby">👶</span>,
    엑스트라베드: <span role="img" aria-label="bed">🛏️</span>,
  "투숙인원 비고": <span role="img" aria-label="memo">📝</span>,
  금액: <span role="img" aria-label="money">💰</span>,
    합계: <span role="img" aria-label="sum">➕</span>,
    Email: <span role="img" aria-label="email">✉️</span>
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
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/SH_H!A1:append?valueInputOption=USER_ENTERED&key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [rowData] })
        }
      );
      alert('호텔 서비스 정보가 저장되었습니다.');
      setFormData({});
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-info">
      <h2 className="step-title">호텔 서비스 정보</h2>
      <form className="sheet-columns-form" onSubmit={handleSubmit}>
        {FIXED_HEADERS
          .filter(col => col.key !== '서비스ID')
          .map((col, idx) => (
            <div className="form-group" key={idx}>
              <label htmlFor={`shh_${col.key}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {iconMap[col.key]}{col.label}
              </label>
              <input
                type={col.type}
                id={`shh_${col.key}`}
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

export default HotelServiceForm;

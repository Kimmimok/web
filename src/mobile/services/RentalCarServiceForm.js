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
  { key: '승차장소', label: '승차장소', type: 'text', required: false },
  { key: '캐리어갯수', label: '캐리어갯수', type: 'number', required: false },
  { key: '목적지', label: '목적지', type: 'text', required: false },
  { key: '경유지', label: '경유지', type: 'text', required: false },
  { key: '승차인원', label: '승차인원', type: 'number', required: false },
  { key: '사용기간', label: '사용기간', type: 'text', required: false },
  { key: '금액', label: '금액', type: 'number', required: false },
  { key: '합계', label: '합계', type: 'number', required: false },
  { key: 'Email', label: '이메일 주소', type: 'email', required: true }
];

function RentalCarServiceForm({ formData, setFormData }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 캐시에서 주문ID, 이메일 자동 입력
    const cachedOrderId = window.localStorage.getItem('reservation_orderId') || `ORD-${Date.now()}`;
    const cachedEmail = window.localStorage.getItem('user_email') || '';
    setFormData(prev => ({
      ...prev,
      서비스ID: process.env.REACT_APP_SHEET_ID,
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
        `https://sheets.googleapis.com/v4/spreadsheets/${process.env.REACT_APP_SHEET_ID}/values/SH_RC!A1:append?valueInputOption=USER_ENTERED&key=${process.env.REACT_APP_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [rowData] })
        }
      );
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
      <h2 className="step-title">렌트카 서비스 정보 (SH_RC 시트 컬럼)</h2>
      <form className="sheet-columns-form" onSubmit={handleSubmit}>
        {FIXED_HEADERS
          .filter(col => col.key !== '서비스ID' && col.key !== '주문ID' && col.key !== 'ID')
          .map((col, idx) => (
            <div className="form-group" key={idx}>
              <label htmlFor={`shrc_${col.key}`}>{col.label}</label>
              <input
                type={col.type}
                id={`shrc_${col.key}`}
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

export default RentalCarServiceForm;

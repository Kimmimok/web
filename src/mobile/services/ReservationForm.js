import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SHEET_ID = '16bKsWL_0HkZeAbOVVntSz0ehUHRGO1PoanNhFLghvEo';
const API_KEY = 'AIzaSyDyfByYamh-s9972-ZeVr_Fyq64jH1snrw';

function ReservationForm({ formData, setFormData }) {
  const [shmHeaders, setShmHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHeaders() {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/SH_M!1:1?key=${API_KEY}`);
      const data = await res.json();
      setShmHeaders(data.values ? data.values[0] : []);
      // 서비스ID, 주문ID, 예약일 자동 입력
      const today = new Date().toISOString().slice(0, 10);
      setFormData(prev => ({
        ...prev,
        서비스ID: SHEET_ID,
        주문ID: `ORD-${Date.now()}`,
        예약일: today
      }));
    }
    fetchHeaders();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const rowData = shmHeaders.map(col => formData[col] || '');
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/SH_M!A1:append?valueInputOption=USER_ENTERED&key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [rowData] })
        }
      );
      alert('예약 정보가 저장되었습니다.');
      setFormData({});
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-info">
      <h2 className="step-title">예약자 정보 </h2>
      {shmHeaders.length > 0 ? (
        <form className="sheet-columns-form" onSubmit={handleSubmit}>
          {(() => {
            let filtered = shmHeaders.filter(col => col !== '서비스ID' && col !== '주문ID' && col !== 'ID');
            const lastIdx = filtered.indexOf('회원등급');
            if (lastIdx >= 0) {
              filtered[lastIdx] = '카톡ID';
            }
            const renderHeaders = lastIdx >= 0 ? filtered.slice(0, lastIdx + 1) : filtered;
            return renderHeaders.map((col, idx) => (
              <div className="form-group" key={idx}>
                <label htmlFor={`shm_${col}`}>
                  {col}
                  {col === '영문이름' && (
                    <span style={{ marginLeft: '8px', color: '#007bff', fontSize: '0.95em' }}>
                      (대문자로 성이 앞에 이름 뒤에 입력)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  id={`shm_${col}`}
                  value={formData[col === '카톡ID' ? '카톡ID' : col] || ''}
                  onChange={e => {
                    let value = e.target.value;
                    if (col === '영문이름') {
                      value = value.replace(/[^A-Z]/g, '').toUpperCase();
                    }
                    handleInputChange(col === '카톡ID' ? '카톡ID' : col, value);
                  }}
                  placeholder={col === '영문이름' ? 'HONG GILDONG 형식 입력' : col}
                />
              </div>
            ));
          })()}
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
              onClick={() => navigate('/reservation')}
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
      ) : (
        <div>컬럼 정보를 불러오는 중...</div>
      )}
    </div>
  );
}

export default ReservationForm;

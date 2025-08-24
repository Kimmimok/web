import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SHEET_ID = '16bKsWL_0HkZeAbOVVntSz0ehUHRGO1PoanNhFLghvEo';
const API_KEY = 'AIzaSyDyfByYamh-s9972-ZeVr_Fyq64jH1snrw';

function CarServiceForm({ formData, setFormData }) {
  const [shcHeaders, setShcHeaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHeaders() {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/SH_C!1:1?key=${API_KEY}`);
      const data = await res.json();
      setShcHeaders(data.values ? data.values[0] : []);
      setFormData(prev => ({
        ...prev,
        서비스ID: SHEET_ID,
        주문ID: `ORD-${Date.now()}`
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
      const rowData = shcHeaders.map(col => formData[col] || '');
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/SH_C!A1:append?valueInputOption=USER_ENTERED&key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [rowData] })
        }
      );
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
      <h2 className="step-title">차량 서비스 정보 (SH_C 시트 컬럼)</h2>
      {shcHeaders.length > 0 ? (
        <form className="sheet-columns-form" onSubmit={handleSubmit}>
          {shcHeaders
            .filter(col => col !== '서비스ID' && col !== '주문ID' && col !== 'ID')
            .map((col, idx) => (
              <div className="form-group" key={idx}>
                <label htmlFor={`shc_${col}`}>{col}</label>
                <input
                  type="text"
                  id={`shc_${col}`}
                  value={formData[col] || ''}
                  onChange={e => handleInputChange(col, e.target.value)}
                  placeholder={col}
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

export default CarServiceForm;

import React, { useState, useEffect } from 'react';
import { getAirportRoutesByType } from '../../utils/airportRoute';
import { getAirportCarTypes } from '../../utils/airportCarType';
import { getAirportCarCode } from '../../utils/airportCarCode';
import { getAirportCarPrice } from '../../utils/airportCarPrice';
import { useNavigate } from 'react-router-dom';

const FIXED_HEADERS = [
  { key: 'ID', label: 'ID', type: 'text', required: false },
  { key: '주문ID', label: '주문ID', type: 'text', required: true },
  { key: '구분', label: '구분', type: 'text', required: false },
  { key: '분류', label: '분류', type: 'text', required: false },
  { key: '경로', label: '경로', type: 'text', required: false },
  { key: '차량코드', label: '차량코드', type: 'text', required: false },
  { key: '차량종류', label: '차량종류', type: 'text', required: false },
  { key: '일자', label: '일자', type: 'date', required: false },
  { key: '시간', label: '시간', type: 'text', required: false },
  { key: '공항명', label: '공항명', type: 'text', required: false },
  { key: '항공편', label: '항공편', type: 'text', required: false },
  { key: '승차인원', label: '승차인원', type: 'number', required: false },
  { key: '캐리어수량', label: '캐리어수량', type: 'number', required: false },
    { key: '패스트', label: '패스트', type: 'text', required: false },
  { key: '장소명', label: '장소명', type: 'text', required: false },
  { key: '경유지', label: '경유지', type: 'text', required: false },
  { key: '경유지대기시간', label: '경유지대기시간', type: 'text', required: false },
  { key: '차량수', label: '차량수', type: 'number', required: false },
  { key: '금액', label: '금액', type: 'number', required: false },
  { key: '합계', label: '합계', type: 'number', required: false },
  { key: 'Email', label: '이메일 주소', type: 'email', required: true },

];

const LABEL_ICONS = {
  '승차인원': '👤',
  '캐리어수량': '🧳',
  '차량수': '🚗',
  '시간': '⏰',
  '장소명': '📍',
  '공항명': '✈️',
  '경로': '🛣️',
  '차량종류': '🚙',
  '차량코드': '🔑',
  '금액': '💰',
  '패스트': '⚡',
  '분류': '🔄',
  '구분': '🏷️',
  'ID': '🆔',
  '주문ID': '📝',
  '서비스ID': '🗂️',
  '일자': '📅',
  '항공편': '🛫',
  '경유지': '🔁',
  '경유지대기시간': '⏳',
  '합계': '🧮',
  'Email': '📧',
};

const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const API_KEY = process.env.REACT_APP_API_KEY;

function AirportServiceForm({ formData, setFormData }) {
  // 금액 자동입력: 경로/분류/차종/코드 값이 모두 선택되면 금액값 자동 입력
  useEffect(() => {
    async function fetchCarPrice() {
      const type = formData['분류'] || '';
      const route = formData['경로'] || '';
      const carType = formData['차량종류'] || '';
      const code = formData['차량코드'] || '';
      if (type && route && carType && code) {
        const price = await getAirportCarPrice(type, route, carType, code);
        setFormData(prev => ({ ...prev, 금액: price }));
      } else {
        setFormData(prev => ({ ...prev, 금액: '' }));
      }
    }
    fetchCarPrice();
  }, [formData['분류'], formData['경로'], formData['차량종류'], formData['차량코드']]);
  // 차량코드 자동입력: 경로/분류/차종 값이 모두 선택되면 코드값 자동 입력
  useEffect(() => {
    async function fetchCarCode() {
      const type = formData['분류'] || '';
      const route = formData['경로'] || '';
      const carType = formData['차량종류'] || '';
      if (type && route && carType) {
        const code = await getAirportCarCode(type, route, carType);
        setFormData(prev => ({ ...prev, 차량코드: code }));
      } else {
        setFormData(prev => ({ ...prev, 차량코드: '' }));
      }
    }
    fetchCarCode();
  }, [formData['분류'], formData['경로'], formData['차량종류']]);
  const [carTypeOptions, setCarTypeOptions] = useState([]);
  const [routeOptions, setRouteOptions] = useState([]);
  // 구분, 분류 기본값 설정
  useEffect(() => {
    if (!formData['구분']) {
      setFormData(prev => ({ ...prev, 구분: '왕복' }));
    }
    if (!formData['분류']) {
      setFormData(prev => ({ ...prev, 분류: '픽업' }));
    }
  }, []);

  // 분류값 변경 시 경로 목록 갱신
  useEffect(() => {
    async function fetchRoutes() {
      const type = formData['분류'] || '픽업';
      const routes = await getAirportRoutesByType(type);
      setRouteOptions(routes);
    }
    fetchRoutes();
  }, [formData['분류']]);

  // 경로/분류값 변경 시 차량종류 목록 갱신
  useEffect(() => {
    async function fetchCarTypes() {
      const type = formData['분류'] || '픽업';
      const route = formData['경로'] || '';
      if (route) {
        const carTypes = await getAirportCarTypes(type, route);
        setCarTypeOptions(carTypes);
      } else {
        setCarTypeOptions([]);
      }
    }
    fetchCarTypes();
  }, [formData['분류'], formData['경로']]);
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
      const appendUrl = process.env.REACT_APP_SHEET_APPEND_URL;
      const appendToken = process.env.REACT_APP_SHEET_APPEND_TOKEN;
      if (!appendUrl) throw new Error('Append URL not configured. Set REACT_APP_SHEET_APPEND_URL in .env');
      const payload = { service: 'airport', row: rowData, token: appendToken };
      const res = await fetch(appendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json || !json.success) throw new Error(json && json.error ? json.error : 'Append failed');
      alert('공항 서비스 정보가 저장되었습니다.');
      setFormData({});
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-info">
      <h2 className="step-title">공항 픽업/샌딩 정보</h2>
      <form className="sheet-columns-form" onSubmit={handleSubmit}>
        {formData['구분'] === '왕복' && (
          <div style={{ color: '#007bff', fontSize: '0.98rem', marginBottom: '10px', fontWeight: 'bold' }}>
            안내: 왕복은 픽업/샌딩 두 번 입력하셔야 합니다.
          </div>
        )}
        {FIXED_HEADERS
          .filter(col => col.key !== '서비스ID' && col.key !== '주문ID' && col.key !== 'ID' && col.key !== '장소명' && col.key !== '구분' && col.key !== '차량코드' && col.key !== '금액' && col.key !== '합계' && col.key !== '패스트')
          .map((col, idx) => (
            <React.Fragment key={col.key}>
              <div className="form-group">
                <label htmlFor={`shp_${col.key}`}>
                  {(LABEL_ICONS[col.key] || '📄')} {col.label}
                </label>
                {['승차인원', '캐리어수량', '차량수'].includes(col.key) ? (
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                    {[1,2,3,4,5,6,7].map(num => (
                      <button
                        key={num}
                        type="button"
                        style={{
                          backgroundColor: formData[col.key] == num ? '#007bff' : '#f0f0f0',
                          color: formData[col.key] == num ? '#fff' : '#333',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          padding: '4px 12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleInputChange(col.key, num)}
                      >{num}</button>
                    ))}
                  </div>
                ) : col.key === '분류' ? (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '6px' }}>
                    {['픽업', '샌딩'].map(opt => (
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
                ) : col.key === '구분' ? (
                  <input
                    type="text"
                    id={`shp_${col.key}`}
                    value={"공항"}
                    readOnly
                    style={{ background: '#f0f0f0', color: '#888' }}
                  />
                ) : col.key === '시간' ? (
                  <input
                    type="time"
                    id={`shp_${col.key}`}
                    value={formData[col.key] || ''}
                    onChange={e => handleInputChange(col.key, e.target.value)}
                    required={col.required}
                  />
                ) : col.key === '경로' ? (
                  <select
                    id={`shp_${col.key}`}
                    value={formData[col.key] || ''}
                    onChange={e => handleInputChange(col.key, e.target.value)}
                    required={col.required}
                  >
                    <option value="">경로 선택</option>
                    {routeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : col.key === '차량종류' ? (
                  <select
                    id={`shp_${col.key}`}
                    value={formData[col.key] || ''}
                    onChange={e => handleInputChange(col.key, e.target.value)}
                    required={col.required}
                  >
                    <option value="">차량종류 선택</option>
                    {carTypeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : col.key === '차량코드' ? (
                  <input
                    type="text"
                    id={`shp_${col.key}`}
                    value={formData[col.key] || ''}
                    readOnly
                    style={{ background: '#f0f0f0', color: '#888' }}
                  />
                ) : col.key === '금액' ? (
                  <input
                    type="number"
                    id={`shp_${col.key}`}
                    value={formData[col.key] || ''}
                    readOnly
                    style={{ background: '#f0f0f0', color: '#888' }}
                  />
                ) : col.key === '공항명' ? (
                  <select
                    id={`shp_${col.key}`}
                    value={formData[col.key] || ''}
                    onChange={e => handleInputChange(col.key, e.target.value)}
                    required={col.required}
                  >
                    <option value="">공항명 선택</option>
                    <option value="노이바이 국제선">노이바이 국제선</option>
                    <option value="깟바 국제선">깟바 국제선</option>
                    <option value="노이바이 국내선">노이바이 국내선</option>
                    <option value="깟바 국내선">깟바 국내선</option>
                  </select>
                ) : col.key === 'Email' ? (
                  <input
                    type="email"
                    id={`shp_${col.key}`}
                    value={formData['Email'] || ''}
                    readOnly
                    style={{ background: '#f0f0f0', color: '#888' }}
                  />
                ) : col.key === '경유지대기시간' ? (
                  <input
                    type="number"
                    id={`shp_${col.key}`}
                    value={formData['경유지대기시간'] || ''}
                    onChange={e => handleInputChange('경유지대기시간', Math.max(0, Math.round(e.target.value/10)*10))}
                    min={0}
                    step={10}
                    placeholder="분"
                    required={col.required}
                  />
                ) : (
                  <input
                    type={col.type}
                    id={`shp_${col.key}`}
                    value={formData[col.key] || ''}
                    onChange={e => handleInputChange(col.key, e.target.value)}
                    placeholder={col.label}
                    required={col.required}
                  />
                )}
              </div>
              {col.key === '시간' && (
                <div className="form-group">
                  <label htmlFor="shp_장소명">📍 장소명</label>
                  <input
                    type="text"
                    id="shp_장소명"
                    value={formData['장소명'] || ''}
                    onChange={e => handleInputChange('장소명', e.target.value)}
                    placeholder="장소명"
                    required={FIXED_HEADERS.find(h => h.key === '장소명').required}
                  />
                </div>
              )}
              {col.key === '캐리어수량' && (
                <div className="form-group">
                  <label htmlFor="shp_패스트">⚡ 패스트</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                    <button
                      type="button"
                      style={{ backgroundColor: formData['패스트'] === true ? '#007bff' : '#f0f0f0', color: formData['패스트'] === true ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 16px', fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={() => handleInputChange('패스트', true)}
                    >예</button>
                    <button
                      type="button"
                      style={{ backgroundColor: formData['패스트'] === false ? '#007bff' : '#f0f0f0', color: formData['패스트'] === false ? '#fff' : '#333', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 16px', fontWeight: 'bold', cursor: 'pointer' }}
                      onClick={() => handleInputChange('패스트', false)}
                    >아니오</button>
                  </div>
                </div>
              )}
            </React.Fragment>
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
export default AirportServiceForm;

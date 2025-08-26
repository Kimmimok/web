  import React, { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';


// 크루즈 예약 컬럼 정보 및 설정 (직접 코드에 저장)
const CRUISE_COLUMNS = [
  { key: 'ID', label: 'ID', type: 'text', required: false },
  { key: '주문ID', label: '주문ID', type: 'text', required: false },
  { key: '체크인', label: '체크인 날짜를 선택하세요.', type: 'date', required: false },
  { key: '일정', label: '일정를 선택하세요.', type: 'select', required: false },
  { key: '크루즈', label: '크루즈를 선택하세요.', type: 'text', required: false },
  { key: '객실종류', label: '객실을 선택하세요.', type: 'text', required: false },
  { key: '구분', label: '구분', type: 'text', required: false },
  { key: '객실비고', label: '결제 방식을 선택하세요. ', type: 'text', required: false },
  // ... 기존 컬럼 ...
  { key: '객실코드', label: '객실코드', type: 'text', required: false },
  { key: '금액', label: '금액', type: 'number', required: false },
  { key: 'ADULT', label: '성인수를 선택하세요.', type: 'number', required: false },
  { key: 'CHILD', label: '아동수를 선택하세요.', type: 'number', required: false },
  { key: 'TODDLER', label: '유아수를 선택하세요.', type: 'number', required: false },
  { key: '승선인원', label: '승선인원(자동 계산)', type: 'number', required: false },
  { key: '인원수', label: '인원수(자동 계산)', type: 'number', required: false },
  { key: '객실수', label: '전체 객실수를 선택하세요.', type: 'number', required: false },
  { key: '승선도움', label: '승선도움을 원하시나요.', type: 'boolean', required: false },

  { key: '커넥팅룸', label: '커넥팅 룸 신청 여부를 선택하세요.', type: 'boolean', required: false },
    { key: 'Email', label: 'Email', type: 'email', required: false },
];



function CruiseBookingForm({ formData, setFormData }) {
  // 결제방식 캐시(localStorage)에서 자동 입력
  useEffect(() => {
    const cachedPayment = window.localStorage.getItem('payment_method') || '';
    if (cachedPayment && !formData['객실비고']) {
      setFormData(prev => ({ ...prev, 객실비고: cachedPayment }));
    }
  }, []);
  // 사용자 정보 페이지의 이메일을 자동으로 입력
  useEffect(() => {
    // 예시: localStorage 또는 글로벌 상태에서 이메일을 가져옴
    // 실제 구현은 사용자 정보 저장 위치에 따라 다름
    const userEmail = window.localStorage.getItem('user_email') || '';
    if (userEmail && !formData['Email']) {
      setFormData(prev => ({ ...prev, Email: userEmail }));
    }
  }, []);
  // 성인, 아동, 유아 값 변경 시 승선인원/인원수 자동입력
  useEffect(() => {
    const adult = Number(formData['ADULT']) || 0;
    const child = Number(formData['CHILD']) || 0;
    const toddler = Number(formData['TODDLER']) || 0;
    const totalBoarding = adult + child + toddler;
    const totalPerson = adult + child;
    setFormData(prev => ({
      ...prev,
      승선인원: totalBoarding,
      인원수: totalPerson
    }));
  }, [formData['ADULT'], formData['CHILD'], formData['TODDLER']]);
  // 객실코드와 금액을 6가지 조건으로 동시에 자동입력
  useEffect(() => {
    async function fetchCodeAndAmount() {
      const {
        체크인,
        일정,
        크루즈,
        객실종류,
        구분,
        객실비고
      } = formData;
      if (!체크인 || !일정 || !크루즈 || !객실종류 || !구분 || !객실비고) {
        setFormData(prev => ({ ...prev, 객실코드: '', 금액: '' }));
        return;
      }
      try {
  const SHEET_ID = process.env.REACT_APP_SHEET_ID;
  const API_KEY = process.env.REACT_APP_API_KEY;
  const useProxy = (process.env.REACT_APP_USE_PROXY === 'true') || (process.env.NODE_ENV !== 'production');
  const readUrl = useProxy ? `/api/append?sheet=room` : `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/room?key=${API_KEY}`;
  const res = await fetch(readUrl);
        const data = await res.json();
        const rows = data.values || [];
        if (rows.length < 2) {
          setFormData(prev => ({ ...prev, 객실코드: '', 금액: '' }));
          return;
        }
  const header = rows[0].map(h => (h || '').toString().trim());
  const headerLower = header.map(h => h.toLowerCase());
  const findIndexCI = (targets) => headerLower.findIndex(h => targets.some(t => h === t));
  const idxStartDate = findIndexCI(['시작일자', 'startdate', 'start']);
  const idxEndDate = findIndexCI(['끝일자', 'enddate', 'end']);
  const idxSchedule = findIndexCI(['일정', 'schedule']);
  const idxCruise = findIndexCI(['크루즈', '크루즈명', 'cruise']);
  const idxRoomType = findIndexCI(['종류', 'type']);
  const idxGubun = findIndexCI(['구분', 'gubun']);
  const idxRemark = findIndexCI(['객실비고', '비고', 'remark']);
  const idxCode = findIndexCI(['코드', 'code']);
  const idxAmount = findIndexCI(['금액', 'amount']);
        if ([idxStartDate, idxEndDate, idxSchedule, idxCruise, idxRoomType, idxGubun, idxRemark, idxCode, idxAmount].includes(-1)) {
          setFormData(prev => ({ ...prev, 객실코드: '', 금액: '' }));
          return;
        }
        // 6가지 조건 모두 일치하는 row 찾기
        const found = rows.slice(1).find(row => {
          const start = row[idxStartDate];
          const end = row[idxEndDate];
          return (
            start && end && start <= 체크인 && 체크인 <= end &&
            row[idxSchedule] === 일정 &&
            row[idxCruise] === 크루즈 &&
            row[idxRoomType] === 객실종류 &&
            row[idxGubun] === 구분 &&
            row[idxRemark] === 객실비고
          );
        });
        if (found) {
          setFormData(prev => ({
            ...prev,
            객실코드: found[idxCode],
            금액: found[idxAmount]
          }));
        } else {
          setFormData(prev => ({ ...prev, 객실코드: '', 금액: '' }));
        }
      } catch (e) {
        setFormData(prev => ({ ...prev, 객실코드: '', 금액: '' }));
      }
    }
    fetchCodeAndAmount();
  }, [formData['체크인'], formData['일정'], formData['크루즈'], formData['객실종류'], formData['구분'], formData['객실비고']]);
  const [loading, setLoading] = useState(false);
  const [checkinOptions, setCheckinOptions] = useState([]);
  const [gubunOptions, setGubunOptions] = useState([]);
  const [cruiseOptions, setCruiseOptions] = useState([]);
  const [roomTypeOptions, setRoomTypeOptions] = useState([]);
  const [remarkOptions, setRemarkOptions] = useState([]);
  // 일정 옵션은 하드코딩
  const scheduleOptions = ["1박2일", "2박3일", "당일"];
  const navigate = useNavigate();

  // ID 자동생성, 주문ID 자동입력 (최초 렌더링 시)
  useEffect(() => {
    async function generateUniqueId() {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let id = '';
      let tries = 0;
      // room 시트의 기존 ID 목록 fetch
      let existingIds = [];
      try {
        const SHEET_ID = process.env.REACT_APP_SHEET_ID;
        const API_KEY = process.env.REACT_APP_API_KEY;
  const useProxy = (process.env.REACT_APP_USE_PROXY === 'true') || (process.env.NODE_ENV !== 'production');
  const readUrl = useProxy ? `/api/append?sheet=room&range=A:A` : `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/room!A:A?key=${API_KEY}`;
  const res = await fetch(readUrl);
        const data = await res.json();
        existingIds = (data.values || []).slice(1).map(row => row[0]);
      } catch (e) {
        existingIds = [];
      }
      do {
        id = '';
        for (let i = 0; i < 8; i++) {
          id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        tries++;
        if (tries > 100) break;
      } while (existingIds.includes(id));
      return id;
    }
    // 주문ID: localStorage에 있으면 우선 사용, 없으면 기존 값 사용
    (async () => {
      const uniqueId = await generateUniqueId();
      const cachedOrderId = window.localStorage.getItem('reservation_orderId') || '';
      setFormData(prev => ({
        ...prev,
        ID: prev.ID || uniqueId,
        주문ID: cachedOrderId || prev.주문ID || prev.orderId || '',
      }));
    })();
  }, []);

  // room 시트에서 체크인 값 fetch (시작일자~끝일자 사이)
  useEffect(() => {
    async function fetchCheckinOptions() {
      try {
  const SHEET_ID = process.env.REACT_APP_SHEET_ID;
  const API_KEY = process.env.REACT_APP_API_KEY;
  const useProxy = (process.env.REACT_APP_USE_PROXY === 'true') || (process.env.NODE_ENV !== 'production');
  const readUrl = useProxy ? `/api/append?sheet=room` : `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/room?key=${API_KEY}`;
  const res = await fetch(readUrl);
        const data = await res.json();
        const rows = data.values || [];
        if (rows.length < 2) return setCheckinOptions([]);
  const header = rows[0].map(h => (h || '').toString().trim());
  const headerLower = header.map(h => h.toLowerCase());
  const findIndexCI = (targets) => headerLower.findIndex(h => targets.some(t => h === t));
  const idxStartDate = findIndexCI(['시작일자', 'startdate', 'start']);
  const idxEndDate = findIndexCI(['끝일자', 'enddate', 'end']);
  if (idxStartDate === -1 || idxEndDate === -1) return setCheckinOptions([]);
        // 헤더 제외, 시작~끝일자 구간의 모든 날짜 추출
        const dateSet = new Set();
        rows.slice(1).forEach(row => {
          const start = row[idxStartDate];
          const end = row[idxEndDate];
          if (start && end) {
            // 날짜 범위 내 모든 날짜를 추가 (YYYY-MM-DD 형식 가정)
            let current = new Date(start);
            const endDate = new Date(end);
            while (current <= endDate) {
              dateSet.add(current.toISOString().slice(0, 10));
              current.setDate(current.getDate() + 1);
            }
          }
        });
        setCheckinOptions(Array.from(dateSet).sort());
      } catch (e) {
        setCheckinOptions([]);
      }
    }
    fetchCheckinOptions();
  }, []);

  // room 시트에서 크루즈 컬럼만 동적으로 가져옴
  useEffect(() => {
    async function fetchCruiseOptions() {
      try {
        const SHEET_ID = process.env.REACT_APP_SHEET_ID;
        const API_KEY = process.env.REACT_APP_API_KEY;
        const useProxy = (process.env.REACT_APP_USE_PROXY === 'true') || (process.env.NODE_ENV !== 'production');
        const readUrl = useProxy ? `/api/append?sheet=room` : `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/room?key=${API_KEY}`;
        const res = await fetch(readUrl);
        const data = await res.json();
        const rows = data.values || [];
        if (rows.length < 2) {
          setCruiseOptions([]);
          return;
        }
        const header = rows[0].map(h => (h || '').toString().trim());
        const headerLower = header.map(h => h.toLowerCase());
        const findIndexCI = targets => headerLower.findIndex(h => targets.some(t => h === t));
        const idxCruise = findIndexCI(['크루즈', '크루즈명', 'cruise']);
        const idxSchedule = findIndexCI(['일정', 'schedule']);
        const idxStartDate = findIndexCI(['시작일자', 'startdate', 'start']);
        const idxEndDate = findIndexCI(['끝일자', 'enddate', 'end']);
        if (idxCruise === -1) {
          setCruiseOptions([]);
          return;
        }
  // 일정, 체크인(시작~끝)으로 필터
  const filtered = rows.slice(1).filter(row => {
          // 일정 필터
          if (idxSchedule !== -1 && formData['일정']) {
            const v = (row[idxSchedule] || '').toString();
            if (v !== formData['일정']) return false;
          }
          // 체크인 날짜가 주어졌으면 시작일자~끝일자 사이인지 확인 (날짜 문자열/Date 처리)
          if (formData['체크인'] && idxStartDate !== -1 && idxEndDate !== -1) {
            const startRaw = row[idxStartDate];
            const endRaw = row[idxEndDate];
            const toIso = val => {
              if (!val && val !== 0) return '';
              try {
                const d = new Date(val);
                if (isNaN(d.getTime())) return (val || '').toString();
                return d.toISOString().slice(0,10);
              } catch (e) { return (val || '').toString(); }
            };
            const start = toIso(startRaw);
            const end = toIso(endRaw);
            const checkin = formData['체크인'];
            if (!(start && end && start <= checkin && checkin <= end)) return false;
          }
          return true;
        });
        const cruiseRaw = filtered.map(row => row[idxCruise]).filter(v => v);
        setCruiseOptions(Array.from(new Set(cruiseRaw)).sort());
        // 추가: 선택된 일정/크루즈 기반으로 구분/객실종류/비고 옵션도 채움
        const idxGubun = findIndexCI(['구분','gubun']);
        const idxRoomType = findIndexCI(['종류','type']);
        const idxRemark = findIndexCI(['객실비고','비고','remark']);
        let rowsForOthers = filtered;
        if (formData['크루즈'] && idxCruise !== -1) {
          rowsForOthers = rowsForOthers.filter(r => (r[idxCruise] || '').toString() === formData['크루즈']);
        }
        if (idxGubun !== -1) setGubunOptions(Array.from(new Set(rowsForOthers.map(r => r[idxGubun]).filter(Boolean))));
        if (idxRoomType !== -1) setRoomTypeOptions(Array.from(new Set(rowsForOthers.map(r => r[idxRoomType]).filter(Boolean))));
        if (idxRemark !== -1) setRemarkOptions(Array.from(new Set(rowsForOthers.map(r => r[idxRemark]).filter(Boolean))));
      } catch (e) {
        setCruiseOptions([]);
      }
    }
    fetchCruiseOptions();
  }, [formData['체크인'], formData['일정']]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 크루즈 선택 시 캐시에 저장
    if (field === '크루즈') {
      window.localStorage.setItem('cruise_value', value);
    }
    // 일정 선택 시 캐시에 저장
    if (field === '일정') {
      window.localStorage.setItem('schedule_value', value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 승선도움, 커넥팅룸 저장 시 true/false로 변환
      const normalized = { ...formData };
      normalized['승선도움'] = normalized['승선도움'] === '예' ? true : false;
      normalized['커넥팅룸'] = normalized['커넥팅룸'] === '예' ? true : false;
      
      // 직접 CRUISE_COLUMNS 순서로 데이터 배열 생성 (빠르고 간단)
      const rowData = CRUISE_COLUMNS.map(col => {
        const value = normalized[col.key] || '';
        // Email은 문자열로 변환하여 객체가 들어가지 않도록 함
        return col.key === 'Email' ? String(value) : value;
      });
      
      const appendUrl = process.env.REACT_APP_SHEET_APPEND_URL;
      const appendToken = process.env.REACT_APP_SHEET_APPEND_TOKEN;
      const useProxy = (process.env.REACT_APP_USE_PROXY === 'true') || (process.env.NODE_ENV !== 'production');
      const targetUrl = useProxy ? '/api/append' : appendUrl;
      if (!targetUrl) throw new Error('Append URL not configured. Set REACT_APP_SHEET_APPEND_URL in .env');
      const payload = { service: 'cruise', row: rowData };
      if (!useProxy && appendToken) payload.token = appendToken;
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json || !json.success) throw new Error(json && json.error ? json.error : 'Append failed');
      alert('크루즈 예약 정보가 저장되었습니다.');
      setFormData({});
    } catch (err) {
      console.error('Save error:', err);
      alert('저장 중 오류가 발생했습니다: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-info">
      <h2 className="step-title">크루즈 객실 정보</h2>
      <form className="sheet-columns-form" onSubmit={handleSubmit}>
  {CRUISE_COLUMNS.filter(col => col.key !== 'ID' && col.key !== '주문ID' && col.key !== '금액' && col.key !== '객실코드').map((col, idx) => (
          <React.Fragment key={idx}>
            <div className="form-group">
              <label htmlFor={`cruise_${col.key}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {(() => {
                  const iconMap = {
                    체크인: <span role="img" aria-label="calendar">📅</span>,
                    일정: <span role="img" aria-label="schedule">🗓️</span>,
                    크루즈: <span role="img" aria-label="ship">🚢</span>,
                    객실종류: <span role="img" aria-label="room">🏨</span>,
                    구분: <span role="img" aria-label="tag">🏷️</span>,
                    객실비고: <span role="img" aria-label="memo">📝</span>,
                    객실코드: <span role="img" aria-label="key">🔑</span>,
                    금액: <span role="img" aria-label="money">💰</span>,
                    ADULT: <span role="img" aria-label="adult">🧑</span>,
                    CHILD: <span role="img" aria-label="child">🧒</span>,
                    TODDLER: <span role="img" aria-label="baby">👶</span>,
                    승선인원: <span role="img" aria-label="group">👥</span>,
                    인원수: <span role="img" aria-label="group">👥</span>,
                    객실수: <span role="img" aria-label="room">🏨</span>,
                    승선도움: <span role="img" aria-label="help">🦮</span>,
                    커넥팅룸: <span role="img" aria-label="connect">🔗</span>,
                    Email: <span role="img" aria-label="email">✉️</span>
                  };
                  return iconMap[col.key];
                })()}
                {col.label}
              </label>
              {/* ...existing code for input rendering... */}
              {col.key === '체크인' ? (
                <input
                  type="date"
                  id={`cruise_체크인`}
                  value={formData['체크인'] || ''}
                  onChange={e => handleInputChange('체크인', e.target.value)}
                  required={col.required}
                />
              ) : col.key === '일정' ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  {["1박2일", "2박3일", "당일"].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      style={{
                        backgroundColor: formData['일정'] === opt ? '#28a745' : '#f0f0f0',
                        color: formData['일정'] === opt ? '#fff' : '#333',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleInputChange('일정', opt)}
                    >{opt}</button>
                  ))}
                </div>
              ) : col.key === '객실수' ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1,2,3,4,5,6,7].map(num => (
                    <button
                      key={num}
                      type="button"
                      style={{
                        backgroundColor: formData['객실수'] == num ? '#007bff' : '#f0f0f0',
                        color: formData['객실수'] == num ? '#fff' : '#333',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleInputChange('객실수', num)}
                    >{num}</button>
                  ))}
                </div>
              ) : col.key === '승선도움' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    style={{
                      backgroundColor: formData['승선도움'] === '아니오' || formData['승선도움'] === undefined ? '#007bff' : '#f0f0f0',
                      color: formData['승선도움'] === '아니오' || formData['승선도움'] === undefined ? '#fff' : '#333',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '6px 16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleInputChange('승선도움', '아니오')}
                  >아니오</button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: formData['승선도움'] === '예' ? '#007bff' : '#f0f0f0',
                      color: formData['승선도움'] === '예' ? '#fff' : '#333',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '6px 16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleInputChange('승선도움', '예')}
                  >예</button>
                </div>
              ) : col.key === '커넥팅룸' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    style={{
                      backgroundColor: formData['커넥팅룸'] === '아니오' || formData['커넥팅룸'] === undefined ? '#007bff' : '#f0f0f0',
                      color: formData['커넥팅룸'] === '아니오' || formData['커넥팅룸'] === undefined ? '#fff' : '#333',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '6px 16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleInputChange('커넥팅룸', '아니오')}
                  >아니오</button>
                  <button
                    type="button"
                    style={{
                      backgroundColor: formData['커넥팅룸'] === '예' ? '#007bff' : '#f0f0f0',
                      color: formData['커넥팅룸'] === '예' ? '#fff' : '#333',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '6px 16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleInputChange('커넥팅룸', '예')}
                  >예</button>
                </div>
              ) : col.key === '구분' ? (
                <select
                  id={`cruise_구분`}
                  value={formData['구분'] || ''}
                  onChange={e => handleInputChange('구분', e.target.value)}
                  required={col.required}
                  disabled={gubunOptions.length === 0}
                >
                  <option value="">구분 선택</option>
                  {gubunOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : col.key === '크루즈' ? (
                <select
                  id={`cruise_크루즈`}
                  value={formData['크루즈'] || ''}
                  onChange={e => handleInputChange('크루즈', e.target.value)}
                  required={col.required}
                  disabled={cruiseOptions.length === 0}
                >
                  <option value="">크루즈 선택</option>
                  {cruiseOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : col.key === '객실종류' ? (
                <select
                  id={`cruise_객실종류`}
                  value={formData['객실종류'] || ''}
                  onChange={e => handleInputChange('객실종류', e.target.value)}
                  required={col.required}
                  disabled={roomTypeOptions.length === 0}
                >
                  <option value="">객실종류 선택</option>
                  {roomTypeOptions.map((opt, i) => (
                    <option key={i} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : col.key === '객실비고' ? (
                <input
                  type="text"
                  id={`cruise_객실비고`}
                  value={formData['객실비고'] || ''}
                  onChange={e => handleInputChange('객실비고', e.target.value)}
                  placeholder={col.label}
                  required={col.required}
                  readOnly={true}
                />
              ) : col.key === '객실코드' ? (
                <input
                  type={col.type}
                  id={`cruise_객실코드`}
                  value={formData['객실코드'] || ''}
                  readOnly
                  placeholder={col.label}
                  required={col.required}
                />
              ) : col.key === '금액' ? (
                <input
                  type={col.type}
                  id={`cruise_금액`}
                  value={formData['금액'] !== undefined ? formData['금액'] : ''}
                  readOnly
                  placeholder={col.label}
                  required={col.required}
                  style={{ backgroundColor: '#f8f9fa', color: '#333', fontWeight: 'bold' }}
                />
              ) : (["ADULT", "CHILD", "TODDLER"].includes(col.key) ? (
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
                  id={`cruise_${col.key}`}
                  value={col.key === 'Email' ? (formData['Email'] || '') : (formData[col.key] || '')}
                  onChange={e => handleInputChange(col.key, e.target.value)}
                  placeholder={col.label}
                  required={col.required}
                  readOnly={col.key === 'Email'}
                />
              ))}
            </div>
            {/* 금액 합계 표시 완전 삭제 */}
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

export default CruiseBookingForm;

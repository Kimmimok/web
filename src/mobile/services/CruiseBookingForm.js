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
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/room?key=${API_KEY}`);
        const data = await res.json();
        const rows = data.values || [];
        if (rows.length < 2) {
          setFormData(prev => ({ ...prev, 객실코드: '', 금액: '' }));
          return;
        }
        const header = rows[0];
        const idxStartDate = header.indexOf('시작일자');
        const idxEndDate = header.indexOf('끝일자');
        const idxSchedule = header.indexOf('일정');
        const idxCruise = header.indexOf('크루즈');
        const idxRoomType = header.indexOf('종류');
        const idxGubun = header.indexOf('구분');
        const idxRemark = header.indexOf('객실비고') !== -1 ? header.indexOf('객실비고') : header.indexOf('비고');
        const idxCode = header.indexOf('코드');
        const idxAmount = header.indexOf('금액');
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
  const [scheduleOptions, setScheduleOptions] = useState([]);
  const [gubunOptions, setGubunOptions] = useState([]);
  const [cruiseOptions, setCruiseOptions] = useState([]);
  const [roomTypeOptions, setRoomTypeOptions] = useState([]);
  const [remarkOptions, setRemarkOptions] = useState([]);
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
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/room!A:A?key=${API_KEY}`);
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
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/room?key=${API_KEY}`);
        const data = await res.json();
        const rows = data.values || [];
        if (rows.length < 2) return setCheckinOptions([]);
        const header = rows[0];
        const idxStartDate = header.indexOf('시작일자');
        const idxEndDate = header.indexOf('끝일자');
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

  // 일정/크루즈 선택 시 room 시트에서 해당 조건으로 구분/크루즈/객실종류 유일값만 옵션으로 표시
  useEffect(() => {
    async function fetchOptions() {
      try {
        const SHEET_ID = process.env.REACT_APP_SHEET_ID;
        const API_KEY = process.env.REACT_APP_API_KEY;
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/room?key=${API_KEY}`);
        const data = await res.json();
        const rows = data.values || [];
        if (rows.length < 2) {
          setScheduleOptions([]);
          setGubunOptions([]);
          setCruiseOptions([]);
          setRoomTypeOptions([]);
          setRemarkOptions([]);
          return;
        }
        const header = rows[0];
        const idxSchedule = header.indexOf('일정');
        const idxGubun = header.indexOf('구분');
        const idxCruise = header.indexOf('크루즈');
        const idxRoomType = header.indexOf('종류');
        const idxRemark = header.indexOf('비고');
        const idxStartDate = header.indexOf('시작일자');
        const idxEndDate = header.indexOf('끝일자');
        // 일정 조건: 체크인 날짜가 시작~끝일자 사이에 있는 row의 일정값만 표시
        let filteredSchedule = rows.slice(1);
        if (formData['체크인'] && idxStartDate !== -1 && idxEndDate !== -1) {
          filteredSchedule = filteredSchedule.filter(row => {
            const start = row[idxStartDate];
            const end = row[idxEndDate];
            return start && end && start <= formData['체크인'] && formData['체크인'] <= end;
          });
        }
        if (idxSchedule !== -1) {
          const scheduleRaw = filteredSchedule.map(row => row[idxSchedule]).filter(v => v);
          setScheduleOptions(Array.from(new Set(scheduleRaw)));
        } else {
          setScheduleOptions([]);
        }
        // 기존 필터링 로직 (일정, 크루즈, 객실종류, 구분, 객실비고)
        let filtered = rows.slice(1);
        if (formData['일정']) {
          filtered = filtered.filter(row => row[idxSchedule] === formData['일정']);
        }
        let filteredRoomType = filtered;
        if (formData['크루즈']) {
          filteredRoomType = filteredRoomType.filter(row => row[idxCruise] === formData['크루즈']);
        }
        let filteredGubun = filtered;
        if (formData['크루즈']) {
          filteredGubun = filteredGubun.filter(row => row[idxCruise] === formData['크루즈']);
        }
        if (formData['객실종류']) {
          filteredGubun = filteredGubun.filter(row => row[idxRoomType] === formData['객실종류']);
        }
        if (idxGubun !== -1) {
          const gubunRaw = filteredGubun.map(row => row[idxGubun]).filter(v => v);
          setGubunOptions(Array.from(new Set(gubunRaw)));
        } else {
          setGubunOptions([]);
        }
        if (idxCruise !== -1) {
          const cruiseRaw = filtered.map(row => row[idxCruise]).filter(v => v);
          setCruiseOptions(Array.from(new Set(cruiseRaw)).sort());
        } else {
          setCruiseOptions([]);
        }
        if (idxRoomType !== -1) {
          const roomTypeRaw = filteredRoomType.map(row => row[idxRoomType]).filter(v => v);
          setRoomTypeOptions(Array.from(new Set(roomTypeRaw)).sort());
        } else {
          setRoomTypeOptions([]);
        }
        let filteredRemark = filtered;
        if (formData['크루즈']) {
          filteredRemark = filteredRemark.filter(row => row[idxCruise] === formData['크루즈']);
        }
        if (formData['객실종류']) {
          filteredRemark = filteredRemark.filter(row => row[idxRoomType] === formData['객실종류']);
        }
        if (formData['구분']) {
          filteredRemark = filteredRemark.filter(row => row[idxGubun] === formData['구분']);
        }
        if (idxRemark !== -1) {
          const remarkRaw = filteredRemark.map(row => row[idxRemark]).filter(v => v);
          setRemarkOptions(Array.from(new Set(remarkRaw)));
        } else {
          setRemarkOptions([]);
        }
      } catch (e) {
        setScheduleOptions([]);
        setGubunOptions([]);
        setCruiseOptions([]);
        setRoomTypeOptions([]);
      }
    }
    // 일정 드롭다운은 체크인 조건에 따라 항상 fetch
    fetchOptions();
  }, [formData['체크인'], formData['일정'], formData['크루즈']]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // 승선도움, 커넥팅룸 저장 시 true/false로 변환
    const saveData = { ...formData };
    if (saveData['승선도움'] === '예') saveData['승선도움'] = true;
    else saveData['승선도움'] = false;
    if (saveData['커넥팅룸'] === '예') saveData['커넥팅룸'] = true;
    else saveData['커넥팅룸'] = false;
    // 실제 저장 로직은 필요에 따라 구현
    setTimeout(() => {
      alert('크루즈 예약 정보가 저장되었습니다.');
      setFormData({});
      setLoading(false);
    }, 800);
  };

  return (
    <div className="customer-info">
      <h2 className="step-title">크루즈 객실 정보</h2>
      <form className="sheet-columns-form" onSubmit={handleSubmit}>
        {CRUISE_COLUMNS.filter(col => col.key !== 'ID' && col.key !== '주문ID').map((col, idx) => (
          <React.Fragment key={idx}>
            <div className="form-group">
              <label htmlFor={`cruise_${col.key}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* ...existing code for icons and label... */}
                {col.key === '체크인' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="10" rx="2" stroke="#007bff" strokeWidth="2"/><rect x="5" y="1" width="6" height="2" rx="1" fill="#007bff"/></svg>
                )}
                {col.key === '일정' && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="#28a745" strokeWidth="2"/><rect x="7" y="4" width="2" height="5" rx="1" fill="#28a745"/><rect x="7" y="10" width="2" height="2" rx="1" fill="#28a745"/></svg>
                )}
                {/* ...other icons... */}
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
                  disabled={!formData['일정']}
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
                  disabled={!formData['일정']}
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
                  disabled={!(formData['일정'] && formData['크루즈'])}
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
              ) : (['ADULT', 'CHILD', 'TODDLER'].includes(col.key) ? (
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

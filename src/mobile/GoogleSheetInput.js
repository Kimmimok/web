import React, { useState } from 'react';
import '../MobileBookingForm.css';
import ReservationForm from './services/ReservationForm';
import CruiseBookingForm from './services/CruiseBookingForm';
import CarServiceForm from './services/CarServiceForm';
import AirportServiceForm from './services/AirportServiceForm';
import TourServiceForm from './services/TourServiceForm';
import HotelServiceForm from './services/HotelServiceForm';
import RentalCarServiceForm from './services/RentalCarServiceForm';

const SHEET_ID = '16bKsWL_0HkZeAbOVVntSz0ehUHRGO1PoanNhFLghvEo';
const API_KEY = 'AIzaSyDyfByYamh-s9972-ZeVr_Fyq64jH1snrw';

function MobileBookingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    serviceSpecific: {}
  });
  // SH_R 시트 컬럼명 fetch 함수
  const [shrHeaders, setShrHeaders] = useState([]);
  React.useEffect(() => {
    async function fetchHeaders() {
      if (selectedService === 'SH_C') {
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/SH_R!1:1?key=${API_KEY}`);
        const data = await res.json();
        setShrHeaders(data.values ? data.values[0] : []);
      }
    }
    fetchHeaders();
  }, [selectedService]);

  // SH_C 시트 컬럼명 fetch 함수 (차량서비스용)
  const [shcHeaders, setShcHeaders] = useState([]);
  React.useEffect(() => {
    async function fetchHeaders() {
      if (selectedService === 'SH_CC') {
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/SH_C!1:1?key=${API_KEY}`);
        const data = await res.json();
        setShcHeaders(data.values ? data.values[0] : []);
      }
    }
    fetchHeaders();
  }, [selectedService]);

  const services = [
    { id: 'SH_R', name: '예약자 정보', icon: '👤', color: '#10B981' },
    { id: 'SH_C', name: '크루즈 예약', icon: '🚢', color: '#059669' },
    { id: 'SH_CC', name: '차량 서비스', icon: '🚗', color: '#DC2626' },
    { id: 'SH_P', name: '공항 서비스', icon: '✈️', color: '#7C2D12' },
    { id: 'SH_T', name: '투어 예약', icon: '🗺️', color: '#9333EA' },
    { id: 'SH_H', name: '호텔 예약', icon: '🏩', color: '#DB2777' },
    { id: 'SH_RC', name: '렌트카 예약', icon: '🚙', color: '#EA580C' }
  ];

  const steps = [
    { title: '서비스 선택', icon: '🔍' },
    { title: '고객 정보', icon: '👤' },
    { title: '예약 정보', icon: '📅' },
    { title: '추가 정보', icon: '📝' },
    { title: '확인', icon: '✅' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceSpecificChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      serviceSpecific: { ...prev.serviceSpecific, [field]: value }
    }));
  };

  const submitBooking = async () => {
    setLoading(true);
    try {
      // SH_M 시트에 저장할 데이터 구성
      const rowData = [
        formData.orderId,
        formData.regDate,
        formData.email,
        formData.koreanName,
        formData.englishName,
        formData.nickname
      ];
      // Google Sheets API 전송 예시 (fetch 사용)
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/SH_M!A1:append?valueInputOption=USER_ENTERED&key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [rowData] })
        }
      );
      alert(`예약이 접수되었습니다!\n주문ID: ${formData.orderId}`);
      setFormData({
        orderId: '',
        regDate: '',
        email: '',
        koreanName: '',
        englishName: '',
        nickname: ''
      });
      setCurrentStep(0);
      setSelectedService('');
    } catch (error) {
      alert('예약 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return selectedService !== '';
      case 1: return formData.customerName && formData.email && formData.phone;
      case 2: return formData.checkInDate && formData.checkOutDate;
      default: return true;
    }
  };

  // 모든 시트의 ID 자동생성 및 주문ID 자동입력 공통 함수
  const fetchOrderIds = async (sheetName) => {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}!A:A?key=${API_KEY}`);
    const data = await res.json();
    return (data.values || []).map(row => row[0]);
  };

  const generateUniqueId = async (sheetName) => {
    const existingIds = await fetchOrderIds(sheetName);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let newId = '';
    let tries = 0;
    do {
      newId = '';
      for (let i = 0; i < 8; i++) {
        newId += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      tries++;
      if (tries > 100) throw new Error('ID 생성 실패: 중복 회피 불가');
    } while (existingIds.includes(newId));
    return newId;
  };

  // 주문ID 자동입력 (사용자 주문ID 불러오기)
  const fetchUserOrderId = async (userEmail) => {
    // 예시: SH_M 시트에서 해당 이메일의 주문ID 조회
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/SH_M!A:F?key=${API_KEY}`);
    const data = await res.json();
    if (!data.values) return '';
    const header = data.values[0];
    const orderIdIdx = header.indexOf('주문ID');
    const emailIdx = header.indexOf('Email');
    const found = data.values.find(row => row[emailIdx] === userEmail);
    return found ? found[orderIdIdx] : '';
  };

  // 폼 초기화 시 각 시트의 ID, 주문ID 자동 입력 (공통 적용)
  React.useEffect(() => {
    async function setAutoIds() {
      if (currentStep === 1 && selectedService) {
        const sheetName = selectedService;
        const uniqueId = await generateUniqueId(sheetName);
        let userOrderId = '';
        if (formData.email) {
          userOrderId = await fetchUserOrderId(formData.email);
        }
        setFormData(prev => ({
          ...prev,
          id: uniqueId,
          orderId: userOrderId
        }));
      }
    }
    setAutoIds();
  }, [currentStep, selectedService, formData.email]);

  return (
    <div className="mobile-booking-form">
      <div className="form-content">
        {currentStep === 0 && (
          <div className="service-selection">
            <h2 className="step-title">예약 서비스를 선택하세요</h2>
            <div className="services-grid">
              {services.map(service => (
                <div
                  key={service.id}
                  className={`service-card ${selectedService === service.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedService(service.id);
                    setCurrentStep(1);
                  }}
                  style={{ '--service-color': service.color }}
                >
                  <div className="service-icon">{service.icon}</div>
                  <div className="service-name">{service.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 1 && selectedService === 'SH_R' && (
          <ReservationForm formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 1 && selectedService === 'SH_C' && (
          <CruiseBookingForm formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 1 && selectedService === 'SH_CC' && (
          <CarServiceForm formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 1 && selectedService === 'SH_P' && (
          <AirportServiceForm formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 1 && selectedService === 'SH_T' && (
          <TourServiceForm formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 1 && selectedService === 'SH_H' && (
          <HotelServiceForm formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 1 && selectedService === 'SH_RC' && (
          <RentalCarServiceForm formData={formData} setFormData={setFormData} />
        )}

        {currentStep === 2 && (
          <div className="booking-info">
            <h2 className="step-title">예약 정보를 선택해주세요</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="checkInDate">체크인 날짜 *</label>
                <input type="date" id="checkInDate" value={formData.checkInDate}
                  onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="form-group">
                <label htmlFor="checkOutDate">체크아웃 날짜 *</label>
                <input type="date" id="checkOutDate" value={formData.checkOutDate}
                  onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                  min={formData.checkInDate || new Date().toISOString().split('T')[0]} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="adults">성인</label>
                <select id="adults" value={formData.adults} onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}>
                  {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num}명</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="children">아동</label>
                <select id="children" value={formData.children} onChange={(e) => handleInputChange('children', parseInt(e.target.value))}>
                  {[0,1,2,3,4].map(num => <option key={num} value={num}>{num}명</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="service-specific">
            <h2 className="step-title">{services.find(s => s.id === selectedService)?.name} 추가 정보</h2>
            <div className="form-group">
              <label htmlFor="specialRequests">특별 요청사항</label>
              <textarea id="specialRequests" value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder="추가 요청사항이나 특별한 요구사항을 입력해주세요" rows="3" />
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="confirmation">
            <h2 className="step-title">예약 정보를 확인해주세요</h2>
            <div className="confirmation-card">
              <div className="confirmation-section">
                <h3>서비스 정보</h3>
                <div className="confirmation-item">
                  <span className="service-badge" style={{ backgroundColor: services.find(s => s.id === selectedService)?.color }}>
                    {services.find(s => s.id === selectedService)?.icon} {services.find(s => s.id === selectedService)?.name}
                  </span>
                </div>
              </div>
              <div className="confirmation-section">
                <h3>고객 정보</h3>
                <div className="confirmation-item">
                  <span className="label">성함:</span><span className="value">{formData.customerName}</span>
                </div>
                <div className="confirmation-item">
                  <span className="label">이메일:</span><span className="value">{formData.email}</span>
                </div>
                <div className="confirmation-item">
                  <span className="label">연락처:</span><span className="value">{formData.phone}</span>
                </div>
              </div>
              <div className="confirmation-section">
                <h3>예약 정보</h3>
                <div className="confirmation-item">
                  <span className="label">체크인:</span><span className="value">{formData.checkInDate}</span>
                </div>
                <div className="confirmation-item">
                  <span className="label">체크아웃:</span><span className="value">{formData.checkOutDate}</span>
                </div>
                <div className="confirmation-item">
                  <span className="label">인원:</span><span className="value">성인 {formData.adults}명, 아동 {formData.children}명</span>
                </div>
              </div>
              {formData.specialRequests && (
                <div className="confirmation-section">
                  <h3>특별 요청사항</h3>
                  <div className="special-requests">{formData.specialRequests}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">예약을 처리하고 있습니다...</div>
        </div>
      )}
    </div>
  );
}

export default MobileBookingForm;

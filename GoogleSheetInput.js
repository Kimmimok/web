import React, { useState } from 'react';
import './MobileBookingForm.css';

const SHEET_ID = '16bKsWL_0HkZeAbOVVntSz0ehUHRGO1PoanNhFLghvEo';
const API_KEY = 'AIzaSyDyfByYamh-s9972-ZeVr_Fyq64jH1snrw';

function MobileBookingForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // 고객 정보
    customerName: '',
    email: '',
    phone: '',
    // 공통 예약 정보
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    // 서비스별 추가 정보
    serviceSpecific: {}
  });

  const services = [
    { id: 'SH_R', name: '객실 예약', icon: '🏨', color: '#4F46E5' },
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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceSpecificChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      serviceSpecific: {
        ...prev.serviceSpecific,
        [field]: value
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateOrderId = () => {
    return 'ORD' + Date.now() + Math.floor(Math.random() * 1000);
  };

  const submitBooking = async () => {
    setLoading(true);
    try {
      const orderId = generateOrderId();
      
      // 고객 정보를 SH_M에 저장
      const customerData = [
        orderId,
        formData.customerName,
        formData.email,
        formData.phone,
        new Date().toLocaleDateString('ko-KR'),
        selectedService
      ];

      // 서비스별 예약 정보 저장
      const bookingData = [
        orderId,
        formData.customerName,
        formData.email,
        formData.phone,
        formData.checkInDate,
        formData.checkOutDate,
        formData.adults,
        formData.children,
        '대기',
        formData.specialRequests,
        ...Object.values(formData.serviceSpecific)
      ];

      console.log('고객 데이터:', customerData);
      console.log('예약 데이터:', bookingData);
      
      // 실제 구글 시트에 데이터 추가하려면 인증이 필요
      alert(`예약이 접수되었습니다!\n주문번호: ${orderId}\n고객명: ${formData.customerName}\n서비스: ${services.find(s => s.id === selectedService)?.name}`);
      
      // 폼 초기화
      setFormData({
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
      setCurrentStep(0);
      setSelectedService('');
      
    } catch (error) {
      console.error('예약 실패:', error);
      alert('예약 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const renderServiceSelection = () => (
    <div className="service-selection">
      <h2 className="step-title">어떤 서비스를 예약하시겠습니까?</h2>
      <div className="services-grid">
        {services.map(service => (
          <div
            key={service.id}
            className={`service-card ${selectedService === service.id ? 'selected' : ''}`}
            onClick={() => {
              setSelectedService(service.id);
              setTimeout(nextStep, 300);
            }}
            style={{ '--service-color': service.color }}
          >
            <div className="service-icon">{service.icon}</div>
            <div className="service-name">{service.name}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCustomerInfo = () => (
    <div className="customer-info">
      <h2 className="step-title">고객 정보를 입력해주세요</h2>
      <div className="form-group">
        <label htmlFor="customerName">성함 *</label>
        <input
          type="text"
          id="customerName"
          value={formData.customerName}
          onChange={(e) => handleInputChange('customerName', e.target.value)}
          placeholder="홍길동"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">이메일 *</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="example@email.com"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="phone">연락처 *</label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="010-1234-5678"
          required
        />
      </div>
    </div>
  );

  const renderBookingInfo = () => (
    <div className="booking-info">
      <h2 className="step-title">예약 정보를 선택해주세요</h2>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="checkInDate">체크인 날짜 *</label>
          <input
            type="date"
            id="checkInDate"
            value={formData.checkInDate}
            onChange={(e) => handleInputChange('checkInDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="checkOutDate">체크아웃 날짜 *</label>
          <input
            type="date"
            id="checkOutDate"
            value={formData.checkOutDate}
            onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
            min={formData.checkInDate || new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="adults">성인</label>
          <select
            id="adults"
            value={formData.adults}
            onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
          >
            {[1,2,3,4,5,6].map(num => (
              <option key={num} value={num}>{num}명</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="children">아동</label>
          <select
            id="children"
            value={formData.children}
            onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
          >
            {[0,1,2,3,4].map(num => (
              <option key={num} value={num}>{num}명</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  const renderServiceSpecific = () => {
    const selectedServiceInfo = services.find(s => s.id === selectedService);
    
    return (
      <div className="service-specific">
        <h2 className="step-title">{selectedServiceInfo?.name} 추가 정보</h2>
        
        {selectedService === 'SH_R' && (
          <>
            <div className="form-group">
              <label>객실 타입</label>
              <select
                value={formData.serviceSpecific.roomType || ''}
                onChange={(e) => handleServiceSpecificChange('roomType', e.target.value)}
              >
                <option value="">선택해주세요</option>
                <option value="스탠다드">스탠다드</option>
                <option value="디럭스">디럭스</option>
                <option value="스위트">스위트</option>
                <option value="프리미엄">프리미엄</option>
              </select>
            </div>
            <div className="form-group">
              <label>침대 타입</label>
              <select
                value={formData.serviceSpecific.bedType || ''}
                onChange={(e) => handleServiceSpecificChange('bedType', e.target.value)}
              >
                <option value="">선택해주세요</option>
                <option value="싱글">싱글</option>
                <option value="더블">더블</option>
                <option value="트윈">트윈</option>
                <option value="킹">킹</option>
              </select>
            </div>
          </>
        )}

        {selectedService === 'SH_C' && (
          <>
            <div className="form-group">
              <label>크루즈 라인</label>
              <select
                value={formData.serviceSpecific.cruiseLine || ''}
                onChange={(e) => handleServiceSpecificChange('cruiseLine', e.target.value)}
              >
                <option value="">선택해주세요</option>
                <option value="로얄캐리비안">로얄캐리비안</option>
                <option value="MSC">MSC 크루즈</option>
                <option value="코스타">코스타 크루즈</option>
                <option value="Celebrity">Celebrity</option>
              </select>
            </div>
            <div className="form-group">
              <label>캐빈 타입</label>
              <select
                value={formData.serviceSpecific.cabinType || ''}
                onChange={(e) => handleServiceSpecificChange('cabinType', e.target.value)}
              >
                <option value="">선택해주세요</option>
                <option value="내부">내부 캐빈</option>
                <option value="오션뷰">오션뷰</option>
                <option value="발코니">발코니</option>
                <option value="스위트">스위트</option>
              </select>
            </div>
          </>
        )}

        {(selectedService === 'SH_CC' || selectedService === 'SH_RC') && (
          <>
            <div className="form-group">
              <label>차량 타입</label>
              <select
                value={formData.serviceSpecific.carType || ''}
                onChange={(e) => handleServiceSpecificChange('carType', e.target.value)}
              >
                <option value="">선택해주세요</option>
                <option value="경차">경차</option>
                <option value="소형">소형</option>
                <option value="중형">중형</option>
                <option value="대형">대형</option>
                <option value="SUV">SUV</option>
                <option value="밴">밴</option>
              </select>
            </div>
            <div className="form-group">
              <label>픽업 위치</label>
              <input
                type="text"
                value={formData.serviceSpecific.pickupLocation || ''}
                onChange={(e) => handleServiceSpecificChange('pickupLocation', e.target.value)}
                placeholder="픽업할 위치를 입력해주세요"
              />
            </div>
          </>
        )}

        {selectedService === 'SH_P' && (
          <>
            <div className="form-group">
              <label>공항</label>
              <select
                value={formData.serviceSpecific.airport || ''}
                onChange={(e) => handleServiceSpecificChange('airport', e.target.value)}
              >
                <option value="">선택해주세요</option>
                <option value="인천국제공항">인천국제공항</option>
                <option value="김포공항">김포공항</option>
                <option value="부산국제공항">부산국제공항</option>
                <option value="제주국제공항">제주국제공항</option>
              </select>
            </div>
            <div className="form-group">
              <label>서비스 타입</label>
              <select
                value={formData.serviceSpecific.serviceType || ''}
                onChange={(e) => handleServiceSpecificChange('serviceType', e.target.value)}
              >
                <option value="">선택해주세요</option>
                <option value="픽업">공항 픽업</option>
                <option value="드롭오프">공항 드롭오프</option>
                <option value="왕복">왕복 서비스</option>
              </select>
            </div>
          </>
        )}

        {selectedService === 'SH_T' && (
          <>
            <div className="form-group">
              <label>투어 타입</label>
              <select
                value={formData.serviceSpecific.tourType || ''}
                onChange={(e) => handleServiceSpecificChange('tourType', e.target.value)}
              >
                <option value="">선택해주세요</option>
                <option value="시티투어">시티투어</option>
                <option value="자연투어">자연투어</option>
                <option value="문화투어">문화투어</option>
                <option value="맞춤투어">맞춤투어</option>
              </select>
            </div>
            <div className="form-group">
              <label>선호 지역</label>
              <input
                type="text"
                value={formData.serviceSpecific.preferredArea || ''}
                onChange={(e) => handleServiceSpecificChange('preferredArea', e.target.value)}
                placeholder="방문하고 싶은 지역을 입력해주세요"
              />
            </div>
          </>
        )}

        {selectedService === 'SH_H' && (
          <>
            <div className="form-group">
              <label>호텔 등급</label>
              <select
                value={formData.serviceSpecific.hotelGrade || ''}
                onChange={(e) => handleServiceSpecificChange('hotelGrade', e.target.value)}
              >
                <option value="">선택해주세요</option>
                <option value="3성급">3성급</option>
                <option value="4성급">4성급</option>
                <option value="5성급">5성급</option>
                <option value="리조트">리조트</option>
              </select>
            </div>
            <div className="form-group">
              <label>선호 위치</label>
              <input
                type="text"
                value={formData.serviceSpecific.preferredLocation || ''}
                onChange={(e) => handleServiceSpecificChange('preferredLocation', e.target.value)}
                placeholder="선호하는 위치나 지역을 입력해주세요"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="specialRequests">특별 요청사항</label>
          <textarea
            id="specialRequests"
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            placeholder="추가 요청사항이나 특별한 요구사항을 입력해주세요"
            rows="3"
          />
        </div>
      </div>
    );
  };

  const renderConfirmation = () => {
    const selectedServiceInfo = services.find(s => s.id === selectedService);
    
    return (
      <div className="confirmation">
        <h2 className="step-title">예약 정보를 확인해주세요</h2>
        <div className="confirmation-card">
          <div className="confirmation-section">
            <h3>서비스 정보</h3>
            <div className="confirmation-item">
              <span className="service-badge" style={{ backgroundColor: selectedServiceInfo?.color }}>
                {selectedServiceInfo?.icon} {selectedServiceInfo?.name}
              </span>
            </div>
          </div>

          <div className="confirmation-section">
            <h3>고객 정보</h3>
            <div className="confirmation-item">
              <span className="label">성함:</span>
              <span className="value">{formData.customerName}</span>
            </div>
            <div className="confirmation-item">
              <span className="label">이메일:</span>
              <span className="value">{formData.email}</span>
            </div>
            <div className="confirmation-item">
              <span className="label">연락처:</span>
              <span className="value">{formData.phone}</span>
            </div>
          </div>

          <div className="confirmation-section">
            <h3>예약 정보</h3>
            <div className="confirmation-item">
              <span className="label">체크인:</span>
              <span className="value">{formData.checkInDate}</span>
            </div>
            <div className="confirmation-item">
              <span className="label">체크아웃:</span>
              <span className="value">{formData.checkOutDate}</span>
            </div>
            <div className="confirmation-item">
              <span className="label">인원:</span>
              <span className="value">성인 {formData.adults}명, 아동 {formData.children}명</span>
            </div>
          </div>

          {Object.keys(formData.serviceSpecific).length > 0 && (
            <div className="confirmation-section">
              <h3>추가 정보</h3>
              {Object.entries(formData.serviceSpecific).map(([key, value]) => (
                value && (
                  <div key={key} className="confirmation-item">
                    <span className="label">{key}:</span>
                    <span className="value">{value}</span>
                  </div>
                )
              ))}
            </div>
          )}

          {formData.specialRequests && (
            <div className="confirmation-section">
              <h3>특별 요청사항</h3>
              <div className="special-requests">
                {formData.specialRequests}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return selectedService !== '';
      case 1: return formData.customerName && formData.email && formData.phone;
      case 2: return formData.checkInDate && formData.checkOutDate;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="mobile-booking-form">
      <div className="form-header">
        <h1 className="form-title">예약하기</h1>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
        <div className="step-indicators">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`step-indicator ${index <= currentStep ? 'active' : ''}`}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-text">{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-content">
        {currentStep === 0 && renderServiceSelection()}
        {currentStep === 1 && renderCustomerInfo()}
        {currentStep === 2 && renderBookingInfo()}
        {currentStep === 3 && renderServiceSpecific()}
        {currentStep === 4 && renderConfirmation()}
      </div>

      <div className="form-footer">
        {currentStep > 0 && (
          <button 
            className="btn btn-secondary" 
            onClick={prevStep}
            disabled={loading}
          >
            이전
          </button>
        )}
        
        {currentStep < steps.length - 1 ? (
          <button 
            className="btn btn-primary" 
            onClick={nextStep}
            disabled={!isStepValid() || loading}
          >
            다음
          </button>
        ) : (
          <button 
            className="btn btn-primary btn-submit" 
            onClick={submitBooking}
            disabled={!isStepValid() || loading}
          >
            {loading ? '처리중...' : '예약 완료'}
          </button>
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

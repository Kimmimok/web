import React, { useState } from 'react';
import { addToGoogleSheet } from '../utils/googleSheets';

function QuoteRequestForm() {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    serviceType: '',
    description: '',
    appointmentDate: '',
    appointmentTime: '',
    urgency: '보통'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 주문ID 생성 (현재 시간 기반)
      const orderId = 'Q' + Date.now();
      const requestDate = new Date().toLocaleDateString('ko-KR');
      
      const quoteData = {
        orderId,
        ...formData,
        requestDate,
        status: '대기'
      };

      // 구글 시트에 데이터 추가
      await addToGoogleSheet(quoteData);
      
      alert('견적 요청이 성공적으로 등록되었습니다!');
      
      // 폼 초기화
      setFormData({
        customerName: '',
        phone: '',
        email: '',
        address: '',
        serviceType: '',
        description: '',
        appointmentDate: '',
        appointmentTime: '',
        urgency: '보통'
      });
    } catch (error) {
      console.error('견적 요청 실패:', error);
      alert('견적 요청 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="quote-request-form">
      <h2>견적 요청</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customerName">고객명 *</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">연락처 *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">주소</label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="2"
          />
        </div>

        <div className="form-group">
          <label htmlFor="serviceType">서비스 유형 *</label>
          <select
            id="serviceType"
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            required
          >
            <option value="">선택하세요</option>
            <option value="인테리어">인테리어</option>
            <option value="리모델링">리모델링</option>
            <option value="수리">수리</option>
            <option value="청소">청소</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">상세 설명</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="상세한 요구사항을 입력해주세요"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="appointmentDate">희망 예약일</label>
            <input
              type="date"
              id="appointmentDate"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="appointmentTime">희망 시간</label>
            <input
              type="time"
              id="appointmentTime"
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="urgency">긴급도</label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
          >
            <option value="낮음">낮음</option>
            <option value="보통">보통</option>
            <option value="높음">높음</option>
            <option value="긴급">긴급</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? '등록 중...' : '견적 요청하기'}
        </button>
      </form>
    </div>
  );
}

export default QuoteRequestForm;

import React, { useState, useEffect } from 'react';
import { fetchAllSheetsData } from '../utils/googleSheets';

function Calendar() {
  const [appointments, setAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayAppointments, setDayAppointments] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await fetchAllSheetsData();
      const appointmentsArray = Object.entries(data)
        .filter(([_, quote]) => quote.appointmentDate)
        .map(([orderId, quote]) => ({
          orderId,
          date: quote.appointmentDate,
          time: quote.appointmentTime,
          customerName: quote.customerName,
          serviceType: quote.serviceType,
          status: quote.status
        }));
      setAppointments(appointmentsArray);
    } catch (error) {
      console.error('예약 데이터 로딩 실패:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // 이전 달의 빈 칸들
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateString);
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setDayAppointments(getAppointmentsForDate(date));
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '대기': return '#ff9800';
      case '진행중': return '#2196f3';
      case '완료': return '#4caf50';
      case '취소': return '#f44336';
      default: return '#757575';
    }
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="calendar">
      <h2>일정 관리</h2>
      
      <div className="calendar-header">
        <button onClick={() => navigateMonth(-1)}>‹</button>
        <h3>{formatDate(currentDate)}</h3>
        <button onClick={() => navigateMonth(1)}>›</button>
      </div>

      <div className="calendar-grid">
        {/* 요일 헤더 */}
        {weekDays.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
        
        {/* 날짜 칸들 */}
        {days.map((date, index) => {
          const dayAppointments = date ? getAppointmentsForDate(date) : [];
          const isToday = date && date.toDateString() === new Date().toDateString();
          const isSelected = date && selectedDate && date.toDateString() === selectedDate.toDateString();
          
          return (
            <div
              key={index}
              className={`calendar-day ${!date ? 'empty' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDateClick(date)}
            >
              {date && (
                <>
                  <span className="day-number">{date.getDate()}</span>
                  {dayAppointments.length > 0 && (
                    <div className="appointments-indicator">
                      {dayAppointments.slice(0, 3).map((apt, i) => (
                        <div
                          key={i}
                          className="appointment-dot"
                          style={{ backgroundColor: getStatusColor(apt.status) }}
                          title={`${apt.customerName} - ${apt.serviceType}`}
                        />
                      ))}
                      {dayAppointments.length > 3 && (
                        <span className="more-appointments">+{dayAppointments.length - 3}</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 선택된 날짜의 예약 목록 */}
      {selectedDate && (
        <div className="day-appointments">
          <h3>{selectedDate.toLocaleDateString('ko-KR')} 예약 목록</h3>
          {dayAppointments.length === 0 ? (
            <p>예약된 일정이 없습니다.</p>
          ) : (
            <div className="appointments-list">
              {dayAppointments.map((apt) => (
                <div key={apt.orderId} className="appointment-item">
                  <div className="appointment-time">{apt.time || '시간 미정'}</div>
                  <div className="appointment-info">
                    <h4>{apt.customerName}</h4>
                    <p>{apt.serviceType}</p>
                  </div>
                  <div 
                    className="appointment-status"
                    style={{ backgroundColor: getStatusColor(apt.status) }}
                  >
                    {apt.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 오늘의 예약 요약 */}
      <div className="today-summary">
        <h3>오늘의 예약</h3>
        {getAppointmentsForDate(new Date()).map((apt) => (
          <div key={apt.orderId} className="today-appointment">
            <span className="time">{apt.time || '시간 미정'}</span>
            <span className="customer">{apt.customerName}</span>
            <span className="service">{apt.serviceType}</span>
            <span 
              className="status"
              style={{ color: getStatusColor(apt.status) }}
            >
              {apt.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar;

import React, { useState, useEffect } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

function BookingManagement() {
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [serviceFilter, setServiceFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    loadAllBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [allBookings, serviceFilter, statusFilter, searchTerm]);

  const loadAllBookings = async () => {
    try {
      const sheets = ['SH_R', 'SH_C', 'SH_CC', 'SH_P', 'SH_T', 'SH_H', 'SH_RC'];
      const allData = [];
      
      for (const sheet of sheets) {
        const data = await fetchSheetData(sheet);
        if (data.length > 1) {
          const headers = data[0];
          const rows = data.slice(1);
          
          rows.forEach(row => {
            const booking = {};
            headers.forEach((header, index) => {
              booking[header] = row[index] || '';
            });
            booking.serviceType = getServiceName(sheet);
            booking.sheetCode = sheet;
            allData.push(booking);
          });
        }
      }
      
      setAllBookings(allData);
    } catch (error) {
      console.error('전체 예약 데이터 로딩 실패:', error);
    }
  };

  const filterBookings = () => {
    let filtered = allBookings;

    // 서비스 필터
    if (serviceFilter !== '전체') {
      filtered = filtered.filter(booking => booking.sheetCode === serviceFilter);
    }

    // 상태 필터
    if (statusFilter !== '전체') {
      filtered = filtered.filter(booking => 
        booking['상태'] === statusFilter || booking['status'] === statusFilter
      );
    }

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        Object.values(booking).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredBookings(filtered);
  };

  const getServiceName = (sheetCode) => {
    const serviceNames = {
      'SH_R': '객실',
      'SH_C': '크루즈',
      'SH_CC': '차량',
      'SH_P': '공항',
      'SH_T': '투어',
      'SH_H': '호텔',
      'SH_RC': '렌트카'
    };
    return serviceNames[sheetCode] || sheetCode;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '확정':
      case '완료': return '#4caf50';
      case '대기':
      case '예약': return '#ff9800';
      case '진행중': return '#2196f3';
      case '취소': return '#f44336';
      default: return '#757575';
    }
  };

  const getBookingStats = () => {
    const stats = {
      total: filteredBookings.length,
      byService: {},
      byStatus: {}
    };

    filteredBookings.forEach(booking => {
      // 서비스별 통계
      const service = booking.serviceType;
      stats.byService[service] = (stats.byService[service] || 0) + 1;

      // 상태별 통계
      const status = booking['상태'] || booking['status'] || '미정';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });

    return stats;
  };

  const stats = getBookingStats();

  return (
    <div className="booking-management">
      <h2>예약 통합 관리</h2>

      {/* 통계 섹션 */}
      <div className="booking-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>전체 예약</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
          {Object.entries(stats.byService).map(([service, count]) => (
            <div key={service} className="stat-card">
              <h3>{service}</h3>
              <p className="stat-number">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="booking-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="예약 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-section">
          <select 
            value={serviceFilter} 
            onChange={(e) => setServiceFilter(e.target.value)}
          >
            <option value="전체">모든 서비스</option>
            <option value="SH_R">객실</option>
            <option value="SH_C">크루즈</option>
            <option value="SH_CC">차량</option>
            <option value="SH_P">공항</option>
            <option value="SH_T">투어</option>
            <option value="SH_H">호텔</option>
            <option value="SH_RC">렌트카</option>
          </select>

          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="전체">모든 상태</option>
            <option value="예약">예약</option>
            <option value="확정">확정</option>
            <option value="진행중">진행중</option>
            <option value="완료">완료</option>
            <option value="취소">취소</option>
          </select>
        </div>
      </div>

      {/* 예약 목록 */}
      <div className="bookings-table">
        <table>
          <thead>
            <tr>
              <th>주문ID</th>
              <th>서비스</th>
              <th>고객명</th>
              <th>연락처</th>
              <th>예약일</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking, index) => (
              <tr key={index}>
                <td>{booking['주문ID'] || booking['orderId']}</td>
                <td>
                  <span className="service-badge">
                    {booking.serviceType}
                  </span>
                </td>
                <td>{booking['고객명'] || booking['customerName']}</td>
                <td>{booking['연락처'] || booking['phone']}</td>
                <td>{booking['예약일'] || booking['bookingDate']}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(booking['상태'] || booking['status']) }}
                  >
                    {booking['상태'] || booking['status'] || '미정'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => setSelectedBooking(booking)}
                    className="view-btn"
                  >
                    상세
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 예약 상세 모달 */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{selectedBooking.serviceType} 예약 상세</h3>
            <div className="booking-details">
              {Object.entries(selectedBooking)
                .filter(([key]) => key !== 'serviceType' && key !== 'sheetCode')
                .map(([key, value]) => (
                <p key={key}><strong>{key}:</strong> {value}</p>
              ))}
            </div>
            <button onClick={() => setSelectedBooking(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingManagement;

import React, { useState, useEffect } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // SH_M 시트에서 사용자 데이터 가져오기
      const userData = await fetchSheetData('SH_M');
      if (userData.length > 1) {
        const headers = userData[0];
        const userList = userData.slice(1).map(row => {
          const user = {};
          headers.forEach((header, index) => {
            user[header] = row[index] || '';
          });
          return user;
        });
        setUsers(userList);
      }
    } catch (error) {
      console.error('사용자 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserBookings = async (user) => {
    setLoading(true);
    try {
      const sheets = ['SH_R', 'SH_C', 'SH_CC', 'SH_P', 'SH_T', 'SH_H', 'SH_RC'];
      const serviceNames = {
        'SH_R': '객실 예약',
        'SH_C': '크루즈 예약', 
        'SH_CC': '차량 서비스',
        'SH_P': '공항 서비스',
        'SH_T': '투어 예약',
        'SH_H': '호텔 예약',
        'SH_RC': '렌트카 예약'
      };
      
      const bookings = {};
      const userEmail = user['이메일'] || user['email'];
      const userName = user['고객명'] || user['customerName'];
      
      for (const sheet of sheets) {
        const data = await fetchSheetData(sheet);
        if (data.length > 1) {
          const headers = data[0];
          const rows = data.slice(1);
          const userBookingsInSheet = rows
            .filter(row => {
              const rowEmail = row[headers.indexOf('이메일')] || row[headers.indexOf('email')];
              const rowName = row[headers.indexOf('고객명')] || row[headers.indexOf('customerName')];
              return rowEmail === userEmail || rowName === userName;
            })
            .map(row => {
              const booking = {};
              headers.forEach((header, index) => {
                booking[header] = row[index] || '';
              });
              booking.serviceName = serviceNames[sheet];
              booking.serviceCode = sheet;
              return booking;
            });
          
          if (userBookingsInSheet.length > 0) {
            bookings[sheet] = userBookingsInSheet;
          }
        }
      }
      
      setUserBookings(bookings);
    } catch (error) {
      console.error('사용자 예약 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;
    if (searchTerm) {
      filtered = users.filter(user => 
        Object.values(user).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    setFilteredUsers(filtered);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    loadUserBookings(user);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '확정':
      case '완료': return '#10B981';
      case '대기':
      case '예약': return '#F59E0B';
      case '진행중': return '#3B82F6';
      case '취소': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTotalBookings = () => {
    return Object.values(userBookings).reduce((total, bookings) => total + bookings.length, 0);
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <h1 className="page-title">고객 관리</h1>
        <p className="page-subtitle">고객 정보와 예약 내역을 통합 관리하세요</p>
      </div>

      <div className="user-layout">
        {/* 사용자 목록 */}
        <div className="user-list-section">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">고객 목록</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="🔍 고객 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="modern-search"
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>데이터를 불러오는 중...</p>
              </div>
            ) : (
              <div className="user-grid">
                {filteredUsers.map((user, index) => (
                  <div
                    key={index}
                    className={`user-card ${selectedUser === user ? 'selected' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="user-avatar">
                      {(user['고객명'] || user['customerName'] || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                      <h4 className="user-name">
                        {user['고객명'] || user['customerName'] || '이름 없음'}
                      </h4>
                      <p className="user-email">
                        {user['이메일'] || user['email'] || '이메일 없음'}
                      </p>
                      <p className="user-phone">
                        {user['연락처'] || user['phone'] || '연락처 없음'}
                      </p>
                    </div>
                    <div className="user-badge">
                      <span className="customer-id">
                        ID: {user['주문ID'] || user['orderId'] || index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 선택된 사용자 상세 정보 */}
        {selectedUser && (
          <div className="user-detail-section">
            <div className="card">
              <div className="card-header">
                <div className="user-detail-header">
                  <div className="user-detail-avatar">
                    {(selectedUser['고객명'] || selectedUser['customerName'] || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="card-title">
                      {selectedUser['고객명'] || selectedUser['customerName'] || '이름 없음'}
                    </h3>
                    <p className="user-detail-email">
                      {selectedUser['이메일'] || selectedUser['email'] || '이메일 없음'}
                    </p>
                  </div>
                </div>
                <div className="booking-summary">
                  <span className="booking-count">{getTotalBookings()}개 예약</span>
                </div>
              </div>

              {/* 고객 기본 정보 */}
              <div className="user-info-section">
                <h4 className="section-title">기본 정보</h4>
                <div className="info-grid-modern">
                  {Object.entries(selectedUser)
                    .filter(([key, value]) => value && key !== '고객명' && key !== 'customerName' && key !== '이메일' && key !== 'email')
                    .map(([key, value]) => (
                    <div key={key} className="info-item-modern">
                      <span className="info-label">{key}</span>
                      <span className="info-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 예약 내역 */}
              <div className="bookings-section">
                <h4 className="section-title">예약 내역</h4>
                {Object.keys(userBookings).length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>예약 내역이 없습니다</p>
                  </div>
                ) : (
                  <div className="bookings-container">
                    {Object.entries(userBookings).map(([sheet, bookings]) => (
                      <div key={sheet} className="service-booking-section">
                        <div className="service-header">
                          <h5 className="service-title">{bookings[0]?.serviceName}</h5>
                          <span className="service-count">{bookings.length}건</span>
                        </div>
                        <div className="booking-cards">
                          {bookings.map((booking, index) => (
                            <div key={index} className="booking-card">
                              <div className="booking-header">
                                <span className="booking-id">
                                  #{booking['주문ID'] || booking['orderId'] || index + 1}
                                </span>
                                <span 
                                  className="booking-status"
                                  style={{ 
                                    backgroundColor: getStatusColor(booking['상태'] || booking['status']),
                                    color: 'white'
                                  }}
                                >
                                  {booking['상태'] || booking['status'] || '상태 없음'}
                                </span>
                              </div>
                              <div className="booking-details">
                                {Object.entries(booking)
                                  .filter(([key, value]) => 
                                    value && 
                                    key !== 'serviceName' && 
                                    key !== 'serviceCode' && 
                                    key !== '고객명' && 
                                    key !== 'customerName' &&
                                    key !== '이메일' && 
                                    key !== 'email' &&
                                    key !== '주문ID' && 
                                    key !== 'orderId' &&
                                    key !== '상태' && 
                                    key !== 'status'
                                  )
                                  .slice(0, 4)
                                  .map(([key, value]) => (
                                  <div key={key} className="booking-detail-item">
                                    <span className="detail-label">{key}:</span>
                                    <span className="detail-value">{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;

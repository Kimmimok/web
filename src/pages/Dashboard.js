import React, { useState, useEffect } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    serviceStats: {},
    confirmedBookings: 0,
    totalRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 사용자 데이터 로드 (SH_M)
      const userData = await fetchSheetData('SH_M');
      const totalUsers = userData.length > 1 ? userData.length - 1 : 0;

      // 각 서비스별 데이터 로드
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

      let totalBookings = 0;
      let confirmedBookings = 0;
      let totalRevenue = 0;
      const serviceStats = {};
      const allBookings = [];

      for (const sheet of sheets) {
        const data = await fetchSheetData(sheet);
        if (data.length > 1) {
          const count = data.length - 1;
          totalBookings += count;
          serviceStats[serviceNames[sheet]] = count;

          // 상태별 통계 계산
          const headers = data[0];
          const statusIndex = headers.findIndex(h => h === '상태' || h === 'status');
          const priceIndex = headers.findIndex(h => h.includes('금액') || h.includes('price') || h.includes('요금'));
          
          if (statusIndex !== -1) {
            data.slice(1).forEach(row => {
              const status = row[statusIndex];
              if (status === '확정' || status === '완료') {
                confirmedBookings++;
              }
              
              // 매출 계산
              if (priceIndex !== -1 && row[priceIndex]) {
                const price = parseFloat(row[priceIndex].toString().replace(/[^\d]/g, '')) || 0;
                if (status === '확정' || status === '완료') {
                  totalRevenue += price;
                }
              }
            });
          }

          // 최근 예약을 위한 데이터 수집
          const rows = data.slice(1, 4); // 최대 3개만
          rows.forEach(row => {
            const booking = {};
            headers.forEach((header, index) => {
              booking[header] = row[index] || '';
            });
            booking.serviceType = serviceNames[sheet];
            allBookings.push(booking);
          });
        }
      }

      setStats({
        totalUsers,
        totalBookings,
        serviceStats,
        confirmedBookings,
        totalRevenue
      });

      setRecentBookings(allBookings.slice(0, 8));
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount);
  };

  const getMaxServiceCount = () => {
    return Math.max(...Object.values(stats.serviceStats));
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-dashboard">
          <div className="spinner-large"></div>
          <h2>대시보드를 불러오는 중...</h2>
          <p>잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">예약 관리 대시보드</h1>
          <p className="dashboard-subtitle">실시간 예약 현황과 통계를 한눈에 확인하세요</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={loadDashboardData}>
            🔄 새로고침
          </button>
        </div>
      </div>

      {/* 주요 통계 카드 */}
      <div className="stats-overview">
        <div className="stat-card-modern primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">총 고객수</div>
          </div>
        </div>
        
        <div className="stat-card-modern secondary">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalBookings}</div>
            <div className="stat-label">총 예약수</div>
          </div>
        </div>
        
        <div className="stat-card-modern success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.confirmedBookings}</div>
            <div className="stat-label">확정 예약</div>
          </div>
        </div>
        
        <div className="stat-card-modern warning">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-label">총 매출</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* 서비스별 통계 */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">서비스별 예약 현황</h3>
            <span className="card-subtitle">각 서비스의 예약 건수를 확인하세요</span>
          </div>
          <div className="services-grid">
            {Object.entries(stats.serviceStats).map(([serviceName, count]) => (
              <div key={serviceName} className="service-stat-card">
                <div className="service-header">
                  <h4 className="service-name">{serviceName}</h4>
                </div>
                <div className="service-number">{count}</div>
                <div className="service-label">건의 예약</div>
                <div className="service-progress">
                  <div 
                    className="service-progress-bar"
                    style={{ 
                      width: `${getMaxServiceCount() > 0 ? (count / getMaxServiceCount()) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 예약 내역 */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">최근 예약 내역</h3>
            <span className="card-subtitle">가장 최근 등록된 예약들을 확인하세요</span>
          </div>
          <div className="recent-bookings">
            {recentBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>최근 예약 내역이 없습니다</p>
              </div>
            ) : (
              <div className="booking-list">
                {recentBookings.map((booking, index) => (
                  <div key={index} className="recent-booking-item">
                    <div className="booking-info">
                      <div className="customer-info">
                        <span className="customer-name">
                          {booking['고객명'] || booking['customerName'] || '이름 없음'}
                        </span>
                        <span className="booking-service">{booking.serviceType}</span>
                      </div>
                      <div className="booking-details">
                        <span className="booking-id">
                          #{booking['주문ID'] || booking['orderId'] || index + 1}
                        </span>
                        <span 
                          className="booking-status-badge"
                          style={{ 
                            backgroundColor: getStatusColor(booking['상태'] || booking['status']),
                            color: 'white'
                          }}
                        >
                          {booking['상태'] || booking['status'] || '상태 없음'}
                        </span>
                      </div>
                    </div>
                    <div className="booking-meta">
                      <span className="booking-date">
                        {booking['예약일'] || booking['bookingDate'] || '날짜 없음'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">빠른 액션</h3>
            <span className="card-subtitle">자주 사용하는 기능에 빠르게 접근하세요</span>
          </div>
          <div className="quick-actions">
            <div className="quick-action-btn primary" onClick={() => window.location.href = '/user-management'}>
              <div className="action-icon">👥</div>
              <div className="action-content">
                <div className="action-title">고객 관리</div>
                <div className="action-desc">고객 정보 조회 및 관리</div>
              </div>
            </div>
            
            <div className="quick-action-btn secondary" onClick={() => window.location.href = '/booking-management'}>
              <div className="action-icon">📋</div>
              <div className="action-content">
                <div className="action-title">예약 관리</div>
                <div className="action-desc">전체 예약 현황 확인</div>
              </div>
            </div>
            
            <div className="quick-action-btn success" onClick={() => window.location.href = '/room-management'}>
              <div className="action-icon">🏨</div>
              <div className="action-content">
                <div className="action-title">객실 예약</div>
                <div className="action-desc">객실 예약 관리</div>
              </div>
            </div>
            
            <div className="quick-action-btn warning" onClick={() => window.location.href = '/cruise-management'}>
              <div className="action-icon">🚢</div>
              <div className="action-content">
                <div className="action-title">크루즈 예약</div>
                <div className="action-desc">크루즈 예약 관리</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

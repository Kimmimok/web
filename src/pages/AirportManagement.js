import React, { useState, useEffect } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

function AirportManagement() {
  const [airports, setAirports] = useState([]);
  const [filteredAirports, setFilteredAirports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  useEffect(() => {
    loadAirports();
  }, []);

  useEffect(() => {
    filterAirports();
  }, [airports, searchTerm, statusFilter]);

  const loadAirports = async () => {
    try {
      const data = await fetchSheetData('SH_P');
      if (data.length > 1) {
        const headers = data[0];
        const airportList = data.slice(1).map(row => {
          const airport = {};
          headers.forEach((header, index) => {
            airport[header] = row[index] || '';
          });
          return airport;
        });
        setAirports(airportList);
      }
    } catch (error) {
      console.error('공항 서비스 데이터 로딩 실패:', error);
    }
  };

  const filterAirports = () => {
    let filtered = airports;

    if (statusFilter !== '전체') {
      filtered = filtered.filter(airport => 
        airport['상태'] === statusFilter || airport['status'] === statusFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(airport => 
        Object.values(airport).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredAirports(filtered);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '예약확정': return '#4caf50';
      case '픽업대기': return '#ff9800';
      case '이동중': return '#2196f3';
      case '완료': return '#4caf50';
      case '취소': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <div className="airport-management">
      <h2>공항 서비스 관리 (SH_P)</h2>

      {/* 필터 및 검색 */}
      <div className="airport-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="공항 서비스 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="전체">모든 상태</option>
          <option value="예약확정">예약확정</option>
          <option value="픽업대기">픽업대기</option>
          <option value="이동중">이동중</option>
          <option value="완료">완료</option>
          <option value="취소">취소</option>
        </select>
      </div>

      {/* 공항 서비스 목록 */}
      <div className="airports-table">
        <table>
          <thead>
            <tr>
              <th>주문ID</th>
              <th>서비스타입</th>
              <th>고객명</th>
              <th>연락처</th>
              <th>항공편</th>
              <th>출발공항</th>
              <th>도착공항</th>
              <th>픽업시간</th>
              <th>목적지</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredAirports.map((airport, index) => (
              <tr key={index}>
                <td>{airport['주문ID'] || airport['orderId']}</td>
                <td>{airport['서비스타입'] || airport['serviceType']}</td>
                <td>{airport['고객명'] || airport['customerName']}</td>
                <td>{airport['연락처'] || airport['phone']}</td>
                <td>{airport['항공편'] || airport['flightNumber']}</td>
                <td>{airport['출발공항'] || airport['departureAirport']}</td>
                <td>{airport['도착공항'] || airport['arrivalAirport']}</td>
                <td>{airport['픽업시간'] || airport['pickupTime']}</td>
                <td>{airport['목적지'] || airport['destination']}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(airport['상태'] || airport['status']) }}
                  >
                    {airport['상태'] || airport['status'] || '미정'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AirportManagement;

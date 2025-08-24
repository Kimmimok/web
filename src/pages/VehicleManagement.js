import React, { useState, useEffect } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [vehicles, searchTerm, statusFilter]);

  const loadVehicles = async () => {
    try {
      const data = await fetchSheetData('SH_CC');
      if (data.length > 1) {
        const headers = data[0];
        const vehicleList = data.slice(1).map(row => {
          const vehicle = {};
          headers.forEach((header, index) => {
            vehicle[header] = row[index] || '';
          });
          return vehicle;
        });
        setVehicles(vehicleList);
      }
    } catch (error) {
      console.error('차량 데이터 로딩 실패:', error);
    }
  };

  const filterVehicles = () => {
    let filtered = vehicles;

    if (statusFilter !== '전체') {
      filtered = filtered.filter(vehicle => 
        vehicle['상태'] === statusFilter || vehicle['status'] === statusFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(vehicle => 
        Object.values(vehicle).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredVehicles(filtered);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '예약확정': return '#4caf50';
      case '운행중': return '#2196f3';
      case '대기': return '#ff9800';
      case '정비중': return '#f44336';
      case '완료': return '#4caf50';
      default: return '#757575';
    }
  };

  return (
    <div className="vehicle-management">
      <h2>차량 관리 (SH_CC)</h2>

      {/* 필터 및 검색 */}
      <div className="vehicle-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="차량 예약 검색..."
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
          <option value="운행중">운행중</option>
          <option value="대기">대기</option>
          <option value="정비중">정비중</option>
          <option value="완료">완료</option>
        </select>
      </div>

      {/* 차량 목록 */}
      <div className="vehicles-table">
        <table>
          <thead>
            <tr>
              <th>주문ID</th>
              <th>차량종류</th>
              <th>차량번호</th>
              <th>고객명</th>
              <th>연락처</th>
              <th>출발지</th>
              <th>목적지</th>
              <th>이용일시</th>
              <th>기사명</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle, index) => (
              <tr key={index}>
                <td>{vehicle['주문ID'] || vehicle['orderId']}</td>
                <td>{vehicle['차량종류'] || vehicle['vehicleType']}</td>
                <td>{vehicle['차량번호'] || vehicle['plateNumber']}</td>
                <td>{vehicle['고객명'] || vehicle['customerName']}</td>
                <td>{vehicle['연락처'] || vehicle['phone']}</td>
                <td>{vehicle['출발지'] || vehicle['departure']}</td>
                <td>{vehicle['목적지'] || vehicle['destination']}</td>
                <td>{vehicle['이용일시'] || vehicle['serviceDateTime']}</td>
                <td>{vehicle['기사명'] || vehicle['driverName']}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(vehicle['상태'] || vehicle['status']) }}
                  >
                    {vehicle['상태'] || vehicle['status'] || '미정'}
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

export default VehicleManagement;

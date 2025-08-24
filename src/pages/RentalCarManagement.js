import React, { useState, useEffect } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

function RentalCarManagement() {
  const [rentalCars, setRentalCars] = useState([]);
  const [filteredRentalCars, setFilteredRentalCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  useEffect(() => {
    loadRentalCars();
  }, []);

  useEffect(() => {
    filterRentalCars();
  }, [rentalCars, searchTerm, statusFilter]);

  const loadRentalCars = async () => {
    try {
      const data = await fetchSheetData('SH_RC');
      if (data.length > 1) {
        const headers = data[0];
        const rentalCarList = data.slice(1).map(row => {
          const rentalCar = {};
          headers.forEach((header, index) => {
            rentalCar[header] = row[index] || '';
          });
          return rentalCar;
        });
        setRentalCars(rentalCarList);
      }
    } catch (error) {
      console.error('렌트카 데이터 로딩 실패:', error);
    }
  };

  const filterRentalCars = () => {
    let filtered = rentalCars;

    if (statusFilter !== '전체') {
      filtered = filtered.filter(rentalCar => 
        rentalCar['상태'] === statusFilter || rentalCar['status'] === statusFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(rentalCar => 
        Object.values(rentalCar).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredRentalCars(filtered);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '예약확정': return '#4caf50';
      case '대여중': return '#2196f3';
      case '반납완료': return '#4caf50';
      case '대기': return '#ff9800';
      case '취소': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <div className="rental-car-management">
      <h2>렌트카 관리 (SH_RC)</h2>

      {/* 필터 및 검색 */}
      <div className="rental-car-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="렌트카 예약 검색..."
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
          <option value="대여중">대여중</option>
          <option value="반납완료">반납완료</option>
          <option value="대기">대기</option>
          <option value="취소">취소</option>
        </select>
      </div>

      {/* 렌트카 목록 */}
      <div className="rental-cars-table">
        <table>
          <thead>
            <tr>
              <th>주문ID</th>
              <th>차량모델</th>
              <th>차량번호</th>
              <th>고객명</th>
              <th>연락처</th>
              <th>대여일</th>
              <th>반납일</th>
              <th>대여장소</th>
              <th>반납장소</th>
              <th>가격</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredRentalCars.map((rentalCar, index) => (
              <tr key={index}>
                <td>{rentalCar['주문ID'] || rentalCar['orderId']}</td>
                <td>{rentalCar['차량모델'] || rentalCar['carModel']}</td>
                <td>{rentalCar['차량번호'] || rentalCar['plateNumber']}</td>
                <td>{rentalCar['고객명'] || rentalCar['customerName']}</td>
                <td>{rentalCar['연락처'] || rentalCar['phone']}</td>
                <td>{rentalCar['대여일'] || rentalCar['rentalDate']}</td>
                <td>{rentalCar['반납일'] || rentalCar['returnDate']}</td>
                <td>{rentalCar['대여장소'] || rentalCar['pickupLocation']}</td>
                <td>{rentalCar['반납장소'] || rentalCar['returnLocation']}</td>
                <td>{rentalCar['가격'] || rentalCar['price']}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(rentalCar['상태'] || rentalCar['status']) }}
                  >
                    {rentalCar['상태'] || rentalCar['status'] || '미정'}
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

export default RentalCarManagement;

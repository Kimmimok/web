import React, { useState, useEffect } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

function HotelManagement() {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  useEffect(() => {
    loadHotels();
  }, []);

  useEffect(() => {
    filterHotels();
  }, [hotels, searchTerm, statusFilter]);

  const loadHotels = async () => {
    try {
      const data = await fetchSheetData('SH_H');
      if (data.length > 1) {
        const headers = data[0];
        const hotelList = data.slice(1).map(row => {
          const hotel = {};
          headers.forEach((header, index) => {
            hotel[header] = row[index] || '';
          });
          return hotel;
        });
        setHotels(hotelList);
      }
    } catch (error) {
      console.error('호텔 데이터 로딩 실패:', error);
    }
  };

  const filterHotels = () => {
    let filtered = hotels;

    if (statusFilter !== '전체') {
      filtered = filtered.filter(hotel => 
        hotel['상태'] === statusFilter || hotel['status'] === statusFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(hotel => 
        Object.values(hotel).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredHotels(filtered);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '예약확정': return '#4caf50';
      case '체크인': return '#2196f3';
      case '체크아웃': return '#4caf50';
      case '대기': return '#ff9800';
      case '취소': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <div className="hotel-management">
      <h2>호텔 관리 (SH_H)</h2>

      {/* 필터 및 검색 */}
      <div className="hotel-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="호텔 예약 검색..."
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
          <option value="체크인">체크인</option>
          <option value="체크아웃">체크아웃</option>
          <option value="대기">대기</option>
          <option value="취소">취소</option>
        </select>
      </div>

      {/* 호텔 목록 */}
      <div className="hotels-table">
        <table>
          <thead>
            <tr>
              <th>주문ID</th>
              <th>호텔명</th>
              <th>고객명</th>
              <th>연락처</th>
              <th>체크인</th>
              <th>체크아웃</th>
              <th>객실타입</th>
              <th>인원수</th>
              <th>가격</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredHotels.map((hotel, index) => (
              <tr key={index}>
                <td>{hotel['주문ID'] || hotel['orderId']}</td>
                <td>{hotel['호텔명'] || hotel['hotelName']}</td>
                <td>{hotel['고객명'] || hotel['customerName']}</td>
                <td>{hotel['연락처'] || hotel['phone']}</td>
                <td>{hotel['체크인'] || hotel['checkIn']}</td>
                <td>{hotel['체크아웃'] || hotel['checkOut']}</td>
                <td>{hotel['객실타입'] || hotel['roomType']}</td>
                <td>{hotel['인원수'] || hotel['guests']}</td>
                <td>{hotel['가격'] || hotel['price']}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(hotel['상태'] || hotel['status']) }}
                  >
                    {hotel['상태'] || hotel['status'] || '미정'}
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

export default HotelManagement;

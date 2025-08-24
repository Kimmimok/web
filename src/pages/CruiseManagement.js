import React, { useState, useEffect } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

function CruiseManagement() {
  const [cruises, setCruises] = useState([]);
  const [filteredCruises, setFilteredCruises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  useEffect(() => {
    loadCruises();
  }, []);

  useEffect(() => {
    filterCruises();
  }, [cruises, searchTerm, statusFilter]);

  const loadCruises = async () => {
    try {
      const data = await fetchSheetData('SH_C');
      if (data.length > 1) {
        const headers = data[0];
        const cruiseList = data.slice(1).map(row => {
          const cruise = {};
          headers.forEach((header, index) => {
            cruise[header] = row[index] || '';
          });
          return cruise;
        });
        setCruises(cruiseList);
      }
    } catch (error) {
      console.error('크루즈 데이터 로딩 실패:', error);
    }
  };

  const filterCruises = () => {
    let filtered = cruises;

    if (statusFilter !== '전체') {
      filtered = filtered.filter(cruise => 
        cruise['상태'] === statusFilter || cruise['status'] === statusFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(cruise => 
        Object.values(cruise).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredCruises(filtered);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '예약확정': return '#4caf50';
      case '대기': return '#ff9800';
      case '진행중': return '#2196f3';
      case '완료': return '#4caf50';
      case '취소': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <div className="cruise-management">
      <h2>크루즈 관리 (SH_C)</h2>

      {/* 필터 및 검색 */}
      <div className="cruise-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="크루즈 예약 검색..."
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
          <option value="대기">대기</option>
          <option value="진행중">진행중</option>
          <option value="완료">완료</option>
          <option value="취소">취소</option>
        </select>
      </div>

      {/* 크루즈 목록 */}
      <div className="cruises-table">
        <table>
          <thead>
            <tr>
              <th>주문ID</th>
              <th>크루즈명</th>
              <th>고객명</th>
              <th>연락처</th>
              <th>출발일</th>
              <th>도착일</th>
              <th>인원수</th>
              <th>캐빈타입</th>
              <th>가격</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredCruises.map((cruise, index) => (
              <tr key={index}>
                <td>{cruise['주문ID'] || cruise['orderId']}</td>
                <td>{cruise['크루즈명'] || cruise['cruiseName']}</td>
                <td>{cruise['고객명'] || cruise['customerName']}</td>
                <td>{cruise['연락처'] || cruise['phone']}</td>
                <td>{cruise['출발일'] || cruise['departureDate']}</td>
                <td>{cruise['도착일'] || cruise['arrivalDate']}</td>
                <td>{cruise['인원수'] || cruise['passengers']}</td>
                <td>{cruise['캐빈타입'] || cruise['cabinType']}</td>
                <td>{cruise['가격'] || cruise['price']}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(cruise['상태'] || cruise['status']) }}
                  >
                    {cruise['상태'] || cruise['status'] || '미정'}
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

export default CruiseManagement;

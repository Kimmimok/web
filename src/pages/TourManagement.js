import React, { useState, useEffect } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

function TourManagement() {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  useEffect(() => {
    loadTours();
  }, []);

  useEffect(() => {
    filterTours();
  }, [tours, searchTerm, statusFilter]);

  const loadTours = async () => {
    try {
      const data = await fetchSheetData('SH_T');
      if (data.length > 1) {
        const headers = data[0];
        const tourList = data.slice(1).map(row => {
          const tour = {};
          headers.forEach((header, index) => {
            tour[header] = row[index] || '';
          });
          return tour;
        });
        setTours(tourList);
      }
    } catch (error) {
      console.error('투어 데이터 로딩 실패:', error);
    }
  };

  const filterTours = () => {
    let filtered = tours;

    if (statusFilter !== '전체') {
      filtered = filtered.filter(tour => 
        tour['상태'] === statusFilter || tour['status'] === statusFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(tour => 
        Object.values(tour).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredTours(filtered);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '예약확정': return '#4caf50';
      case '진행중': return '#2196f3';
      case '대기': return '#ff9800';
      case '완료': return '#4caf50';
      case '취소': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <div className="tour-management">
      <h2>투어 관리 (SH_T)</h2>

      {/* 필터 및 검색 */}
      <div className="tour-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="투어 예약 검색..."
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
          <option value="진행중">진행중</option>
          <option value="대기">대기</option>
          <option value="완료">완료</option>
          <option value="취소">취소</option>
        </select>
      </div>

      {/* 투어 목록 */}
      <div className="tours-table">
        <table>
          <thead>
            <tr>
              <th>주문ID</th>
              <th>투어명</th>
              <th>고객명</th>
              <th>연락처</th>
              <th>투어일정</th>
              <th>인원수</th>
              <th>가이드</th>
              <th>집합장소</th>
              <th>가격</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredTours.map((tour, index) => (
              <tr key={index}>
                <td>{tour['주문ID'] || tour['orderId']}</td>
                <td>{tour['투어명'] || tour['tourName']}</td>
                <td>{tour['고객명'] || tour['customerName']}</td>
                <td>{tour['연락처'] || tour['phone']}</td>
                <td>{tour['투어일정'] || tour['tourDate']}</td>
                <td>{tour['인원수'] || tour['participants']}</td>
                <td>{tour['가이드'] || tour['guide']}</td>
                <td>{tour['집합장소'] || tour['meetingPoint']}</td>
                <td>{tour['가격'] || tour['price']}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(tour['상태'] || tour['status']) }}
                  >
                    {tour['상태'] || tour['status'] || '미정'}
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

export default TourManagement;

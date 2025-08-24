import React, { useState, useEffect } from 'react';
import { fetchSheetData } from '../utils/googleSheets';

function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, statusFilter]);

  const loadRooms = async () => {
    try {
      const data = await fetchSheetData('SH_R');
      if (data.length > 1) {
        const headers = data[0];
        const roomList = data.slice(1).map(row => {
          const room = {};
          headers.forEach((header, index) => {
            room[header] = row[index] || '';
          });
          return room;
        });
        setRooms(roomList);
      }
    } catch (error) {
      console.error('객실 데이터 로딩 실패:', error);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;

    if (statusFilter !== '전체') {
      filtered = filtered.filter(room => 
        room['상태'] === statusFilter || room['status'] === statusFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(room => 
        Object.values(room).some(value => 
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredRooms(filtered);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '예약가능': return '#4caf50';
      case '예약됨': return '#ff9800';
      case '점검중': return '#f44336';
      case '청소중': return '#2196f3';
      default: return '#757575';
    }
  };

  const getRoomStats = () => {
    const stats = {
      total: rooms.length,
      available: rooms.filter(r => r['상태'] === '예약가능').length,
      booked: rooms.filter(r => r['상태'] === '예약됨').length,
      maintenance: rooms.filter(r => r['상태'] === '점검중').length,
      cleaning: rooms.filter(r => r['상태'] === '청소중').length
    };
    return stats;
  };

  const stats = getRoomStats();

  return (
    <div className="room-management">
      <h2>객실 관리 (SH_R)</h2>

      {/* 통계 */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>전체 객실</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>예약가능</h3>
          <p className="stat-number" style={{color: '#4caf50'}}>{stats.available}</p>
        </div>
        <div className="stat-card">
          <h3>예약됨</h3>
          <p className="stat-number" style={{color: '#ff9800'}}>{stats.booked}</p>
        </div>
        <div className="stat-card">
          <h3>점검/청소중</h3>
          <p className="stat-number" style={{color: '#f44336'}}>{stats.maintenance + stats.cleaning}</p>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="room-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="객실 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="전체">모든 상태</option>
          <option value="예약가능">예약가능</option>
          <option value="예약됨">예약됨</option>
          <option value="점검중">점검중</option>
          <option value="청소중">청소중</option>
        </select>
      </div>

      {/* 객실 목록 */}
      <div className="rooms-table">
        <table>
          <thead>
            <tr>
              <th>주문ID</th>
              <th>객실번호</th>
              <th>객실타입</th>
              <th>고객명</th>
              <th>체크인</th>
              <th>체크아웃</th>
              <th>인원수</th>
              <th>가격</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room, index) => (
              <tr key={index}>
                <td>{room['주문ID'] || room['orderId']}</td>
                <td>{room['객실번호'] || room['roomNumber']}</td>
                <td>{room['객실타입'] || room['roomType']}</td>
                <td>{room['고객명'] || room['customerName']}</td>
                <td>{room['체크인'] || room['checkIn']}</td>
                <td>{room['체크아웃'] || room['checkOut']}</td>
                <td>{room['인원수'] || room['guests']}</td>
                <td>{room['가격'] || room['price']}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(room['상태'] || room['status']) }}
                  >
                    {room['상태'] || room['status'] || '미정'}
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

export default RoomManagement;

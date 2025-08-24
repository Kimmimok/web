import React, { useState, useEffect } from 'react';
import { fetchAllSheetsData, updateGoogleSheet } from '../utils/googleSheets';

function QuoteList() {
  const [quotes, setQuotes] = useState([]);
  const [filteredQuotes, setFilteredQuotes] = useState([]);
  const [filter, setFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, filter, searchTerm]);

  const loadQuotes = async () => {
    try {
      const data = await fetchAllSheetsData();
      const quotesArray = Object.entries(data).map(([orderId, sheetData]) => ({
        orderId,
        ...sheetData
      }));
      setQuotes(quotesArray);
    } catch (error) {
      console.error('견적 목록 로딩 실패:', error);
    }
  };

  const filterQuotes = () => {
    let filtered = quotes;

    // 상태 필터
    if (filter !== '전체') {
      filtered = filtered.filter(quote => quote.status === filter);
    }

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.phone?.includes(searchTerm) ||
        quote.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuotes(filtered);
  };

  const updateQuoteStatus = async (orderId, newStatus) => {
    try {
      await updateGoogleSheet(orderId, { status: newStatus });
      setQuotes(quotes.map(quote => 
        quote.orderId === orderId 
          ? { ...quote, status: newStatus }
          : quote
      ));
      alert('상태가 업데이트되었습니다.');
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '대기': return '#ff9800';
      case '진행중': return '#2196f3';
      case '완료': return '#4caf50';
      case '취소': return '#f44336';
      default: return '#757575';
    }
  };

  return (
    <div className="quote-list">
      <h2>견적 목록</h2>
      
      <div className="list-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="고객명, 연락처, 주문ID로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-buttons">
          {['전체', '대기', '진행중', '완료', '취소'].map(status => (
            <button
              key={status}
              className={filter === status ? 'active' : ''}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="quotes-table">
        <table>
          <thead>
            <tr>
              <th>주문ID</th>
              <th>고객명</th>
              <th>연락처</th>
              <th>서비스 유형</th>
              <th>요청일</th>
              <th>예약일</th>
              <th>상태</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.map((quote) => (
              <tr key={quote.orderId}>
                <td>{quote.orderId}</td>
                <td>{quote.customerName}</td>
                <td>{quote.phone}</td>
                <td>{quote.serviceType}</td>
                <td>{quote.requestDate}</td>
                <td>{quote.appointmentDate}</td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(quote.status) }}
                  >
                    {quote.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => setSelectedQuote(quote)}
                      className="view-btn"
                    >
                      상세
                    </button>
                    <select
                      value={quote.status}
                      onChange={(e) => updateQuoteStatus(quote.orderId, e.target.value)}
                      className="status-select"
                    >
                      <option value="대기">대기</option>
                      <option value="진행중">진행중</option>
                      <option value="완료">완료</option>
                      <option value="취소">취소</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 상세 모달 */}
      {selectedQuote && (
        <div className="modal-overlay" onClick={() => setSelectedQuote(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>견적 상세 정보</h3>
            <div className="quote-details">
              <p><strong>주문ID:</strong> {selectedQuote.orderId}</p>
              <p><strong>고객명:</strong> {selectedQuote.customerName}</p>
              <p><strong>연락처:</strong> {selectedQuote.phone}</p>
              <p><strong>이메일:</strong> {selectedQuote.email}</p>
              <p><strong>주소:</strong> {selectedQuote.address}</p>
              <p><strong>서비스 유형:</strong> {selectedQuote.serviceType}</p>
              <p><strong>상세 설명:</strong> {selectedQuote.description}</p>
              <p><strong>예약일시:</strong> {selectedQuote.appointmentDate} {selectedQuote.appointmentTime}</p>
              <p><strong>긴급도:</strong> {selectedQuote.urgency}</p>
              <p><strong>상태:</strong> {selectedQuote.status}</p>
            </div>
            <button onClick={() => setSelectedQuote(null)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuoteList;

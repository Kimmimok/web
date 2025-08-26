import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GoogleSheetInput from './mobile/GoogleSheetInput';
import './MobileBookingForm.css';

function App() {
  const [formData, setFormData] = useState({});

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="header-inner">
            <h1 className="brand">스테이 하롱 트레블</h1>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            {/* 모바일 예약폼이 기본 루트 */}
            <Route 
              path="/" 
              element={<GoogleSheetInput formData={formData} setFormData={setFormData} />} 
            />
            {/* 다른 모든 경로를 루트로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

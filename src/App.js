import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GoogleSheetInput from './mobile/GoogleSheetInput';
import './MobileBookingForm.css';

function App() {
  const [formData, setFormData] = useState({});

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* 모바일 예약폼이 기본 루트 */}
          <Route 
            path="/" 
            element={<GoogleSheetInput formData={formData} setFormData={setFormData} />} 
          />
          {/* 다른 모든 경로를 루트로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

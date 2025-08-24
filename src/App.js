import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import BookingManagement from './pages/BookingManagement';
import RoomManagement from './pages/RoomManagement';
import CruiseManagement from './pages/CruiseManagement';
import VehicleManagement from './pages/VehicleManagement';
import AirportManagement from './pages/AirportManagement';
import TourManagement from './pages/TourManagement';
import HotelManagement from './pages/HotelManagement';
import RentalCarManagement from './pages/RentalCarManagement';
import MobileBookingForm from './mobile/GoogleSheetInput';
import './App.css';

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = useState(window.innerWidth < 768 ? 'mobileform' : 'dashboard');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // 페이지 자동 변경은 하지 않음
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'rooms':
        return <RoomManagement />;
      case 'cruise':
        return <CruiseManagement />;
      case 'vehicles':
        return <VehicleManagement />;
      case 'airport':
        return <AirportManagement />;
      case 'tours':
        return <TourManagement />;
      case 'hotels':
        return <HotelManagement />;
      case 'rentals':
        return <RentalCarManagement />;
      case 'mobileform':
        return (
          <Router>
            <MobileBookingForm />
          </Router>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <h1 style={{cursor:'pointer'}} onClick={() => setCurrentPage('mobileform')}>스테이 하롱 트레블</h1>
        {isMobile ? (
          <>
           
            {mobileMenuOpen && (
              <div className="mobile-nav-menu">
                <button className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => {setCurrentPage('dashboard'); setMobileMenuOpen(false);}}>대시보드</button>
                <button className={currentPage === 'users' ? 'active' : ''} onClick={() => {setCurrentPage('users'); setMobileMenuOpen(false);}}>사용자 관리</button>
                <button className={currentPage === 'bookings' ? 'active' : ''} onClick={() => {setCurrentPage('bookings'); setMobileMenuOpen(false);}}>예약 통합관리</button>
                <button onClick={() => {setCurrentPage('rooms'); setMobileMenuOpen(false);}}>객실 (SH_R)</button>
                <button onClick={() => {setCurrentPage('cruise'); setMobileMenuOpen(false);}}>크루즈 (SH_C)</button>
                <button onClick={() => {setCurrentPage('vehicles'); setMobileMenuOpen(false);}}>차량 (SH_CC)</button>
                <button onClick={() => {setCurrentPage('airport'); setMobileMenuOpen(false);}}>공항 (SH_P)</button>
                <button onClick={() => {setCurrentPage('tours'); setMobileMenuOpen(false);}}>투어 (SH_T)</button>
                <button onClick={() => {setCurrentPage('hotels'); setMobileMenuOpen(false);}}>호텔 (SH_H)</button>
                <button onClick={() => {setCurrentPage('rentals'); setMobileMenuOpen(false);}}>렌트카 (SH_RC)</button>
                <button className={currentPage === 'mobileform' ? 'active' : ''} onClick={() => {setCurrentPage('mobileform'); setMobileMenuOpen(false);}}>모바일 예약 입력폼</button>
              </div>
            )}
          </>
        ) : (
          <div className="nav-buttons">
            <button 
              className={currentPage === 'dashboard' ? 'active' : ''}
              onClick={() => setCurrentPage('dashboard')}
            >
              대시보드
            </button>
            <button 
              className={currentPage === 'users' ? 'active' : ''}
              onClick={() => setCurrentPage('users')}
            >
              사용자 관리
            </button>
            <button 
              className={currentPage === 'bookings' ? 'active' : ''}
              onClick={() => setCurrentPage('bookings')}
            >
              예약 통합관리
            </button>
            <button 
              className={currentPage === 'mobileform' ? 'active' : ''}
              onClick={() => setCurrentPage('mobileform')}
            >
              모바일 예약 입력폼
            </button>
            <div className="nav-dropdown">
              <button className="dropdown-btn">서비스별 관리 ▼</button>
              <div className="dropdown-content">
                <button onClick={() => setCurrentPage('rooms')}>객실 (SH_R)</button>
                <button onClick={() => setCurrentPage('cruise')}>크루즈 (SH_C)</button>
                <button onClick={() => setCurrentPage('vehicles')}>차량 (SH_CC)</button>
                <button onClick={() => setCurrentPage('airport')}>공항 (SH_P)</button>
                <button onClick={() => setCurrentPage('tours')}>투어 (SH_T)</button>
                <button onClick={() => setCurrentPage('hotels')}>호텔 (SH_H)</button>
                <button onClick={() => setCurrentPage('rentals')}>렌트카 (SH_RC)</button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;

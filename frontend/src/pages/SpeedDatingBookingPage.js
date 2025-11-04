import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { addSpeedDatingBooking } from '../services/bookingStorage';

function SpeedDatingBookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const showcase = location.state?.showcase || { title: "공연 제목", id: 1 };
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [language, setLanguage] = useState('ko');

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const text = {
    ko: {
      back: "← 뒤로",
      speedDatingBooking: "PAMS Speed Dating 예약",
      bookingSubtitle: "한국 공연 관계자들과의 빠른 미팅 시간을 선택해주세요",
      whatIsSpeedDating: "Speed Dating이란?",
      speedDatingDescription: "각 세션당 30분 동안 6명의 한국 공연 제작사, 극장, 페스티벌 관계자들과 순차적으로 미팅을 진행합니다. 효율적으로 많은 관계자들과 네트워킹할 수 있는 기회입니다.",
      closed: "마감",
      spotsLeft: "자리 남음",
      whatToExpect: "무엇을 기대할 수 있나요?",
      expectation1: "한국 공연계 주요 관계자들과의 직접 미팅",
      expectation2: "각 미팅당 5분씩 총 30분간 진행",
      expectation3: "공연 소개 자료 및 명함 교환",
      expectation4: "향후 협업 가능성 탐색",
      expectation5: "한국 공연 시장 인사이트 획득",
      dashboard: "대시보드",
      confirmBooking: "예약 확인",
      bookingSuccess: "Speed Dating 세션이 예약되었습니다!\n대시보드에서 확인하실 수 있습니다.",
      bookingError: "예약 저장 중 오류가 발생했습니다. 다시 시도해주세요.",
      langToggle: "EN"
    },
    en: {
      back: "← Back",
      speedDatingBooking: "PAMS Speed Dating Booking",
      bookingSubtitle: "Select your preferred quick meeting time with Korean performing arts professionals",
      whatIsSpeedDating: "What is Speed Dating?",
      speedDatingDescription: "Each session lasts 30 minutes where you will meet sequentially with 6 representatives from Korean performance production companies, theaters, and festivals. This is an efficient opportunity to network with many professionals.",
      closed: "Closed",
      spotsLeft: "spots left",
      whatToExpect: "What can you expect?",
      expectation1: "Direct meetings with key Korean performing arts professionals",
      expectation2: "5 minutes per meeting, total 30 minutes per session",
      expectation3: "Exchange of performance materials and business cards",
      expectation4: "Exploration of future collaboration possibilities",
      expectation5: "Insights into the Korean performing arts market",
      dashboard: "Dashboard",
      confirmBooking: "Confirm Booking",
      bookingSuccess: "Speed Dating session has been booked!\nYou can check it in your dashboard.",
      bookingError: "An error occurred while saving the booking. Please try again.",
      langToggle: "KO"
    }
  };

  const currentText = text[language];

  // Mock speed dating sessions data
  const sessions = [
    {
      id: 1,
      date: '2024-10-15',
      time: '10:00-11:00',
      session: 'Session A',
      venue: '1F, Terrace at Haeoreum Theater (NTOK)',
      capacity: 30,
      booked: 12,
      status: 'available'
    },
    {
      id: 2,
      date: '2024-10-15',
      time: '14:00-15:00',
      session: 'Session B',
      venue: '1F, Terrace at Haeoreum Theater (NTOK)',
      capacity: 30,
      booked: 25,
      status: 'available'
    },
    {
      id: 3,
      date: '2024-10-16',
      time: '11:00-12:00',
      session: 'Session C',
      venue: '1F, Terrace at Haeoreum Theater (NTOK)',
      capacity: 25,
      booked: 20,
      status: 'available'
    },
    {
      id: 4,
      date: '2024-10-16',
      time: '15:00-16:00',
      session: 'Session D',
      venue: '1F, Terrace at Haeoreum Theater (NTOK)',
      capacity: 30,
      booked: 30,
      status: 'full'
    },
    {
      id: 5,
      date: '2024-10-17',
      time: '10:00-11:00',
      session: 'Session E',
      venue: '1F, Terrace at Haeoreum Theater (NTOK)',
      capacity: 25,
      booked: 8,
      status: 'available'
    },
    {
      id: 6,
      date: '2024-10-17',
      time: '14:00-15:00',
      session: 'Session F',
      venue: '1F, Terrace at Haeoreum Theater (NTOK)',
      capacity: 30,
      booked: 18,
      status: 'available'
    }
  ];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const getAvailabilityColor = (booked, capacity) => {
    const ratio = booked / capacity;
    if (ratio >= 1) return '#dc2626'; // Full
    if (ratio >= 0.8) return '#f59e0b'; // Almost full
    return '#10b981'; // Available
  };

  const handleSlotSelect = (session) => {
    if (session.status === 'full') return;
    setSelectedSlot(session);
  };

  const handleBooking = () => {
    if (!selectedSlot) return;

    try {
      // Save booking to localStorage
      const booking = addSpeedDatingBooking(selectedSlot);

      alert(`${selectedSlot.date} ${selectedSlot.time} ${currentText.bookingSuccess}`);

      // Navigate to dashboard after booking
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error saving speed dating booking:', error);
      alert(currentText.bookingError);
    }
  };

  return (
    <div className="screen">
      {/* Header */}
      <div className="header">
        <div className="logo">
          <Link to="/">
            <img src="/assets/images/PAMS_Logo.png" alt="PAMS" className="logo-img"/>
          </Link>
        </div>
        <div className="nav-buttons">
          <Link to="/" className="nav-btn">HOME</Link>
          <Link to="/matching" className="nav-btn">MATCHING</Link>
          <button onClick={toggleLanguage} className="lang-toggle">
            {currentText.langToggle}
          </button>
        </div>
      </div>

      <div className="content">
        <div className="page-header">
          <Link to={`/showcase/${showcase.id}`} className="btn secondary">
            {currentText.back}
          </Link>
          <div className="header-text">
            <h1>{currentText.speedDatingBooking}</h1>
            <p>{currentText.bookingSubtitle}</p>
          </div>
        </div>

        {/* Speed Dating Info */}
        <div className="speed-dating-info">
          <h4>{currentText.whatIsSpeedDating}</h4>
          <p>
            {currentText.speedDatingDescription}
          </p>
        </div>

        {/* Time Grid */}
        <div className="time-grid">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`time-slot ${selectedSlot?.id === session.id ? 'selected' : ''} ${session.status === 'full' ? 'disabled' : ''}`}
              onClick={() => handleSlotSelect(session)}
            >
              <div className="slot-header">
                <div className="slot-session">{session.session}</div>
                <div className="slot-date">{formatDate(session.date)}</div>
              </div>
              <div className="slot-time">{session.time}</div>
              <div className="slot-venue">{session.venue}</div>
              <div className="slot-availability">
                <div
                  className="availability-indicator"
                  style={{
                    backgroundColor: getAvailabilityColor(session.booked, session.capacity)
                  }}
                />
                <span className="availability-text">
                  {session.booked}/{session.capacity}
                  {session.status === 'full' ? ` (${currentText.closed})` : ` (${session.capacity - session.booked} ${currentText.spotsLeft})`}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* What to Expect */}
        <div className="expectations-info">
          <h4>{currentText.whatToExpect}</h4>
          <ul>
            <li>{currentText.expectation1}</li>
            <li>{currentText.expectation2}</li>
            <li>{currentText.expectation3}</li>
            <li>{currentText.expectation4}</li>
            <li>{currentText.expectation5}</li>
          </ul>
        </div>

        {/* Booking Actions */}
        <div className="form-actions">
          <Link to="/dashboard" className="btn secondary">
            {currentText.dashboard}
          </Link>
          <button
            className={`btn ${!selectedSlot ? 'disabled' : ''}`}
            onClick={handleBooking}
            disabled={!selectedSlot}
          >
            {currentText.confirmBooking}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SpeedDatingBookingPage;
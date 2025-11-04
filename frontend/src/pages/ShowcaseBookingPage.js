import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { addShowcaseBooking } from '../services/bookingStorage';

function ShowcaseBookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const showcase = location.state?.showcase || {
    id: 1,
    title: "드럼의 꿈",
    artist: "갬블러즈 크루 x 고블린 파티",
    duration: "40분",
    genre: "무용, 쇼케이스"
  };

  const [selectedSession, setSelectedSession] = useState(null);
  const [language, setLanguage] = useState('ko');

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const text = {
    ko: {
      back: "← 뒤로",
      showcaseBooking: "쇼케이스 예약",
      bookingSubtitle: "원하는 쇼케이스 시간을 선택해주세요",
      full: "매진",
      venueInfo: "공연장 정보",
      venueName: "아르코예술극장",
      venueAddress: "서울시 중구 동호로 3길 54",
      venueDirection: "지하철 3호선 동대입구역 1번 출구 도보 5분",
      dashboard: "대시보드",
      book: "예약",
      bookingSuccess: "세션이 예약되었습니다!\n대시보드에서 확인하실 수 있습니다.",
      bookingError: "예약 저장 중 오류가 발생했습니다. 다시 시도해주세요.",
      langToggle: "EN"
    },
    en: {
      back: "← Back",
      showcaseBooking: "Showcase Booking",
      bookingSubtitle: "Please select your preferred showcase time",
      full: "Sold Out",
      venueInfo: "Venue Information",
      venueName: "Arko Arts Theater",
      venueAddress: "54 Dongho-ro 3-gil, Jung-gu, Seoul",
      venueDirection: "5 minutes walk from Exit 1 of Dongguk Univ. Station (Line 3)",
      dashboard: "Dashboard",
      book: "Book",
      bookingSuccess: "Session has been booked!\nYou can check it in your dashboard.",
      bookingError: "An error occurred while saving the booking. Please try again.",
      langToggle: "KO"
    }
  };

  const currentText = text[language];

  // Mock session data
  const sessions = [
    { id: 1, date: '2024-10-15', time: '14:00-15:00', venue: '대극장', capacity: 200, booked: 150, status: 'available' },
    { id: 2, date: '2024-10-15', time: '16:00-17:00', venue: '대극장', capacity: 200, booked: 180, status: 'available' },
    { id: 3, date: '2024-10-16', time: '10:00-11:00', venue: '소극장', capacity: 100, booked: 85, status: 'available' },
    { id: 4, date: '2024-10-16', time: '14:00-15:00', venue: '대극장', capacity: 200, booked: 200, status: 'full' },
    { id: 5, date: '2024-10-17', time: '11:00-12:00', venue: '소극장', capacity: 100, booked: 60, status: 'available' },
    { id: 6, date: '2024-10-17', time: '15:00-16:00', venue: '대극장', capacity: 200, booked: 120, status: 'available' }
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

  const getPosterImage = (title) => {
    console.log(`[ShowcaseBookingPage] Looking for poster for: "${title}"`);

    const posterMap = {
      "The Drum's Dream": "The Drum's Dream_poster.jpg",
      'The Drum\'s Dream': "The Drum's Dream_poster.jpg",
      "동네북": "The Drum's Dream_poster.jpg",
      "Aesthetic Flow": "Aesthetic Flow_Poster.jpg",
      "SHIMMERING": "Shimmering_poster.jpg",
      "Lee Jaram Pansori 'Snow, Snow, Snow'": "Lee Jaram Pansori 'Snow, Snow, Snow_poster.jpg",
      "이자람 판소리 '눈설眼雪설雪'": "Lee Jaram Pansori 'Snow, Snow, Snow_poster.jpg",
      "in:out": "in-out_poster.jpg",
      "Your Symptoms": "Your Symptoms_poster.jpg",
      "Gyogam(Access)": "Gyogam_poster.jpg",
      "Between Glances: A Symphony of the Unsaid": "Between Glances- A Symphony of the Unsaid_poster.jpg",
      "Yeonhee Physics: The Quantum Ritual": "Yeonhee Physics- The Quantum Ritual_poster.jpg",
      "OffOn Yeonhee project II": "OffOn Yeonhee Project II_poster.jpg",
      "Next Journey": "Next Journey_poster.jpg",
      "BARCODE": "BARCODE_poster.jpg",
      "Mr. Nobody: The wanpan Edition of Sledgehammer Mr. Baek's Journal": "Mr. Nobody- The wanpan Edition of Sledgehammer Mr. Baek's Journal_poster.jpg",
      "The Wanpan Edition of Sledgehammer Mr. Baek's Journal": "Mr. Nobody- The wanpan Edition of Sledgehammer Mr. Baek's Journal_poster.jpg",
      "큰머리 백씨 일기의 완판본 미스터 노바디": "Mr. Nobody- The wanpan Edition of Sledgehammer Mr. Baek's Journal_poster.jpg",
      "Light Trees": "Light Trees_poster.jpg",
      "Yutnori: The Game That Nobody Plays These Day": "Yutnori- The Game That Nobody Plays These Day_poster.jpg",
      "Yutnori: The Game That Nobody Plays These Days": "Yutnori- The Game That Nobody Plays These Day_poster.jpg",
      "Chair,Table,Chair": "Chair,Table,Chair_poster.jpg",
      "Not of This World": "Not of This World_poster.jpg",
      "Swipe!": "Swipe!_poster.jpg",
      "Gyogam": "Gyogam_poster.jpg",
      "OffOn Yeonhee Project II": "OffOn Yeonhee Project II_poster.jpg"
    };

    let posterFile = posterMap[title];

    if (!posterFile) {
      for (const [key, value] of Object.entries(posterMap)) {
        if (title.includes(key) || key.includes(title)) {
          posterFile = value;
          break;
        }
      }
    }

    if (!posterFile) {
      for (const [key, value] of Object.entries(posterMap)) {
        if (title.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(title.toLowerCase())) {
          posterFile = value;
          break;
        }
      }
    }

    if (!posterFile) {
      if (title.toLowerCase().includes('drum') || title.includes('동네북')) {
        posterFile = "The Drum's Dream_poster.jpg";
      } else if (title.toLowerCase().includes('snow') || title.includes('눈') || title.includes('설')) {
        posterFile = "Lee Jaram Pansori 'Snow, Snow, Snow_poster.jpg";
      } else if (title.toLowerCase().includes('baek') || title.includes('백') || title.toLowerCase().includes('nobody') || title.includes('노바디')) {
        posterFile = "Mr. Nobody- The wanpan Edition of Sledgehammer Mr. Baek's Journal_poster.jpg";
      }
    }

    if (posterFile) {
      const posterUrl = `/assets/posters/${encodeURIComponent(posterFile)}`;
      console.log(`[ShowcaseBookingPage] Returning poster URL: ${posterUrl}`);
      return posterUrl;
    }

    console.log(`[ShowcaseBookingPage] No poster found for: "${title}"`);
    return null;
  };

  const handleSessionSelect = (session) => {
    if (session.status === 'full') return;
    setSelectedSession(session);
  };

  const handleBooking = () => {
    if (!selectedSession) return;

    try {
      // Save booking to localStorage
      const booking = addShowcaseBooking(showcase, selectedSession);

      alert(`${selectedSession.date} ${selectedSession.time} ${currentText.bookingSuccess}`);

      // Navigate to dashboard after booking
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error saving booking:', error);
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
          <Link to={`/showcase/${showcase.id || '1'}`} className="btn secondary">
            {currentText.back}
          </Link>
          <div className="header-text">
            <h1>{currentText.showcaseBooking}</h1>
            <p>{currentText.bookingSubtitle}</p>
          </div>
        </div>

        {/* Performance Info */}
        <div
          className="performance-info-card"
          style={{
            '--poster-image': getPosterImage(showcase.title) ? `url(${getPosterImage(showcase.title)})` : 'none'
          }}
        >
          <div className="show-details">
            <h3>{showcase.title}</h3>
            <p className="show-company">{showcase.artist}</p>
            <p className="show-meta">{showcase.duration} • {showcase.genre}</p>
          </div>
        </div>

        {/* Sessions Grid */}
        <div className="sessions-grid">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`session-card ${selectedSession?.id === session.id ? 'selected' : ''} ${session.status === 'full' ? 'disabled' : ''}`}
              onClick={() => handleSessionSelect(session)}
            >
              <div className="session-date">{formatDate(session.date)}</div>
              <div className="session-time">{session.time}</div>
              <div className="session-venue">{session.venue}</div>
              <div className="session-availability">
                <div
                  className="availability-bar"
                  style={{
                    backgroundColor: getAvailabilityColor(session.booked, session.capacity),
                    width: `${(session.booked / session.capacity) * 100}%`
                  }}
                />
                <span className="availability-text">
                  {session.booked}/{session.capacity}
                  {session.status === 'full' ? ` (${currentText.full})` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Venue Information */}
        <div className="venue-info">
          <h4>{currentText.venueInfo}</h4>
          <div className="venue-card">
            <div className="venue-icon">📍</div>
            <div className="venue-details">
              <h5>{currentText.venueName}</h5>
              <p>{currentText.venueAddress}</p>
              <p>{currentText.venueDirection}</p>
            </div>
          </div>
        </div>

        {/* Booking Actions */}
        <div className="form-actions">
          <Link to="/dashboard" className="btn secondary">
            {currentText.dashboard}
          </Link>
          <button
            className={`btn ${!selectedSession ? 'disabled' : ''}`}
            onClick={handleBooking}
            disabled={!selectedSession}
          >
            {currentText.book}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShowcaseBookingPage;
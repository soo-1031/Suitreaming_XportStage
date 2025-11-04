import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ROICalculator from '../components/ROICalculator';
import {
  getShowcaseBookings,
  getSpeedDatingBookings,
  getProposals,
  formatBookingDate,
  formatBookingDateTime
} from '../services/bookingStorage';

function MyDashboardPage() {
  const [language, setLanguage] = useState('ko');
  const [scheduleData, setScheduleData] = useState([]);
  const [proposalData, setProposalData] = useState([]);

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const text = {
    ko: {
      title: "나의 대시보드",
      subtitle: "나의 예약 현황과 제안서 내역을 확인하세요",
      pamsSchedule: "PAMS 일정표",
      proposalList: "제안서 목록",
      roiCalculator: "ROI 간편 계산기",
      betaNotice: "⚠️ 베타 기능 안내",
      betaDescription: "이 기능은 개발 중인 베타 버전입니다. 실제 투자 결정에 사용하지 마시고 참고용으로만 활용해주세요.",
      viewAllShows: "전체 공연 보기",
      toMain: "메인으로",
      langToggle: "EN",
      date: "날짜",
      time: "시간",
      activity: "활동",
      venue: "장소",
      status: "상태",
      rating: "평가",
      manage: "관리",
      title: "제목",
      recipient: "받는 사람",
      amount: "금액",
      sentDate: "전송일",
      completed: "완료",
      pending: "대기중",
      confirmed: "확정"
    },
    en: {
      title: "My Dashboard",
      subtitle: "Check your booking status and proposal history",
      pamsSchedule: "PAMS Schedule",
      proposalList: "Proposal List",
      roiCalculator: "ROI Quick Calculator",
      betaNotice: "⚠️ Beta Feature Notice",
      betaDescription: "This is a beta feature under development. Do not use for actual investment decisions - for reference only.",
      viewAllShows: "View All Shows",
      toMain: "To Main",
      langToggle: "KO",
      date: "Date",
      time: "Time",
      activity: "Activity",
      venue: "Venue",
      status: "Status",
      rating: "Rating",
      manage: "Manage",
      title: "Title",
      recipient: "Recipient",
      amount: "Amount",
      sentDate: "Sent Date",
      completed: "Completed",
      pending: "Pending",
      confirmed: "Confirmed"
    }
  };

  const currentText = text[language];

  // Load real data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        // Get bookings from localStorage
        const showcaseBookings = getShowcaseBookings();
        const speedDatingBookings = getSpeedDatingBookings();
        const proposals = getProposals();

        // Convert showcase bookings to schedule format
        const showcaseSchedule = showcaseBookings.map(booking => ({
          id: booking.id,
          date: booking.session.date,
          time: booking.session.time,
          activity: `${booking.showcase.title} 쇼케이스`,
          venue: booking.session.venue,
          status: "confirmed",
          rating: null,
          type: 'showcase'
        }));

        // Convert speed dating bookings to schedule format
        const speedDatingSchedule = speedDatingBookings.map(booking => ({
          id: booking.id,
          date: booking.session.date,
          time: booking.session.time,
          activity: `PAMS Speed Dating (${booking.session.session})`,
          venue: booking.session.venue,
          status: "confirmed",
          rating: null,
          type: 'speed-dating'
        }));

        // Combine all schedule items and sort by date
        const allSchedule = [...showcaseSchedule, ...speedDatingSchedule]
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setScheduleData(allSchedule);

        // Convert proposals to display format
        const proposalList = proposals.map(proposal => ({
          id: proposal.id,
          title: `${proposal.showcase.title} 제안서`,
          recipient: proposal.bookerInfo.company || proposal.venueInfo.name || "미정",
          amount: proposal.performanceDetails.ticketPrice ?
            `$${proposal.performanceDetails.ticketPrice}` : "협의",
          sentDate: formatBookingDate(proposal.generatedAt),
          status: proposal.status
        }));

        setProposalData(proposalList);

      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to empty arrays if there's an error
        setScheduleData([]);
        setProposalData([]);
      }
    };

    loadData();

    // Listen for storage changes (when bookings are made in other tabs)
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'confirmed': return '#007bff';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return currentText.completed;
      case 'confirmed': return currentText.confirmed;
      case 'pending': return currentText.pending;
      default: return status;
    }
  };

  const renderStars = (rating) => {
    if (!rating) return '-';
    return '★'.repeat(Math.floor(rating)) + (rating % 1 ? '☆' : '');
  };

  return (
    <div className="screen" id="myDashboard">
      <div className="header">
        <div className="logo" onClick={() => window.location.href = '/'}>
          <img src="/assets/images/PAMS_Logo.png" alt="PAMS 2025" style={{height: '32px', width: 'auto'}} />
        </div>
        <div className="nav-buttons">
          <button className="lang-toggle" onClick={toggleLanguage}>
            <span>{currentText.langToggle}</span>
          </button>
          <Link to="/showcases" className="btn secondary">
            <span>{currentText.viewAllShows}</span>
          </Link>
          <Link to="/" className="btn secondary">
            <span>{currentText.toMain}</span>
          </Link>
        </div>
      </div>

      <h2>
        <span>{currentText.title}</span>
      </h2>
      <p style={{marginBottom: '30px', color: '#666'}}>
        <span>{currentText.subtitle}</span>
      </p>

      {/* PAMS 일정표 */}
      <div className="card">
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="2" style={{marginRight: '8px', verticalAlign: 'text-top'}}>
            <path d="M9.5 4h5l1.5 2-1.5 2h-5l-1.5-2 1.5-2z"></path>
            <path d="M4 14a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5z"></path>
            <line x1="2" y1="14" x2="22" y2="14"></line>
          </svg>
          <span>{currentText.pamsSchedule}</span>
        </div>
        <div className="schedule-container">
          <div className="schedule-header">
            <div className="schedule-header-item"><span>{currentText.date}</span></div>
            <div className="schedule-header-item"><span>{currentText.time}</span></div>
            <div className="schedule-header-item"><span>{currentText.activity}</span></div>
            <div className="schedule-header-item"><span>{currentText.venue}</span></div>
            <div className="schedule-header-item"><span>{currentText.status}</span></div>
            <div className="schedule-header-item"><span>{currentText.rating}</span></div>
            <div className="schedule-header-item"><span>{currentText.manage}</span></div>
          </div>
          <div id="scheduleList">
            {scheduleData.length > 0 ? (
              scheduleData.map((item, index) => (
                <div key={index} className="schedule-item">
                  <div className="schedule-item-cell">{item.date}</div>
                  <div className="schedule-item-cell">{item.time}</div>
                  <div className="schedule-item-cell">{item.activity}</div>
                  <div className="schedule-item-cell">{item.venue}</div>
                  <div className="schedule-item-cell">
                    <span style={{
                      color: getStatusColor(item.status),
                      fontWeight: '500'
                    }}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                  <div className="schedule-item-cell">{renderStars(item.rating)}</div>
                  <div className="schedule-item-cell">
                    <button className="btn small">상세</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>아직 예약된 일정이 없습니다.</p>
                <p>
                  <Link to="/matching" className="btn">매칭 시작하기</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 제안서 목록 */}
      <div className="card" style={{marginTop: '30px'}}>
        <div className="card-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="2" style={{marginRight: '8px', verticalAlign: 'text-top'}}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
          <span>{currentText.proposalList}</span>
        </div>
        <div className="schedule-container">
          <div className="schedule-header proposal-header">
            <div className="schedule-header-item"><span>{currentText.title}</span></div>
            <div className="schedule-header-item"><span>{currentText.recipient}</span></div>
            <div className="schedule-header-item"><span>{currentText.amount}</span></div>
            <div className="schedule-header-item"><span>{currentText.sentDate}</span></div>
            <div className="schedule-header-item"><span>{currentText.manage}</span></div>
          </div>
          <div id="proposalList">
            {proposalData.length > 0 ? (
              proposalData.map((item, index) => (
                <div key={index} className="schedule-item proposal-item">
                  <div className="schedule-item-cell">{item.title}</div>
                  <div className="schedule-item-cell">{item.recipient}</div>
                  <div className="schedule-item-cell">{item.amount}</div>
                  <div className="schedule-item-cell">{item.sentDate}</div>
                  <div className="schedule-item-cell">
                    <button className="btn small">보기</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>생성된 제안서가 없습니다.</p>
                <p>
                  <Link to="/showcases" className="btn">공연 탐색하기</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROI 간편 계산기 (BETA) */}
      <div className="card" id="roiAnalysisCard" style={{marginTop: '30px'}}>
        <div className="card-title">
          💰 <span>{currentText.roiCalculator}</span>
          <span className="beta-tag">BETA</span>
          <span style={{fontSize: '11px', color: '#666', marginLeft: '10px'}}>
            <span>※ 완전 베타 버전 - 참고용만</span>
          </span>
        </div>
        {/* 베타 경고 박스 */}
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeeba',
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '4px'
        }}>
          <div style={{fontSize: '12px', color: '#856404', fontWeight: '500'}}>
            <span>{currentText.betaNotice}</span>
          </div>
          <div style={{fontSize: '11px', color: '#856404', marginTop: '4px', lineHeight: '1.4'}}>
            <span>{currentText.betaDescription}</span>
          </div>
        </div>

        {/* ROI 계산기 입력 폼 */}
        <ROICalculator language={language} />
      </div>
    </div>
  );
}

export default MyDashboardPage;
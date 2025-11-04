import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  const [language, setLanguage] = useState('ko');

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const text = {
    ko: {
      title: "당신의 무대를 위한 한국 공연을 만나보세요",
      subtitle: "맞춤형 추천 · 시장 트렌드 · 즉시 공유 제안서",
      trendsTitle: "국내 공연 트렌드",
      trendsDesc: "KOPIS 빅데이터 기반 실시간 공연계 동향과 인사이트를 확인하세요",
      trendsFeatures: "• 장르별 관객 선호도 분석\n• 시즌별 예매 트렌드\n• 해외 진출 성공 케이스",
      getStarted: "시작하기",
      dashboard: "대시보드",
      langToggle: "EN"
    },
    en: {
      title: "Discover Korea's Performing Arts",
      subtitle: "Tailored Recommendations · Market Trends · Ready-to-Send Proposals",
      trendsTitle: "Korean Performance Trends",
      trendsDesc: "Discover real-time performing arts trends and insights based on KOPIS big data",
      trendsFeatures: "• Genre preference analysis\n• Seasonal booking trends\n• International success cases",
      getStarted: "Get Started",
      dashboard: "Dashboard",
      langToggle: "KO"
    }
  };

  const currentText = text[language];

  return (
    <div className="landing-page">
      <div className="header">
        <div className="logo" onClick={() => window.location.href = '/'}>
          <img src="/assets/images/PAMS_Logo.png" alt="PAMS 2025" style={{height: '32px', width: 'auto'}} />
        </div>
        <div className="nav-buttons">
          <button className="lang-toggle" onClick={toggleLanguage}>
            {currentText.langToggle}
          </button>
          <Link to="/matching" className="btn secondary">
            {currentText.getStarted}
          </Link>
          <Link to="/dashboard" className="btn">
            {currentText.dashboard}
          </Link>
        </div>
      </div>

      <div className="hero" style={{
        position: 'relative',
        backgroundImage: 'url("/assets/images/PAMS_poster.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: window.innerWidth <= 968 ? '0 20px' : '0 60px'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1
        }}></div>
        <div style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          color: 'white'
        }}>
          <h1 style={{
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            marginBottom: '20px',
            fontSize: '48px',
            fontWeight: '700'
          }}>
            {currentText.title}
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            fontSize: '18px'
          }}>
            {currentText.subtitle}
          </p>
        </div>
      </div>

      <div className="features-grid">
        <Link to="/analysis" className="feature-card trend-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="feature-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <h3>{currentText.trendsTitle}</h3>
          <p>{currentText.trendsDesc}</p>
          <div className="feature-list">
            {currentText.trendsFeatures.split('\n').map((feature, index) => (
              <div key={index}>{feature}</div>
            ))}
          </div>
        </Link>

        <Link to="/matching" className="feature-card matching-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="feature-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="6"></circle>
              <circle cx="12" cy="12" r="2"></circle>
            </svg>
          </div>
          <h3>
            {language === 'ko' ? '맞춤 공연 추천' : 'Personalized Recommendations'}
          </h3>
          <p>
            {language === 'ko'
              ? 'AI 추천으로 취향에 꼭 맞는 공연을 찾아 바로 예약하세요.'
              : 'Discover your perfect performance matches analyzed by AI and book instantly'
            }
          </p>
          <div className="feature-list">
            <div>
              {language === 'ko' ? '• 5분 설문으로 정확한 분석' : '• Precise analysis with 5-min survey'}
            </div>
            <div>
              {language === 'ko' ? '• 200+ 프리미엄 공연' : '• 200+ premium performances'}
            </div>
            <div>
              {language === 'ko' ? '• 원클릭 미팅 예약' : '• One-click meeting booking'}
            </div>
          </div>
        </Link>
      </div>

      {/* PAMS 2025 Service Flow */}
      <div className="service-flow-section">
        <div className="service-flow-header">
          <h2>
            {language === 'ko' ? 'PAMS 2025 Service Flow' : 'PAMS 2025 Service Flow'}
          </h2>
          <p>
            {language === 'ko'
              ? '공연예술 추천부터 예약까지, 한번에 경험하는 통합 플랫폼'
              : 'From performing arts recommendations to booking, integrated platform experience'
            }
          </p>
        </div>

        <div className="service-flow-container">
          {/* Top Branch: Trend Analysis */}
          <div className="trend-analysis-branch">
            <div className="flow-card trend-card" onClick={() => window.location.href = '/analysis'}>
              <div className="card-icon">
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="2.5">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
                </svg>
              </div>
              <h4>{language === 'ko' ? '국내 공연 트렌드' : 'Korean Performance Trends'}</h4>
              <p>{language === 'ko' ? 'KOPIS 빅데이터 분석' : 'KOPIS Big Data Analysis'}</p>
            </div>
          </div>

          {/* Main Flow */}
          <div className="main-flow">
            {/* Step 1: Survey */}
            <div className="flow-step">
              <div className="step-card" onClick={() => window.location.href = '/matching'}>
                <div className="step-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                  </svg>
                </div>
                <h4>{language === 'ko' ? '설문 조사' : 'Survey'}</h4>
                <p>{language === 'ko' ? '극장 정보 & 선호도' : 'Theater Info & Preferences'}</p>
              </div>
            </div>

            {/* Arrow 1 */}
            <div className="flow-arrow">
              <div className="arrow-line"></div>
              <div className="arrow-head"></div>
            </div>

            {/* Step 2: AI Recommendation - EMPHASIZED */}
            <div className="flow-step emphasized">
              <div className="step-card ai-card">
                <div className="step-icon ai-icon">
                  <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="2.8">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-6.5-4.24 4.24M7.76 7.76l-4.24-4.24m0 12.48 4.24-4.24m8.48 8.48 4.24-4.24"></path>
                  </svg>
                </div>
                <h4>{language === 'ko' ? 'AI 추천' : 'AI Recommendation'}</h4>
                <p>{language === 'ko' ? '맞춤형 공연 매칭' : 'Personalized Performance Matching'}</p>
              </div>
            </div>

            {/* Arrow 2 */}
            <div className="flow-arrow">
              <div className="arrow-line"></div>
              <div className="arrow-head"></div>
            </div>

            {/* Step 3: Performance Details */}
            <div className="flow-step">
              <div className="step-card">
                <div className="step-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2c2c2c" strokeWidth="2.5">
                    <path d="M2 3h20v18H2z"></path>
                    <circle cx="12" cy="12" r="4"></circle>
                    <path d="M12 8v8M8 12h8"></path>
                  </svg>
                </div>
                <h4>{language === 'ko' ? '공연 상세' : 'Performance Details'}</h4>
                <p>{language === 'ko' ? '아티스트 & 일정 정보' : 'Artist & Schedule Info'}</p>
              </div>
            </div>

            {/* Arrow 3 */}
            <div className="flow-arrow">
              <div className="arrow-line"></div>
              <div className="arrow-head"></div>
            </div>

            {/* Step 4: Booking & Proposal */}
            <div className="flow-step">
              <div className="step-card final-card">
                <div className="step-icon final-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                  </svg>
                </div>
                <h4>{language === 'ko' ? '예약 & Proposal' : 'Booking & Proposal'}</h4>
                <p>{language === 'ko' ? '쇼케이스 예약 및 제안서' : 'Showcase Booking & Proposals'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
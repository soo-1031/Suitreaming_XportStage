import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ShowcaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showcase, setShowcase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('artist');
  const [language, setLanguage] = useState('ko');

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const text = {
    ko: {
      loading: "쇼케이스 정보를 불러오는 중...",
      error: "에러: ",
      notFound: "쇼케이스를 찾을 수 없습니다",
      posterAlt: "포스터",
      posterPlaceholder: "포스터 이미지",
      genre: "장르:",
      venue: "공연장:",
      performanceDate: "공연 날짜:",
      performanceTime: "공연 시간:",
      duration: "공연 길이:",
      director: "연출:",
      cast: "출연진:",
      showcaseBooking: "쇼케이스 예약",
      speedDating: "PAMS Speed Dating",
      generateProposal: "Generate Proposal",
      artist: "아티스트",
      review: "Review/후기",
      artistIntro: "아티스트 소개",
      tourInfo: "투어 정보",
      tourSize: "투어 규모:",
      performersCount: "공연자 수:",
      staffCount: "스태프 수:",
      people: "명",
      contact: "연락처",
      contactPerson: "담당자:",
      email: "이메일:",
      noReview: "아직 리뷰가 없습니다.",
      langToggle: "EN"
    },
    en: {
      loading: "Loading showcase information...",
      error: "Error: ",
      notFound: "Showcase not found",
      posterAlt: "Poster",
      posterPlaceholder: "Poster Image",
      genre: "Genre:",
      venue: "Venue:",
      performanceDate: "Performance Date:",
      performanceTime: "Performance Time:",
      duration: "Duration:",
      director: "Director:",
      cast: "Cast:",
      showcaseBooking: "Book Showcase",
      speedDating: "PAMS Speed Dating",
      generateProposal: "Generate Proposal",
      artist: "Artist",
      review: "Review",
      artistIntro: "Artist Introduction",
      tourInfo: "Tour Information",
      tourSize: "Tour Size:",
      performersCount: "Performers Count:",
      staffCount: "Staff Count:",
      people: "people",
      contact: "Contact",
      contactPerson: "Contact Person:",
      email: "Email:",
      noReview: "No reviews yet.",
      langToggle: "KO"
    }
  };

  const currentText = text[language];

  useEffect(() => {
    if (id) {
      fetchShowcaseDetail();
    }
  }, [id]);

  const fetchShowcaseDetail = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/api/showcases/${id}`);
      setShowcase(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowcaseBooking = () => {
    navigate(`/showcase/${id}/booking`, {
      state: { showcase }
    });
  };

  const handleSpeedDating = () => {
    navigate(`/showcase/${id}/speed-dating`, {
      state: { showcase }
    });
  };

  const handleGenerateProposal = () => {
    navigate(`/showcase/${id}/proposal`, {
      state: { showcase }
    });
  };

  const getPosterImage = (title) => {
    console.log(`[ShowcaseDetailPage] Looking for poster for: "${title}"`);

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
      console.log(`[ShowcaseDetailPage] Returning poster URL: ${posterUrl}`);
      return posterUrl;
    }

    console.log(`[ShowcaseDetailPage] No poster found for: "${title}"`);
    return null;
  };




  if (loading) return <div className="loading">{currentText.loading}</div>;
  if (error) return <div className="error">{currentText.error}{error}</div>;
  if (!showcase) return <div className="error">{currentText.notFound}</div>;

  return (
    <div className="screen showcase-detail-screen">
      {/* Header */}
      <div className="header">
        <div className="logo">
          <Link to="/">
            <img src="/assets/images/PAMS_Logo.png" alt="PAMS" className="logo-img"/>
          </Link>
        </div>
        <div className="nav-buttons">
          <Link to="/" className="nav-btn">HOME</Link>
          <Link to="/recommendation" className="nav-btn">MATCHING</Link>
          <button onClick={toggleLanguage} className="lang-toggle">
            {currentText.langToggle}
          </button>
        </div>
      </div>

      {/* Performance Header */}
      <div className="performance-header">
        <div className="performance-media">
          <div className="performance-posters">
            <div className="poster-main">
              {getPosterImage(showcase.title) ? (
                <img
                  src={getPosterImage(showcase.title)}
                  alt={`${showcase.title} ${currentText.posterAlt}`}
                  className="poster-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="poster-placeholder" style={{display: getPosterImage(showcase.title) ? 'none' : 'flex'}}>
                {currentText.posterPlaceholder}
              </div>
            </div>
          </div>
        </div>

        <div className="performance-info">
          <h1 className="performance-title">{showcase.title}</h1>
          {showcase.artist && (
            <h3 className="performance-company">{showcase.artist}</h3>
          )}

          <div className="performance-meta">
            {showcase.genre && (
              <div className="meta-item">
                <span className="meta-label">{currentText.genre}</span>
                <span className="meta-value">{showcase.genre}</span>
              </div>
            )}
            {showcase.venue && (
              <div className="meta-item">
                <span className="meta-label">{currentText.venue}</span>
                <span className="meta-value">{showcase.venue}</span>
              </div>
            )}
            {showcase.schedule_date && (
              <div className="meta-item">
                <span className="meta-label">{currentText.performanceDate}</span>
                <span className="meta-value">{showcase.schedule_date}</span>
              </div>
            )}
            {showcase.schedule_time && (
              <div className="meta-item">
                <span className="meta-label">{currentText.performanceTime}</span>
                <span className="meta-value">{showcase.schedule_time}</span>
              </div>
            )}
            {showcase.duration && (
              <div className="meta-item">
                <span className="meta-label">{currentText.duration}</span>
                <span className="meta-value">{showcase.duration}</span>
              </div>
            )}
            {showcase.director && (
              <div className="meta-item">
                <span className="meta-label">{currentText.director}</span>
                <span className="meta-value">{showcase.director}</span>
              </div>
            )}
            {showcase.cast && (
              <div className="meta-item full-width">
                <span className="meta-label">{currentText.cast}</span>
                <span className="meta-value">{showcase.cast}</span>
              </div>
            )}
          </div>

          {showcase.introduction && (
            <div className="performance-description">
              {showcase.introduction.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="action-btn primary"
              onClick={() => handleShowcaseBooking()}
            >
              {currentText.showcaseBooking}
            </button>
            <button
              className="action-btn secondary"
              onClick={() => handleSpeedDating()}
            >
              {currentText.speedDating}
            </button>
            <button
              className="action-btn primary"
              onClick={() => handleGenerateProposal()}
            >
              {currentText.generateProposal}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Container */}
      <div className="tab-container">
        <div className="tabs">
          <div
            className={`tab ${activeTab === 'artist' ? 'active' : ''}`}
            onClick={() => setActiveTab('artist')}
          >
            {currentText.artist}
          </div>
          <div
            className={`tab ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            {currentText.review}
          </div>
        </div>

        <div className="tab-content">
          {activeTab === 'artist' && (
            <div className="artist-content">
              {showcase.artist_description && (
                <div className="artist-description">
                  <h3>{currentText.artistIntro}</h3>
                  <div className="description-text">
                    {showcase.artist_description.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* 투어 정보 */}
              <div className="tour-info">
                <h3>{currentText.tourInfo}</h3>
                <div className="tour-details">
                  {showcase.tour_size !== null && showcase.tour_size !== undefined && (
                    <div className="tour-item">
                      <span className="tour-label">{currentText.tourSize}</span>
                      <span className="tour-value">{showcase.tour_size}{currentText.people}</span>
                    </div>
                  )}
                  {showcase.performers_count !== null && showcase.performers_count !== undefined && (
                    <div className="tour-item">
                      <span className="tour-label">{currentText.performersCount}</span>
                      <span className="tour-value">{showcase.performers_count}{currentText.people}</span>
                    </div>
                  )}
                  {showcase.staff_count !== null && showcase.staff_count !== undefined && (
                    <div className="tour-item">
                      <span className="tour-label">{currentText.staffCount}</span>
                      <span className="tour-value">{showcase.staff_count}{currentText.people}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 연락처 정보 */}
              {(showcase.contact_names || showcase.contact_emails) && (
                <div className="contact-info">
                  <h3>{currentText.contact}</h3>
                  <div className="contact-details">
                    {showcase.contact_names && (
                      <div className="contact-item">
                        <span className="contact-label">{currentText.contactPerson}</span>
                        <span className="contact-value">{showcase.contact_names}</span>
                      </div>
                    )}
                    {showcase.contact_emails && (
                      <div className="contact-item">
                        <span className="contact-label">{currentText.email}</span>
                        <span className="contact-value">{showcase.contact_emails}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'review' && (
            <div className="review-content">
              {showcase.review ? (
                <div className="review-text">
                  {showcase.review.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              ) : (
                <div className="no-review">
                  <p>{currentText.noReview}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShowcaseDetailPage;
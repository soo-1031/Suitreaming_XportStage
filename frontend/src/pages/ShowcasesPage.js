import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function ShowcasesPage() {
  const [showcases, setShowcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState([]);
  const [language, setLanguage] = useState('ko');

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const text = {
    ko: {
      showcases: "Showcases",
      subtitle: "AI 기반 공연 매칭 시스템으로 최적의 쇼케이스를 찾아보세요",
      searchPlaceholder: "쇼케이스 제목 또는 공연장 검색...",
      allGenres: "모든 장르",
      createEmbedding: "임베딩 생성",
      noResults: "검색 결과가 없습니다.",
      loading: "쇼케이스 데이터를 불러오는 중...",
      error: "에러: ",
      venue: "공연장:",
      schedule: "일정:",
      price: "가격:",
      viewDetails: "상세보기",
      langToggle: "EN"
    },
    en: {
      showcases: "Showcases",
      subtitle: "Find the optimal showcases with our AI-based performance matching system",
      searchPlaceholder: "Search showcase title or venue...",
      allGenres: "All Genres",
      createEmbedding: "Create Embedding",
      noResults: "No search results found.",
      loading: "Loading showcase data...",
      error: "Error: ",
      venue: "Venue:",
      schedule: "Schedule:",
      price: "Price:",
      viewDetails: "View Details",
      langToggle: "KO"
    }
  };

  const currentText = text[language];

  const getPosterImage = (title) => {
    console.log(`[ShowcasesPage] Looking for poster for: "${title}"`);

    const posterMap = {
      "The Drum's Dream": "The Drum's Dream_poster.jpg",
      'The Drum\'s Dream': "The Drum's Dream_poster.jpg",
      "동네북": "The Drum's Dream_poster.jpg",
      "드럼의 꿈": "The Drum's Dream_poster.jpg",
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
      if (title.toLowerCase().includes('drum') || title.includes('동네북') || title.includes('드럼')) {
        posterFile = "The Drum's Dream_poster.jpg";
      } else if (title.toLowerCase().includes('snow') || title.includes('눈') || title.includes('설')) {
        posterFile = "Lee Jaram Pansori 'Snow, Snow, Snow_poster.jpg";
      } else if (title.toLowerCase().includes('baek') || title.includes('백') || title.toLowerCase().includes('nobody') || title.includes('노바디')) {
        posterFile = "Mr. Nobody- The wanpan Edition of Sledgehammer Mr. Baek's Journal_poster.jpg";
      }
    }

    if (posterFile) {
      const posterUrl = `/assets/posters/${encodeURIComponent(posterFile)}`;
      console.log(`[ShowcasesPage] Returning poster URL: ${posterUrl}`);
      return posterUrl;
    }

    console.log(`[ShowcasesPage] No poster found for: "${title}"`);
    return null;
  };

  useEffect(() => {
    fetchShowcases();
    fetchGenres();
  }, []);

  const fetchShowcases = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/showcases');
      setShowcases(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const data = await api.get('/api/genres');
      setGenres(data.genres || []);
    } catch (err) {
      console.error('Failed to fetch genres:', err);
    }
  };

  const createEmbeddings = async () => {
    try {
      await api.post('/api/showcases/embed', {});
      alert('임베딩 생성이 시작되었습니다. 백그라운드에서 처리됩니다.');
    } catch (err) {
      alert('임베딩 생성 실패: ' + err.message);
    }
  };

  const filteredShowcases = showcases.filter(showcase => {
    const matchesSearch = showcase.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          showcase.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !selectedGenre || showcase.genre?.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  if (loading) return <div className="loading">{currentText.loading}</div>;
  if (error) return <div className="error">{currentText.error}{error}</div>;

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
        <div className="page showcases-page">
      <div className="page-header">
        <h1>{currentText.showcases}</h1>
        <p>{currentText.subtitle}</p>
      </div>

      <div className="controls-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder={currentText.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="genre-select"
          >
            <option value="">{currentText.allGenres}</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
          {/* <button onClick={createEmbeddings} className="btn btn-secondary">
            임베딩 생성
          </button> */}
        </div>
      </div>

      <div className="showcase-grid">
        {filteredShowcases.length === 0 ? (
          <div className="no-results">{currentText.noResults}</div>
        ) : (
          filteredShowcases.map(showcase => {
            const posterUrl = getPosterImage(showcase.title);

            return (
              <div
                key={showcase.id}
                className="showcase-card"
                style={{
                  backgroundImage: posterUrl ? `url(${posterUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className="showcase-overlay"></div>
                <div className="showcase-content">
                  <div className="showcase-header">
                    <h3>{showcase.title}</h3>
                    {showcase.genre && <span className="genre-badge">{showcase.genre}</span>}
                  </div>
                  <div className="showcase-info">
                    {showcase.venue && <p><strong>{currentText.venue}</strong> {showcase.venue}</p>}
                    {showcase.dates && <p><strong>{currentText.schedule}</strong> {showcase.dates}</p>}
                    {showcase.price && <p><strong>{currentText.price}</strong> {showcase.price}</p>}
                    {showcase.rating && (
                      <div className="rating">
                        <span className="stars">{'★'.repeat(Math.floor(showcase.rating))}</span>
                        <span className="rating-value">{showcase.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="showcase-actions">
                    <a href={`/showcase/${showcase.id.toString().replace('pams_', '')}`} className="btn btn-primary btn-sm">
                      {currentText.viewDetails}
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
        </div>
      </div>
    </div>
  );
}

export default ShowcasesPage;
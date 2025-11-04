import React, { useState } from 'react';
import apiService from '../services/api';

function ROICalculator({ language = 'ko' }) {
  const [formData, setFormData] = useState({
    localTicketPrice: '',
    seatsCapacity: '',
    showCount: '1',
    totalCost: ''
  });
  const [results, setResults] = useState(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [kopisData, setKopisData] = useState(null);
  const [isLoadingKopis, setIsLoadingKopis] = useState(false);

  const text = {
    ko: {
      localTicketPrice: "현지 평균 티켓가격 *",
      seatsCapacity: "좌석수(회당) *",
      showCount: "회차수 *",
      totalCost: "총비용 *",
      currency: "원화 기준",
      calculate: "계산하기",
      resultsTitle: "장르별 ROI 분석 결과",
      dataBasedLabel: "데이터 기반",
      genre: "장르",
      kopisIndex: "KOPIS 장르지수",
      expectedOccupancy: "예상 점유율",
      expectedAudience: "예상관객",
      expectedRevenue: "예상매출",
      roi: "ROI",
      genres: {
        dance: "무용",
        music: "음악",
        theater: "연극",
        musical: "뮤지컬"
      },
      fillAllFields: "필수 항목을 모두 입력해주세요",
      methodology: "방법론 & 제한사항 보기",
      methodologyTitle: "계산 방법론 (MVP)",
      dataSource: "데이터 소스",
      dataSourceDesc: "KOPIS Open API prfstsCate: 최근 31일 장르별 관객 점유율(nmrsshr)",
      userInput: "사용자 입력: 현지 평균 티켓가, 좌석수(회당), 회차 수, 총비용",
      calculation: "계산식",
      calculationFormula: "장르지수(KGI) = nmrsshr ÷ 100 (0~1)\n예상 점유율(Occ) = clamp(0.25 + 0.60 × KGI, 0.05, 0.95)\n예) 음악 KGI 0.75 → 0.25 + 0.60 × 0.75 = 0.70 → 70%\n예상 관객수 = 좌석수 × 회차수 × Occ\n예상 매출 = 현지 평균 티켓가 × 예상 관객수\nROI = (예상 매출 − 총비용) ÷ 총비용 × 100%",
      limitationsTitle: "중요 안내 (한계·주의)",
      limitationsDesc: "• 본 추정은 장르 평균 경향(KOPIS)과 사용자 입력값에 기반한 참고 지표입니다.\n• 국가/브랜드 보정은 적용하지 않습니다(베타 이전 단계).\n• 작품별 요소(캐스팅, 마케팅, IP 파워, 기술 요구 등)는 반영되지 않았습니다.\n• KOPIS prfstsCate는 최대 31일 범위이므로, 장기 추세는 구간 합산 또는 최신 31일 기준으로 표시됩니다.\n• API 호출 실패 또는 키 미설정 시 화면에는 샘플 장르지수가 일시 표시될 수 있습니다(표기됨).\n• 계약·투자 전에는 현지 파트너와 가격·수요를 별도 검증하세요."
    },
    en: {
      localTicketPrice: "Local Avg Ticket Price *",
      seatsCapacity: "Seats per Show *",
      showCount: "Show Count *",
      totalCost: "Total Cost *",
      currency: "KRW basis",
      calculate: "Calculate",
      resultsTitle: "ROI Analysis Results by Genre",
      dataBasedLabel: "Data Based",
      genre: "Genre",
      kopisIndex: "KOPIS Genre Index",
      expectedOccupancy: "Expected Occupancy",
      expectedAudience: "Expected Audience",
      expectedRevenue: "Expected Revenue",
      roi: "ROI",
      genres: {
        dance: "Dance",
        music: "Music",
        theater: "Theater",
        musical: "Musical"
      },
      fillAllFields: "Please fill in all required fields",
      methodology: "View Methodology & Limitations",
      methodologyTitle: "Calculation Methodology (MVP)",
      dataSource: "Data Source",
      dataSourceDesc: "KOPIS Open API prfstsCate: Recent 31-day genre audience share (nmrsshr)",
      userInput: "User Input: Local avg ticket price, seats per show, show count, total cost",
      calculation: "Calculation Formula",
      calculationFormula: "Genre Index (KGI) = nmrsshr ÷ 100 (0~1)\nExpected Occupancy (Occ) = clamp(0.25 + 0.60 × KGI, 0.05, 0.95)\nEx) Music KGI 0.75 → 0.25 + 0.60 × 0.75 = 0.70 → 70%\nExpected Audience = Seats × Shows × Occ\nExpected Revenue = Local Avg Ticket Price × Expected Audience\nROI = (Expected Revenue − Total Cost) ÷ Total Cost × 100%",
      limitationsTitle: "Important Notice (Limitations)",
      limitationsDesc: "• This estimation is a reference indicator based on genre average trends (KOPIS) and user input.\n• Country/brand adjustments are not applied (pre-beta stage).\n• Work-specific factors (casting, marketing, IP power, technical requirements, etc.) are not reflected.\n• KOPIS prfstsCate has a maximum 31-day range, so long-term trends are displayed based on interval summation or latest 31 days.\n• In case of API call failure or key misconfiguration, sample genre indices may be temporarily displayed on screen (indicated).\n• Please verify pricing and demand separately with local partners before contracts/investments."
    }
  };

  const currentText = text[language];

  // 기본 KOPIS 장르지수 (API 실패 시 사용)
  const defaultKopisGenreIndex = {
    dance: 0.60,    // 무용: 60%
    music: 0.75,    // 음악: 75%
    theater: 0.45,  // 연극: 45%
    musical: 0.70   // 뮤지컬: 70%
  };

  // KOPIS API에서 실시간 데이터 가져오기
  const fetchKopisData = async () => {
    setIsLoadingKopis(true);
    try {
      const data = await apiService.get('/api/kopis/genre-indices');
      setKopisData(data);
      console.log('KOPIS Data:', data);
    } catch (error) {
      console.error('KOPIS API Error:', error);
      // 실패 시 기본값 사용
      setKopisData({
        status: 'fallback',
        data: defaultKopisGenreIndex,
        source: 'Default values',
        note: 'Fallback data due to API unavailability'
      });
    } finally {
      setIsLoadingKopis(false);
    }
  };

  // 컴포넌트 마운트 시 KOPIS 데이터 가져오기
  React.useEffect(() => {
    fetchKopisData();
  }, []);

  // 현재 사용할 장르지수 (KOPIS 데이터 또는 기본값)
  const getCurrentGenreIndex = () => {
    if (kopisData && kopisData.data) {
      return kopisData.data;
    }
    return defaultKopisGenreIndex;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  };

  const calcForGenre = (genre, ticketPrice, capacity, shows, totalCost) => {
    const genreIndex = getCurrentGenreIndex();
    const kgi = genreIndex[genre] || 0.6;
    // 점유율 = 0.25 + 0.60 × KGI (5%~95% 제한)
    const occupancy = clamp(0.25 + 0.60 * kgi, 0.05, 0.95);
    // 예상관객 = 좌석수 × 회차수 × 점유율
    const audience = Math.round(capacity * shows * occupancy);
    // 매출 = 현지 평균 티켓가 × 예상관객
    const revenue = ticketPrice * audience;
    // ROI = (매출 − 총비용) / 총비용
    const roi = totalCost > 0 ? (revenue - totalCost) / totalCost : 0;

    return {
      kgi: Math.round(kgi * 100), // 백분율로 표시
      occupancy: Math.round(occupancy * 100), // 백분율로 표시
      audience: audience,
      revenue: revenue,
      roi: roi
    };
  };

  const calculateROI = () => {
    const { localTicketPrice, seatsCapacity, showCount, totalCost } = formData;

    const ticketPrice = parseFloat(localTicketPrice) || 0;
    const capacity = parseInt(seatsCapacity) || 0;
    const shows = parseInt(showCount) || 1;
    const cost = parseFloat(totalCost) || 0;

    // 필수값 검증
    if (!ticketPrice || !capacity || !cost) {
      alert(currentText.fillAllFields);
      return;
    }

    // 모든 장르에 대해 계산
    const genres = ['dance', 'music', 'theater', 'musical'];
    const calculatedResults = {};

    genres.forEach(genre => {
      calculatedResults[genre] = calcForGenre(genre, ticketPrice, capacity, shows, cost);
    });

    setResults(calculatedResults);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatPercentage = (num) => {
    return `${(num * 100).toFixed(1)}%`;
  };

  return (
    <div>
      {/* 입력 폼 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px',
        alignItems: 'end'
      }}>
        <div>
          <label style={{fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block'}}>
            {currentText.localTicketPrice}
          </label>
          <input
            type="number"
            name="localTicketPrice"
            value={formData.localTicketPrice}
            onChange={handleInputChange}
            placeholder="50000"
            style={{width: '100%', padding: '8px', border: '1px solid #d0d0d0', fontSize: '14px'}}
            min="0"
          />
          <div style={{fontSize: '10px', color: '#999', marginTop: '2px'}}>
            {currentText.currency}
          </div>
        </div>

        <div>
          <label style={{fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block'}}>
            {currentText.seatsCapacity}
          </label>
          <input
            type="number"
            name="seatsCapacity"
            value={formData.seatsCapacity}
            onChange={handleInputChange}
            placeholder="300"
            style={{width: '100%', padding: '8px', border: '1px solid #d0d0d0', fontSize: '14px'}}
            min="1"
          />
        </div>

        <div>
          <label style={{fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block'}}>
            {currentText.showCount}
          </label>
          <input
            type="number"
            name="showCount"
            value={formData.showCount}
            onChange={handleInputChange}
            style={{width: '100%', padding: '8px', border: '1px solid #d0d0d0', fontSize: '14px'}}
            min="1"
          />
        </div>

        <div>
          <label style={{fontSize: '12px', color: '#666', marginBottom: '5px', display: 'block'}}>
            {currentText.totalCost}
          </label>
          <input
            type="number"
            name="totalCost"
            value={formData.totalCost}
            onChange={handleInputChange}
            placeholder="20000000"
            style={{width: '100%', padding: '8px', border: '1px solid #d0d0d0', fontSize: '14px'}}
            min="0"
          />
          <div style={{fontSize: '10px', color: '#999', marginTop: '2px'}}>
            {currentText.currency}
          </div>
        </div>

        <button
          className="btn"
          onClick={calculateROI}
          disabled={isLoadingKopis}
          style={{
            padding: '8px 15px',
            fontSize: '14px',
            opacity: isLoadingKopis ? 0.6 : 1,
            cursor: isLoadingKopis ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoadingKopis ? 'KOPIS 로딩 중...' : currentText.calculate}
        </button>
      </div>

      {/* ROI 계산 결과 테이블 */}
      {results && (
        <div style={{margin: '20px 0'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
            <h4 style={{margin: '0'}}>
              {currentText.resultsTitle}
            </h4>
            <div style={{fontSize: '11px', color: '#666'}}>
              <span className="kopis-badge">KOPIS</span>
              <span style={{marginLeft: '5px'}}>{currentText.dataBasedLabel}</span>
              {kopisData && (
                <span style={{marginLeft: '8px', fontSize: '10px'}}>
                  ({kopisData.status === 'success' ? '실시간' : '기본값'})
                </span>
              )}
            </div>
          </div>

          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '13px'}}>
              <thead>
                <tr style={{background: '#f8f8f8'}}>
                  <th style={{padding: '12px 8px', border: '1px solid #e0e0e0', textAlign: 'left'}}>
                    {currentText.genre}
                  </th>
                  <th style={{padding: '12px 8px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
                    {currentText.kopisIndex}
                  </th>
                  <th style={{padding: '12px 8px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
                    {currentText.expectedOccupancy}
                  </th>
                  <th style={{padding: '12px 8px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
                    {currentText.expectedAudience}
                  </th>
                  <th style={{padding: '12px 8px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
                    {currentText.expectedRevenue}
                  </th>
                  <th style={{padding: '12px 8px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
                    {currentText.roi}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results).map(([genre, result]) => {
                  const roiColor = result.roi >= 0 ? '#666666' : '#dc3545';
                  return (
                    <tr key={genre}>
                      <td style={{padding: '12px 8px', border: '1px solid #e0e0e0', fontWeight: '500'}}>
                        {currentText.genres[genre]}
                      </td>
                      <td style={{padding: '12px 8px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
                        {result.kgi}%
                      </td>
                      <td style={{padding: '12px 8px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
                        {result.occupancy}%
                      </td>
                      <td style={{padding: '12px 8px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
                        {formatNumber(result.audience)}명
                      </td>
                      <td style={{padding: '12px 8px', border: '1px solid #e0e0e0', textAlign: 'center'}}>
                        ₩{formatNumber(result.revenue)}
                      </td>
                      <td style={{padding: '12px 8px', border: '1px solid #e0e0e0', textAlign: 'center', color: roiColor, fontWeight: '600'}}>
                        {formatPercentage(result.roi)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 방법론 & 제한사항 토글 버튼 */}
      <div style={{marginTop: '20px', textAlign: 'center'}}>
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          style={{
            background: 'none',
            border: '1px solid #ddd',
            padding: '8px 16px',
            fontSize: '12px',
            color: '#666',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'all 0.3s ease'
          }}
        >
          {currentText.methodology} {showMethodology ? '▲' : '▼'}
        </button>
      </div>

      {/* 방법론 & 제한사항 내용 */}
      {showMethodology && (
        <div style={{
          marginTop: '15px',
          padding: '20px',
          background: '#f9f9f9',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          fontSize: '12px',
          lineHeight: '1.6'
        }}>
          <div style={{marginBottom: '20px'}}>
            <h4 style={{margin: '0 0 10px 0', color: '#333', fontSize: '14px'}}>
              {currentText.methodologyTitle}
            </h4>

            <div style={{marginBottom: '12px'}}>
              <strong>{currentText.dataSource}</strong>
              <div style={{marginTop: '4px', color: '#555'}}>
                {currentText.dataSourceDesc}
              </div>
              <div style={{marginTop: '2px', color: '#555'}}>
                {currentText.userInput}
              </div>
            </div>

            <div>
              <strong>{currentText.calculation}</strong>
              <div style={{
                marginTop: '6px',
                fontFamily: 'monospace',
                background: '#fff',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '11px',
                whiteSpace: 'pre-line'
              }}>
                {currentText.calculationFormula}
              </div>
            </div>
          </div>

          <div>
            <h4 style={{margin: '0 0 10px 0', color: '#d63384', fontSize: '14px'}}>
              {currentText.limitationsTitle}
            </h4>
            <div style={{color: '#555', whiteSpace: 'pre-line'}}>
              {currentText.limitationsDesc}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ROICalculator;
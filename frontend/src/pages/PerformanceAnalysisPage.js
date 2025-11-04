import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function PerformanceAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [genrePerformanceStats, setGenrePerformanceStats] = useState([]);
  const [genreBoxStats, setGenreBoxStats] = useState({});
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('ko');

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const text = {
    ko: {
      loading: "데이터를 불러오는 중...",
      error: "데이터 로드 중 오류가 발생했습니다.",
      home: "홈으로",
      title: "국내 공연 트렌드 분석",
      subtitle: "KOPIS 데이터 기반 공연계 동향 분석",
      marketOverview: "시장 개요",
      genreAnalysis: "장르별 분석",
      bookingAnalysis: "예매 분석",
      totalAudience: "총 관객수",
      totalRevenue: "총 매출액",
      totalShows: "총 공연수",
      averageOccupancy: "평균 관객점유율",
      genreDistribution: "장르별 분포",
      audienceShare: "관객 점유율",
      revenueShare: "매출 점유율",
      aiInsightsTitle: "AI 트렌드 분석",
      regenerateAi: "재생성",
      minimizePanel: "패널 최소화",
      expandPanel: "패널 확장",
      aiAnalyzing: "AI가 분석 중...",
      langToggle: "EN"
    },
    en: {
      loading: "Loading data...",
      error: "An error occurred while loading data.",
      home: "Home",
      title: "Domestic Performance Trends Analysis",
      subtitle: "KOPIS data-based performing arts trend analysis",
      marketOverview: "Market Overview",
      genreAnalysis: "Genre Analysis",
      bookingAnalysis: "Booking Analysis",
      totalAudience: "Total Audience",
      totalRevenue: "Total Revenue",
      totalShows: "Total Shows",
      averageOccupancy: "Average Occupancy Rate",
      genreDistribution: "Genre Distribution",
      audienceShare: "Audience Share",
      revenueShare: "Revenue Share",
      aiInsightsTitle: "AI Trend Analysis",
      regenerateAi: "Regenerate",
      minimizePanel: "Minimize Panel",
      expandPanel: "Expand Panel",
      aiAnalyzing: "AI is analyzing...",
      langToggle: "KO"
    }
  };

  const currentText = text[language];

  // AI 인사이트 관련 상태
  const [aiInsights, setAiInsights] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiThinking, setAiThinking] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [isAiPanelMinimized, setIsAiPanelMinimized] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [streamingText, setStreamingText] = useState('');
  const aiContentRef = useRef(null);

  // Trends 페이지 기능 추가
  const [allGenreStats, setAllGenreStats] = useState([]);
  const [trendsGenreBoxStats, setTrendsGenreBoxStats] = useState({});
  const selectedDateRange = 'week'; // 7일 고정

  // 장르별 공연 통계 가져오기 (날짜 범위 지원)
  const fetchGenrePerformanceStatsWithRange = async (dateRange = 'week') => {
    try {
      const { stdate, eddate } = getDateRange(dateRange);

      const params = new URLSearchParams({
        stdate: stdate,
        eddate: eddate
      });

      const response = await fetch(`http://localhost:8000/api/kopis/genre-performance-stats?${params}`);

      if (!response.ok) {
        throw new Error(`장르별 공연 통계 API 호출 실패: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(result.data, 'text/xml');

        const prfstElements = xmlDoc.querySelectorAll('prfst');
        const performanceStats = Array.from(prfstElements).map(prfst => ({
          genre: prfst.querySelector('cate')?.textContent || '',
          performanceCount: parseInt(prfst.querySelector('prfprocnt')?.textContent || '0'),
          showCount: parseInt(prfst.querySelector('prfdtcnt')?.textContent || '0'),
          revenue: parseInt(prfst.querySelector('amount')?.textContent || '0'),
          revenueShare: parseFloat(prfst.querySelector('amountshr')?.textContent || '0'),
          audience: parseInt(prfst.querySelector('nmrs')?.textContent || '0'),
          audienceShare: parseFloat(prfst.querySelector('nmrsshr')?.textContent || '0')
        }));

        return performanceStats;
      } else {
        throw new Error('백엔드 API 응답 오류');
      }
    } catch (err) {
      console.error('장르별 공연 통계 API 호출 에러:', err);
      throw err;
    }
  };

  // API 호출 함수들
  const fetchGenrePerformanceStats = async () => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

      const stdate = thirtyDaysAgo.toISOString().slice(0, 10).replace(/-/g, '');
      const eddate = today.toISOString().slice(0, 10).replace(/-/g, '');

      const response = await fetch(`http://localhost:8000/api/kopis/genre-performance-stats?stdate=${stdate}&eddate=${eddate}`);

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(result.data, 'text/xml');

        const prfstElements = xmlDoc.querySelectorAll('prfst');
        const performanceStats = Array.from(prfstElements).map(prfst => ({
          genre: prfst.querySelector('cate')?.textContent || '',
          performanceCount: parseInt(prfst.querySelector('prfprocnt')?.textContent || '0'),
          showCount: parseInt(prfst.querySelector('prfdtcnt')?.textContent || '0'),
          revenue: parseInt(prfst.querySelector('amount')?.textContent || '0'),
          revenueShare: parseFloat(prfst.querySelector('amountshr')?.textContent || '0'),
          audience: parseInt(prfst.querySelector('nmrs')?.textContent || '0'),
          audienceShare: parseFloat(prfst.querySelector('nmrsshr')?.textContent || '0')
        }));

        return performanceStats;
      }
    } catch (err) {
      console.error('API 호출 에러:', err);
      throw err;
    }
  };

  // Trends 기능 함수들
  const getDateRange = (range) => {
    const today = new Date();
    let daysBack;

    switch(range) {
      case 'week': daysBack = 7; break;
      case 'month': daysBack = 30; break;
      default: daysBack = 7;
    }

    const startDate = new Date(today.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    return {
      stdate: startDate.toISOString().slice(0, 10).replace(/-/g, ''),
      eddate: today.toISOString().slice(0, 10).replace(/-/g, '')
    };
  };

  const fetchGenreBoxStats = async (catecode = null, dateRange = 'week') => {
    try {
      const { stdate, eddate } = getDateRange(dateRange);

      const params = new URLSearchParams({
        stdate: stdate,
        eddate: eddate
      });

      if (catecode) {
        params.append('catecode', catecode);
      }

      const response = await fetch(`http://localhost:8000/api/kopis/genre-box-stats?${params}`);

      if (!response.ok) {
        throw new Error(`장르별 박스오피스 API 호출 실패: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(result.data, 'text/xml');

        const statsElements = xmlDoc.querySelectorAll('boxStatsof');
        const genreStats = Array.from(statsElements).map(stats => ({
          category: stats.querySelector('catenm')?.textContent || '',
          performanceCount: parseInt(stats.querySelector('prfcnt')?.textContent || '0'),
          performanceDays: parseInt(stats.querySelector('prfdtcnt')?.textContent || '0'),
          cancelledTickets: parseInt(stats.querySelector('cancelnmrssm')?.textContent || '0'),
          totalTicketsSold: parseInt(stats.querySelector('totnmrssm')?.textContent || '0'),
          salesAmount: parseInt(stats.querySelector('ntssamountsm')?.textContent || '0'),
          reservedTickets: parseInt(stats.querySelector('ntssnmrssm')?.textContent || '0')
        })).filter(stat => stat.category && stat.category !== '합계');

        return genreStats;
      } else {
        throw new Error('백엔드 API 응답 오류');
      }
    } catch (err) {
      console.error('장르별 박스오피스 API 호출 에러:', err);
      throw err;
    }
  };

  const fetchGenreBoxStatsOld = async (genreCode) => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

      const stdate = thirtyDaysAgo.toISOString().slice(0, 10).replace(/-/g, '');
      const eddate = today.toISOString().slice(0, 10).replace(/-/g, '');

      const params = new URLSearchParams({
        stdate: stdate,
        eddate: eddate
      });

      if (genreCode) {
        params.append('catecode', genreCode);
      }

      const response = await fetch(`http://localhost:8000/api/kopis/genre-box-stats?${params}`);

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(result.data, 'text/xml');

        const statsElements = xmlDoc.querySelectorAll('boxStatsof');
        const genreStats = Array.from(statsElements).map(stats => ({
          category: stats.querySelector('catenm')?.textContent || '',
          performanceCount: parseInt(stats.querySelector('prfcnt')?.textContent || '0'),
          performanceDays: parseInt(stats.querySelector('prfdtcnt')?.textContent || '0'),
          cancelledTickets: parseInt(stats.querySelector('cancelnmrssm')?.textContent || '0'),
          totalTicketsSold: parseInt(stats.querySelector('totnmrssm')?.textContent || '0'),
          salesAmount: parseInt(stats.querySelector('ntssamountsm')?.textContent || '0'),
          reservedTickets: parseInt(stats.querySelector('ntssnmrssm')?.textContent || '0')
        })).filter(stat => stat.category && stat.category !== '합계');

        return genreStats;
      }
    } catch (err) {
      console.error('API 호출 에러:', err);
      throw err;
    }
  };

  // 마크다운 렌더링 함수
  const renderMarkdown = (text) => {
    if (!text) return '';

    // 먼저 테이블 처리
    text = renderMarkdownTables(text);

    // 텍스트를 줄 단위로 분리
    let lines = text.split('\n');
    let result = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // 이미 HTML 테이블인 경우 건너뛰기
      if (line.includes('<table') || line.includes('</table>') || line.includes('<tr>') || line.includes('<td>') || line.includes('<th>')) {
        result.push(line);
        continue;
      }

      // 헤더 처리 (줄의 시작에서만)
      if (line.match(/^#### /)) {
        line = line.replace(/^#### (.*)/, '<h4 style="color: #2c2c2c; margin: 18px 0 10px 0; font-size: 1.05rem; font-weight: 600; border-bottom: 1px solid #dee2e6; padding-bottom: 4px; display: block;">$1</h4>');
      } else if (line.match(/^### /)) {
        line = line.replace(/^### (.*)/, '<h3 style="color: #2c2c2c; margin: 20px 0 12px 0; font-size: 1.1rem; font-weight: 600; border-bottom: 1px solid #e9ecef; padding-bottom: 6px; display: block;">$1</h3>');
      } else if (line.match(/^## /)) {
        line = line.replace(/^## (.*)/, '<h2 style="color: #2c2c2c; margin: 25px 0 15px 0; font-size: 1.2rem; font-weight: 600; border-bottom: 2px solid #2c2c2c; padding-bottom: 8px; display: block;">$1</h2>');
      } else if (line.match(/^# /)) {
        line = line.replace(/^# (.*)/, '<h1 style="color: #2c2c2c; margin: 30px 0 20px 0; font-size: 1.3rem; font-weight: 700; border-bottom: 3px solid #2c2c2c; padding-bottom: 10px; display: block;">$1</h1>');
      }

      // 리스트 처리
      if (line.match(/^- /)) {
        line = line.replace(/^- (.*)/, '<li style="margin: 8px 0; color: #444; line-height: 1.6; padding-left: 12px; border-left: 3px solid #e9ecef; margin-left: 15px; list-style: none; display: block;">$1</li>');
      }

      // 볼드, 이탤릭 처리
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #2c2c2c; font-weight: 700; background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 2px 4px; border-radius: 3px;">$1</strong>');
      line = line.replace(/\*(.*?)\*/g, '<em style="color: #495057; font-style: italic; background: #f8f9fa; padding: 1px 3px; border-radius: 2px;">$1</em>');

      // 이모지 처리
      line = line.replace(/(📊|📈|🎯|🔮|💡|⚡|🚀|🔥|💰|🎭|🎪|🎨|🎵|🎬|🎤)/g, '<span style="font-size: 1.1em; margin-right: 6px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));">$1</span>');

      result.push(line);
    }

    return result.join('<br style="margin: 4px 0; line-height: 1.6;">');
  };

  // 마크다운 테이블을 HTML 테이블로 변환하는 함수
  const renderMarkdownTables = (text) => {
    const lines = text.split('\n');
    const result = [];
    let inTable = false;
    let tableRows = [];
    let headerRow = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 테이블 행 감지 (|로 시작하고 끝나거나 |가 포함된 경우)
      if (line.includes('|') && line.split('|').length > 2) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }

        // 헤더 구분선 체크 (---|---|--- 패턴)
        if (line.match(/^\|?[\s]*:?-+:?[\s]*\|/)) {
          // 구분선은 건너뛰고 이전 행을 헤더로 설정
          if (tableRows.length > 0) {
            headerRow = tableRows.pop();
          }
          continue;
        }

        // 테이블 셀 파싱
        const cells = line.split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== ''); // 빈 셀 제거

        if (cells.length > 0) {
          tableRows.push(cells);
        }
      } else {
        // 테이블이 아닌 줄을 만났을 때
        if (inTable && tableRows.length > 0) {
          // 테이블 HTML 생성
          result.push(generateTableHTML(headerRow, tableRows));
          inTable = false;
          tableRows = [];
          headerRow = null;
        }
        result.push(line);
      }
    }

    // 마지막에 테이블이 있는 경우
    if (inTable && tableRows.length > 0) {
      result.push(generateTableHTML(headerRow, tableRows));
    }

    return result.join('\n');
  };

  // HTML 테이블 생성 함수
  const generateTableHTML = (headerRow, rows) => {
    let html = '<table style="border-collapse: collapse; width: 100%; margin: 16px 0; border: 1px solid #e1e5e9; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">';

    // 헤더 행
    if (headerRow) {
      html += '<thead style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">';
      html += '<tr>';
      headerRow.forEach(cell => {
        html += `<th style="padding: 12px 16px; text-align: left; font-weight: 600; color: #2c2c2c; border-bottom: 2px solid #dee2e6; font-size: 0.9rem;">${cell}</th>`;
      });
      html += '</tr>';
      html += '</thead>';
    }

    // 데이터 행들
    html += '<tbody>';
    rows.forEach((row, index) => {
      const isEven = index % 2 === 0;
      html += `<tr style="background-color: ${isEven ? '#ffffff' : '#fafbfc'};">`;
      row.forEach(cell => {
        html += `<td style="padding: 10px 16px; border-bottom: 1px solid #f1f3f4; color: #444; font-size: 0.85rem; line-height: 1.5;">${cell}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';

    html += '</table>';
    return html;
  };

  // 스크롤 디바운싱을 위한 타이머 ref
  const scrollTimeoutRef = useRef(null);
  const isScrollingRef = useRef(false);

  // 스크롤 관리 함수 완전 재설계
  const scrollToBottomSmooth = () => {
    if (aiContentRef.current && shouldAutoScroll && !isScrollingRef.current) {
      const element = aiContentRef.current;

      // 스크롤이 이미 하단에 있는지 확인
      const isNearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 50;

      if (isNearBottom) {
        isScrollingRef.current = true;

        // 부드러운 스크롤 적용
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });

        // 스크롤 완료 후 플래그 리셋
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 300);
      }
    }
  };

  // 디바운싱된 스크롤 함수
  const debouncedScrollToBottom = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      scrollToBottomSmooth();
    }, 200); // 200ms 디바운스
  };

  // 스크롤 위치 감지
  const handleScroll = () => {
    if (aiContentRef.current && !isScrollingRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = aiContentRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
      setShouldAutoScroll(isAtBottom);
    }
  };

  // AI 인사이트 생성 함수
  const generateAiInsights = async () => {
    if (aiLoading) return;

    setAiLoading(true);
    setAiInsights('');
    setAiThinking('');
    setStreamingText('');
    setShouldAutoScroll(true);

    try {
      // 시장개요 탭에서 사용하는 실제 데이터 준비
      const analysisData = {
        // 시장 전체 지표
        marketOverview: {
          totalAudience: totalAudience,
          totalRevenue: totalRevenue,
          totalShows: totalShows,
          totalPerformanceCount: totalPerformanceCount,
          genreCount: genrePerformanceStats.length,
          analysisPeriod: '최근 30일'
        },
        // 장르별 상세 성과 데이터
        genrePerformanceStats: genrePerformanceStats.map(stat => ({
          genre: stat.genre,
          audienceShare: stat.audienceShare,
          revenueShare: stat.revenueShare,
          audience: stat.audience,
          revenue: stat.revenue,
          performanceCount: stat.performanceCount,
          showCount: stat.showCount
        })),
        // 예매 현황 데이터 (연극 기준)
        bookingData: {
          totalReserved: totalReserved,
          totalCancelled: totalCancelled,
          totalSold: totalSold,
          cancellationRate: parseFloat(cancellationRate),
          bookingGenre: '연극'
        },
        // 장르별 박스오피스 데이터 (trends 탭용)
        trendsGenreBoxStats: Object.entries(trendsGenreBoxStats).map(([code, data]) => ({
          genreCode: code,
          genreName: data.name,
          totalSales: data.totalSales,
          totalShows: data.totalShows,
          totalTickets: data.totalTickets,
          performanceDays: data.performanceDays,
          averageDailySales: data.performanceDays > 0 ? data.totalSales / data.performanceDays : 0
        }))
      };

      const eventSource = new EventSource(
        `http://localhost:8000/api/kopis/ai-insights?data=${encodeURIComponent(JSON.stringify(analysisData))}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'status':
            // 상태 메시지는 숨김
            break;
          case 'thinking':
            // 중간 상태 메시지는 숨김
            break;
          case 'inference':
            // 실시간으로 스트리밍 텍스트 업데이트
            setStreamingText(data.text);
            // 디바운싱된 스크롤 사용 - 훨씬 적은 빈도로 호출
            debouncedScrollToBottom();
            break;
          case 'inference_complete':
            // 추론 완료는 숨김
            break;
          case 'complete':
            setAiInsights(data.insights);
            setStreamingText('');
            setAiLoading(false);
            // 완료시에는 확실하게 스크롤
            setTimeout(() => {
              if (aiContentRef.current) {
                aiContentRef.current.scrollTo({
                  top: aiContentRef.current.scrollHeight,
                  behavior: 'smooth'
                });
              }
            }, 500);
            eventSource.close();
            break;
          case 'error':
            setError(`AI 분석 오류: ${data.message}`);
            setAiLoading(false);
            eventSource.close();
            break;
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        setError('AI 인사이트 생성 중 연결 오류가 발생했습니다.');
        setAiLoading(false);
        eventSource.close();
      };

    } catch (error) {
      console.error('AI insights error:', error);
      setError('AI 인사이트 생성 중 오류가 발생했습니다.');
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 병렬로 데이터 가져오기
        const [performanceStats, theaterStats] = await Promise.all([
          fetchGenrePerformanceStats(),
          fetchGenreBoxStats('AAAA') // 연극 데이터
        ]);

        setGenrePerformanceStats(performanceStats || []);
        setGenreBoxStats(theaterStats?.[0] || {});

        // Trends functionality - 장르별 데이터 로드
        const genres = [
          { code: 'AAAA', name: '연극' },
          { code: 'BBBC', name: '뮤지컬' },
          { code: 'CCCA', name: '음악' },
          { code: 'EEEB', name: '무용' }
        ];

        // 모든 장르와 전체 통계, 공연 통계 병렬로 가져오기
        const [allStats, performanceStatsForTrends, ...genreStats] = await Promise.all([
          fetchGenreBoxStats(null, selectedDateRange), // 전체 통계
          fetchGenrePerformanceStatsWithRange(selectedDateRange), // 장르별 공연 통계
          ...genres.map(genre => fetchGenreBoxStats(genre.code, selectedDateRange))
        ]);

        // 장르별 통계 정리
        const genreData = {};
        genres.forEach((genre, index) => {
          const stats = genreStats[index] || [];
          const firstStat = stats.length > 0 ? stats[0] : null;

          genreData[genre.code] = {
            name: genre.name,
            data: stats,
            totalSales: firstStat?.salesAmount || 0,
            totalShows: firstStat?.performanceCount || 0,
            totalTickets: firstStat?.totalTicketsSold || 0,
            performanceDays: firstStat?.performanceDays || 0,
            reservedTickets: firstStat?.reservedTickets || 0
          };
        });

        setTrendsGenreBoxStats(genreData);
        setAllGenreStats(allStats || []);
        if (performanceStatsForTrends) {
          setGenrePerformanceStats(performanceStatsForTrends);
        }

        // 데이터 로딩 완료 후 AI 인사이트 자동 시작
        if (performanceStats && performanceStats.length > 0) {
          setTimeout(() => {
            generateAiInsights();
          }, 1000);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // 7일 고정이므로 dependency 제거

  // Cleanup 함수 - 타이머 정리
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // 계산된 값들
  const totalAudience = genrePerformanceStats.reduce((sum, stat) => sum + stat.audience, 0);
  const totalRevenue = genrePerformanceStats.reduce((sum, stat) => sum + stat.revenue, 0);
  const totalShows = genrePerformanceStats.reduce((sum, stat) => sum + stat.showCount, 0);
  const totalPerformanceCount = genrePerformanceStats.reduce((sum, stat) => sum + stat.performanceCount, 0);

  // 예매 데이터 (연극 기준)
  const totalReserved = genreBoxStats.reservedTickets || 0;
  const totalCancelled = genreBoxStats.cancelledTickets || 0;
  const totalSold = genreBoxStats.totalTicketsSold || 0;
  const cancellationRate = totalReserved > 0 ? ((totalCancelled / totalReserved) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="screen">
        <div className="header">
          <div className="logo" onClick={() => window.location.href = '/'}>
            <img src="/assets/images/PAMS_Logo.png" alt="PAMS 2025" style={{height: '32px', width: 'auto'}} />
          </div>
          <div className="nav-buttons">
            <Link to="/" className="btn secondary">
              <span>홈으로</span>
            </Link>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p style={{ fontSize: '18px', color: '#666' }}>{currentText.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="screen">
        <div className="header">
          <div className="logo" onClick={() => window.location.href = '/'}>
            <img src="/assets/images/PAMS_Logo.png" alt="PAMS 2025" style={{height: '32px', width: 'auto'}} />
          </div>
          <div className="nav-buttons">
            <Link to="/" className="btn secondary">
              <span>홈으로</span>
            </Link>
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
          <p style={{ fontSize: '18px', color: '#e74c3c' }}>{currentText.error}</p>
          <p style={{ fontSize: '14px', color: '#666' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Lato', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
      lineHeight: 1.6,
      color: '#333333',
      background: '#fafafa',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{
          background: 'white',
          border: '1px solid #f0f0f0',
          padding: '40px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          {/* 헤더 */}
          <div style={{
            textAlign: 'center',
            paddingBottom: '30px',
            borderBottom: '1px solid #f0f0f0',
            marginBottom: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div className="logo" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }}>
                <img src="/assets/images/PAMS_Logo.png" alt="PAMS 2025" style={{height: '32px', width: 'auto'}} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/" style={{
                  padding: '8px 16px',
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  {currentText.home}
                </Link>
                <button
                  onClick={toggleLanguage}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f8f9fa',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {currentText.langToggle}
                </button>
              </div>
            </div>
            <h1 style={{
              fontSize: '2rem',
              color: '#2c2c2c',
              marginBottom: '10px',
              fontWeight: 500
            }}>
              {currentText.title}
            </h1>
            <p style={{
              color: '#666666',
              fontSize: '1rem'
            }}>
              {currentText.subtitle}
            </p>
          </div>

          {/* 탭 네비게이션 */}
          <div style={{
            display: 'flex',
            background: '#f8f9fa',
            borderBottom: '1px solid #e9ecef',
            marginBottom: '30px'
          }}>
            {[
              { id: 'overview', name: currentText.marketOverview },
              { id: 'genres', name: currentText.genreAnalysis },
              { id: 'booking', name: currentText.bookingAnalysis }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: activeTab === tab.id ? 'white' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === tab.id ? 500 : 400,
                  color: activeTab === tab.id ? '#2c2c2c' : '#666666',
                  borderBottom: activeTab === tab.id ? '2px solid #2c2c2c' : '2px solid transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* 시장 개요 탭 */}
          {activeTab === 'overview' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div style={{
                  background: 'white',
                  border: '1px solid #f0f0f0',
                  padding: '25px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{
                    fontSize: '2rem',
                    color: '#2c2c2c',
                    marginBottom: '8px',
                    fontWeight: 500
                  }}>
                    {totalAudience.toLocaleString()}
                  </h3>
                  <p style={{ color: '#666666', fontSize: '0.9rem' }}>총 관객수</p>
                </div>
                <div style={{
                  background: 'white',
                  border: '1px solid #f0f0f0',
                  padding: '25px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{
                    fontSize: '2rem',
                    color: '#2c2c2c',
                    marginBottom: '8px',
                    fontWeight: 500
                  }}>
                    {totalShows.toLocaleString()}
                  </h3>
                  <p style={{ color: '#666666', fontSize: '0.9rem' }}>총 공연일수</p>
                </div>
                <div style={{
                  background: 'white',
                  border: '1px solid #f0f0f0',
                  padding: '25px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{
                    fontSize: '2rem',
                    color: '#2c2c2c',
                    marginBottom: '8px',
                    fontWeight: 500
                  }}>
                    {(totalRevenue / 100000000).toFixed(0)}억원
                  </h3>
                  <p style={{ color: '#666666', fontSize: '0.9rem' }}>총 매출액</p>
                </div>
                <div style={{
                  background: 'white',
                  border: '1px solid #f0f0f0',
                  padding: '25px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{
                    fontSize: '2rem',
                    color: '#2c2c2c',
                    marginBottom: '8px',
                    fontWeight: 500
                  }}>
                    {genrePerformanceStats.length}개
                  </h3>
                  <p style={{ color: '#666666', fontSize: '0.9rem' }}>분석 장르</p>
                </div>
              </div>

              <div style={{
                background: 'white',
                border: '1px solid #f0f0f0',
                padding: '25px',
                marginBottom: '25px'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  marginBottom: '20px',
                  color: '#2c2c2c'
                }}>
                  장르별 관객 점유율
                </div>
                <div style={{ height: '400px' }}>
                  {genrePerformanceStats.length > 0 && (
                    <Doughnut
                      data={{
                        labels: genrePerformanceStats.map(stat => stat.genre),
                        datasets: [{
                          data: genrePerformanceStats.map(stat => stat.audienceShare),
                          backgroundColor: [
                            '#2c2c2c', '#666666', '#999999', '#4facfe',
                            '#f093fb', '#43e97b', '#ffd93d', '#ff6b6b', '#74b9ff'
                          ]
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                              }
                            }
                          }
                        }
                      }}
                    />
                  )}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                {genrePerformanceStats.slice(0, 6).map((stat, index) => (
                  <div key={index} style={{
                    background: 'white',
                    border: '1px solid #f0f0f0',
                    padding: '20px',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    <h4 style={{
                      color: '#2c2c2c',
                      marginBottom: '10px',
                      fontSize: '1rem',
                      fontWeight: 500
                    }}>
                      {stat.genre}
                    </h4>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 500,
                      color: '#2c2c2c',
                      marginBottom: '5px'
                    }}>
                      {stat.audienceShare}%
                    </div>
                    <p style={{ color: '#666666', fontSize: '0.8rem' }}>관객점유율</p>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 500,
                      color: '#2c2c2c',
                      marginBottom: '5px',
                      marginTop: '10px'
                    }}>
                      {(stat.revenue / 100000000).toFixed(1)}억원
                    </div>
                    <p style={{ color: '#666666', fontSize: '0.8rem' }}>매출액</p>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 장르별 분석 탭 */}
          {activeTab === 'genres' && (
            <div>
              <h3 style={{
                textAlign: 'center',
                marginBottom: '30px',
                color: '#2c2c2c',
                fontSize: '1.5rem',
                fontWeight: 600
              }}>장르별 트렌드 분석</h3>

              {/* 기간 정보 표시 */}
              <div style={{
                marginBottom: '30px',
                textAlign: 'center',
                color: '#666',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                📅 최근 7일간 데이터 기준
              </div>

              {/* 장르별 통계 요약 카드 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
              }}>
                {Object.entries(trendsGenreBoxStats).map(([code, genre], index) => (
                  <div key={code} style={{
                    background: [
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                    ][index],
                    color: 'white',
                    padding: '30px',
                    borderRadius: '15px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>{genre.name}</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {(genre.totalSales / 10000).toLocaleString()}만원
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '5px' }}>
                      {genre.totalShows}편 상영
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '5px' }}>
                      평균: {genre.totalShows > 0 ? (genre.totalSales / genre.totalShows / 10000).toFixed(1) : 0}만원
                    </div>
                  </div>
                ))}
              </div>

              {/* 차트 섹션 */}
              <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                  {/* 장르별 매출 비교 차트 */}
                  <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '25px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
                      장르별 매출 비교
                    </h3>
                    <div style={{ height: '300px' }}>
                      <Bar
                        data={{
                          labels: Object.values(trendsGenreBoxStats).map(genre => genre.name),
                          datasets: [
                            {
                              label: '매출액 (만원)',
                              data: Object.values(trendsGenreBoxStats).map(genre => genre.totalSales / 10000),
                              backgroundColor: [
                                'rgba(102, 126, 234, 0.8)',
                                'rgba(240, 147, 251, 0.8)',
                                'rgba(79, 172, 254, 0.8)',
                                'rgba(67, 233, 123, 0.8)'
                              ],
                              borderColor: [
                                'rgba(102, 126, 234, 1)',
                                'rgba(240, 147, 251, 1)',
                                'rgba(79, 172, 254, 1)',
                                'rgba(67, 233, 123, 1)'
                              ],
                              borderWidth: 1
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return value.toLocaleString() + '만원';
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* 장르별 공연 수 도넛 차트 */}
                  <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '25px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
                      장르별 공연 수 분포
                    </h3>
                    <div style={{ height: '300px' }}>
                      <Doughnut
                        data={{
                          labels: Object.values(trendsGenreBoxStats).map(genre => genre.name),
                          datasets: [
                            {
                              data: Object.values(trendsGenreBoxStats).map(genre => genre.totalShows),
                              backgroundColor: [
                                '#FF6384',
                                '#36A2EB',
                                '#FFCE56',
                                '#4BC0C0'
                              ]
                            }
                          ]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 장르별 상세 분석 */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{
                  textAlign: 'center',
                  marginBottom: '30px',
                  color: '#2c3e50',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  장르별 상세 분석
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  {Object.entries(trendsGenreBoxStats).map(([code, genreData]) => {
                    if (!genreData) return null;

                    return (
                      <div key={code} style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '25px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}>
                        <h4 style={{ marginBottom: '20px', color: '#2c3e50' }}>
                          {genreData.name} 상세 통계
                        </h4>
                        <div style={{ fontSize: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>총 공연 수:</span>
                            <span style={{ fontWeight: 'bold' }}>{genreData.totalShows}편</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>총 매출액:</span>
                            <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                              {(genreData.totalSales / 100000000).toFixed(1)}억원
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>총 티켓 판매:</span>
                            <span style={{ fontWeight: 'bold' }}>{genreData.totalTickets?.toLocaleString()}매</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>총 공연 일수:</span>
                            <span style={{ fontWeight: 'bold' }}>{genreData.performanceDays}일</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>평균 일별 매출:</span>
                            <span style={{ fontWeight: 'bold' }}>
                              {genreData.performanceDays > 0
                                ? (genreData.totalSales / genreData.performanceDays / 10000).toFixed(0)
                                : 0}만원
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 전체 장르 통합 통계 */}
              {allGenreStats.length > 0 && (
                <div style={{
                  background: 'white',
                  borderRadius: '15px',
                  padding: '25px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  marginBottom: '40px'
                }}>
                  <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
                    전체 장르 통합 통계
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px'
                  }}>
                    {allGenreStats.map((stat, index) => (
                      <div key={index} style={{
                        padding: '20px',
                        border: '2px solid #3498db',
                        borderRadius: '15px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '10px' }}>
                          {stat.category}
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c', marginBottom: '10px' }}>
                          {(stat.salesAmount / 100000000).toFixed(1)}억원
                        </div>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                          {stat.performanceCount}편 • {stat.totalTicketsSold?.toLocaleString()}매
                        </div>
                        <div style={{ fontSize: '12px', color: '#888' }}>
                          {stat.performanceDays}일간
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 장르별 시장 점유율 분석 */}
              {genrePerformanceStats.length > 0 && (
                <div>
                  <h3 style={{
                    textAlign: 'center',
                    marginBottom: '30px',
                    color: '#2c3e50',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}>
                    장르별 시장 점유율 분석
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
                    {/* 매출 점유율 차트 */}
                    <div style={{
                      background: 'white',
                      borderRadius: '15px',
                      padding: '25px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}>
                      <h4 style={{ marginBottom: '20px', color: '#2c3e50' }}>
                        매출 점유율
                      </h4>
                      <div style={{ height: '300px' }}>
                        <Doughnut
                          data={{
                            labels: genrePerformanceStats.map(stat => stat.genre),
                            datasets: [
                              {
                                data: genrePerformanceStats.map(stat => stat.revenueShare),
                                backgroundColor: [
                                  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                                  '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0'
                                ]
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    return context.label + ': ' + context.parsed + '%';
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* 관객 점유율 차트 */}
                    <div style={{
                      background: 'white',
                      borderRadius: '15px',
                      padding: '25px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }}>
                      <h4 style={{ marginBottom: '20px', color: '#2c3e50' }}>
                        관객 점유율
                      </h4>
                      <div style={{ height: '300px' }}>
                        <Doughnut
                          data={{
                            labels: genrePerformanceStats.map(stat => stat.genre),
                            datasets: [
                              {
                                data: genrePerformanceStats.map(stat => stat.audienceShare),
                                backgroundColor: [
                                  '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56',
                                  '#FF9F40', '#9966FF', '#C9CBCF', '#FF6384', '#4BC0C0'
                                ]
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom'
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    return context.label + ': ' + context.parsed + '%';
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 장르별 상세 통계 테이블 */}
                  <div style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '25px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}>
                    <h4 style={{ marginBottom: '20px', color: '#2c3e50' }}>
                      장르별 상세 통계 비교
                    </h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>장르</th>
                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>공연수</th>
                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>상연횟수</th>
                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>매출액</th>
                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>매출점유율</th>
                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>관객수</th>
                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>관객점유율</th>
                          </tr>
                        </thead>
                        <tbody>
                          {genrePerformanceStats.map((stat, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                              <td style={{ padding: '12px', fontWeight: 'bold' }}>{stat.genre}</td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>{stat.performanceCount}</td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>{stat.showCount}</td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                {(stat.revenue / 100000000).toFixed(1)}억원
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center', color: '#e74c3c', fontWeight: 'bold' }}>
                                {stat.revenueShare}%
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                {stat.audience.toLocaleString()}명
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center', color: '#3498db', fontWeight: 'bold' }}>
                                {stat.audienceShare}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 예매 분석 탭 */}
          {activeTab === 'booking' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div style={{
                  background: 'white',
                  border: '1px solid #f0f0f0',
                  padding: '25px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{
                    fontSize: '2rem',
                    color: '#2c2c2c',
                    marginBottom: '8px',
                    fontWeight: 500
                  }}>
                    {totalReserved.toLocaleString()}
                  </h3>
                  <p style={{ color: '#666666', fontSize: '0.9rem' }}>총 예매수</p>
                </div>
                <div style={{
                  background: 'white',
                  border: '1px solid #f0f0f0',
                  padding: '25px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{
                    fontSize: '2rem',
                    color: '#2c2c2c',
                    marginBottom: '8px',
                    fontWeight: 500
                  }}>
                    {totalCancelled.toLocaleString()}
                  </h3>
                  <p style={{ color: '#666666', fontSize: '0.9rem' }}>취소수</p>
                </div>
                <div style={{
                  background: 'white',
                  border: '1px solid #f0f0f0',
                  padding: '25px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{
                    fontSize: '2rem',
                    color: '#2c2c2c',
                    marginBottom: '8px',
                    fontWeight: 500
                  }}>
                    {totalSold.toLocaleString()}
                  </h3>
                  <p style={{ color: '#666666', fontSize: '0.9rem' }}>실제판매</p>
                </div>
                <div style={{
                  background: 'white',
                  border: '1px solid #f0f0f0',
                  padding: '25px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{
                    fontSize: '2rem',
                    color: '#2c2c2c',
                    marginBottom: '8px',
                    fontWeight: 500
                  }}>
                    {cancellationRate}%
                  </h3>
                  <p style={{ color: '#666666', fontSize: '0.9rem' }}>취소율</p>
                </div>
              </div>

              <div style={{
                background: 'white',
                border: '1px solid #f0f0f0',
                padding: '25px',
                marginBottom: '25px'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  marginBottom: '20px',
                  color: '#2c2c2c'
                }}>
                  예매 현황 분석
                </div>
                <div style={{ height: '400px' }}>
                  <Doughnut
                    data={{
                      labels: ['실제 판매', '취소'],
                      datasets: [{
                        data: [totalSold, totalCancelled],
                        backgroundColor: ['#2c2c2c', '#999999']
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div style={{
                background: 'white',
                border: '1px solid #f0f0f0',
                padding: '25px',
                marginBottom: '25px'
              }}>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  marginBottom: '20px',
                  color: '#2c2c2c'
                }}>
                  예매 플로우
                </div>
                <div style={{ height: '400px' }}>
                  <Bar
                    data={{
                      labels: ['예매수', '취소수', '실제판매'],
                      datasets: [{
                        label: '건수',
                        data: [totalReserved, totalCancelled, totalSold],
                        backgroundColor: ['#2c2c2c', '#999999', '#666666']
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                padding: '25px',
                marginTop: '25px'
              }}>
                <h3 style={{
                  color: '#2c2c2c',
                  marginBottom: '15px',
                  fontSize: '1.1rem',
                  fontWeight: 500
                }}>
                  예매 패턴 분석
                </h3>
                <ul style={{ listStyle: 'none' }}>
                  <li style={{
                    padding: '8px 0',
                    color: '#666666',
                    borderBottom: '1px solid #e9ecef',
                    fontSize: '0.9rem'
                  }}>
                    총 예매 {totalReserved.toLocaleString()}건 중 {cancellationRate}%가 취소되어 실제판매 {totalSold.toLocaleString()}건
                  </li>
                  <li style={{
                    padding: '8px 0',
                    color: '#666666',
                    borderBottom: '1px solid #e9ecef',
                    fontSize: '0.9rem'
                  }}>
                    취소율 {cancellationRate}%는 공연 시장의 일반적인 수준
                  </li>
                  <li style={{
                    padding: '8px 0',
                    color: '#666666',
                    borderBottom: '1px solid #e9ecef',
                    fontSize: '0.9rem'
                  }}>
                    연극 장르 기준: {genreBoxStats.performanceCount}개 공연, {genreBoxStats.performanceDays}회 상연
                  </li>
                  <li style={{
                    padding: '8px 0',
                    color: '#666666',
                    fontSize: '0.9rem'
                  }}>
                    예매 확정률 {(100 - cancellationRate).toFixed(1)}%로 안정적인 관객 확보
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 플로팅 AI 인사이트 패널 */}
      {showAiPanel && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: isAiPanelMinimized ? '320px' : '450px',
          maxHeight: isAiPanelMinimized ? '65px' : '600px',
          backgroundColor: 'white',
          border: '1px solid #e1e5e9',
          borderRadius: '16px',
          boxShadow: '0 12px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)',
          zIndex: 1000,
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}>
          {/* 헤더 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)',
            color: 'white',
            cursor: 'pointer',
            borderRadius: '16px 16px 0 0'
          }} onClick={() => setIsAiPanelMinimized(!isAiPanelMinimized)}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.95rem',
              fontWeight: 600,
              letterSpacing: '-0.02em'
            }}>
              <span style={{
                marginRight: '10px',
                fontSize: '1.1em',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
              }}>🤖</span>
              AI 트렌드 보고서
              {aiLoading && (
                <div style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginLeft: '12px'
                }}></div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAiPanelMinimized(!isAiPanelMinimized);
                }}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s ease',
                  backdropFilter: 'blur(4px)'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >
                {isAiPanelMinimized ? '⬆' : '⬇'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAiPanel(false);
                }}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s ease',
                  backdropFilter: 'blur(4px)'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,71,87,0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              >
                ✕
              </button>
            </div>
          </div>

          {/* 컨텐츠 */}
          {!isAiPanelMinimized && (
            <div
              ref={aiContentRef}
              onScroll={handleScroll}
              className="ai-content"
              style={{
                padding: '24px',
                maxHeight: '520px',
                overflowY: 'auto',
                background: 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
                scrollbarWidth: 'thin',
                scrollbarColor: '#e1e5e9 transparent'
              }}>
              {aiLoading && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 20px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    border: '4px solid #e9ecef',
                    borderTop: '4px solid #2c2c2c',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '20px'
                  }}></div>
                  <div style={{
                    color: '#495057',
                    fontSize: '1rem',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    marginBottom: '8px'
                  }}>
                    AI 트렌드 보고서 작성 중...
                  </div>
                  <div style={{
                    color: '#6c757d',
                    fontSize: '0.85rem',
                    lineHeight: 1.5
                  }}>
                    KOPIS 데이터를 분석하여 전문적인 보고서를 생성하고 있습니다
                  </div>
                </div>
              )}

              {streamingText && aiLoading && (
                <div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#6c757d',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                    borderRadius: '8px',
                    border: '1px solid #bbdefb'
                  }}>
                    <span style={{
                      marginRight: '8px',
                      fontSize: '1em',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                    }}>✍️</span>
                    <span style={{ fontWeight: 500, color: '#1976d2' }}>AI 보고서 실시간 작성 중...</span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: '#2c2c2c',
                      lineHeight: 1.7,
                      letterSpacing: '-0.01em',
                      padding: '16px',
                      background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef',
                      position: 'relative'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(streamingText) + '<span style="animation: blink 1s infinite; color: #2c2c2c; font-weight: bold;">|</span>'
                    }}
                  />
                </div>
              )}

              {aiInsights && !aiLoading && (
                <div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: '#6c757d',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%)',
                    borderRadius: '10px',
                    border: '1px solid #c3e6c3'
                  }}>
                    <span style={{
                      marginRight: '8px',
                      fontSize: '1.1em',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                    }}>🤖</span>
                    <span style={{ fontWeight: 500, color: '#28a745' }}>AI 트렌드 보고서 분석 완료</span>
                  </div>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      color: '#2c2c2c',
                      lineHeight: 1.7,
                      letterSpacing: '-0.01em'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(aiInsights)
                    }}
                  />
                </div>
              )}

              {!aiLoading && !aiInsights && (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: '#6c757d'
                }}>
                  <div style={{
                    fontSize: '32px',
                    marginBottom: '16px',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }}>📊</div>
                  <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    letterSpacing: '-0.01em'
                  }}>
                    KOPIS 데이터 기반 트렌드 분석을 준비하고 있습니다...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* 스크롤바 스타일링 */
          .ai-content::-webkit-scrollbar {
            width: 6px;
          }

          .ai-content::-webkit-scrollbar-track {
            background: #f1f3f4;
            border-radius: 3px;
          }

          .ai-content::-webkit-scrollbar-thumb {
            background: #c1c8cd;
            border-radius: 3px;
            transition: background 0.2s ease;
          }

          .ai-content::-webkit-scrollbar-thumb:hover {
            background: #9aa0a6;
          }

          /* 스크롤 안정성을 위한 추가 스타일 */
          .ai-content {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }

          /* 커서 깜빡이는 애니메이션 */
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}

export default PerformanceAnalysisPage;
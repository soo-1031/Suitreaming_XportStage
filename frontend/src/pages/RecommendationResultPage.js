import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function RecommendationResultPage() {
  const [language, setLanguage] = useState("ko");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // New states for step-by-step process
  const [currentStep, setCurrentStep] = useState(1);
  const [stepProgress, setStepProgress] = useState(0);
  const [stepMessage, setStepMessage] = useState("AI가 추론을 시작합니다...");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [exaoneFullResponse, setExaoneFullResponse] = useState("");
  const [showResultsButton, setShowResultsButton] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const surveyData = location.state?.surveyData || {};

  const toggleLanguage = () => {
    setLanguage(language === "ko" ? "en" : "ko");
  };

  const text = {
    ko: {
      welcome: "안녕하세요",
      welcomeSuffix: "님",
      subtitle: "귀하를 위한 맞춤 추천 공연입니다",
      viewDetails: "상세보기",
      viewAllShows: "전체 공연 보기",
      langToggle: "EN",
      back: "뒤로",
      dashboard: "대시보드",
      logout: "로그아웃",
      editProfile: "프로필 수정",
      myDashboard: "나의 대시보드",
      loading: "맞춤 추천을 불러오는 중...",
      error: "추천을 불러오는데 실패했습니다.",
      noResults: "추천 결과가 없습니다.",
      step1Title: "1. AI 기반 사용자 분석",
      step2Title: "2. 유사도 검색 기반 사용자 맞춤 공연",
      analyzing: "AI가 사용자 선호도를 분석하고 있습니다...",
      searching: "최적의 공연을 찾고 있습니다...",
      completed: "분석 완료!"
    },
    en: {
      welcome: "Welcome",
      welcomeSuffix: "",
      subtitle: "Here are your personalized recommendations",
      viewDetails: "View Details",
      viewAllShows: "View All Shows",
      langToggle: "KO",
      back: "Back",
      dashboard: "Dashboard",
      logout: "Logout",
      editProfile: "Edit Profile",
      myDashboard: "My Dashboard",
      loading: "Loading personalized recommendations...",
      error: "Failed to load recommendations.",
      noResults: "No recommendations found.",
      step1Title: "1. AI-based User Analysis",
      step2Title: "2. Similarity Search for Personalized Performances",
      analyzing: "AI is analyzing user preferences...",
      searching: "Finding optimal performances...",
      completed: "Analysis Complete!"
    },
  };

  const currentText = text[language];

  useEffect(() => {
    console.log("🆕 Starting step-by-step recommendation process");

    // Check if we have cached recommendations for the same survey data
    const cachedData = checkCachedRecommendations();
    if (cachedData) {
      console.log("🔄 Loading cached recommendations");
      loadCachedRecommendations(cachedData);
    } else {
      console.log("🆕 No cached data found, starting fresh analysis");
      startStepByStepProcess();
    }
  }, []);

  const checkCachedRecommendations = () => {
    try {
      const cached = localStorage.getItem('recommendationCache');
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const currentTime = new Date().getTime();

      // Check if cache is expired (24 hours)
      if (currentTime - cacheData.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('recommendationCache');
        return null;
      }

      // Check if survey data matches
      const currentSurveyHash = JSON.stringify(surveyData);
      if (cacheData.surveyHash === currentSurveyHash) {
        return cacheData;
      }

      return null;
    } catch (error) {
      console.error("Error checking cache:", error);
      localStorage.removeItem('recommendationCache');
      return null;
    }
  };

  const loadCachedRecommendations = (cachedData) => {
    setRecommendations(cachedData.recommendations);
    setAnalysisResults(cachedData.analysisResults);
    setExaoneFullResponse(cachedData.exaoneFullResponse);
    setCurrentStep(2);
    setStepProgress(100);
    setStepMessage("캐시된 결과를 불러왔습니다!");
    setIsAnalyzing(false);
    setShowResults(true);
    setShowResultsButton(false);
  };

  const saveCachedRecommendations = (recommendations, analysisResults, exaoneResponse) => {
    try {
      const cacheData = {
        timestamp: new Date().getTime(),
        surveyHash: JSON.stringify(surveyData),
        recommendations,
        analysisResults,
        exaoneFullResponse: exaoneResponse
      };
      localStorage.setItem('recommendationCache', JSON.stringify(cacheData));
      console.log("💾 Recommendations cached successfully");
    } catch (error) {
      console.error("Error saving cache:", error);
    }
  };

  const clearCacheAndRefresh = () => {
    localStorage.removeItem('recommendationCache');
    setRecommendations([]);
    setAnalysisResults(null);
    setExaoneFullResponse("");
    setCurrentStep(1);
    setStepProgress(0);
    setStepMessage("AI가 추론을 시작합니다...");
    setIsAnalyzing(true);
    setShowResults(false);
    setShowResultsButton(false);
    startStepByStepProcess();
  };

  const startStepByStepProcess = async () => {
    try {
      // Integrated process: AI analysis + BGE-M3 similarity search
      await performIntegratedAnalysis();
    } catch (error) {
      console.error("Error in integrated process:", error);
      setError(error.message);
      setIsAnalyzing(false);
    }
  };

  const performIntegratedAnalysis = async () => {
    console.log("🚀 Starting integrated AI analysis + BGE-M3 similarity search");
    setStepMessage("AI가 추론을 시작합니다...");
    setStepProgress(10);

    try {
      // Use EventSource for Server-Sent Events
      const surveyDataStr = encodeURIComponent(JSON.stringify(surveyData));
      const eventSource = new EventSource(`http://localhost:8000/api/recommendation/stream-analysis?survey_data=${surveyDataStr}`);

      let extractedKeywords = [];

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'status':
              setStepMessage(data.message);
              setStepProgress(15);
              break;

            case 'inference':
              // Show simple AI thinking message during inference
              setStepMessage("AI 추론 중...");
              setStepProgress(Math.min(30, 15 + data.text.length * 0.05));
              break;

            case 'inference_complete':
              setStepMessage(data.message);
              setStepProgress(35);
              break;

            case 'full_response':
              // Display ExaONE's complete analysis naturally in AI thinking block
              setExaoneFullResponse(data.response);
              setStepMessage("✨ 분석을 완료했습니다. 유사도 검색을 시작합니다...");
              setStepProgress(40);
              break;

            case 'keyword':
              // Add keyword one by one with animation
              extractedKeywords.push(data.keyword);
              setAnalysisResults(prev => ({
                ...prev,
                status: "success",
                keywords: [...extractedKeywords],
                analysis_text: `키워드 추출 중: ${extractedKeywords.join(", ")}`
              }));
              setStepProgress(35 + (data.index + 1) * 1);
              break;

            case 'complete':
              setAnalysisResults({
                status: "success",
                keywords: data.keywords,
                analysis_text: `사용자 선호 분석 완료: ${data.keywords.join(", ")}`
              });
              setCurrentStep(2);
              setStepProgress(50);
              eventSource.close();
              // Continue with similarity search
              performSimilaritySearch();
              break;

            case 'error':
              throw new Error(data.message);
          }
        } catch (parseError) {
          console.error("Error parsing streaming data:", parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error("EventSource error:", error);
        eventSource.close();

        // Show error instead of fallback
        setError("스트리밍 분석 연결에 실패했습니다.");
        setIsAnalyzing(false);
      };

      // Set timeout for EventSource
      setTimeout(() => {
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close();
          // Show timeout error instead of fallback
          if (!exaoneFullResponse && !analysisResults) {
            setError("분석이 시간 초과되었습니다. 다시 시도해주세요.");
            setIsAnalyzing(false);
          }
        }
      }, 30000); // 30 second timeout

    } catch (error) {
      console.error("Error in integrated analysis:", error);
      // Show error instead of fallback
      setError(`분석 중 오류가 발생했습니다: ${error.message}`);
      setIsAnalyzing(false);
    }
  };

  const handleViewResults = () => {
    setShowResultsButton(false);
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const performSimilaritySearch = async () => {
    console.log("🔍 Step 2: Starting BGE-M3 similarity search");
    setStepMessage("BGE-M3 모델을 사용하여 유사도 검색을 수행하고 있습니다...");
    setStepProgress(60);

    // Simulate processing steps for better UX
    const searchSteps = [
      { progress: 70, message: "임베딩 벡터를 생성하고 있습니다..." },
      { progress: 80, message: "유사도를 계산하고 있습니다..." },
      { progress: 90, message: "최적의 공연을 선별하고 있습니다..." },
    ];

    for (const step of searchSteps) {
      setTimeout(() => {
        setStepProgress(step.progress);
        setStepMessage(step.message);
      }, (step.progress - 60) * 100); // Spread out over time
    }

    try {
      // Wait for visual effect
      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await fetch("http://localhost:8000/api/recommendation/step-by-step", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          survey_data: surveyData,
          step: 2
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await response.json();
      console.log("✅ Recommendation result:", data);

      if (data.recommendations && data.recommendations.length > 0) {
        // Transform the recommendations to match expected format
        const formattedRecommendations = data.recommendations.map((rec, index) => ({
          ...rec.showcase,
          similarity: rec.similarity_score,
          rank: index + 1
        }));

        setRecommendations(formattedRecommendations);
        setStepProgress(100);
        setStepMessage(`✅ ${data.recommendations.length}개의 맞춤 공연을 찾았습니다!`);

        // Save to cache
        saveCachedRecommendations(formattedRecommendations, analysisResults, exaoneFullResponse);

        // Show results button after completion
        setShowResultsButton(true);

      } else {
        throw new Error("No recommendations found");
      }

    } catch (error) {
      console.error("Error in similarity search:", error);
      setError(error.message);
      setIsAnalyzing(false);
    }
  };

  const getPosterImage = (title, artist) => {
    console.log(`Looking for poster for: "${title}"`);

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
      "Light Trees": "Light Trees_poster.jpg",
      "Yutnori: The Game That Nobody Plays These Day": "Yutnori- The Game That Nobody Plays These Day_poster.jpg",
      "Chair,Table,Chair": "Chair,Table,Chair_poster.jpg",
      "Not of This World": "Not of This World_poster.jpg",
      "Swipe!": "Swipe!_poster.jpg",
      "Gyogam": "Gyogam_poster.jpg",
    };

    let posterFile = posterMap[title];

    // Keyword matching fallback
    if (!posterFile) {
      const titleLower = title?.toLowerCase() || "";
      if (titleLower.includes("drum") || titleLower.includes("동네북")) {
        posterFile = "The Drum's Dream_poster.jpg";
      } else if (titleLower.includes("snow") || titleLower.includes("눈") || titleLower.includes("설")) {
        posterFile = "Lee Jaram Pansori 'Snow, Snow, Snow'_poster.jpg";
      }
    }

    if (posterFile) {
      return `/assets/posters/${encodeURIComponent(posterFile)}`;
    }
    return null;
  };

  const getShowIcon = (title, genre) => {
    const titleLower = title.toLowerCase();
    const genreLower = (genre || "").toLowerCase();

    if (titleLower.includes("drum") || titleLower.includes("드럼")) return "🥁";
    if (titleLower.includes("aesthetic") || titleLower.includes("flow")) return "🎵";
    if (titleLower.includes("shimmer") || titleLower.includes("shining")) return "✨";
    if (genreLower.includes("dance") || genreLower.includes("무용")) return "💃";
    if (genreLower.includes("music") || genreLower.includes("음악")) return "🎶";
    if (genreLower.includes("theater") || genreLower.includes("연극")) return "🎭";
    return "🎪";
  };

  const calculateMatchScore = (similarity) => {
    if (similarity === undefined || similarity === null || isNaN(similarity)) {
      return 85;
    }
    return Math.round(similarity * 100);
  };

  // Analysis screen with step-by-step progress
  if (isAnalyzing) {
    return (
      <div className="survey-container">
        <div className="header">
          <div className="logo" onClick={() => (window.location.href = "/")}>
            <img
              src="/assets/images/PAMS_Logo.png"
              alt="PAMS 2025"
              style={{ height: "32px", width: "auto" }}
            />
          </div>
          <div className="nav-buttons">
            <button className="lang-toggle" onClick={toggleLanguage}>
              {currentText.langToggle}
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", padding: "50px 20px", maxWidth: "600px", margin: "0 auto" }}>
          <div className="loading-icon" style={{ fontSize: "60px", marginBottom: "30px" }}>
            ⚡
          </div>
          <h2 style={{ marginBottom: "40px", color: "#2c3e50", fontFamily: "var(--font-korean)" }}>
            AI가 맞춤 추천을 생성하고 있습니다...
          </h2>

          {/* Progress Steps */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "20px",
              position: "relative"
            }}>
              {/* Step 1 */}
              <div style={{
                flex: 1,
                textAlign: "left",
                opacity: currentStep >= 1 ? 1 : 0.5
              }}>
                <div style={{
                  width: "30px",
                  height: "30px",
                  backgroundColor: currentStep >= 1 ? "#3498db" : "#ecf0f1",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  marginBottom: "10px"
                }}>
                  {currentStep > 1 ? "✓" : "1"}
                </div>
                <h4 style={{ fontSize: "14px", margin: 0, color: "#2c3e50", fontFamily: "var(--font-korean)" }}>
                  AI 기반 사용자 분석
                </h4>
              </div>

              {/* Connection Line */}
              <div style={{
                flex: 2,
                height: "2px",
                backgroundColor: currentStep >= 2 ? "#3498db" : "#ecf0f1",
                marginTop: "14px",
                marginLeft: "10px",
                marginRight: "10px"
              }}></div>

              {/* Step 2 */}
              <div style={{
                flex: 1,
                textAlign: "right",
                opacity: currentStep >= 2 ? 1 : 0.5
              }}>
                <div style={{
                  width: "30px",
                  height: "30px",
                  backgroundColor: currentStep >= 2 ? "#3498db" : "#ecf0f1",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  marginBottom: "10px",
                  marginLeft: "auto"
                }}>
                  {stepProgress >= 100 ? "✓" : "2"}
                </div>
                <h4 style={{ fontSize: "14px", margin: 0, color: "#2c3e50", fontFamily: "var(--font-korean)" }}>
                  유사도 검색 기반 맞춤 공연
                </h4>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#ecf0f1",
              borderRadius: "4px",
              overflow: "hidden",
              marginBottom: "20px"
            }}>
              <div style={{
                width: `${stepProgress}%`,
                height: "100%",
                backgroundColor: "#3498db",
                transition: "width 0.3s ease"
              }}></div>
            </div>

            {/* Current Step Message */}
            <p style={{
              fontSize: "16px",
              color: "#7f8c8d",
              minHeight: "24px",
              margin: "0 0 20px 0",
              fontFamily: "var(--font-korean)"
            }}>
              {stepMessage}
            </p>

            {/* Results Button - Positioned above keywords for better UX */}
            {showResultsButton && (
              <div style={{ textAlign: "center", marginTop: "30px", marginBottom: "20px" }}>
                <button
                  onClick={handleViewResults}
                  style={{
                    background: "linear-gradient(135deg, #e74c3c, #c0392b)",
                    color: "white",
                    border: "none",
                    padding: "18px 35px",
                    borderRadius: "30px",
                    fontSize: "18px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(231, 76, 60, 0.4)",
                    transition: "all 0.3s ease",
                    fontFamily: "var(--font-korean)",
                    minWidth: "250px",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #c0392b, #a93226)";
                    e.target.style.transform = "translateY(-3px) scale(1.02)";
                    e.target.style.boxShadow = "0 8px 25px rgba(231, 76, 60, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #e74c3c, #c0392b)";
                    e.target.style.transform = "translateY(0) scale(1)";
                    e.target.style.boxShadow = "0 6px 20px rgba(231, 76, 60, 0.4)";
                  }}
                >
                  🎯 맞춤 추천 결과 보기
                </button>
              </div>
            )}

            {/* Keywords Display with Animation */}
            {analysisResults && analysisResults.keywords && currentStep >= 1 && (
              <div style={{
                backgroundColor: "#f8f9fa",
                padding: "20px",
                borderRadius: "12px",
                marginTop: "10px",
                border: "1px solid #e9ecef"
              }}>
                <h4 style={{
                  margin: "0 0 15px 0",
                  color: "#2c3e50",
                  textAlign: "center",
                  fontSize: "16px",
                  fontFamily: "var(--font-korean)"
                }}>
                  💡 추출된 키워드
                </h4>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  justifyContent: "center",
                  minHeight: "40px"
                }}>
                  {analysisResults.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: "#27ae60",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "500",
                        fontFamily: "var(--font-korean)",
                        animation: `keywordAppear 0.5s ease-in-out ${index * 0.2}s both`,
                        boxShadow: "0 2px 4px rgba(39, 174, 96, 0.3)",
                        transform: "translateY(0)",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 8px rgba(39, 174, 96, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 4px rgba(39, 174, 96, 0.3)";
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Inference Display Area */}
            {currentStep >= 1 && (
              <div style={{
                backgroundColor: "#2c3e50",
                color: "#ecf0f1",
                padding: "15px",
                borderRadius: "8px",
                marginTop: "15px",
                fontFamily: "monospace",
                fontSize: "13px",
                minHeight: "60px",
                border: "2px solid #34495e"
              }}>
                <div style={{
                  marginBottom: "8px",
                  fontSize: "12px",
                  color: "#95a5a6",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontFamily: "var(--font-korean)"
                }}>
                  추론 과정:
                </div>
                <div style={{
                  color: "#f39c12",
                  lineHeight: "1.4",
                  minHeight: "20px",
                  fontFamily: "var(--font-korean)",
                  whiteSpace: "pre-wrap",
                  maxHeight: "200px",
                  overflowY: "auto",
                  padding: "5px"
                }}>
                  {exaoneFullResponse ? (
                    <div>
                      <div style={{
                        color: "#95a5a6",
                        fontSize: "11px",
                        marginBottom: "8px",
                        fontWeight: "bold"
                      }}>
                        🤖 AI 분석 완료:
                      </div>
                      <div style={{
                        fontSize: "14px",
                        lineHeight: "1.6"
                      }}>
                        {exaoneFullResponse}
                      </div>
                    </div>
                  ) : stepMessage === 'AI 추론 중...' ? (
                    '분석을 진행하고 있습니다...'
                  ) : (
                    '추론을 시작합니다...'
                  )}
                </div>
              </div>
            )}
          </div>

          <p style={{ color: "#95a5a6", fontSize: "14px", fontFamily: "var(--font-korean)" }}>
            잠시만 기다려주세요. AI가 최적의 공연을 찾고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  // Results display
  return (
    <div className="survey-container">
      <div className="header">
        <div className="logo" onClick={() => (window.location.href = "/")}>
          <img
            src="/assets/images/PAMS_Logo.png"
            alt="PAMS 2025"
            style={{ height: "32px", width: "auto" }}
          />
        </div>
        <div className="nav-buttons">
          <button className="lang-toggle" onClick={toggleLanguage}>
            {currentText.langToggle}
          </button>
          <button className="btn secondary">{currentText.editProfile}</button>
          <button className="btn secondary">{currentText.myDashboard}</button>
          <button className="btn secondary">{currentText.logout}</button>
        </div>
      </div>

      <div style={{ marginBottom: "30px" }}>
        <h1>
          {currentText.welcome}, {surveyData.firstName || "게스트"}
          {currentText.welcomeSuffix}
        </h1>
        <p style={{ color: "#666" }}>{currentText.subtitle}</p>
      </div>

      {error && (
        <div style={{ textAlign: "center", padding: "50px 0", color: "#e74c3c" }}>
          <h3>{currentText.error}</h3>
          <button className="btn" onClick={() => window.location.reload()}>
            재시도
          </button>
        </div>
      )}

      {!error && recommendations.length === 0 && !isAnalyzing && (
        <div style={{ textAlign: "center", padding: "50px 0", color: "#666" }}>
          <h3>{currentText.noResults}</h3>
        </div>
      )}

      {/* Cache notification */}
      {recommendations.length > 0 && stepMessage === "캐시된 결과를 불러왔습니다!" && (
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "15px 20px",
          borderRadius: "10px",
          margin: "20px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>⚡</span>
            <div>
              <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                캐시된 결과를 빠르게 불러왔습니다
              </div>
              <div style={{ fontSize: "12px", opacity: "0.8" }}>
                동일한 설문 결과로 이전에 생성된 추천을 표시하고 있습니다
              </div>
            </div>
          </div>
          <button
            onClick={clearCacheAndRefresh}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,255,255,0.3)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
            }}
          >
            🔄 새로 분석하기
          </button>
        </div>
      )}

      <div id="recommendations">
        {recommendations.map((recommendation, index) => {
          const posterUrl = getPosterImage(recommendation.title, recommendation.artist);

          return (
            <div key={index} className="recommendation-card">
              <div className="show-image">
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={recommendation.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      const parent = e.target.parentElement;
                      parent.innerHTML = getShowIcon(recommendation.title, recommendation.genre);
                      parent.style.fontSize = "32px";
                      parent.style.display = "flex";
                      parent.style.alignItems = "center";
                      parent.style.justifyContent = "center";
                      parent.style.color = "white";
                    }}
                  />
                ) : (
                  getShowIcon(recommendation.title, recommendation.genre)
                )}
              </div>
              <div className="show-details">
                <div className="recommendation-rank">#{recommendation.rank}</div>
                <div className="show-title">{recommendation.title}</div>
                <div className="show-meta">
                  {recommendation.duration || "60분"} • {recommendation.genre || "공연"}
                </div>
                <div className="show-meta">{recommendation.artist}</div>
                <div className="recommendation-actions">
                  <span className="match-score">
                    유사도 {calculateMatchScore(recommendation.similarity)}%
                  </span>
                  <button
                    className="btn btn-detail"
                    onClick={() =>
                      navigate(`/showcase/${recommendation.id.toString().replace("pams_", "")}`)
                    }
                  >
                    {currentText.viewDetails}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <button className="btn secondary" onClick={() => navigate("/showcases")}>
          {currentText.viewAllShows}
        </button>
      </div>
    </div>
  );
}

export default RecommendationResultPage;
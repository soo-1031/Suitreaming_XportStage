import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function BookerMatchingPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('ko');
  const [currentStep, setCurrentStep] = useState(1);
  const [showDemoPopup, setShowDemoPopup] = useState(true);
  const [formData, setFormData] = useState({
    // Basic Information (Step 1) - Pre-filled demo data
    firstName: '예술',
    lastName: '김',
    orgName: '서울아트센터',
    orgType: '페스티벌',
    position: '프로그래머',
    email: 'test@seoularts.com',
    phone: '+82-10-1234-5678',
    website: 'https://www.seoularts.com',
    country: '대한민국',

    // Schedule Related (Step 2) - Pre-filled demo data
    availableDates: '2024년 9월 ~ 11월',
    preferredVenues: ['중극장', '소극장'],
    budgetRange: '50k-100k',
    targetAudience: '가족, 전문가, 젊은층',
    expectedAudience: '300-800명',
    tourDuration: '2-3주',

    // Survey Questions (Step 3) - Pre-filled demo data
    interestedGenres: ['traditional', 'contemporary', 'dance'],
    performanceStyle: '전통과 현대가 조화를 이루는 작품을 선호합니다. 특히 한국의 전통 무용과 현대적 해석이 결합된 공연에 관심이 많습니다.',
    culturalThemes: '한국의 전통 문화를 현대적으로 재해석한 작품, K-문화의 글로벌 확산에 기여할 수 있는 콘텐츠',
    collaborationInterest: 'very-interested',
    marketingSupport: '홍보, 미디어, 관객 개발, SNS 마케팅',
    expectedOutcomes: 'PAMS를 통해 혁신적인 한국 공연예술 작품을 발굴하고, 해외 진출 기회를 확보하여 문화 교류를 확대하고자 합니다.'
  });

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const text = {
    ko: {
      title1: "브리게이트 프로필 설문 (1/3)",
      subtitle1: "기본 정보를 입력해주세요",
      title2: "브리게이트 프로필 설문 (2/3)",
      subtitle2: "일정 관련 정보를 입력해주세요",
      title3: "브리게이트 프로필 설문 (3/3)",
      subtitle3: "추가 정보를 입력해주세요",
      back: "뒤로",
      previous: "이전",
      next: "다음",
      cancel: "취소",
      saveDraft: "임시저장",
      submit: "설문 제출",
      langToggle: "EN",
      basicInfo: "기본 정보",
      scheduleRelated: "일정 관련",
      surveyQuestions: "설문 항목",
      demoNotice: "사용 안내",
      demoMessage: "PAMS  데이터베이스와 연동된 추천 알고리즘이 작동됩니다",
      demoSubMessage: "현재 화면은 데모 데이터로 채워져 있습니다. 실제 사용 시 각 항목을 직접 수정해 사용하실 수 있습니다.",
      understand: "이해했습니다",
      continueDemo: "시작하기",
      loadingTitle: "AI가 맞춤 추천을 생성하고 있습니다...",
      loadingSubtitle: "잠시만 기다려주세요",
      loadingMessage: "설문 데이터를 분석하여 최적의 공연을 찾고 있습니다"
    },
    en: {
      title1: "Delegate Profile Survey (1/3)",
      subtitle1: "Please enter your basic information",
      title2: "Delegate Profile Survey (2/3)",
      subtitle2: "Please enter your schedule preferences",
      title3: "Delegate Profile Survey (3/3)",
      subtitle3: "Please enter additional information",
      back: "Back",
      previous: "Previous",
      next: "Next",
      cancel: "Cancel",
      saveDraft: "Save Draft",
      submit: "Submit Survey",
      langToggle: "KO",
      basicInfo: "Basic Information",
      scheduleRelated: "Schedule Related",
      surveyQuestions: "Survey Questions",
      demoNotice: "Usage Guide",
      demoMessage: "Personalized recommendation algorithms integrated with PAMS 2025 database are actually working.",
      demoSubMessage: "User information has been pre-filled for convenience. You can directly modify and use it.",
      understand: "I Understand",
      continueDemo: "Get Started",
      loadingTitle: "AI is generating personalized recommendations...",
      loadingSubtitle: "Please wait a moment",
      loadingMessage: "Analyzing survey data to find the optimal performances"
    }
  };

  const currentText = text[language];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitSurvey = () => {
    console.log("🚀 Survey submission started!");
    console.log("📝 Current formData:", JSON.stringify(formData, null, 2));
    console.log("🔍 Key survey fields:");
    console.log("  - performanceStyle:", formData.performanceStyle);
    console.log("  - culturalThemes:", formData.culturalThemes);
    console.log("  - interestedGenres:", formData.interestedGenres);

    console.log("🎯 Navigating to recommendations with data:", {
      performanceStyle: formData.performanceStyle,
      culturalThemes: formData.culturalThemes,
      interestedGenres: formData.interestedGenres
    });

    // Navigate directly to recommendations page with survey data
    navigate('/recommendations', {
      state: { surveyData: formData }
    });
  };

  const saveDraft = () => {
    alert('임시저장 완료!');
  };

  const orgTypes = ['페스티벌', '극장', '프로덕션', '에이전시', '정부기관', '교육기관', '미디어', '기타'];
  const countries = ['대한민국', '미국', '일본', '중국', '영국', '프랑스', '독일', '캐나다', '호주', '기타'];
  const genres = ['traditional', 'contemporary', 'dance', 'music', 'theater', 'multidisciplinary'];
  const venues = ['소극장', '중극장', '대극장', '야외공연장', '컨벤션센터', '기타'];

  return (
    <div className="survey-container">
      {/* Demo Notice Popup */}
      {showDemoPopup && (
        <div className="demo-popup-overlay">
          <div className="demo-popup">
            <h3>{currentText.demoNotice}</h3>
            <p>{currentText.demoMessage}</p>
            <p style={{fontSize: '14px', color: '#666', marginTop: '15px'}}>
              {currentText.demoSubMessage}
            </p>
            <div className="demo-buttons">
              <button
                className="btn secondary"
                onClick={() => setShowDemoPopup(false)}
              >
                {currentText.understand}
              </button>
              <button
                className="btn"
                onClick={() => setShowDemoPopup(false)}
              >
                {currentText.continueDemo}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="header">
        <div className="logo" onClick={() => window.location.href = '/'}>
          <img src="/assets/images/PAMS_Logo.png" alt="PAMS 2025" style={{height: '32px', width: 'auto'}} />
        </div>
        <div className="nav-buttons">
          <button className="lang-toggle" onClick={toggleLanguage}>
            {currentText.langToggle}
          </button>
          <button className="btn secondary" onClick={() => window.history.back()}>
            {currentText.back}
          </button>
        </div>
      </div>


      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{width: `${(currentStep / 3) * 100}%`}}
        ></div>
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="survey-step">
          <h2>{currentText.title1}</h2>
          <p className="step-subtitle">{currentText.subtitle1}</p>

          <form className="survey-form">
            <h3>{currentText.basicInfo}</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>이름 (First Name) *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="홍"
                  required
                />
              </div>

              <div className="form-group">
                <label>성 (Last Name) *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="길동"
                  required
                />
              </div>

              <div className="form-group">
                <label>기관명 (Organization) *</label>
                <input
                  type="text"
                  value={formData.orgName}
                  onChange={(e) => handleInputChange('orgName', e.target.value)}
                  placeholder="서울아트센터"
                  required
                />
              </div>

              <div className="form-group">
                <label>기관 유형 (Organization Type) *</label>
                <select
                  value={formData.orgType}
                  onChange={(e) => handleInputChange('orgType', e.target.value)}
                  required
                >
                  <option value="">선택하세요</option>
                  {orgTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>직책 (Position) *</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="프로그래머"
                  required
                />
              </div>

              <div className="form-group">
                <label>이메일 (Email) *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>전화번호 (Phone)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+82-10-1234-5678"
                />
              </div>

              <div className="form-group">
                <label>웹사이트 (Website)</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.example.com"
                />
              </div>

              <div className="form-group">
                <label>국가 (Country) *</label>
                <select
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  required
                >
                  <option value="">선택하세요</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="button-group">
              <button type="button" className="btn secondary" onClick={() => window.history.back()}>
                {currentText.cancel}
              </button>
              <button type="button" className="btn" onClick={nextStep}>
                {currentText.next}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 2: Schedule Related */}
      {currentStep === 2 && (
        <div className="survey-step">
          <h2>{currentText.title2}</h2>
          <p className="step-subtitle">{currentText.subtitle2}</p>

          <form className="survey-form">
            <h3>{currentText.scheduleRelated}</h3>

            <div className="form-group">
              <label>선호 공연 일정 (Preferred Performance Dates)</label>
              <input
                type="text"
                value={formData.availableDates}
                onChange={(e) => handleInputChange('availableDates', e.target.value)}
                placeholder="예: 2024년 3월 ~ 5월"
              />
            </div>

            <div className="form-group">
              <label>선호 공연장 유형 (Preferred Venues) *</label>
              <div className="checkbox-group">
                {venues.map(venue => (
                  <div key={venue} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={venue}
                      checked={formData.preferredVenues.includes(venue)}
                      onChange={() => handleCheckboxChange('preferredVenues', venue)}
                    />
                    <label htmlFor={venue}>{venue}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>예산 범위 (Budget Range)</label>
              <select
                value={formData.budgetRange}
                onChange={(e) => handleInputChange('budgetRange', e.target.value)}
              >
                <option value="">선택하세요</option>
                <option value="under-50k">5만 달러 미만</option>
                <option value="50k-100k">5만 - 10만 달러</option>
                <option value="100k-200k">10만 - 20만 달러</option>
                <option value="over-200k">20만 달러 이상</option>
              </select>
            </div>

            <div className="form-group">
              <label>타겟 관객층 (Target Audience)</label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                placeholder="예: 가족, 젊은층, 전문가"
              />
            </div>

            <div className="form-group">
              <label>예상 관객 수 (Expected Audience Size)</label>
              <input
                type="text"
                value={formData.expectedAudience}
                onChange={(e) => handleInputChange('expectedAudience', e.target.value)}
                placeholder="예: 500-1000명"
              />
            </div>

            <div className="form-group">
              <label>투어 기간 (Tour Duration)</label>
              <input
                type="text"
                value={formData.tourDuration}
                onChange={(e) => handleInputChange('tourDuration', e.target.value)}
                placeholder="예: 2주, 1개월"
              />
            </div>

            <div className="button-group">
              <button type="button" className="btn secondary" onClick={prevStep}>
                {currentText.previous}
              </button>
              <button type="button" className="btn secondary" onClick={saveDraft}>
                {currentText.saveDraft}
              </button>
              <button type="button" className="btn" onClick={nextStep}>
                {currentText.next}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Survey Questions */}
      {currentStep === 3 && (
        <div className="survey-step">
          <h2>{currentText.title3}</h2>
          <p className="step-subtitle">{currentText.subtitle3}</p>

          <form className="survey-form">
            <h3>{currentText.surveyQuestions}</h3>

            <div className="form-group">
              <label>1. 관심 있는 장르는 무엇입니까? (복수 선택 가능)</label>
              <div className="checkbox-group">
                {genres.map(genre => (
                  <div key={genre} className="checkbox-item">
                    <input
                      type="checkbox"
                      id={genre}
                      checked={formData.interestedGenres.includes(genre)}
                      onChange={() => handleCheckboxChange('interestedGenres', genre)}
                    />
                    <label htmlFor={genre}>
                      {genre === 'traditional' && '전통 공연예술'}
                      {genre === 'contemporary' && '현대 공연예술'}
                      {genre === 'dance' && '무용'}
                      {genre === 'music' && '음악'}
                      {genre === 'theater' && '연극'}
                      {genre === 'multidisciplinary' && '복합장르'}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>2. 선호하는 공연 스타일을 설명해주세요</label>
              <textarea
                value={formData.performanceStyle}
                onChange={(e) => handleInputChange('performanceStyle', e.target.value)}
                rows="3"
                placeholder="예: 전통과 현대가 조화를 이루는 작품을 선호합니다."
              />
            </div>

            <div className="form-group">
              <label>3. 관심 있는 문화적 테마가 있다면?</label>
              <textarea
                value={formData.culturalThemes}
                onChange={(e) => handleInputChange('culturalThemes', e.target.value)}
                rows="3"
                placeholder="예: 한국의 전통 문화, 현대 도시 문화 등"
              />
            </div>

            <div className="form-group">
              <label>4. 국제 공동 제작에 관심이 있으신가요?</label>
              <select
                value={formData.collaborationInterest}
                onChange={(e) => handleInputChange('collaborationInterest', e.target.value)}
              >
                <option value="">선택하세요</option>
                <option value="very-interested">매우 관심있음</option>
                <option value="somewhat-interested">어느 정도 관심있음</option>
                <option value="not-sure">잘 모르겠음</option>
                <option value="not-interested">관심없음</option>
              </select>
            </div>

            <div className="form-group">
              <label>5. 마케팅 지원이 필요한 영역은?</label>
              <textarea
                value={formData.marketingSupport}
                onChange={(e) => handleInputChange('marketingSupport', e.target.value)}
                rows="3"
                placeholder="예: 홍보, 미디어, 관객 개발 등"
              />
            </div>

            <div className="form-group">
              <label>6. PAMS 참여를 통해 기대하는 성과는?</label>
              <textarea
                value={formData.expectedOutcomes}
                onChange={(e) => handleInputChange('expectedOutcomes', e.target.value)}
                rows="3"
                placeholder="PAMS 참여를 통해 기대하는 성과를 입력해주세요"
              />
            </div>

            <div className="button-group">
              <button type="button" className="btn secondary" onClick={prevStep}>
                {currentText.previous}
              </button>
              <button type="button" className="btn secondary" onClick={saveDraft}>
                {currentText.saveDraft}
              </button>
              <button type="button" className="btn" onClick={submitSurvey}>
                {currentText.submit}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default BookerMatchingPage;
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { addProposal } from '../services/bookingStorage';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import ProposalPDF from '../components/ProposalPDF';

function ProposalFormPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguage] = useState('ko');
  const showcase = location.state?.showcase || {
    id: 1,
    title: "드럼의 꿈",
    artist: "갬블러즈 크루 x 고블린 파티",
    duration: "40분",
    genre: "무용, 쇼케이스"
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };

  const text = {
    ko: {
      proposalGeneration: "제안서 생성",
      proposalSubtitle: "공연 제안서를 생성하기 위한 정보를 입력해주세요",
      back: "← 뒤로",
      cancel: "취소",
      generateProposal: "제안서 생성",
      bookerInfo: "부커 정보",
      venueInfo: "공연장 정보",
      performanceDetails: "공연 세부사항",
      additionalInfo: "추가 정보",
      company: "회사명",
      contactPerson: "담당자명",
      address: "주소",
      phone: "전화번호",
      email: "이메일",
      venueName: "공연장명",
      venueAddress: "공연장 주소",
      capacity: "객석 수",
      venueType: "공연장 유형",
      selectOption: "선택하세요",
      theater: "극장",
      concertHall: "콘서트홀",
      outdoor: "야외공연장",
      festival: "페스티벌",
      other: "기타",
      selectedPerformance: "선택된 공연",
      artist: "아티스트",
      genre: "장르",
      duration: "소요시간",
      preferredDate: "공연 희망 날짜",
      performanceTime: "공연 시간",
      ticketPrice: "티켓 가격 (USD)",
      performanceCount: "공연 횟수",
      targetAudience: "주요 관객층",
      marketingBudget: "마케팅 예산 (USD)",
      specialRequirements: "특별 요구사항",
      additionalNotes: "기타 메모",
      langToggle: "EN"
    },
    en: {
      proposalGeneration: "Generate Proposal",
      proposalSubtitle: "Please enter information to generate a performance proposal",
      back: "← Back",
      cancel: "Cancel",
      generateProposal: "Generate Proposal",
      bookerInfo: "Booker Information",
      venueInfo: "Venue Information",
      performanceDetails: "Performance Details",
      additionalInfo: "Additional Information",
      company: "Company",
      contactPerson: "Contact Person",
      address: "Address",
      phone: "Phone",
      email: "Email",
      venueName: "Venue Name",
      venueAddress: "Venue Address",
      capacity: "Capacity",
      venueType: "Venue Type",
      selectOption: "Select Option",
      theater: "Theater",
      concertHall: "Concert Hall",
      outdoor: "Outdoor Venue",
      festival: "Festival",
      other: "Other",
      selectedPerformance: "Selected Performance",
      artist: "Artist",
      genre: "Genre",
      duration: "Duration",
      preferredDate: "Preferred Date",
      performanceTime: "Performance Time",
      ticketPrice: "Ticket Price (USD)",
      performanceCount: "Number of Performances",
      targetAudience: "Target Audience",
      marketingBudget: "Marketing Budget (USD)",
      specialRequirements: "Special Requirements",
      additionalNotes: "Additional Notes",
      langToggle: "KO"
    }
  };

  const currentText = text[language];

  const [formData, setFormData] = useState({
    // Booker Information
    bookerCompany: 'Glade Entertainment',
    bookerName: 'John Smith',
    bookerAddress: '316 11th St, San Francisco, CA, 94103',
    bookerPhone: '+1-415-555-0123',
    bookerEmail: 'john.smith@glade.com',

    // Venue Information
    venueName: 'Lincoln Center',
    venueAddress: '10 Lincoln Center Plaza, New York, NY 10023',
    venueCapacity: '500',
    venueType: 'theater',
    venueContact: '',

    // Performance Details
    performanceDate: '2025-03-15',
    performanceTime: '19:30',
    ticketPrice: '75',
    performanceCount: '2',
    audienceType: '20-40대 문화예술 애호가, 현대무용 관심층',
    marketingBudget: '8000',

    // Additional Information
    specialRequirements: '무대 조명: LED 색상 변경 가능, 음향: 무선 마이크 4개, 무대: 최소 12m x 8m',
    additionalNotes: 'PAMS 2024에서 우수한 평가를 받은 작품으로, 현지 언론 및 관객들의 높은 관심이 예상됩니다.'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.bookerCompany || !formData.bookerName || !formData.venueName) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      // Save proposal to localStorage
      const proposal = addProposal(showcase, formData);

      // Generate PDF
      const pdfDoc = <ProposalPDF showcase={showcase} formData={formData} />;
      const asPdf = pdf(pdfDoc);
      const pdfBlob = await asPdf.toBlob();

      // Create object URL for the PDF
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Open PDF in new window
      const newWindow = window.open(pdfUrl, '_blank');
      if (newWindow) {
        newWindow.focus();
      }

      alert('제안서 PDF가 새 창에서 열렸습니다!\n대시보드에서도 확인하실 수 있습니다.');

      // Navigate to dashboard after generating proposal
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error saving proposal:', error);
      alert('제안서 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
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
            <h1>{currentText.proposalGeneration}</h1>
            <p>{currentText.proposalSubtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="proposal-form">
          {/* Booker Information */}
          <div className="form-section">
            <h3 className="section-title">{currentText.bookerInfo}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="bookerCompany">{currentText.company} *</label>
                <input
                  type="text"
                  id="bookerCompany"
                  name="bookerCompany"
                  value={formData.bookerCompany}
                  onChange={handleInputChange}
                  placeholder="예: Glade Entertainment"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="bookerName">{currentText.contactPerson} *</label>
                <input
                  type="text"
                  id="bookerName"
                  name="bookerName"
                  value={formData.bookerName}
                  onChange={handleInputChange}
                  placeholder="예: John Smith"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="bookerAddress">{currentText.address}</label>
                <input
                  type="text"
                  id="bookerAddress"
                  name="bookerAddress"
                  value={formData.bookerAddress}
                  onChange={handleInputChange}
                  placeholder="예: 316 11th St, San Francisco, CA, 94103"
                />
              </div>
              <div className="form-group">
                <label htmlFor="bookerPhone">{currentText.phone}</label>
                <input
                  type="tel"
                  id="bookerPhone"
                  name="bookerPhone"
                  value={formData.bookerPhone}
                  onChange={handleInputChange}
                  placeholder="예: +1-415-555-0123"
                />
              </div>
              <div className="form-group full-width">
                <label htmlFor="bookerEmail">{currentText.email}</label>
                <input
                  type="email"
                  id="bookerEmail"
                  name="bookerEmail"
                  value={formData.bookerEmail}
                  onChange={handleInputChange}
                  placeholder="예: john.smith@glade.com"
                />
              </div>
            </div>
          </div>

          {/* Venue Information */}
          <div className="form-section">
            <h3 className="section-title">{currentText.venueInfo}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="venueName">{currentText.venueName} *</label>
                <input
                  type="text"
                  id="venueName"
                  name="venueName"
                  value={formData.venueName}
                  onChange={handleInputChange}
                  placeholder="예: Lincoln Center"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="venueAddress">{currentText.venueAddress}</label>
                <input
                  type="text"
                  id="venueAddress"
                  name="venueAddress"
                  value={formData.venueAddress}
                  onChange={handleInputChange}
                  placeholder="예: 10 Lincoln Center Plaza, New York, NY"
                />
              </div>
              <div className="form-group">
                <label htmlFor="venueCapacity">{currentText.capacity}</label>
                <input
                  type="number"
                  id="venueCapacity"
                  name="venueCapacity"
                  value={formData.venueCapacity}
                  onChange={handleInputChange}
                  placeholder="예: 500"
                />
              </div>
              <div className="form-group">
                <label htmlFor="venueType">{currentText.venueType}</label>
                <select
                  id="venueType"
                  name="venueType"
                  value={formData.venueType}
                  onChange={handleInputChange}
                >
                  <option value="">{currentText.selectOption}</option>
                  <option value="theater">{currentText.theater}</option>
                  <option value="concert_hall">{currentText.concertHall}</option>
                  <option value="outdoor">{currentText.outdoor}</option>
                  <option value="festival">{currentText.festival}</option>
                  <option value="other">{currentText.other}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Performance Details */}
          <div className="form-section">
            <h3 className="section-title">{currentText.performanceDetails}</h3>
            <div className="performance-info-display">
              <div className="selected-performance">
                <h4>{currentText.selectedPerformance}: {showcase.title}</h4>
                <p>{currentText.artist}: {showcase.artist}</p>
                <p>{currentText.genre}: {showcase.genre} • {currentText.duration}: {showcase.duration}</p>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="performanceDate">{currentText.preferredDate}</label>
                <input
                  type="date"
                  id="performanceDate"
                  name="performanceDate"
                  value={formData.performanceDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="performanceTime">{currentText.performanceTime}</label>
                <input
                  type="time"
                  id="performanceTime"
                  name="performanceTime"
                  value={formData.performanceTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="ticketPrice">{currentText.ticketPrice}</label>
                <input
                  type="number"
                  id="ticketPrice"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handleInputChange}
                  placeholder="예: 50"
                />
              </div>
              <div className="form-group">
                <label htmlFor="performanceCount">{currentText.performanceCount}</label>
                <select
                  id="performanceCount"
                  name="performanceCount"
                  value={formData.performanceCount}
                  onChange={handleInputChange}
                >
                  <option value="1">1회</option>
                  <option value="2">2회</option>
                  <option value="3">3회</option>
                  <option value="4">4회 이상</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="audienceType">{currentText.targetAudience}</label>
                <input
                  type="text"
                  id="audienceType"
                  name="audienceType"
                  value={formData.audienceType}
                  onChange={handleInputChange}
                  placeholder="예: 20-40대 문화예술 애호가"
                />
              </div>
              <div className="form-group">
                <label htmlFor="marketingBudget">{currentText.marketingBudget}</label>
                <input
                  type="number"
                  id="marketingBudget"
                  name="marketingBudget"
                  value={formData.marketingBudget}
                  onChange={handleInputChange}
                  placeholder="예: 5000"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="form-section">
            <h3 className="section-title">{currentText.additionalInfo}</h3>
            <div className="form-group">
              <label htmlFor="specialRequirements">{currentText.specialRequirements}</label>
              <textarea
                id="specialRequirements"
                name="specialRequirements"
                value={formData.specialRequirements}
                onChange={handleInputChange}
                placeholder="무대 설치, 음향, 조명 등 특별한 요구사항이 있으면 입력해주세요"
                rows={4}
              />
            </div>
            <div className="form-group">
              <label htmlFor="additionalNotes">{currentText.additionalNotes}</label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                placeholder="기타 전달하고 싶은 내용을 입력해주세요"
                rows={4}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Link to={`/showcase/${showcase.id || '1'}`} className="btn secondary">
              {currentText.cancel}
            </Link>
            <button type="submit" className="btn">
              {currentText.generateProposal}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProposalFormPage;
import React from 'react';

function AboutPage() {
  return (
    <div className="page about-page">
      <h1>수트리밍 소개</h1>
      
      <div className="content">
        <section>
          <h2>개요</h2>
          <p>
            수트리밍은 AI 시대의 공연산업 B2B 자동화 유통 솔루션입니다.
            KOPIS 데이터를 기반으로 한 예측적 매칭 시스템으로 한국 공연예술의
            글로벌 진출을 가속화하고 데이터 기반 의사결정을 지원합니다.
          </p>
        </section>

        <section>
          <h2>주요 기능</h2>
          <ul>
            <li>KOPIS 데이터 기반 예측적 매칭 시스템</li>
            <li>Sentence-BERT 임베딩 768차원 콘텐츠 유사도 분석</li>
            <li>XGBoost 회귀모델 기반 ROI 예측</li>
            <li>Venue Fit 매칭 알고리즘</li>
            <li>B2B 특화 프로페셔널 워크플로우</li>
            <li>GPT-4o API 기반 실시간 번역</li>
            <li>Chroma 벡터 DB 시맨틱 검색</li>
          </ul>
        </section>

        <section>
          <h2>기술 스택</h2>
          <ul>
            <li>Frontend: React.js, Next.js</li>
            <li>Backend: FastAPI, Python</li>
            <li>AI/ML: Sentence-BERT, XGBoost, TF-IDF</li>
            <li>Vector DB: ChromaDB</li>
            <li>Cloud: Google BigQuery, Vertex AI</li>
            <li>API: GPT-4o, Google Slides API</li>
          </ul>
        </section>

        <section>
          <h2>핵심 API Endpoints</h2>
          <ul>
            <li><code>GET /api/showcases</code> - 쇼케이스 목록 조회</li>
            <li><code>POST /api/showcases/embed</code> - 임베딩 생성</li>
            <li><code>POST /api/matching/similar</code> - 유사 쇼케이스 검색</li>
            <li><code>POST /api/matching/recommend</code> - 부커 프로필 기반 추천</li>
            <li><code>GET /api/showcases/:id/venue-fit</code> - Venue Fit 점수 계산</li>
            <li><code>POST /api/chroma/search</code> - 벡터 유사도 검색</li>
          </ul>
        </section>

        <section>
          <h2>차별성 및 독창성</h2>
          <ol>
            <li><strong>KOPIS 데이터 기반 예측적 매칭</strong>: 50년간 변하지 않은 ‘감’과 ‘인맥’ 중심의 아날로그적 네트워킹을 데이터 기반 과학적 매칭으로 전환</li>
            <li><strong>ROI 중심 투자 의사결정 지원</strong>: 기존 공연업계의 ‘직감적 선택’을 정량적 수익성 예측으로 보완</li>
            <li><strong>B2B 특화 프로페셔널 워크플로우</strong>: 부커 개인화 대시보드와 Venue Fit 점수 실시간 조회 시스템</li>
          </ol>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;
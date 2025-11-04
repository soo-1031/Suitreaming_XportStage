# KOPIS 공연 추천 시스템 (PoC)

공연 예술 분야의 쇼케이스 매칭 및 추천을 위한 AI 기반 플랫폼입니다.

## 🎯 주요 기능

- **AI 기반 공연 추천**: BGE-M3 벡터 임베딩을 활용한 유사도 기반 추천
- **북커 매칭**: 북커 프로필과 공연의 자동 매칭
- **KOPIS API 연동**: 한국 공연예술 통합전산망(KOPIS) 데이터 통합
- **ROI 계산기**: 장르별 수익성 분석 도구
- **실시간 AI 분석**: Ollama/ExaONE을 활용한 스트리밍 분석

## 🏗️ 기술 스택

### Backend
- **FastAPI**: RESTful API 서버
- **ChromaDB**: 벡터 데이터베이스 (유사도 검색)
- **BGE-M3**: 다국어 임베딩 모델
- **SQLite**: 관계형 데이터베이스
- **Ollama**: 로컬 LLM 서버 (ExaONE 모델)

### Frontend
- **React 19**: UI 프레임워크
- **React Router**: 라우팅
- **Chart.js**: 데이터 시각화
- **React PDF**: PDF 생성

## 📋 사전 요구사항

- Python 3.8+
- Node.js 16+
- npm 또는 yarn
- (선택) Ollama 서버 (AI 분석 기능용)

## 🚀 설치 및 실행

### 1. 저장소 클론

```bash
git clone <your-repo-url>
cd KOPIS_원본코드s
```

### 2. Backend 설정

```bash
cd backend

# 가상환경 생성 (권장)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# PAMS.csv 파일 확인
# 파일이 없으면 상위 디렉토리에서 자동 복사 시도
# 또는 수동으로 backend/ 디렉토리에 PAMS.csv 파일 배치
```

### 3. Frontend 설정

```bash
cd frontend

# 의존성 설치
npm install

# 포트 설정 (기본 3000, 충돌 시 3001 사용)
# .env 파일 생성 (포트 3000이 사용 중이면)
echo "PORT=3001" > .env
```

### 4. 환경 변수 설정 (선택)

백엔드 루트에 `.env` 파일 생성 (API 키 등):

```bash
cd backend
cp .env.example .env  # 예시 파일 참고
# .env 파일 편집
```

### 5. Ollama 설정 (선택 - AI 분석 기능용)

```bash
# Ollama 설치 후 모델 다운로드
ollama pull ingu627/exaone4.0:1.2b

# Ollama 서버 실행 (별도 터미널)
ollama serve
```

### 6. 서버 실행

**터미널 1: Backend 서버**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**터미널 2: Frontend 서버**
```bash
cd frontend
npm start
```

서버가 실행되면:
- Frontend: http://localhost:3001 (포트 3000이 사용 중이면 자동으로 3001 사용)
- Backend API: http://localhost:8000
- API 문서: http://localhost:8000/docs

## 📁 프로젝트 구조

```
KOPIS_원본코드s/
├── backend/
│   ├── main.py              # FastAPI 메인 애플리케이션
│   ├── models.py            # 데이터 모델
│   ├── database.py          # 데이터베이스 접근
│   ├── chroma_store.py      # ChromaDB 벡터 스토어
│   ├── matching.py          # 매칭 알고리즘
│   ├── kopis_api.py         # KOPIS API 클라이언트
│   ├── embeddings*.py       # 임베딩 관련 모듈
│   ├── requirements.txt     # Python 의존성
│   ├── PAMS.csv             # 공연 데이터 (로컬)
│   └── chroma_db/           # ChromaDB 저장소 (자동 생성)
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── components/      # 재사용 컴포넌트
│   │   └── services/        # API 서비스
│   ├── public/              # 정적 파일
│   └── package.json         # Node.js 의존성
│
└── README.md                # 이 파일
```

## 🔑 주요 API 엔드포인트

### 쇼케이스
- `GET /api/showcases` - 모든 쇼케이스 조회
- `GET /api/showcases/{id}` - 특정 쇼케이스 조회

### 추천 & 매칭
- `POST /api/matching/similar` - 유사 공연 검색
- `POST /api/matching/recommend` - 프로필 기반 추천
- `POST /api/chroma/search` - 벡터 검색

### KOPIS API 프록시
- `GET /api/kopis/performance-list` - 공연 목록
- `GET /api/kopis/boxoffice` - 박스오피스 순위
- `GET /api/kopis/genre-indices` - 장르별 지수

### AI 분석
- `POST /api/recommendation/analyze-user` - 사용자 분석
- `POST /api/recommendation/step-by-step` - 단계별 추천
- `GET /api/recommendation/stream-analysis` - 스트리밍 분석

## 🐛 문제 해결

### ChromaDB 초기화 오류
```bash
cd backend
rm -rf chroma_db/  # 기존 벡터 DB 삭제
# 서버 재시작 시 자동 재생성
```

### PAMS.csv 파일 없음
- `backend/PAMS.csv` 파일이 있는지 확인
- 없으면 상위 디렉토리(`../../PAMS.csv`)에서 자동 복사 시도
- 수동으로 파일을 `backend/` 디렉토리에 배치

### Ollama 연결 실패
- Ollama 서버가 `http://localhost:11434`에서 실행 중인지 확인
- AI 분석 기능은 선택 사항이므로, 해당 기능을 사용하지 않으면 무시 가능

### 포트 충돌
- Backend 기본 포트: 8000
- Frontend 기본 포트: 3000
- 포트가 사용 중이면 변경 필요

## 📝 주의사항

- **KOPIS API 키**: 현재 코드에 하드코딩되어 있습니다. 프로덕션 환경에서는 환경 변수로 관리하세요.
- **데이터베이스**: `showcases.db`와 `chroma_db/`는 로컬에 생성되며 Git에 포함되지 않습니다.
- **PAMS.csv**: 데이터 파일이 크면 Git LFS 사용을 고려하세요.

## 🚧 향후 개선 사항

- [ ] 환경 변수를 통한 API 키 관리
- [ ] Docker Compose를 통한 통합 배포
- [ ] 프로덕션 환경 설정
- [ ] 테스트 코드 추가

## 📄 라이선스

이 프로젝트는 데모/프로토타입 용도입니다.

## 👥 기여

이슈 및 개선 제안은 GitHub Issues를 통해 제출해주세요.


# 🚀 로컬 데모 배포 가이드

이 문서는 GitHub에 업로드하고 로컬 서버에서 데모를 실행하는 방법을 안내합니다.

## 📤 GitHub 업로드 전 체크리스트

### 1. 민감 정보 확인
- [x] `.gitignore`에 `.env`, `*.db`, `chroma_db/` 포함 확인
- [ ] API 키가 코드에 하드코딩되어 있음 (현재는 데모용으로 허용)

### 2. 필수 파일 확인
- [x] `README.md` - 프로젝트 설명 및 설치 가이드
- [x] `.gitignore` - Git 제외 파일 목록
- [x] `requirements.txt` - Python 의존성
- [x] `package.json` - Node.js 의존성

### 3. 데이터 파일 처리
- `PAMS.csv`: 공개 데이터라면 포함, 민감 데이터라면 제외
- `showcases.db`: `.gitignore`로 제외됨 (자동 생성)
- `chroma_db/`: `.gitignore`로 제외됨 (자동 생성)

## 📤 GitHub 업로드 절차

### 방법 1: GitHub CLI 사용 (권장)

```bash
# GitHub CLI 설치 후
gh repo create kopis-showcase-recommendation --public --source=. --remote=origin --push
```

### 방법 2: 수동 업로드

1. **Git 저장소 초기화**
```bash
cd /Users/hyunsoolee/Desktop/KOPIS_2025/KOPIS_원본코드s
git init
git add .
git commit -m "Initial commit: KOPIS 공연 추천 시스템 PoC"
```

2. **GitHub에서 새 저장소 생성**
   - GitHub.com 접속
   - "New repository" 클릭
   - 저장소 이름 입력 (예: `kopis-showcase-recommendation`)
   - Public 또는 Private 선택
   - "Create repository" 클릭

3. **원격 저장소 연결 및 푸시**
```bash
git remote add origin https://github.com/YOUR_USERNAME/kopis-showcase-recommendation.git
git branch -M main
git push -u origin main
```

## 🖥️ 로컬 서버에서 데모 실행

### 빠른 시작 (스크립트 사용)

**macOS/Linux:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
start.bat
```

### 수동 실행

**터미널 1 - Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**터미널 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

**터미널 3 - Ollama (선택, AI 분석 기능용):**
```bash
ollama serve
ollama pull ingu627/exaone4.0:1.2b
```

## 🌐 접속 정보

- **Frontend**: http://localhost:3001 (포트 3000이 사용 중이면 자동으로 3001 사용)
- **Backend API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs
- **Ollama** (선택): http://localhost:11434

## 🔧 데모 환경 설정 팁

### 1. 데이터 준비
```bash
# PAMS.csv 파일이 backend/ 디렉토리에 있는지 확인
ls backend/PAMS.csv

# 없으면 복사
cp /path/to/PAMS.csv backend/
```

### 2. 포트 변경이 필요한 경우

**Backend 포트 변경:**
```bash
# main.py 마지막 줄 수정
uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
```

**Frontend 포트 변경:**
```bash
# frontend/.env 파일 생성 (포트 3000이 사용 중이면)
echo "PORT=3001" > frontend/.env

# 또는 다른 포트 사용
echo "PORT=3002" > frontend/.env
```

### 3. ChromaDB 초기화
```bash
cd backend
rm -rf chroma_db/
# 서버 재시작 시 자동 재생성
```

## 📦 배포 패키징 (선택)

### Docker 사용 (향후)

```dockerfile
# Dockerfile 예시 (참고용)
FROM python:3.9-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## ⚠️ 주의사항

1. **API 키 보안**: 현재 KOPIS API 키가 코드에 하드코딩되어 있습니다.
   - 데모용으로는 문제없지만, 프로덕션에서는 환경 변수로 관리하세요.

2. **데이터 크기**: 
   - `PAMS.csv` 파일이 크면 Git LFS 사용 고려
   - 또는 `.gitignore`에 추가하고 별도로 제공

3. **의존성 버전**: 
   - Python 3.8+ 필요
   - Node.js 16+ 필요
   - PyTorch 등 대용량 라이브러리 포함

4. **네트워크**: 
   - KOPIS API는 인터넷 연결 필요
   - Ollama는 로컬 서버 필요

## 🐛 문제 해결

### "PAMS.csv not found" 오류
```bash
# 파일 확인
ls -la backend/PAMS.csv

# 없으면 상위 디렉토리에서 복사
cp ../../PAMS.csv backend/
```

### "Port already in use" 오류
```bash
# 포트 사용 중인 프로세스 확인
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# 프로세스 종료 또는 다른 포트 사용
```

### ChromaDB 초기화 오류
```bash
cd backend
rm -rf chroma_db/
python -c "from chroma_store import ChromaVectorStore; store = ChromaVectorStore('./chroma_db'); store.load_pams_data('PAMS.csv')"
```

## 📝 데모 시연 체크리스트

- [ ] Backend 서버 정상 실행 (8000 포트)
- [ ] Frontend 서버 정상 실행 (3000 포트)
- [ ] 쇼케이스 목록 조회 가능
- [ ] 유사도 검색 동작 확인
- [ ] KOPIS API 연동 확인 (인터넷 필요)
- [ ] AI 분석 기능 확인 (Ollama 필요)

---

**문의**: GitHub Issues를 통해 문의해주세요.


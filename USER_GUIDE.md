# 👥 사용자 가이드 - 다른 컴퓨터에서 실행하기

이 문서는 다른 사람이 GitHub에서 코드를 다운받아 자신의 컴퓨터에서 실행하는 방법을 안내합니다.

## ✅ 네, 각자 컴퓨터에서 실행 가능합니다!

각 사용자는 자신의 컴퓨터에서 독립적으로 실행할 수 있습니다.

## 📋 필요한 것들

### 필수 사항
1. **Python 3.8 이상** 설치
   - Windows: https://www.python.org/downloads/
   - macOS: `brew install python` 또는 공식 사이트
   - Linux: `sudo apt install python3` (Ubuntu/Debian)

2. **Node.js 16 이상** 설치
   - https://nodejs.org/ 에서 다운로드
   - 설치 확인: `node --version`, `npm --version`

3. **Git** (코드 다운로드용)
   - Windows: https://git-scm.com/download/win
   - macOS: `brew install git`
   - Linux: `sudo apt install git`

### 선택 사항
- **Ollama** (AI 분석 기능 사용 시)
  - https://ollama.ai/ 에서 다운로드

## 🚀 실행 방법 (단계별)

### 1단계: 코드 다운로드

```bash
# GitHub에서 클론
git clone https://github.com/soo-1031/Suitreaming_XportStage.git

# 또는 ZIP 파일로 다운로드 후 압축 해제

# 폴더로 이동
cd Suitreaming_XportStage
```

### 2단계: Backend 설정

```bash
cd backend

# 가상환경 생성 (권장)
python -m venv venv

# 가상환경 활성화
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 의존성 설치 (시간이 좀 걸릴 수 있습니다)
pip install -r requirements.txt

# PAMS.csv 파일 확인
# GitHub에 포함되어 있으면 자동으로 있음
# 없으면 별도로 제공받아야 함
```

### 3단계: Frontend 설정

```bash
cd frontend

# 의존성 설치
npm install

# 포트 설정 (필요시)
# 포트 3000이 사용 중이면 3001로 변경
echo "PORT=3001" > .env
```

### 4단계: 서버 실행

**터미널 1 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**터미널 2 - Frontend:**
```bash
cd frontend
npm start
```

### 5단계: 접속

브라우저에서:
- **Frontend**: http://localhost:3001 (또는 3000)
- **Backend API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs

## 🌐 네트워크 접근 (같은 네트워크 내 다른 기기)

현재 설정으로는 **같은 컴퓨터에서만** 접근 가능합니다.

같은 네트워크(WiFi)에 연결된 다른 기기(스마트폰, 태블릿, 다른 컴퓨터)에서 접근하려면:

### Backend 설정 변경
```python
# backend/main.py 마지막 줄
uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
# host="0.0.0.0"은 이미 설정되어 있음 ✅
```

### Frontend 환경변수 설정
```bash
# frontend/.env 파일 생성
echo "REACT_APP_API_URL=http://YOUR_IP_ADDRESS:8000" > frontend/.env
```

**IP 주소 확인:**
- macOS/Linux: `ifconfig | grep "inet "`
- Windows: `ipconfig`

예시:
- 컴퓨터 IP: `192.168.0.10`
- 다른 기기에서 접속: `http://192.168.0.10:3001`

## ⚠️ 주의사항

### 1. 포트 충돌
- 각 사용자의 컴퓨터에서 포트가 다를 수 있습니다
- 이미 사용 중인 포트가 있으면 자동으로 다음 포트 사용 (3001, 3002...)
- 또는 `.env` 파일로 명시적으로 설정

### 2. 데이터 파일
- `PAMS.csv` 파일이 GitHub에 포함되어 있어야 합니다
- 크기가 크면 Git LFS 사용 고려

### 3. 환경 차이
- 각 사용자의 Python/Node.js 버전이 다를 수 있음
- 의존성 설치 시 오류가 발생할 수 있음
- 문제 발생 시 GitHub Issues에 문의

### 4. 방화벽
- 네트워크 접근 시 방화벽 설정 필요할 수 있음
- 로컬호스트 접근은 문제 없음

## 🔧 문제 해결

### "포트가 이미 사용 중입니다"
```bash
# 다른 포트 사용
# Backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001

# Frontend
echo "PORT=3002" > frontend/.env
```

### "모듈을 찾을 수 없습니다"
```bash
# 가상환경이 활성화되어 있는지 확인
which python  # 가상환경 경로가 나와야 함

# 의존성 재설치
pip install -r requirements.txt --force-reinstall
```

### "PAMS.csv 파일이 없습니다"
- GitHub에 파일이 포함되어 있는지 확인
- 포함되어 있지 않으면 별도로 제공받아야 함

## 📝 요약

✅ **네, 각자 컴퓨터에서 실행 가능합니다!**
- GitHub에서 클론
- 의존성 설치
- 서버 실행
- 각자의 localhost에서 접속

현재 설정은 **로컬 개발용**으로, 각 사용자가 자신의 컴퓨터에서 독립적으로 실행할 수 있습니다.


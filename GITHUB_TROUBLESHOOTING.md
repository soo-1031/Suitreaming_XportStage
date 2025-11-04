# GitHub 저장소 생성 실패 해결 가이드

## 🔍 일반적인 원인들

### 1. **저장소 이름 규칙 위반**
GitHub 저장소 이름 규칙:
- ✅ 허용: 영문자, 숫자, 하이픈(-), 언더스코어(_), 점(.)
- ❌ 금지: 공백, 특수문자, 대소문자 구분 (권장하지 않음)
- 길이: 최대 100자

**권장 저장소 이름:**
- `kopis-showcase-recommendation`
- `kopis-final`
- `kopis-poc`
- `kopis-showcase-system`

### 2. **이미 같은 이름의 저장소가 존재**
- GitHub에서 같은 이름의 저장소가 이미 있는지 확인
- Public 저장소는 전역적으로 고유해야 함
- Private 저장소는 본인 계정 내에서만 고유하면 됨

**해결:** 다른 이름 사용 또는 기존 저장소 삭제

### 3. **GitHub 인증 문제**
- 로그인 상태 확인
- 2FA(2단계 인증) 활성화되어 있으면 인증 필요
- 브라우저 쿠키/세션 문제

**해결:** 
- 로그아웃 후 다시 로그인
- 시크릿 모드에서 시도

### 4. **네트워크/서버 문제**
- GitHub 서버 일시적 장애
- 방화벽/프록시 문제

**해결:** 잠시 후 재시도

### 5. **계정 제한**
- Free 계정의 저장소 개수 제한 (무제한이지만 확인 필요)
- 조직(Organization) 권한 문제

## 🛠️ 해결 방법

### 방법 1: GitHub CLI 사용 (권장)

터미널에서 직접 생성:

```bash
# GitHub CLI 설치 확인
gh --version

# 설치되어 있지 않다면
brew install gh  # macOS
# 또는 https://cli.github.com/ 에서 다운로드

# 로그인
gh auth login

# 저장소 생성 및 업로드
gh repo create kopis-final --public --source=. --remote=origin --push
```

### 방법 2: 웹 브라우저에서 수동 생성

1. **저장소 이름 확인:**
   - 간단한 이름 사용: `kopis-final` 또는 `kopis-showcase`
   - 특수문자 없이 영문자와 하이픈만 사용

2. **저장소 생성 페이지에서:**
   - Repository name: `kopis-final` (소문자, 하이픈)
   - Description: 선택 사항
   - Public 또는 Private 선택
   - **중요:** "Add a README file" **체크 해제**
   - **중요:** "Add .gitignore" **체크 해제**
   - "Choose a license" 선택 없음

3. **Create repository 클릭**

### 방법 3: 기존 저장소 확인

혹시 이미 저장소를 만들었는지 확인:

```bash
# GitHub에서 본인 저장소 목록 확인
gh repo list

# 또는 브라우저에서
# https://github.com/YOUR_USERNAME?tab=repositories
```

## 📝 저장소 생성 후 업로드 명령어

저장소가 성공적으로 생성되면 다음 명령어 실행:

```bash
cd /Users/hyunsoolee/Desktop/KOPIS_2025/KOPIS_Final

# 원격 저장소 연결 (YOUR_USERNAME과 YOUR_REPO_NAME 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 브랜치명 확인
git branch -M main

# 업로드
git push -u origin main
```

## ⚠️ 에러 메시지별 해결

### "Repository already exists"
- 같은 이름의 저장소가 이미 존재
- 해결: 다른 이름 사용 또는 기존 저장소 삭제

### "Invalid repository name"
- 저장소 이름 규칙 위반
- 해결: 소문자, 하이픈만 사용

### "Authentication failed"
- 로그인 문제
- 해결: GitHub CLI로 재인증 (`gh auth login`)

### "Network error" 또는 "Timeout"
- 네트워크 문제
- 해결: 잠시 후 재시도, VPN 확인

## 🎯 추천 저장소 이름

다음 중 하나를 선택하세요:

1. `kopis-final`
2. `kopis-showcase-recommendation`
3. `kopis-poc`
4. `kopis-showcase-system`
5. `kopis-performance-platform`

위 이름들은 모두 GitHub 규칙을 준수합니다.


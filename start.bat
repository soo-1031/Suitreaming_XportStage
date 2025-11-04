@echo off
REM KOPIS 공연 추천 시스템 시작 스크립트 (Windows)

echo 🚀 KOPIS 공연 추천 시스템 시작 중...

REM Backend 서버 시작
echo 📦 Backend 서버 시작...
start "Backend Server" cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM 잠시 대기
timeout /t 3 /nobreak >nul

REM Frontend 서버 시작
echo ⚛️  Frontend 서버 시작...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo ✅ 서버들이 시작되었습니다!
echo    - Backend: http://localhost:8000
echo    - Frontend: http://localhost:3001 (포트 3000이 사용 중이면 자동으로 3001 사용)
echo    - API Docs: http://localhost:8000/docs
echo.
echo 서버를 중지하려면 각 창을 닫으세요.

pause


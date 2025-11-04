#!/bin/bash

# KOPIS 공연 추천 시스템 시작 스크립트

echo "🚀 KOPIS 공연 추천 시스템 시작 중..."

# Backend 서버 시작
echo "📦 Backend 서버 시작..."
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# 잠시 대기 (Backend가 시작될 시간)
sleep 3

# Frontend 서버 시작
echo "⚛️  Frontend 서버 시작..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ 서버들이 시작되었습니다!"
echo "   - Backend: http://localhost:8000"
echo "   - Frontend: http://localhost:3001 (포트 3000이 사용 중이면 자동으로 3001 사용)"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "서버를 중지하려면 Ctrl+C를 누르세요."

# 종료 시 프로세스 정리
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# 대기
wait


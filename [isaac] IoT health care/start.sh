#!/bin/bash

echo "🏥 IoT Health Care 프로젝트 시작!"
echo "=================================="

# 백엔드 빌드
echo "📦 백엔드 빌드 중..."
cd backend && npm run build

# 백엔드 시작 (백그라운드)
echo "🚀 백엔드 서버 시작 중..."
npm run dev &
BACKEND_PID=$!

# 프론트엔드 시작 (백그라운드)
echo "🎨 프론트엔드 서버 시작 중..."
cd ../frontend && npm start &
FRONTEND_PID=$!

echo ""
echo "✅ 서버가 시작되었습니다!"
echo "📊 백엔드: http://localhost:3001"
echo "🎨 프론트엔드: http://localhost:3000"
echo ""
echo "종료하려면 Ctrl+C를 누르세요."

# 종료 시그널 처리
trap "echo '🛑 서버를 종료합니다...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# 프로세스 대기
wait

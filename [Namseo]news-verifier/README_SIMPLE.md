# TraceFirst - 간단 실행 가이드

## 🚀 한 번에 실행

```bash
START.bat
```

## 🔧 수동 실행

### 백엔드:
```bash
cd backend
py real_crawler_server.py
```

### 프론트엔드:
```bash
npm run dev
```

## 📍 접속 주소

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8080

## 🧪 테스트 검색어

- 삼성전자
- 아이폰  
- 정치
- 경제

## 📁 핵심 파일

- `START.bat` - 전체 시스템 시작
- `backend/real_crawler_server.py` - 실제 크롤링 서버
- `src/app/page.tsx` - 메인 페이지
- `src/app/search/page.tsx` - 검색 결과 페이지
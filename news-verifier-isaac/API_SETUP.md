# 🔑 API 키 설정 가이드

뉴스 검증 플랫폼에서 사용할 수 있는 API들과 설정 방법을 안내합니다.

## 📋 지원하는 API 목록

### 1. 네이버 검색 API (추천 ⭐⭐⭐)
**한국 뉴스에 최적화된 API**

- **무료 할당량**: 25,000회/일
- **장점**: 한국어 뉴스 검색 정확도 높음
- **설정 방법**:
  1. [네이버 개발자 센터](https://developers.naver.com/main/) 접속
  2. 애플리케이션 등록 → 검색 API 선택
  3. Client ID와 Client Secret 발급
  4. `.env` 파일에 추가:
     ```
     NAVER_CLIENT_ID=your_client_id
     NAVER_CLIENT_SECRET=your_client_secret
     ```

### 2. Google Custom Search API
**전세계 뉴스 검색**

- **무료 할당량**: 100회/일 (유료: $5/1000회)
- **장점**: 검색 품질 우수, 전세계 뉴스 커버
- **설정 방법**:
  1. [Google Cloud Console](https://console.cloud.google.com/) 접속
  2. Custom Search API 활성화
  3. API 키 생성
  4. [Custom Search Engine](https://cse.google.com/) 생성
  5. `.env` 파일에 추가:
     ```
     GOOGLE_API_KEY=your_api_key
     GOOGLE_CX=your_search_engine_id
     ```

### 3. NewsAPI
**글로벌 뉴스 API**

- **무료 할당량**: 1,000회/일 (유료: $449/월)
- **장점**: 70,000+ 뉴스 소스, 실시간 업데이트
- **설정 방법**:
  1. [NewsAPI](https://newsapi.org/) 회원가입
  2. API 키 발급
  3. `.env` 파일에 추가:
     ```
     NEWS_API_KEY=your_api_key
     ```

### 4. Exa API (향후 지원 예정)
**AI 기반 웹 검색**

- **특징**: 의미론적 검색, 고품질 결과
- **설정 방법**:
  ```
  EXA_API_KEY=your_exa_api_key
  ```

## 🚀 빠른 시작

### 1단계: 환경 변수 파일 생성
```bash
cp .env.example .env
```

### 2단계: API 키 입력
`.env` 파일을 열어서 발급받은 API 키들을 입력하세요:

```env
# 네이버 검색 API (한국 뉴스 - 추천)
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# Google Custom Search API (글로벌 뉴스)
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CX=your_custom_search_engine_id

# NewsAPI (글로벌 뉴스)
NEWS_API_KEY=your_news_api_key

# 서버 설정
PORT=3000
NODE_ENV=development
```

### 3단계: 서버 실행
```bash
npm start
```

### 4단계: API 상태 확인
브라우저에서 `http://localhost:3000/api/status` 접속하여 API 설정 상태를 확인하세요.

## 💡 추천 설정

### 해커톤용 (무료)
```env
NAVER_CLIENT_ID=your_naver_id
NAVER_CLIENT_SECRET=your_naver_secret
```
→ 네이버 API만으로도 충분한 한국 뉴스 검증 가능

### 프로덕션용 (유료)
```env
NAVER_CLIENT_ID=your_naver_id
NAVER_CLIENT_SECRET=your_naver_secret
GOOGLE_API_KEY=your_google_key
GOOGLE_CX=your_google_cx
NEWS_API_KEY=your_news_key
```
→ 다중 소스로 더 정확한 검증

## 🔧 문제 해결

### API 키가 없어도 작동하나요?
네! API 키가 설정되지 않으면 자동으로 목업 데이터를 사용합니다.

### 어떤 API를 우선 설정해야 하나요?
한국 뉴스 검증이 목적이라면 **네이버 검색 API**를 먼저 설정하세요.

### API 할당량을 초과하면?
- 네이버: 다음날 자동 리셋
- Google: 유료 플랜 업그레이드 필요
- NewsAPI: 유료 플랜 업그레이드 필요

### 에러가 발생하면?
1. `.env` 파일의 API 키 확인
2. 콘솔 로그 확인
3. `/api/status` 엔드포인트로 API 상태 확인

## 📊 API 비교표

| API | 무료 할당량 | 한국어 지원 | 실시간성 | 추천도 |
|-----|------------|------------|----------|--------|
| 네이버 | 25,000/일 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Google | 100/일 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| NewsAPI | 1,000/일 | ⭐ | ⭐⭐⭐ | ⭐⭐ |
| Exa | TBD | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 해커톤 팁

1. **네이버 API만으로도 충분**: 한국 뉴스 검증에는 네이버 API가 가장 효과적
2. **목업 데이터 활용**: API 키 없이도 데모 가능
3. **에러 핸들링**: API 실패 시 자동으로 목업 데이터로 전환
4. **실시간 테스트**: 실제 뉴스로 바로 테스트 가능

# Google Custom Search API 키 발급 가이드

## ✅ 이미 완료된 것
- Custom Search Engine 생성 완료
- 검색엔진 ID: `f372c15aed8dd43d7`

## 🔑 API 키만 새로 발급받기

### 1단계: Google Cloud Console 접속
1. https://console.cloud.google.com/ 접속
2. 기존 프로젝트 선택 또는 새 프로젝트 생성

### 2단계: Custom Search API 활성화
1. 좌측 메뉴 > "API 및 서비스" > "라이브러리"
2. "Custom Search API" 검색
3. "사용 설정" 클릭

### 3단계: API 키 생성
1. 좌측 메뉴 > "API 및 서비스" > "사용자 인증 정보"
2. 상단 "+ 사용자 인증 정보 만들기" 클릭
3. "API 키" 선택
4. 생성된 API 키 복사

### 4단계: API 키 제한 설정 (보안)
1. 생성된 API 키 옆 편집 버튼 클릭
2. "API 제한사항" > "키 제한"
3. "Custom Search API" 선택
4. 저장

### 5단계: .env 파일 업데이트
```bash
# 아래 줄의 주석을 제거하고 새 API 키 입력
GOOGLE_API_KEY=여기에_새로운_API_키_입력
```

## 🧪 테스트 방법
1. 서버 재시작: `npm start`
2. http://localhost:3002/api/status 접속하여 Google API 상태 확인
3. 뉴스 검색 테스트

## 💡 참고사항
- 무료 할당량: 일일 100회 검색
- API 키는 절대 GitHub에 업로드하지 마세요
- .env 파일이 .gitignore에 포함되어 있는지 확인하세요

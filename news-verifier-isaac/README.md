# 뉴스 검증 플랫폼

실시간 웹 검색과 AI를 활용한 가짜뉴스 검증 서비스

## 🚀 주요 기능

- **실시간 뉴스 검증**: 자연어 질문으로 뉴스 진위 확인
- **다중 출처 분석**: 여러 신뢰할 수 있는 출처에서 정보 수집
- **신뢰도 점수**: AI 기반 신뢰도 평가 시스템
- **시각적 대시보드**: 직관적인 결과 표시

## 🛠 기술 스택

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **MCP Integration**: Exa Search MCP
- **Deployment**: AWS (EC2, S3, CloudFront)

## 📦 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정
```bash
cp .env.example .env
# .env 파일에서 API 키 설정
```

3. 서버 실행
```bash
npm start
# 또는 개발 모드
npm run dev
```

4. 브라우저에서 접속
```
http://localhost:3000
```

## 🔧 MCP 연동

Exa MCP 서버와 연동하여 실시간 웹 검색 기능을 제공합니다.

MCP 서버 URL: https://server.smithery.ai/exa/mcp

## 📈 향후 개발 계획

- [ ] Exa MCP 실제 연동
- [ ] 더 정교한 신뢰도 알고리즘
- [ ] 사용자 피드백 시스템
- [ ] 소셜 미디어 연동
- [ ] 모바일 앱 개발

## 🏆 해커톤 특화 기능

- 48시간 내 구현 가능한 MVP
- 실시간 데모 가능
- 확장 가능한 아키텍처
- AWS 클라우드 배포 준비

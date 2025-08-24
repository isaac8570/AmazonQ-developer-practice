# 🔗 MCP (Model Context Protocol) 연결 가이드

Exa MCP 서버를 뉴스 검증 플랫폼에 연결하는 방법을 안내합니다.

## 🤔 MCP란?

MCP(Model Context Protocol)는 AI 모델과 외부 도구/데이터 소스를 연결하는 표준 프로토콜입니다.
- **Exa MCP**: AI 기반 웹 검색 서비스
- **서버 URL**: https://server.smithery.ai/exa/mcp

## 🚀 연결 방법

### 방법 1: Q Chat에서 직접 사용 (추천 ⭐⭐⭐)

Q Chat에서 MCP 서버를 직접 연결하여 사용하는 것이 가장 효과적입니다.

```bash
# Q Chat 설정에서 MCP 서버 추가
q config add-mcp-server exa https://server.smithery.ai/exa/mcp
```

**Q Chat에서 사용 예시:**
```
사용자: "윤석열 대통령 최근 뉴스" 관련해서 exa로 검색해줘
Q: exa___search를 사용하여 검색하겠습니다...
```

### 방법 2: 웹 애플리케이션에서 HTTP 연결

현재 구현된 방식으로, HTTP 요청을 통해 MCP 서버와 통신합니다.

```javascript
// 자동으로 시도됨
const exaClient = new ExaMCPClient();
await exaClient.connect();
```

### 방법 3: 직접 MCP 클라이언트 구현

더 고급 사용을 위해 MCP SDK를 사용할 수 있습니다.

```bash
npm install @modelcontextprotocol/sdk
```

## 🔧 현재 구현 상태

### ✅ 구현된 기능
- HTTP 기반 MCP 서버 연결 시도
- Exa 검색 API 호출
- 검색 결과 파싱 및 신뢰도 평가
- 연결 실패 시 자동 대체 방법 사용

### ⚠️ 제한사항
- MCP 서버가 공개적으로 접근 가능하지 않을 수 있음
- 인증이 필요할 수 있음
- 네트워크 방화벽 이슈 가능

## 🎯 해커톤에서의 활용 방법

### 1. Q Chat 통합 데모
```bash
# 터미널에서 Q Chat 실행
q chat

# MCP 서버 연결 (만약 가능하다면)
사용자: exa MCP 서버에 연결해서 "가짜뉴스 검증" 관련 최신 뉴스를 찾아줘
```

### 2. 웹 애플리케이션 데모
- 현재 웹앱에서 자동으로 MCP 연결 시도
- 연결 실패 시 다른 API나 목업 데이터 사용
- 실시간으로 연결 상태 표시

### 3. 하이브리드 접근법 (추천)
1. **Q Chat으로 MCP 테스트**: 실제 Exa 검색 기능 시연
2. **웹앱으로 UI 데모**: 사용자 친화적인 인터페이스
3. **API 통합**: 네이버/구글 API로 실제 데이터 보완

## 🔍 MCP 연결 테스트

### 서버에서 확인
```bash
# 서버 실행 시 로그 확인
npm start

# 출력 예시:
# 🔌 MCP 서버 연결 시도 중...
# ✅ Exa MCP 서버에 연결되었습니다.
# 또는
# ⚠️ Exa MCP 서버 연결 실패: timeout
```

### 브라우저에서 확인
```
http://localhost:8080/api/status
```

응답 예시:
```json
{
  "apis": {
    "exa-mcp": true,
    "naver": false,
    "google": false,
    "newsapi": false
  },
  "configured": true
}
```

## 🛠 문제 해결

### MCP 연결이 안 될 때
1. **네트워크 확인**: 인터넷 연결 상태
2. **방화벽 설정**: 8080 포트 허용
3. **서버 상태**: MCP 서버가 온라인인지 확인
4. **대체 방법**: 다른 API 사용

### 검색 결과가 없을 때
- 자동으로 목업 데이터 사용
- 다른 API들과 결합하여 결과 보완
- 사용자에게 명확한 상태 표시

## 💡 해커톤 팁

### 데모 시나리오
1. **성공 케이스**: MCP 연결 → 실제 Exa 검색 결과 표시
2. **실패 케이스**: MCP 실패 → 다른 API로 자동 전환
3. **하이브리드**: 여러 소스 결합하여 더 정확한 검증

### 발표 포인트
- "AI 기반 검색 엔진 Exa와 MCP 프로토콜 활용"
- "다중 데이터 소스 통합으로 신뢰성 향상"
- "실시간 연결 상태 모니터링"

### 기술적 차별화
- MCP 프로토콜 사용으로 최신 기술 트렌드 반영
- 연결 실패 시 graceful degradation
- 확장 가능한 아키텍처

## 📚 참고 자료

- [MCP 공식 문서](https://modelcontextprotocol.io/)
- [Exa AI 검색](https://exa.ai/)
- [Q Chat MCP 가이드](https://docs.aws.amazon.com/q/latest/userguide/mcp.html)

## 🎉 결론

MCP 연결이 성공하면 더욱 강력한 검색 기능을 제공할 수 있지만, 실패해도 다른 방법들로 충분히 경쟁력 있는 서비스를 만들 수 있습니다. 해커톤에서는 **안정성**과 **데모 가능성**이 가장 중요하므로, 여러 백업 방안을 준비하는 것이 좋습니다!

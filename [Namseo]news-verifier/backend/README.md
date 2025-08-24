# TraceFirst Backend

## 빠른 시작

```bash
# 의존성 설치
pip install -r requirements.txt

# Playwright 브라우저 설치
python -m playwright install chromium

# 서버 실행
python run.py
```

## API 엔드포인트

### POST /search
검색 쿼리로 기사 클러스터링

```json
{
  "query": "신형 폰 배터리",
  "sources": ["news", "community"]
}
```

### GET /trending
실시간 트렌드 토픽

## 구조

- `main.py`: FastAPI 애플리케이션
- `crawler.py`: 뉴스/커뮤니티 크롤링
- `analyzer.py`: TraceScore 알고리즘
- `run.py`: 실행 스크립트

## 크롤링 대상

- **뉴스**: 네이버 뉴스 검색
- **커뮤니티**: 뽐뿌 (Playwright)

## TraceScore 알고리즘

```
TraceScore = 0.5×시간점수 + 0.2×교차검증 + 0.2×백링크 - 0.3×집계페널티 + 0.1×커뮤니티보너스
```
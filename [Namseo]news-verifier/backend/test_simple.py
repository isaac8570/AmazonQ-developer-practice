#!/usr/bin/env python3
"""
간단한 백엔드 테스트 - 최소한의 의존성으로 시작
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="TraceFirst Test API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "TraceFirst API is running!", "status": "ok"}

@app.get("/test")
async def test():
    return {"test": "success", "data": "Backend is working"}

@app.post("/search")
async def search_test(request: dict):
    query = request.get("query", "test")
    return {
        "clusters": [
            {
                "id": "test_cluster_1",
                "label": f"{query} 관련 뉴스",
                "size": 3,
                "articles": [
                    {
                        "id": "test_article_1",
                        "title": f"{query} 관련 기사 1",
                        "content": f"{query}에 대한 내용입니다.",
                        "url": "https://example.com/1",
                        "domain": "example.com",
                        "source_type": "press",
                        "timestamp": "2025-01-01T10:00:00Z",
                        "confidence": "High"
                    },
                    {
                        "id": "test_article_2", 
                        "title": f"{query} 커뮤니티 글",
                        "content": f"{query} 커뮤니티 논의",
                        "url": "https://community.com/1",
                        "domain": "community.com",
                        "source_type": "community",
                        "timestamp": "2025-01-01T09:30:00Z",
                        "confidence": "Mid"
                    }
                ],
                "trace_score": 0.85
            }
        ]
    }

@app.get("/trending")
async def trending_test():
    return {
        "topics": [
            {"id": 1, "title": "신형 폰 배터리 발화 루머", "count": 18, "trend": "up", "category": "tech"},
            {"id": 2, "title": "게임 업데이트 보안 취약점", "count": 11, "trend": "up", "category": "security"},
            {"id": 3, "title": "정치인 발언 논란", "count": 24, "trend": "down", "category": "politics"}
        ]
    }

if __name__ == "__main__":
    print("🚀 Starting TraceFirst Test Backend...")
    print("📍 URL: http://localhost:8080")
    print("📍 Docs: http://localhost:8080/docs")
    uvicorn.run(app, host="0.0.0.0", port=8080, reload=True)
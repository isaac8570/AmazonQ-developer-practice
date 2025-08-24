from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="TraceFirst API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    query: str
    sources: Optional[List[str]] = ["news", "community"]

class Article(BaseModel):
    id: str
    title: str
    content: str
    url: str
    domain: str
    source_type: str
    timestamp: str
    confidence: str

class Cluster(BaseModel):
    id: str
    label: str
    size: int
    articles: List[Article]
    trace_score: float

@app.get("/")
async def root():
    return {"message": "TraceFirst Backend is running!", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "TraceFirst"}

@app.get("/trending")
async def get_trending():
    # 임시 트렌드 데이터
    return {
        "topics": [
            {"id": 1, "title": "삼성전자", "count": 15, "trend": "up", "category": "tech"},
            {"id": 2, "title": "아이폰", "count": 12, "trend": "up", "category": "tech"},
            {"id": 3, "title": "정치", "count": 8, "trend": "stable", "category": "politics"}
        ]
    }

@app.post("/search")
async def search_news(request: SearchRequest):
    # 임시 응답 - 크롤러 구현 전
    return {
        "clusters": [
            {
                "id": "temp_cluster_1",
                "label": f"{request.query} 관련 뉴스",
                "size": 1,
                "articles": [
                    {
                        "id": "temp_1",
                        "title": f"{request.query} 관련 임시 기사",
                        "content": f"{request.query}에 대한 임시 내용입니다.",
                        "url": "https://example.com",
                        "domain": "example.com",
                        "source_type": "press",
                        "timestamp": "2025-01-01T10:00:00Z",
                        "confidence": "Mid"
                    }
                ],
                "trace_score": 0.5
            }
        ]
    }

if __name__ == "__main__":
    print("🚀 TraceFirst Backend Starting...")
    print("📍 URL: http://localhost:8080")
    print("📍 Docs: http://localhost:8080/docs")
    uvicorn.run(app, host="0.0.0.0", port=8080, reload=True)
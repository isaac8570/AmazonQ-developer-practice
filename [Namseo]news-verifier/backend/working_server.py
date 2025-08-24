from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import requests
from bs4 import BeautifulSoup
import urllib.parse
from datetime import datetime, timedelta
import re
import asyncio
import aiohttp

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

class RealCrawler:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

    async def search_articles(self, query: str, sources: List[str]) -> List[dict]:
        articles = []
        
        if "news" in sources:
            # 네이버 뉴스 크롤링
            naver_articles = await self._crawl_naver_news(query)
            articles.extend(naver_articles)
            
            # 다음 뉴스 크롤링
            daum_articles = await self._crawl_daum_news(query)
            articles.extend(daum_articles)
        
        if "community" in sources:
            # 커뮤니티 크롤링 (간단한 버전)
            community_articles = await self._crawl_community(query)
            articles.extend(community_articles)
        
        return articles

    async def _crawl_naver_news(self, query: str) -> List[dict]:
        articles = []
        try:
            encoded_query = urllib.parse.quote(query)
            url = f"https://search.naver.com/search.naver?where=news&query={encoded_query}&sort=1"
            
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 네이버 뉴스 검색 결과 파싱
            news_items = soup.select('.news_area')
            
            for i, item in enumerate(news_items[:10]):
                try:
                    title_elem = item.select_one('.news_tit')
                    if not title_elem:
                        continue
                    
                    title = title_elem.get_text(strip=True)
                    url_link = title_elem.get('href', '')
                    
                    # 도메인 추출
                    try:
                        domain = urllib.parse.urlparse(url_link).netloc
                    except:
                        domain = 'naver.com'
                    
                    # 요약 텍스트
                    summary_elem = item.select_one('.news_dsc')
                    summary = summary_elem.get_text(strip=True) if summary_elem else title
                    
                    # 시간 정보
                    time_elem = item.select_one('.info_group .info')
                    time_text = time_elem.get_text(strip=True) if time_elem else ""
                    
                    # 신뢰도 계산
                    confidence = self._calculate_confidence(domain)
                    
                    articles.append({
                        'id': f"naver_{i}",
                        'title': title,
                        'content': summary,
                        'url': url_link,
                        'domain': domain,
                        'source_type': 'press',
                        'timestamp': self._parse_time(time_text),
                        'confidence': confidence
                    })
                    
                except Exception as e:
                    print(f"Error parsing naver item: {e}")
                    continue
                    
        except Exception as e:
            print(f"Naver crawling error: {e}")
        
        return articles

    async def _crawl_daum_news(self, query: str) -> List[dict]:
        articles = []
        try:
            encoded_query = urllib.parse.quote(query)
            url = f"https://search.daum.net/search?w=news&q={encoded_query}&sort=recency"
            
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            news_items = soup.select('.item-news')
            
            for i, item in enumerate(news_items[:5]):
                try:
                    title_elem = item.select_one('.tit-news a')
                    if not title_elem:
                        continue
                    
                    title = title_elem.get_text(strip=True)
                    url_link = title_elem.get('href', '')
                    
                    try:
                        domain = urllib.parse.urlparse(url_link).netloc
                    except:
                        domain = 'daum.net'
                    
                    summary_elem = item.select_one('.desc')
                    summary = summary_elem.get_text(strip=True) if summary_elem else title
                    
                    time_elem = item.select_one('.date')
                    time_text = time_elem.get_text(strip=True) if time_elem else ""
                    
                    confidence = self._calculate_confidence(domain)
                    
                    articles.append({
                        'id': f"daum_{i}",
                        'title': title,
                        'content': summary,
                        'url': url_link,
                        'domain': domain,
                        'source_type': 'press',
                        'timestamp': self._parse_time(time_text),
                        'confidence': confidence
                    })
                    
                except Exception as e:
                    print(f"Error parsing daum item: {e}")
                    continue
                    
        except Exception as e:
            print(f"Daum crawling error: {e}")
        
        return articles

    async def _crawl_community(self, query: str) -> List[dict]:
        # 커뮤니티 크롤링은 복잡하므로 일단 Mock 데이터 반환
        return [
            {
                'id': f'community_1',
                'title': f'{query} 관련 커뮤니티 글',
                'content': f'{query}에 대한 커뮤니티 논의',
                'url': 'https://ppomppu.co.kr/mock',
                'domain': 'ppomppu.co.kr',
                'source_type': 'community',
                'timestamp': datetime.now().isoformat(),
                'confidence': 'High'
            }
        ]

    def _calculate_confidence(self, domain: str) -> str:
        high_trust = [
            'yonhapnews.co.kr', 'yna.co.kr', 'kbs.co.kr', 'mbc.co.kr', 'sbs.co.kr',
            'chosun.com', 'donga.com', 'joongang.co.kr', 'hani.co.kr', 'khan.co.kr'
        ]
        medium_trust = [
            'naver.com', 'daum.net', 'mk.co.kr', 'mt.co.kr', 'etnews.com'
        ]
        
        if any(trusted in domain for trusted in high_trust):
            return 'High'
        elif any(trusted in domain for trusted in medium_trust):
            return 'Mid'
        else:
            return 'Low'

    def _parse_time(self, time_text: str) -> str:
        try:
            now = datetime.now()
            
            if '분 전' in time_text:
                minutes = int(re.findall(r'(\d+)분 전', time_text)[0])
                time_obj = now - timedelta(minutes=minutes)
            elif '시간 전' in time_text:
                hours = int(re.findall(r'(\d+)시간 전', time_text)[0])
                time_obj = now - timedelta(hours=hours)
            elif '일 전' in time_text:
                days = int(re.findall(r'(\d+)일 전', time_text)[0])
                time_obj = now - timedelta(days=days)
            else:
                time_obj = now
                
            return time_obj.isoformat()
        except:
            return datetime.now().isoformat()

class ContentAnalyzer:
    def create_clusters(self, articles: List[dict]) -> List[dict]:
        if not articles:
            return []
        
        # 간단한 클러스터링: 제목 유사도 기반
        clusters = []
        used_articles = set()
        
        for i, article in enumerate(articles):
            if i in used_articles:
                continue
                
            cluster_articles = [article]
            used_articles.add(i)
            
            # 유사한 기사들 찾기
            for j, other_article in enumerate(articles[i+1:], i+1):
                if j in used_articles:
                    continue
                    
                similarity = self._calculate_similarity(article['title'], other_article['title'])
                if similarity > 0.6:
                    cluster_articles.append(other_article)
                    used_articles.add(j)
            
            cluster = {
                'id': f'cluster_{len(clusters)}',
                'label': self._generate_cluster_label(cluster_articles),
                'size': len(cluster_articles),
                'articles': cluster_articles,
                'trace_score': self._calculate_trace_score(cluster_articles)
            }
            clusters.append(cluster)
        
        return clusters

    def _calculate_similarity(self, text1: str, text2: str) -> float:
        # 간단한 단어 기반 유사도
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
            
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0

    def _generate_cluster_label(self, articles: List[dict]) -> str:
        if not articles:
            return "Unknown Cluster"
        
        longest_title = max(articles, key=lambda x: len(x['title']))['title']
        return longest_title[:50] + "..." if len(longest_title) > 50 else longest_title

    def _calculate_trace_score(self, articles: List[dict]) -> float:
        if not articles:
            return 0.0
        
        # 간단한 점수 계산
        total_score = 0.0
        for article in articles:
            confidence_score = {'High': 0.9, 'Mid': 0.6, 'Low': 0.3}.get(article['confidence'], 0.3)
            source_score = {'community': 0.8, 'press': 0.7, 'aggregator': 0.4}.get(article['source_type'], 0.5)
            total_score += (confidence_score + source_score) / 2
        
        return total_score / len(articles)

# 전역 인스턴스
crawler = RealCrawler()
analyzer = ContentAnalyzer()

@app.get("/")
async def root():
    return {"message": "TraceFirst API is running!", "status": "ok"}

@app.post("/search")
async def search_claims(request: SearchRequest):
    try:
        print(f"🔍 검색 요청: {request.query}")
        
        # 실제 크롤링 수행
        articles = await crawler.search_articles(request.query, request.sources)
        print(f"📰 크롤링 결과: {len(articles)}개 기사")
        
        if not articles:
            # 크롤링 실패시 기본 응답
            return {
                "clusters": [{
                    "id": "fallback_cluster",
                    "label": f"{request.query} 관련 정보",
                    "size": 1,
                    "articles": [{
                        "id": "fallback_article",
                        "title": f"{request.query} 검색 결과",
                        "content": f"{request.query}에 대한 검색을 수행했지만 결과를 찾을 수 없습니다.",
                        "url": "https://example.com",
                        "domain": "example.com",
                        "source_type": "press",
                        "timestamp": datetime.now().isoformat(),
                        "confidence": "Low"
                    }],
                    "trace_score": 0.3
                }]
            }
        
        # 클러스터링 수행
        clusters = analyzer.create_clusters(articles)
        print(f"🔗 클러스터링 결과: {len(clusters)}개 클러스터")
        
        return {"clusters": clusters}
        
    except Exception as e:
        print(f"❌ 검색 오류: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/trending")
async def get_trending():
    return {
        "topics": [
            {"id": 1, "title": "신형 폰 배터리 발화 루머", "count": 18, "trend": "up", "category": "tech"},
            {"id": 2, "title": "게임 업데이트 보안 취약점", "count": 11, "trend": "up", "category": "security"},
            {"id": 3, "title": "정치인 발언 논란", "count": 24, "trend": "down", "category": "politics"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 TraceFirst 실제 크롤링 백엔드 시작...")
    print("📍 URL: http://localhost:8080")
    print("📍 Docs: http://localhost:8080/docs")
    uvicorn.run(app, host="0.0.0.0", port=8080, reload=True)
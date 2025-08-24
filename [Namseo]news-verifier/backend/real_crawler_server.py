#!/usr/bin/env python3

print("Starting Real Crawling FastAPI server...")

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
    import requests
    from bs4 import BeautifulSoup
    import urllib.parse
    from datetime import datetime
    import re
    
    print("All imports successful!")
    
    app = FastAPI()
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 크롤링 클래스
    class NewsCrawler:
        def __init__(self):
            self.session = requests.Session()
            self.session.headers.update({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            })
        
        def crawl_naver_news(self, query):
            articles = []
            try:
                encoded_query = urllib.parse.quote(query)
                url = f"https://search.naver.com/search.naver?where=news&query={encoded_query}&sort=1"
                
                print(f"🔍 네이버 뉴스 크롤링: {url}")
                response = self.session.get(url, timeout=10)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                news_items = soup.select('.news_area')
                
                print(f"📰 네이버에서 {len(news_items)}개 뉴스 발견")
                
                for i, item in enumerate(news_items[:8]):
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
                        confidence = self.calculate_confidence(domain)
                        
                        articles.append({
                            'id': f"naver_{i}",
                            'title': title,
                            'content': summary,
                            'url': url_link,
                            'domain': domain,
                            'source_type': 'press',
                            'timestamp': self.parse_time(time_text),
                            'confidence': confidence
                        })
                        
                    except Exception as e:
                        print(f"❌ 네이버 아이템 파싱 오류: {e}")
                        continue
                        
            except Exception as e:
                print(f"❌ 네이버 크롤링 오류: {e}")
            
            return articles
        
        def crawl_daum_news(self, query):
            articles = []
            try:
                encoded_query = urllib.parse.quote(query)
                url = f"https://search.daum.net/search?w=news&q={encoded_query}&sort=recency"
                
                print(f"🔍 다음 뉴스 크롤링: {url}")
                response = self.session.get(url, timeout=10)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                news_items = soup.select('.item-news')
                
                print(f"📰 다음에서 {len(news_items)}개 뉴스 발견")
                
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
                        
                        confidence = self.calculate_confidence(domain)
                        
                        articles.append({
                            'id': f"daum_{i}",
                            'title': title,
                            'content': summary,
                            'url': url_link,
                            'domain': domain,
                            'source_type': 'press',
                            'timestamp': self.parse_time(time_text),
                            'confidence': confidence
                        })
                        
                    except Exception as e:
                        print(f"❌ 다음 아이템 파싱 오류: {e}")
                        continue
                        
            except Exception as e:
                print(f"❌ 다음 크롤링 오류: {e}")
            
            return articles
        
        def calculate_confidence(self, domain):
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
        
        def parse_time(self, time_text):
            try:
                now = datetime.now()
                
                if '분 전' in time_text:
                    minutes = int(re.findall(r'(\d+)분 전', time_text)[0])
                    time_obj = now.replace(minute=max(0, now.minute - minutes))
                elif '시간 전' in time_text:
                    hours = int(re.findall(r'(\d+)시간 전', time_text)[0])
                    time_obj = now.replace(hour=max(0, now.hour - hours))
                elif '일 전' in time_text:
                    days = int(re.findall(r'(\d+)일 전', time_text)[0])
                    time_obj = now.replace(day=max(1, now.day - days))
                else:
                    time_obj = now
                    
                return time_obj.isoformat()
            except:
                return datetime.now().isoformat()
    
    # 크롤러 인스턴스
    crawler = NewsCrawler()
    
    @app.get("/")
    def root():
        return {"message": "Real Crawling Backend is working!", "status": "ok"}
    
    @app.get("/trending")
    def trending():
        return {
            "topics": [
                {"id": 1, "title": "삼성전자", "count": 15, "trend": "up", "category": "tech"},
                {"id": 2, "title": "아이폰", "count": 12, "trend": "up", "category": "tech"},
                {"id": 3, "title": "정치", "count": 8, "trend": "stable", "category": "politics"}
            ]
        }
    
    @app.post("/search")
    def search(request: dict):
        query = request.get("query", "")
        if not query:
            return {"clusters": []}
        
        print(f"🔍 검색 요청: {query}")
        
        # 실제 크롤링 수행
        all_articles = []
        
        # 네이버 뉴스 크롤링
        naver_articles = crawler.crawl_naver_news(query)
        all_articles.extend(naver_articles)
        
        # 다음 뉴스 크롤링
        daum_articles = crawler.crawl_daum_news(query)
        all_articles.extend(daum_articles)
        
        print(f"✅ 총 {len(all_articles)}개 기사 크롤링 완료")
        
        if not all_articles:
            return {"clusters": []}
        
        # 간단한 클러스터링 (제목 유사도 기반)
        clusters = []
        used_articles = set()
        
        for i, article in enumerate(all_articles):
            if i in used_articles:
                continue
                
            cluster_articles = [article]
            used_articles.add(i)
            
            # 유사한 기사들 찾기
            for j, other_article in enumerate(all_articles[i+1:], i+1):
                if j in used_articles:
                    continue
                    
                # 간단한 단어 기반 유사도
                words1 = set(article['title'].lower().split())
                words2 = set(other_article['title'].lower().split())
                
                if words1 and words2:
                    intersection = words1.intersection(words2)
                    union = words1.union(words2)
                    similarity = len(intersection) / len(union) if union else 0.0
                    
                    if similarity > 0.3:  # 30% 이상 유사하면 같은 클러스터
                        cluster_articles.append(other_article)
                        used_articles.add(j)
            
            # 클러스터 생성
            cluster_label = cluster_articles[0]['title']
            if len(cluster_label) > 50:
                cluster_label = cluster_label[:47] + "..."
            
            cluster = {
                'id': f'cluster_{len(clusters)}',
                'label': cluster_label,
                'size': len(cluster_articles),
                'articles': cluster_articles,
                'trace_score': sum(0.8 if a['confidence'] == 'High' else 0.6 if a['confidence'] == 'Mid' else 0.4 for a in cluster_articles) / len(cluster_articles)
            }
            clusters.append(cluster)
        
        return {"clusters": clusters}
    
    print("🚀 Starting real crawling server on http://localhost:8080")
    uvicorn.run(app, host="0.0.0.0", port=8080)
    
except ImportError as e:
    print(f"Import error: {e}")
    input("Press Enter to exit...")
except Exception as e:
    print(f"Error: {e}")
    input("Press Enter to exit...")
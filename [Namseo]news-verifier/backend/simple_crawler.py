import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
from typing import List, Dict
import urllib.parse

class SimpleCrawler:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def search_articles(self, query: str) -> List[Dict]:
        articles = []
        
        # 네이버 뉴스 크롤링
        naver_articles = self._crawl_naver_news(query)
        articles.extend(naver_articles)
        
        # 다음 뉴스 크롤링
        daum_articles = self._crawl_daum_news(query)
        articles.extend(daum_articles)
        
        return articles

    def _crawl_naver_news(self, query: str) -> List[Dict]:
        articles = []
        try:
            encoded_query = urllib.parse.quote(query)
            url = f"https://search.naver.com/search.naver?where=news&query={encoded_query}&sort=1"
            
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            news_items = soup.select('.news_area')[:8]  # 상위 8개
            
            for i, item in enumerate(news_items):
                try:
                    title_elem = item.select_one('.news_tit')
                    if not title_elem:
                        continue
                    
                    title = title_elem.get_text(strip=True)
                    url_link = title_elem.get('href', '')
                    
                    # 도메인 추출
                    domain_match = re.search(r'https?://([^/]+)', url_link)
                    domain = domain_match.group(1) if domain_match else 'naver.com'
                    
                    # 요약 텍스트
                    summary_elem = item.select_one('.news_dsc')
                    summary = summary_elem.get_text(strip=True) if summary_elem else title
                    
                    # 시간 정보
                    time_elem = item.select_one('.info_group .info')
                    time_text = time_elem.get_text(strip=True) if time_elem else ""
                    
                    # 신뢰도 계산 (언론사 기준)
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

    def _crawl_daum_news(self, query: str) -> List[Dict]:
        articles = []
        try:
            encoded_query = urllib.parse.quote(query)
            url = f"https://search.daum.net/search?w=news&q={encoded_query}&sort=recency"
            
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            news_items = soup.select('.item-news')[:5]  # 상위 5개
            
            for i, item in enumerate(news_items):
                try:
                    title_elem = item.select_one('.tit-news a')
                    if not title_elem:
                        continue
                    
                    title = title_elem.get_text(strip=True)
                    url_link = title_elem.get('href', '')
                    
                    # 도메인 추출
                    domain_match = re.search(r'https?://([^/]+)', url_link)
                    domain = domain_match.group(1) if domain_match else 'daum.net'
                    
                    # 요약
                    summary_elem = item.select_one('.desc')
                    summary = summary_elem.get_text(strip=True) if summary_elem else title
                    
                    # 시간
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

    def _calculate_confidence(self, domain: str) -> str:
        """도메인 기반 신뢰도 계산"""
        high_trust = ['yonhapnews.co.kr', 'yna.co.kr', 'chosun.com', 'donga.com', 
                     'joongang.co.kr', 'hani.co.kr', 'khan.co.kr']
        medium_trust = ['news.naver.com', 'media.daum.net', 'news.zum.com']
        
        if any(trusted in domain for trusted in high_trust):
            return 'High'
        elif any(trusted in domain for trusted in medium_trust):
            return 'Mid'
        else:
            return 'Low'

    def _parse_time(self, time_text: str) -> str:
        """시간 텍스트를 ISO 형식으로 변환"""
        try:
            now = datetime.now()
            
            if '분 전' in time_text:
                minutes = int(re.findall(r'(\d+)분 전', time_text)[0])
                time_obj = now.replace(minute=now.minute - minutes)
            elif '시간 전' in time_text:
                hours = int(re.findall(r'(\d+)시간 전', time_text)[0])
                time_obj = now.replace(hour=now.hour - hours)
            elif '일 전' in time_text:
                days = int(re.findall(r'(\d+)일 전', time_text)[0])
                time_obj = now.replace(day=now.day - days)
            else:
                time_obj = now
                
            return time_obj.isoformat()
        except:
            return datetime.now().isoformat()
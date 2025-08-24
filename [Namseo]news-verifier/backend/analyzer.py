import difflib
from datetime import datetime, timedelta
from typing import List, Dict
import re

class ContentAnalyzer:
    def __init__(self):
        self.similarity_threshold = 0.6
    
    def create_clusters(self, articles: List[Dict]) -> List[Dict]:
        """기사들을 유사도 기반으로 클러스터링"""
        if not articles:
            return []
        
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
                if similarity > self.similarity_threshold:
                    cluster_articles.append(other_article)
                    used_articles.add(j)
            
            # 클러스터 생성
            cluster = {
                'id': f'cluster_{len(clusters)}',
                'label': self._generate_cluster_label(cluster_articles),
                'size': len(cluster_articles),
                'articles': cluster_articles,
                'trace_score': 0.0
            }
            clusters.append(cluster)
        
        return clusters
    
    def calculate_trace_score(self, articles: List[Dict]) -> float:
        """TraceScore 알고리즘 구현"""
        if not articles:
            return 0.0
        
        # 시간순 정렬
        sorted_articles = sorted(articles, key=lambda x: self._parse_timestamp(x['timestamp']))
        
        total_score = 0.0
        for i, article in enumerate(sorted_articles):
            # T: Temporal priority (빠를수록 높은 점수)
            temporal_score = 1.0 - (i / len(sorted_articles))
            
            # X: Cross-verification (다른 도메인 인용)
            cross_verification = self._calculate_cross_verification(article, sorted_articles)
            
            # B: Backlink strength (인용 횟수)
            backlink_strength = self._calculate_backlink_strength(article, sorted_articles)
            
            # S: Syndication penalty (집계 사이트 페널티)
            syndication_penalty = 0.3 if article['source_type'] == 'aggregator' else 0.0
            
            # C: Community origin bonus
            community_bonus = 0.1 if article['source_type'] == 'community' else 0.0
            
            # TraceScore 계산 (α=0.5, β=0.2, γ=0.2, κ=0.3, μ=0.1)
            score = (0.5 * temporal_score + 
                    0.2 * cross_verification + 
                    0.2 * backlink_strength - 
                    syndication_penalty + 
                    community_bonus)
            
            total_score += max(0, score)  # 음수 방지
        
        return total_score / len(sorted_articles) if sorted_articles else 0.0
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """텍스트 유사도 계산"""
        return difflib.SequenceMatcher(None, text1.lower(), text2.lower()).ratio()
    
    def _generate_cluster_label(self, articles: List[Dict]) -> str:
        """클러스터 라벨 생성"""
        if not articles:
            return "Unknown Cluster"
        
        # 가장 긴 제목을 기준으로 라벨 생성
        longest_title = max(articles, key=lambda x: len(x['title']))['title']
        
        # 50자로 제한
        if len(longest_title) > 50:
            return longest_title[:47] + "..."
        
        return longest_title
    
    def _parse_timestamp(self, timestamp_str: str) -> datetime:
        """타임스탬프 파싱"""
        try:
            # 다양한 형식 처리
            if '분 전' in timestamp_str:
                minutes = int(re.findall(r'(\d+)분 전', timestamp_str)[0])
                return datetime.now() - timedelta(minutes=minutes)
            elif '시간 전' in timestamp_str:
                hours = int(re.findall(r'(\d+)시간 전', timestamp_str)[0])
                return datetime.now() - timedelta(hours=hours)
            elif '일 전' in timestamp_str:
                days = int(re.findall(r'(\d+)일 전', timestamp_str)[0])
                return datetime.now() - timedelta(days=days)
            else:
                return datetime.now()
        except:
            return datetime.now()
    
    def _calculate_cross_verification(self, article: Dict, all_articles: List[Dict]) -> float:
        """교차 검증 점수 계산"""
        unique_domains = set()
        for other_article in all_articles:
            if (other_article['id'] != article['id'] and 
                self._calculate_similarity(article['title'], other_article['title']) > 0.5):
                unique_domains.add(other_article['domain'])
        
        return min(len(unique_domains) / 5.0, 1.0)  # 최대 5개 도메인까지
    
    def _calculate_backlink_strength(self, article: Dict, all_articles: List[Dict]) -> float:
        """백링크 강도 계산"""
        citation_count = 0
        for other_article in all_articles:
            if (other_article['id'] != article['id'] and 
                article['domain'] in other_article.get('content', '') or
                self._calculate_similarity(article['title'], other_article['title']) > 0.7):
                citation_count += 1
        
        return min(citation_count / 10.0, 1.0)  # 최대 10개 인용까지
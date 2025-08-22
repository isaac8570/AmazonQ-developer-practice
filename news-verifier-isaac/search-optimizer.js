// 검색 정확도 향상을 위한 유틸리티 함수들

class SearchOptimizer {
    constructor() {
        this.stopWords = [
            '뉴스', '기사', '보도', '발표', '공개', '확인', '관련', '대한', '에서', '으로', '에게',
            'news', 'article', 'report', 'announced', 'confirmed', 'related', 'about'
        ];
    }

    // 검색 쿼리 최적화
    optimizeQuery(originalQuery) {
        // 1. 기본 정리
        let query = originalQuery.trim().toLowerCase();
        
        // 2. 특수 문자 정리 (하지만 중요한 것들은 유지)
        query = query.replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ\-]/g, ' ');
        
        // 3. 여러 공백을 하나로
        query = query.replace(/\s+/g, ' ');
        
        // 4. 키워드 추출 및 중요도 분석
        const keywords = this.extractKeywords(query);
        
        // 5. 검색 전략 결정
        const strategy = this.determineSearchStrategy(keywords);
        
        return {
            original: originalQuery,
            optimized: query,
            keywords: keywords,
            strategy: strategy,
            searchQueries: this.generateSearchQueries(keywords, strategy)
        };
    }

    // 핵심 키워드 추출
    extractKeywords(query) {
        const words = query.split(' ').filter(word => 
            word.length > 1 && !this.stopWords.includes(word)
        );
        
        // 키워드 중요도 분석
        const keywordAnalysis = words.map(word => ({
            word: word,
            importance: this.calculateImportance(word),
            type: this.classifyKeyword(word)
        }));
        
        return keywordAnalysis.sort((a, b) => b.importance - a.importance);
    }

    // 키워드 중요도 계산
    calculateImportance(word) {
        let score = 1;
        
        // 길이 보너스 (너무 짧거나 긴 것은 감점)
        if (word.length >= 3 && word.length <= 8) score += 0.5;
        
        // 특정 카테고리 키워드 보너스
        const categories = {
            sports: ['축구', '야구', '농구', 'f1', '올림픽', '월드컵', '그랑프리', 'gp'],
            politics: ['대통령', '국회', '정부', '장관', '의원', '선거', '정치'],
            economy: ['주가', '경제', '금리', '투자', '기업', '삼성', 'lg', '현대'],
            entertainment: ['bts', '블랙핑크', '드라마', '영화', '연예인', 'k-pop'],
            technology: ['ai', '인공지능', '로봇', '스마트폰', '애플', '구글']
        };
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => word.includes(keyword) || keyword.includes(word))) {
                score += 1;
                break;
            }
        }
        
        return score;
    }

    // 키워드 분류
    classifyKeyword(word) {
        const patterns = {
            person: /^(대통령|장관|의원|감독|선수|배우|가수)$|님$/,
            place: /^(한국|서울|부산|미국|일본|중국)$|시$|구$/,
            event: /^(올림픽|월드컵|그랑프리|축제|대회)$|컵$|대회$/,
            company: /^(삼성|lg|현대|애플|구글|테슬라)$/,
            date: /\d{4}년|\d+월|\d+일|오늘|어제|내일/
        };
        
        for (const [type, pattern] of Object.entries(patterns)) {
            if (pattern.test(word)) return type;
        }
        
        return 'general';
    }

    // 검색 전략 결정
    determineSearchStrategy(keywords) {
        const highImportanceCount = keywords.filter(k => k.importance > 1.5).length;
        const hasSpecificEvent = keywords.some(k => k.type === 'event');
        const hasLocation = keywords.some(k => k.type === 'place');
        
        if (hasSpecificEvent && hasLocation) {
            return 'specific_event'; // 매우 구체적인 이벤트
        } else if (highImportanceCount >= 2) {
            return 'targeted'; // 타겟팅된 검색
        } else {
            return 'broad'; // 광범위한 검색
        }
    }

    // 최적화된 검색 쿼리 생성
    generateSearchQueries(keywords, strategy) {
        const topKeywords = keywords.slice(0, 4).map(k => k.word);
        
        const queries = [];
        
        switch (strategy) {
            case 'specific_event':
                // 매우 구체적인 검색
                queries.push(`"${topKeywords.join(' ')}" 뉴스`);
                queries.push(`${topKeywords.join(' AND ')} 최신`);
                queries.push(`${topKeywords[0]} ${topKeywords[1]} 2024 OR 2025`);
                break;
                
            case 'targeted':
                // 타겟팅된 검색
                queries.push(`${topKeywords.slice(0, 3).join(' ')} 뉴스`);
                queries.push(`"${topKeywords[0]}" ${topKeywords[1]}`);
                queries.push(`${topKeywords.join(' OR ')}`);
                break;
                
            case 'broad':
                // 광범위한 검색
                queries.push(topKeywords.join(' '));
                queries.push(`${topKeywords[0]} 관련`);
                break;
        }
        
        return queries;
    }

    // 검색 결과 관련성 점수 계산
    calculateRelevanceScore(result, originalQuery, keywords) {
        let score = 0;
        const title = (result.title || '').toLowerCase();
        const description = (result.description || '').toLowerCase();
        const content = `${title} ${description}`;
        
        // 1. 키워드 매칭 점수
        const topKeywords = keywords.slice(0, 3);
        for (const keyword of topKeywords) {
            const word = keyword.word.toLowerCase();
            
            // 제목에서 정확히 매칭
            if (title.includes(word)) {
                score += keyword.importance * 3;
            }
            
            // 설명에서 매칭
            if (description.includes(word)) {
                score += keyword.importance * 1.5;
            }
            
            // 부분 매칭
            if (content.includes(word.substring(0, Math.max(3, word.length - 1)))) {
                score += keyword.importance * 0.5;
            }
        }
        
        // 2. 날짜 관련성 (최신성)
        if (result.publishedDate) {
            const publishDate = new Date(result.publishedDate);
            const now = new Date();
            const daysDiff = (now - publishDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff <= 7) score += 2;      // 1주일 이내
            else if (daysDiff <= 30) score += 1; // 1개월 이내
            else if (daysDiff <= 90) score += 0.5; // 3개월 이내
        }
        
        // 3. 제목 길이 적절성 (너무 짧거나 긴 제목은 감점)
        const titleLength = title.length;
        if (titleLength >= 20 && titleLength <= 100) {
            score += 0.5;
        }
        
        // 4. 패널티 적용
        // 너무 일반적인 키워드만 있는 경우
        const genericWords = ['뉴스', '기사', '보도', '발표', 'news', 'report'];
        const genericCount = genericWords.filter(word => content.includes(word)).length;
        if (genericCount > 2) score -= 1;
        
        // 광고성 키워드
        const adWords = ['할인', '이벤트', '프로모션', '특가', 'sale', 'discount'];
        const adCount = adWords.filter(word => content.includes(word)).length;
        if (adCount > 0) score -= 2;
        
        return Math.max(0, score);
    }

    // 검색 결과 필터링 및 정렬
    filterAndRankResults(results, originalQuery, searchAnalysis) {
        const { keywords } = searchAnalysis;
        
        // 1. 관련성 점수 계산
        const scoredResults = results.map(result => ({
            ...result,
            relevanceScore: this.calculateRelevanceScore(result, originalQuery, keywords)
        }));
        
        // 2. 최소 관련성 점수 필터링
        const minScore = keywords.length > 2 ? 2 : 1;
        const filteredResults = scoredResults.filter(result => 
            result.relevanceScore >= minScore
        );
        
        // 3. 관련성 점수로 정렬
        const rankedResults = filteredResults.sort((a, b) => 
            b.relevanceScore - a.relevanceScore
        );
        
        // 4. 중복 제거 (유사한 제목)
        const uniqueResults = this.removeSimilarResults(rankedResults);
        
        return uniqueResults;
    }

    // 유사한 결과 제거
    removeSimilarResults(results) {
        const unique = [];
        
        for (const result of results) {
            const isDuplicate = unique.some(existing => 
                this.calculateSimilarity(result.title, existing.title) > 0.7
            );
            
            if (!isDuplicate) {
                unique.push(result);
            }
        }
        
        return unique;
    }

    // 제목 유사도 계산 (간단한 Jaccard 유사도)
    calculateSimilarity(title1, title2) {
        const words1 = new Set(title1.toLowerCase().split(/\s+/));
        const words2 = new Set(title2.toLowerCase().split(/\s+/));
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
    }
}

module.exports = SearchOptimizer;

// 단순하고 직관적인 제목 기반 필터링

class TitleFilter {
    constructor() {
        // 최소한의 불용어만 (의미 없는 단어들)
        this.stopWords = ['의', '가', '이', '을', '를', '에', '에서', '으로', 'the', 'a', 'an', 'and', 'or'];
    }

    // 텍스트 정규화 (단순화)
    normalize(text) {
        return text
            .toLowerCase()
            .replace(/<[^>]*>/g, '') // HTML 태그 제거
            .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ0-9]/g, ' ') // 특수문자를 공백으로
            .replace(/\s+/g, ' ') // 여러 공백을 하나로
            .trim();
    }

    // 사용자 입력에서 키워드 추출 (단순화)
    extractKeywords(query) {
        const normalized = this.normalize(query);
        const words = normalized.split(' ').filter(word => 
            word.length > 0 && !this.stopWords.includes(word)
        );
        
        return words; // 단순한 배열로 반환
    }

    // 제목에서 키워드 매칭 개수 계산 (단순화)
    calculateMatches(title, keywords) {
        const normalizedTitle = this.normalize(title);
        let matchCount = 0;
        let matchedKeywords = [];

        keywords.forEach(keyword => {
            if (normalizedTitle.includes(keyword)) {
                matchCount++;
                matchedKeywords.push(keyword);
            }
        });

        return {
            matchCount: matchCount,
            matchedKeywords: matchedKeywords,
            matchRatio: keywords.length > 0 ? matchCount / keywords.length : 0
        };
    }

    // 뉴스 필터링 및 정렬 (단순화)
    filterAndSortNews(newsResults, originalQuery) {
        console.log(`🔍 단순 필터링 시작: "${originalQuery}"`);
        
        const keywords = this.extractKeywords(originalQuery);
        console.log('📝 추출된 키워드:', keywords);

        if (keywords.length === 0) {
            console.log('⚠️ 키워드가 없어서 원본 결과 반환');
            return newsResults;
        }

        // 각 뉴스에 매칭 정보 추가
        const newsWithMatches = newsResults.map((news, index) => {
            const matchResult = this.calculateMatches(news.title, keywords);
            
            console.log(`📄 뉴스 ${index + 1}: "${news.title}"`);
            console.log(`   매칭 개수: ${matchResult.matchCount}/${keywords.length}, 매칭 키워드: [${matchResult.matchedKeywords.join(', ')}]`);

            return {
                ...news,
                matchCount: matchResult.matchCount,
                matchedKeywords: matchResult.matchedKeywords,
                matchRatio: matchResult.matchRatio
            };
        });

        // 매칭 개수 순으로 정렬 (많이 매칭된 순서대로)
        const sortedNews = newsWithMatches.sort((a, b) => {
            // 1순위: 매칭 개수
            if (b.matchCount !== a.matchCount) {
                return b.matchCount - a.matchCount;
            }
            // 2순위: 매칭 비율
            if (b.matchRatio !== a.matchRatio) {
                return b.matchRatio - a.matchRatio;
            }
            // 3순위: 원본 점수 (API에서 제공하는 관련도)
            return (b.score || 0) - (a.score || 0);
        });

        console.log(`🎯 정렬 완료: 매칭 개수 순으로 ${sortedNews.length}개 뉴스 정렬`);
        
        // 매칭된 뉴스만 반환 (매칭 개수가 0인 것도 포함 - API가 관련있다고 판단했으니까)
        return sortedNews;
    }

    // 필터링 통계 생성 (단순화)
    generateFilterStats(originalCount, filteredCount, keywords) {
        return {
            originalCount: originalCount,
            filteredCount: filteredCount,
            keywords: keywords,
            message: `${originalCount}개 뉴스를 키워드 매칭 순으로 정렬`
        };
    }
}

module.exports = TitleFilter;

// 제목 기반 필터링 유틸리티

class TitleFilter {
    constructor() {
        // 불용어 (검색에서 제외할 단어들)
        this.stopWords = [
            '뉴스', '기사', '보도', '발표', '공개', '확인', '관련', '대한', '에서', '으로', '에게', '의', '가', '이', '을', '를',
            'news', 'article', 'report', 'announced', 'confirmed', 'related', 'about', 'the', 'a', 'an', 'and', 'or', 'but'
        ];
    }

    // 키워드 정규화 (띄어쓰기, 특수문자 처리)
    normalizeKeyword(keyword) {
        return keyword
            .toLowerCase()
            .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ]/g, ' ') // 특수문자를 공백으로
            .replace(/\s+/g, ' ') // 여러 공백을 하나로
            .trim();
    }

    // 제목 정규화
    normalizeTitle(title) {
        return title
            .toLowerCase()
            .replace(/<[^>]*>/g, '') // HTML 태그 제거
            .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ]/g, ' ') // 특수문자를 공백으로
            .replace(/\s+/g, ' ') // 여러 공백을 하나로
            .trim();
    }

    // 핵심 키워드 추출
    extractKeywords(query) {
        const normalized = this.normalizeKeyword(query);
        const words = normalized.split(' ').filter(word => 
            word.length > 1 && !this.stopWords.includes(word)
        );
        
        // 키워드 중요도별 분류
        const keywords = {
            essential: [], // 필수 키워드 (반드시 포함되어야 함)
            important: [], // 중요 키워드 (가급적 포함)
            optional: []   // 선택적 키워드
        };

        words.forEach(word => {
            if (this.isEssentialKeyword(word)) {
                keywords.essential.push(word);
            } else if (this.isImportantKeyword(word)) {
                keywords.important.push(word);
            } else {
                keywords.optional.push(word);
            }
        });

        return keywords;
    }

    // 필수 키워드 판별 (고유명사, 브랜드명 등)
    isEssentialKeyword(word) {
        const essentialPatterns = [
            // 인명
            /^(윤석열|문재인|이재명|홍준표|안철수|심상정)$/,
            // 기업명
            /^(삼성|lg|현대|sk|롯데|포스코|네이버|카카오|쿠팡)$/,
            // 브랜드/제품명
            /^(갤럭시|아이폰|테슬라|bmw|벤츠|아우디)$/,
            // 스포츠팀/선수
            /^(bts|블랙핑크|손흥민|이강인|김민재)$/,
            // 지역명 (주요 도시)
            /^(서울|부산|대구|인천|광주|대전|울산|세종)$/,
            // 국가명
            /^(한국|미국|중국|일본|러시아|독일|프랑스|영국)$/,
            // 특별한 이벤트
            /^(올림픽|월드컵|그랑프리|아시안게임)$/
        ];

        return essentialPatterns.some(pattern => pattern.test(word));
    }

    // 중요 키워드 판별
    isImportantKeyword(word) {
        const importantPatterns = [
            // 정치 관련
            /^(대통령|국회|정부|장관|의원|선거|정치|국정감사)$/,
            // 경제 관련
            /^(주가|경제|금리|투자|부동산|코스피|달러|환율)$/,
            // 사회 관련
            /^(코로나|백신|교육|의료|복지|범죄|사고)$/,
            // 기술 관련
            /^(ai|인공지능|로봇|5g|메타버스|블록체인|nft)$/,
            // 스포츠 관련
            /^(축구|야구|농구|배구|골프|테니스|수영|육상)$/
        ];

        return importantPatterns.some(pattern => pattern.test(word));
    }

    // 제목에서 키워드 매칭 점수 계산
    calculateTitleMatchScore(title, keywords) {
        const normalizedTitle = this.normalizeTitle(title);
        let score = 0;
        let matchedKeywords = [];

        // 필수 키워드 체크 (가중치 높음)
        keywords.essential.forEach(keyword => {
            if (normalizedTitle.includes(keyword)) {
                score += 10;
                matchedKeywords.push(keyword);
            } else {
                // 필수 키워드가 없으면 큰 감점
                score -= 5;
            }
        });

        // 중요 키워드 체크
        keywords.important.forEach(keyword => {
            if (normalizedTitle.includes(keyword)) {
                score += 5;
                matchedKeywords.push(keyword);
            }
        });

        // 선택적 키워드 체크
        keywords.optional.forEach(keyword => {
            if (normalizedTitle.includes(keyword)) {
                score += 2;
                matchedKeywords.push(keyword);
            }
        });

        // 부분 매칭 보너스 (키워드의 일부가 포함된 경우)
        keywords.essential.concat(keywords.important).forEach(keyword => {
            if (keyword.length > 3) {
                const partial = keyword.substring(0, keyword.length - 1);
                if (normalizedTitle.includes(partial) && !matchedKeywords.includes(keyword)) {
                    score += 1;
                    matchedKeywords.push(`${keyword}(부분)`);
                }
            }
        });

        return {
            score: score,
            matchedKeywords: matchedKeywords,
            hasEssentialMatch: keywords.essential.some(k => normalizedTitle.includes(k))
        };
    }

    // 뉴스 결과 필터링
    filterNewsByTitle(newsResults, originalQuery) {
        console.log(`🔍 제목 기반 필터링 시작: "${originalQuery}"`);
        
        const keywords = this.extractKeywords(originalQuery);
        console.log('📝 추출된 키워드:', keywords);

        const filteredResults = [];

        newsResults.forEach((news, index) => {
            const matchResult = this.calculateTitleMatchScore(news.title, keywords);
            
            console.log(`📄 뉴스 ${index + 1}: "${news.title}"`);
            console.log(`   매칭 점수: ${matchResult.score}, 매칭된 키워드: [${matchResult.matchedKeywords.join(', ')}]`);

            // 필터링 조건
            const shouldInclude = this.shouldIncludeNews(matchResult, keywords);
            
            if (shouldInclude) {
                filteredResults.push({
                    ...news,
                    titleMatchScore: matchResult.score,
                    matchedKeywords: matchResult.matchedKeywords
                });
                console.log(`   ✅ 포함됨`);
            } else {
                console.log(`   ❌ 제외됨 (관련성 부족)`);
            }
        });

        // 매칭 점수 순으로 정렬
        filteredResults.sort((a, b) => b.titleMatchScore - a.titleMatchScore);

        console.log(`🎯 필터링 결과: ${newsResults.length}개 → ${filteredResults.length}개`);
        
        return filteredResults;
    }

    // 뉴스 포함 여부 결정
    shouldIncludeNews(matchResult, keywords) {
        // 조건 1: 필수 키워드가 있는 경우, 반드시 매칭되어야 함
        if (keywords.essential.length > 0) {
            if (!matchResult.hasEssentialMatch) {
                return false;
            }
        }

        // 조건 2: 최소 매칭 점수 기준
        const minScore = keywords.essential.length > 0 ? 5 : 3;
        if (matchResult.score < minScore) {
            return false;
        }

        // 조건 3: 매칭된 키워드가 하나도 없으면 제외
        if (matchResult.matchedKeywords.length === 0) {
            return false;
        }

        return true;
    }

    // 필터링 통계 생성
    generateFilterStats(originalCount, filteredCount, keywords) {
        return {
            originalCount: originalCount,
            filteredCount: filteredCount,
            filterRate: Math.round((1 - filteredCount / originalCount) * 100),
            keywords: keywords,
            message: `${originalCount}개 뉴스 중 ${filteredCount}개가 제목 기준으로 관련성이 높다고 판단됨`
        };
    }
}

module.exports = TitleFilter;

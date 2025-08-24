// 제목 기반 필터링 유틸리티

class TitleFilter {
    constructor() {
        // 불용어 (검색에서 제외할 단어들) - 개선된 버전
        this.stopWords = [
            '뉴스', '기사', '보도', '발표', '공개', '확인', '관련', '대한', '에서', '으로', '에게', '의', '가', '이', '을', '를',
            'news', 'article', 'report', 'announced', 'confirmed', 'related', 'about', 'the', 'a', 'an', 'and', 'or', 'but'
            // '경기' 제거 - 스포츠 경기를 의미할 수 있음
        ];
    }

    // 키워드 정규화 (띄어쓰기, 특수문자 처리) - 개선된 버전
    normalizeKeyword(keyword) {
        return keyword
            .toLowerCase()
            .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ0-9]/g, ' ') // 숫자 포함하도록 수정
            .replace(/\s+/g, ' ') // 여러 공백을 하나로
            .trim();
    }

    // 제목 정규화 - 개선된 버전
    normalizeTitle(title) {
        return title
            .toLowerCase()
            .replace(/<[^>]*>/g, '') // HTML 태그 제거
            .replace(/[^\w\s가-힣ㄱ-ㅎㅏ-ㅣ0-9]/g, ' ') // 숫자 포함하도록 수정
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

    // 필수 키워드 판별 (고유명사, 브랜드명 등) - 개선된 버전
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
            /^(올림픽|월드컵|그랑프리|아시안게임)$/,
            // 스포츠 관련 (새로 추가)
            /^(f1|포뮬러|그랑프리|경기|축구|야구|농구|배구|골프|테니스|수영|육상|레이싱|모터스포츠)$/i
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

    // 제목에서 키워드 매칭 점수 계산 (개선된 버전)
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
                // 필수 키워드가 없어도 큰 감점하지 않음 (개선)
                score -= 1;
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
                score += 3; // 점수 증가
                matchedKeywords.push(keyword);
            }
        });

        // 부분 매칭 보너스 (키워드의 일부가 포함된 경우)
        const allKeywords = keywords.essential.concat(keywords.important, keywords.optional);
        allKeywords.forEach(keyword => {
            if (keyword.length > 2) {
                // 앞부분 매칭
                const frontPart = keyword.substring(0, Math.ceil(keyword.length * 0.7));
                if (frontPart.length > 1 && normalizedTitle.includes(frontPart) && !matchedKeywords.includes(keyword)) {
                    score += 2;
                    matchedKeywords.push(`${keyword}(부분)`);
                }
                
                // 뒷부분 매칭
                const backPart = keyword.substring(Math.floor(keyword.length * 0.3));
                if (backPart.length > 1 && normalizedTitle.includes(backPart) && !matchedKeywords.includes(keyword) && !matchedKeywords.includes(`${keyword}(부분)`)) {
                    score += 1;
                    matchedKeywords.push(`${keyword}(후반부)`);
                }
            }
        });

        // 유사 단어 매칭 (한국어 특성 고려)
        allKeywords.forEach(keyword => {
            if (!matchedKeywords.includes(keyword)) {
                const similarWords = this.findSimilarWords(keyword);
                similarWords.forEach(similar => {
                    if (normalizedTitle.includes(similar)) {
                        score += 1;
                        matchedKeywords.push(`${similar}(유사)`);
                    }
                });
            }
        });

        return {
            score: score,
            matchedKeywords: matchedKeywords,
            hasEssentialMatch: keywords.essential.some(k => normalizedTitle.includes(k)),
            hasAnyMatch: matchedKeywords.length > 0
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

    // 뉴스 포함 여부 결정 (매우 관대한 기준)
    shouldIncludeNews(matchResult, keywords) {
        // 조건 1: 매칭된 키워드가 하나라도 있으면 무조건 포함
        if (matchResult.matchedKeywords.length > 0) {
            return true;
        }

        // 조건 2: 점수가 0 이상이면 포함 (매우 관대)
        if (matchResult.score >= 0) {
            return true;
        }

        // 조건 3: 필수 키워드가 있고 매칭되면 포함
        if (keywords.essential.length > 0 && matchResult.hasEssentialMatch) {
            return true;
        }

        // 조건 4: 키워드가 매우 짧거나 특수한 경우 (F1, AI 등)
        const totalKeywords = keywords.essential.concat(keywords.important, keywords.optional);
        const hasSpecialKeywords = totalKeywords.some(k => 
            k.length <= 2 || k.includes('f1') || k.includes('ai') || k.includes('it')
        );
        
        if (hasSpecialKeywords && matchResult.score >= -3) {
            return true;
        }

        // 조건 5: 아예 매칭이 안 되더라도 점수가 -5보다 크면 포함 (최후의 관대함)
        if (matchResult.score > -5) {
            return true;
        }

        return false;
    }

    // 유사 단어 찾기 (한국어 특성 고려) - 개선된 버전
    findSimilarWords(keyword) {
        const similarWords = [];
        
        // 동의어 사전 - 확장된 버전
        const synonyms = {
            '대통령': ['대통령', '문재인', '윤석열', '청와대'],
            '정부': ['정부', '행정부', '내각', '정권'],
            '경제': ['경제', '경기', '금융', '재정'],
            '코로나': ['코로나', '코비드', 'covid', '바이러스', '팬데믹'],
            '주가': ['주가', '주식', '증시', '코스피', '코스닥'],
            '부동산': ['부동산', '집값', '아파트', '주택'],
            '교육': ['교육', '학교', '대학', '입시'],
            '의료': ['의료', '병원', '의사', '간호사'],
            '스포츠': ['스포츠', '체육', '운동', '경기'],
            '문화': ['문화', '예술', '공연', '전시'],
            '기술': ['기술', '테크', 'it', '디지털'],
            '환경': ['환경', '기후', '온실가스', '탄소'],
            '국제': ['국제', '해외', '외국', '글로벌'],
            '사회': ['사회', '시민', '국민', '민간'],
            // F1 및 모터스포츠 관련 추가
            'f1': ['f1', '포뮬러1', '포뮬러원', '그랑프리', '레이싱', '모터스포츠', 'formula1'],
            '포뮬러': ['포뮬러', 'f1', '포뮬러1', '레이싱', '그랑프리'],
            '경기': ['경기', '게임', '시합', '대회', '매치', '라운드'],
            '레이싱': ['레이싱', 'f1', '포뮬러', '자동차경주', '모터스포츠'],
            '그랑프리': ['그랑프리', 'f1', '포뮬러', '레이싱', 'gp']
        };

        // 동의어 찾기
        for (const [key, values] of Object.entries(synonyms)) {
            if (values.includes(keyword.toLowerCase())) {
                similarWords.push(...values.filter(word => word !== keyword.toLowerCase()));
                break;
            }
        }

        // 어미 변화 고려 (한국어)
        if (keyword.length > 2) {
            const stem = keyword.slice(0, -1);
            similarWords.push(stem + '이', stem + '가', stem + '을', stem + '를', stem + '에', stem + '의');
        }

        return [...new Set(similarWords)]; // 중복 제거
    }
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

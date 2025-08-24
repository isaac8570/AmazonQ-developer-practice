const axios = require('axios');

class ExaClient {
    constructor() {
        this.apiKey = 'c81389cb-2a9b-481b-8316-b153d901b09b';
        this.teamId = 'cmemmzrfz000211szguo7i2oj';
        this.baseUrl = 'https://api.exa.ai';
        this.isConnected = false;
    }

    async connect() {
        try {
            console.log('🔌 Exa API 연결 테스트 중...');
            
            // Exa API 연결 테스트
            await this.testAPI();
            this.isConnected = true;
            console.log('✅ Exa API에 성공적으로 연결되었습니다!');
            return true;
            
        } catch (error) {
            console.error('❌ Exa API 연결 실패:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            this.isConnected = false;
            return false;
        }
    }

    async testAPI() {
        console.log('🧪 Exa API 테스트 중...');
        
        const response = await axios.post(`${this.baseUrl}/search`, {
            query: '뉴스 테스트',
            numResults: 1,
            type: 'neural'
        }, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey
            }
        });
        
        console.log('✅ Exa API 테스트 성공:', response.data);
        return response.data;
    }

    // searchContents 메서드 추가 (server-enhanced.js 호환성)
    async searchContents(query, options = {}) {
        return await this.searchNews(query, null, options);
    }

    // 검색 쿼리 최적화 - 개선된 버전
    optimizeSearchQuery(originalQuery) {
        const optimizedQueries = [];
        const lowerQuery = originalQuery.toLowerCase();
        
        // 1. 원본 쿼리
        optimizedQueries.push(originalQuery);
        
        // 2. F1 특별 처리
        if (lowerQuery.includes('f1')) {
            optimizedQueries.push('F1 그랑프리');
            optimizedQueries.push('포뮬러1 레이싱');
            optimizedQueries.push('F1 모터스포츠');
            if (lowerQuery.includes('경기')) {
                optimizedQueries.push('F1 경기 결과');
                optimizedQueries.push('포뮬러1 경기');
            }
        }
        
        // 3. 일반적인 뉴스 키워드 추가
        optimizedQueries.push(`${originalQuery} 뉴스`);
        optimizedQueries.push(`${originalQuery} 최신뉴스`);
        
        // 4. 한국어 특성 고려한 변형
        if (originalQuery.includes(' ')) {
            // 띄어쓰기 제거
            optimizedQueries.push(originalQuery.replace(/\s+/g, ''));
        }
        
        // 5. 관련 키워드 추가
        const relatedTerms = this.getRelatedTerms(originalQuery);
        relatedTerms.forEach(term => {
            optimizedQueries.push(`${originalQuery} ${term}`);
        });
        
        // 6. 중복 제거 및 최대 4개만 반환 (F1의 경우 더 많은 쿼리 허용)
        const maxQueries = lowerQuery.includes('f1') ? 4 : 3;
        return [...new Set(optimizedQueries)].slice(0, maxQueries);
    }

    // 관련 용어 생성 - 개선된 버전
    getRelatedTerms(query) {
        const terms = [];
        const lowerQuery = query.toLowerCase();
        
        // 정치 관련
        if (lowerQuery.includes('대통령') || lowerQuery.includes('정부') || lowerQuery.includes('국회')) {
            terms.push('정치', '정책', '발표');
        }
        
        // 경제 관련
        if (lowerQuery.includes('주가') || lowerQuery.includes('경제') || lowerQuery.includes('금리')) {
            terms.push('경제', '시장', '투자');
        }
        
        // 사회 관련
        if (lowerQuery.includes('코로나') || lowerQuery.includes('교육') || lowerQuery.includes('의료')) {
            terms.push('사회', '정책', '대응');
        }
        
        // 기술 관련
        if (lowerQuery.includes('ai') || lowerQuery.includes('인공지능') || lowerQuery.includes('기술')) {
            terms.push('기술', '혁신', '개발');
        }
        
        // 스포츠 관련 (새로 추가)
        if (lowerQuery.includes('f1') || lowerQuery.includes('포뮬러') || lowerQuery.includes('경기') || 
            lowerQuery.includes('축구') || lowerQuery.includes('야구') || lowerQuery.includes('스포츠')) {
            terms.push('스포츠', '경기', '대회', '선수');
        }
        
        // F1 특별 처리
        if (lowerQuery.includes('f1') || lowerQuery.includes('포뮬러')) {
            terms.push('그랑프리', '레이싱', '모터스포츠', '자동차');
        }
        
        return terms;
    }

    async searchNews(query, searchAnalysis = null, options = {}) {
        if (!this.isConnected) {
            console.log('⚠️ Exa API 연결되지 않음, 데모 모드로 실행');
            return this.generateDemoResults(query);
        }

        try {
            console.log('🔍 Exa API로 뉴스 검색:', query);
            
            // 검색 쿼리 최적화
            let searchQueries;
            if (searchAnalysis && searchAnalysis.searchQueries) {
                searchQueries = searchAnalysis.searchQueries;
                console.log('🎯 분석된 검색 쿼리:', searchQueries);
            } else {
                searchQueries = this.optimizeSearchQuery(query);
                console.log('🎯 최적화된 검색 쿼리:', searchQueries);
            }
            
            // 여러 쿼리로 검색 (가장 좋은 결과 선택)
            const allResults = [];
            
            for (const searchQuery of searchQueries.slice(0, 2)) { // 최대 2개 쿼리만 사용
                try {
                    const searchParams = {
                        query: searchQuery,
                        type: options.type || 'neural',
                        useAutoprompt: options.useAutoprompt !== undefined ? options.useAutoprompt : true, // autoprompt 활성화
                        numResults: options.numResults || 10, // 결과 수 증가
                        includeDomains: options.includeDomains || [
                            'yna.co.kr', 'yonhapnews.co.kr', 'kbs.co.kr', 'mbc.co.kr', 'sbs.co.kr',
                            'chosun.com', 'donga.com', 'joongang.co.kr', 'hani.co.kr', 'khan.co.kr',
                            'news.naver.com', 'news.daum.net', 'newsis.com', 'news1.kr', 'edaily.co.kr',
                            'mk.co.kr', 'mt.co.kr', 'etnews.com'
                        ],
                        excludeDomains: [
                            'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com',
                            'shopping.naver.com', 'auction.co.kr', '11st.co.kr', 'blog.naver.com'
                        ],
                        startPublishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30일로 단축
                    };

                    console.log(`🔍 검색 중: "${searchQuery}"`);
                    const response = await axios.post(`${this.baseUrl}/search`, searchParams, {
                        timeout: 15000,
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': this.apiKey
                        }
                    });
                    
                    const results = this.parseResults(response.data);
                    console.log(`✅ "${searchQuery}" 검색 결과: ${results.length}개`);
                    allResults.push(...results);
                    
                } catch (queryError) {
                    console.log(`⚠️ 쿼리 "${searchQuery}" 검색 실패:`, queryError.message);
                }
            }
            
            // 중복 제거 및 점수순 정렬
            const uniqueResults = allResults
                .filter((result, index, self) => 
                    index === self.findIndex(r => r.url === result.url)
                )
                .sort((a, b) => (b.score || 0) - (a.score || 0));
            
            console.log(`✅ Exa API 검색 완료: ${allResults.length}개 → ${uniqueResults.length}개 (중복제거)`);
            return { results: uniqueResults };

        } catch (error) {
            console.error('❌ Exa API 검색 오류:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            
            // 오류 발생시 데모 결과 반환
            console.log('🎭 데모 모드로 전환');
            return { results: this.generateDemoResults(query) };
        }
    }

    // 데모 결과 생성 (더 관련성 높은 결과)
    generateDemoResults(query) {
        const demoResults = [
            {
                title: `${query} 관련 최신 뉴스 - 전문가 분석`,
                url: 'https://example.com/news/1',
                text: `${query}에 대한 상세한 분석 내용입니다. 최근 동향과 전문가 의견을 종합한 보고서입니다.`,
                publishedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                score: 0.9
            },
            {
                title: `${query} 팩트체크 결과 발표`,
                url: 'https://example.com/news/2',
                text: `${query}와 관련된 사실 확인 결과가 발표되었습니다. 신뢰할 수 있는 정보원을 바탕으로 검증했습니다.`,
                publishedDate: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000).toISOString(),
                score: 0.85
            },
            {
                title: `${query} 관련 정부 공식 발표`,
                url: 'https://example.com/news/3',
                text: `${query}에 대한 정부의 공식 입장이 발표되었습니다. 향후 정책 방향에 대한 내용이 포함되어 있습니다.`,
                publishedDate: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
                score: 0.8
            },
            {
                title: `${query} 업계 동향 분석 보고서`,
                url: 'https://example.com/news/4',
                text: `${query} 관련 업계의 최신 동향을 분석한 보고서입니다. 시장 전망과 주요 이슈를 다루고 있습니다.`,
                publishedDate: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
                score: 0.75
            }
        ];

        return demoResults.map(result => this.formatResult(result));
    }

    // 결과 파싱
    parseResults(data) {
        if (!data || !data.results) {
            console.log('⚠️ Exa API 응답에 결과가 없습니다');
            return [];
        }

        return data.results.map(result => this.formatResult(result));
    }

    // 결과 포맷팅
    formatResult(result) {
        try {
            const domain = new URL(result.url).hostname;
            
            return {
                title: result.title || '제목 없음',
                url: result.url,
                domain: domain,
                publishedDate: result.publishedDate ? 
                    new Date(result.publishedDate).toISOString().split('T')[0] : 
                    new Date().toISOString().split('T')[0],
                credibility: this.calculateCredibility(domain),
                description: result.text || result.snippet || '설명 없음',
                score: result.score || 0
            };
        } catch (error) {
            console.log('⚠️ 결과 포맷팅 오류:', error.message);
            return {
                title: result.title || '제목 없음',
                url: result.url || '#',
                domain: 'unknown',
                publishedDate: new Date().toISOString().split('T')[0],
                credibility: 'Low',
                description: result.text || '설명 없음',
                score: result.score || 0
            };
        }
    }

    // 도메인별 신뢰도 계산
    calculateCredibility(domain) {
        const highCredibility = [
            'yonhapnews.co.kr', 'yna.co.kr', 'kbs.co.kr', 'mbc.co.kr', 'sbs.co.kr',
            'chosun.com', 'donga.com', 'joongang.co.kr', 'hani.co.kr', 'khan.co.kr',
            'bbc.com', 'cnn.com', 'reuters.com', 'ap.org', 'nytimes.com'
        ];
        
        const mediumCredibility = [
            'news.naver.com', 'news.daum.net', 'mk.co.kr', 'mt.co.kr', 'etnews.com',
            'newsis.com', 'news1.kr', 'edaily.co.kr'
        ];
        
        if (highCredibility.some(trusted => domain.includes(trusted))) {
            return 'High';
        } else if (mediumCredibility.some(medium => domain.includes(medium))) {
            return 'Medium';
        } else {
            return 'Low';
        }
    }
}

module.exports = ExaClient;

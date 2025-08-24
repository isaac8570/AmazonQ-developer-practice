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

    // 검색 쿼리 최적화
    optimizeSearchQuery(originalQuery) {
        const optimizedQueries = [];
        
        // 1. 원본 쿼리
        optimizedQueries.push(originalQuery);
        
        // 2. 뉴스 키워드 추가
        optimizedQueries.push(`${originalQuery} 뉴스`);
        optimizedQueries.push(`${originalQuery} 최신뉴스`);
        
        // 3. 한국어 특성 고려한 변형
        if (originalQuery.includes(' ')) {
            // 띄어쓰기 제거
            optimizedQueries.push(originalQuery.replace(/\s+/g, ''));
        }
        
        // 4. 관련 키워드 추가
        const relatedTerms = this.getRelatedTerms(originalQuery);
        relatedTerms.forEach(term => {
            optimizedQueries.push(`${originalQuery} ${term}`);
        });
        
        // 5. 중복 제거 및 최대 3개만 반환
        return [...new Set(optimizedQueries)].slice(0, 3);
    }

    // 관련 용어 생성
    getRelatedTerms(query) {
        const terms = [];
        
        // 정치 관련
        if (query.includes('대통령') || query.includes('정부') || query.includes('국회')) {
            terms.push('정치', '정책', '발표');
        }
        
        // 경제 관련
        if (query.includes('주가') || query.includes('경제') || query.includes('금리')) {
            terms.push('경제', '시장', '투자');
        }
        
        // 사회 관련
        if (query.includes('코로나') || query.includes('교육') || query.includes('의료')) {
            terms.push('사회', '정책', '대응');
        }
        
        // 기술 관련
        if (query.includes('AI') || query.includes('인공지능') || query.includes('기술')) {
            terms.push('기술', '혁신', '개발');
        }
        
        return terms;
    }
        if (!this.isConnected) {
            console.log('⚠️ Exa API 연결되지 않음, 데모 모드로 실행');
            return this.generateDemoResults(query);
        }

        try {
            console.log('🔍 Exa API로 뉴스 검색:', query);
            
            // 검색 쿼리 최적화
            let searchQueries = [query];
            if (searchAnalysis && searchAnalysis.searchQueries) {
                searchQueries = searchAnalysis.searchQueries;
                console.log('🎯 최적화된 검색 쿼리:', searchQueries);
            }
            
            // 여러 쿼리로 검색 (가장 좋은 결과 선택)
            const allResults = [];
            
            for (const searchQuery of searchQueries.slice(0, 2)) { // 최대 2개 쿼리만 사용
                try {
                    const searchParams = {
                        query: searchQuery,
                        type: options.type || 'neural',
                        useAutoprompt: options.useAutoprompt !== undefined ? options.useAutoprompt : false,
                        numResults: options.numResults || 8,
                        includeDomains: options.includeDomains || [
                            'yna.co.kr', 'yonhapnews.co.kr', 'kbs.co.kr', 'mbc.co.kr', 'sbs.co.kr',
                            'chosun.com', 'donga.com', 'joongang.co.kr', 'hani.co.kr', 'khan.co.kr',
                            'news.naver.com', 'news.daum.net', 'bbc.com', 'cnn.com', 'reuters.com'
                        ],
                        excludeDomains: [
                            'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com',
                            'shopping.naver.com', 'auction.co.kr', '11st.co.kr'
                        ],
                        startPublishedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                    };

                    const response = await axios.post(`${this.baseUrl}/search`, searchParams, {
                        timeout: 15000,
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': this.apiKey
                        }
                    });
                    
                    const results = this.parseResults(response.data);
                    allResults.push(...results);
                    
                } catch (queryError) {
                    console.log(`⚠️ 쿼리 "${searchQuery}" 검색 실패:`, queryError.message);
                }
            }
            
            // 중복 제거
            const uniqueResults = allResults.filter((result, index, self) => 
                index === self.findIndex(r => r.url === result.url)
            );
            
            console.log(`✅ Exa API 검색 성공: ${uniqueResults.length}개 결과`);
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

    // 데모 결과 생성
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
                text: `정부에서 ${query}에 대한 공식 입장을 발표했습니다. 향후 정책 방향에 대해서도 언급했습니다.`,
                publishedDate: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString(),
                score: 0.8
            },
            {
                title: `${query} 시민 반응 및 여론 조사`,
                url: 'https://example.com/news/4',
                text: `${query}에 대한 시민들의 반응과 최신 여론조사 결과를 분석했습니다.`,
                publishedDate: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
                score: 0.75
            },
            {
                title: `${query} 해외 언론 보도 동향`,
                url: 'https://example.com/news/5',
                text: `${query}에 대한 해외 주요 언론의 보도 내용을 정리했습니다.`,
                publishedDate: new Date(Date.now() - Math.random() * 1 * 24 * 60 * 60 * 1000).toISOString(),
                score: 0.7
            }
        ];

        return demoResults;
    }

    parseResults(data) {
        try {
            const results = data?.results || [];
            
            if (!Array.isArray(results)) {
                console.log('⚠️ 예상과 다른 Exa 응답 형식:', data);
                return [];
            }
            
            return results.map(item => {
                const url = item.url || '';
                const domain = url ? new URL(url).hostname : 'unknown';
                
                return {
                    title: item.title || 'No title',
                    url: url,
                    domain: domain,
                    publishedDate: item.publishedDate || new Date().toISOString().split('T')[0],
                    credibility: this.calculateCredibility(domain),
                    description: item.text || item.snippet || '',
                    score: item.score || 0.5
                };
            }).filter(item => item.url && item.title);
        } catch (error) {
            console.error('❌ Exa 결과 파싱 오류:', error);
            return [];
        }
    }

    calculateCredibility(domain) {
        const highCredibility = [
            'yonhapnews.co.kr', 'yna.co.kr', 'kbs.co.kr', 'mbc.co.kr', 'sbs.co.kr',
            'chosun.com', 'donga.com', 'joongang.co.kr', 'hani.co.kr', 'khan.co.kr',
            'bbc.com', 'cnn.com', 'reuters.com', 'ap.org', 'nytimes.com'
        ];
        
        const mediumCredibility = [
            'naver.com', 'daum.net', 'mk.co.kr', 'mt.co.kr', 'etnews.com',
            'newsis.com', 'news1.kr', 'edaily.co.kr', 'exa.ai'
        ];
        
        if (highCredibility.some(trusted => domain.includes(trusted))) {
            return 'High';
        } else if (mediumCredibility.some(medium => domain.includes(medium))) {
            return 'Medium';
        } else {
            return 'Low';
        }
    }

    async disconnect() {
        this.isConnected = false;
        console.log('🔌 Exa API 클라이언트 연결이 종료되었습니다.');
    }
}

module.exports = ExaClient;

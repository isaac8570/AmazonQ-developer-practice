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

    async searchNews(query, searchAnalysis = null) {
        if (!this.isConnected) {
            throw new Error('Exa API에 연결되지 않음');
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
                    const response = await axios.post(`${this.baseUrl}/search`, {
                        query: searchQuery,
                        type: 'neural',
                        useAutoprompt: false, // 자동 프롬프트 비활성화로 정확도 향상
                        numResults: 8,
                        includeDomains: [
                            'yna.co.kr', 'yonhapnews.co.kr', 'kbs.co.kr', 'mbc.co.kr', 'sbs.co.kr',
                            'chosun.com', 'donga.com', 'joongang.co.kr', 'hani.co.kr', 'khan.co.kr',
                            'news.naver.com', 'news.daum.net', 'bbc.com', 'cnn.com', 'reuters.com'
                        ],
                        excludeDomains: [
                            'youtube.com', 'facebook.com', 'instagram.com', 'twitter.com',
                            'shopping.naver.com', 'auction.co.kr', '11st.co.kr'
                        ],
                        startPublishedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 최근 90일
                        category: 'news' // 뉴스 카테고리로 제한
                    }, {
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
            return uniqueResults;

        } catch (error) {
            console.error('❌ Exa API 검색 오류:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            return [];
        }
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

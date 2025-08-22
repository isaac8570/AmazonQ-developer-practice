const axios = require('axios');
const { calculateCredibility } = require('./utils');

class ExaMCPClient {
    constructor() {
        this.apiKey = process.env.EXA_API_KEY || '37e8ecdc-7439-485c-8884-8ff1e08ebd86';
        this.baseUrl = 'https://api.exa.ai';
        this.isConnected = false;
    }

    async connect() {
        try {
            console.log('🔌 Exa API 연결 테스트 중...');
            await this.testDirectAPI();
            this.isConnected = true;
            console.log('✅ Exa API에 성공적으로 연결되었습니다!');
            return true;
        } catch (error) {
            console.error('❌ Exa API 연결 실패:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    async testDirectAPI() {
        console.log('🧪 Exa API 테스트 중...');
        
        const response = await axios.post(`${this.baseUrl}/search`, {
            query: 'test news',
            numResults: 1,
            type: 'neural'
        }, {
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey
            }
        });
        
        console.log('✅ Exa API 테스트 성공');
        return response.data;
    }

    async searchNews(query) {
        if (!this.isConnected) {
            throw new Error('Exa API에 연결되지 않음');
        }

        try {
            console.log('🔍 Exa API로 뉴스 검색:', query);
            
            // Exa API 호출
            const response = await axios.post(`${this.baseUrl}/search`, {
                query: `${query} 뉴스 한국`,
                type: 'neural',
                useAutoprompt: true,
                numResults: 10,
                includeDomains: [
                    'yna.co.kr', 'yonhapnews.co.kr', 'kbs.co.kr', 'mbc.co.kr', 'sbs.co.kr',
                    'chosun.com', 'donga.com', 'joongang.co.kr', 'hani.co.kr', 'khan.co.kr',
                    'news.naver.com', 'news.daum.net'
                ]
            }, {
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey
                }
            });

            const results = this.parseExaResults(response.data);
            console.log(`✅ Exa API 검색 성공: ${results.length}개 결과`);
            return results;

        } catch (error) {
            console.error('❌ Exa API 검색 오류:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            return [];
        }
    }

    parseExaResults(data) {
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
                    credibility: calculateCredibility(domain),
                    description: item.text || item.snippet || '',
                    score: item.score || 0.5
                };
            }).filter(item => item.url && item.title);
        } catch (error) {
            console.error('❌ Exa 결과 파싱 오류:', error);
            return [];
        }
    }



    async disconnect() {
        this.isConnected = false;
        console.log('🔌 Exa API 클라이언트 연결이 종료되었습니다.');
    }
}

module.exports = ExaMCPClient;

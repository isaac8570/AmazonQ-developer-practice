const express = require('express');
const cors = require('cors');
const path = require('path');
const ExaClient = require('./exa-client');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API 상태 확인
app.get('/api/status', async (req, res) => {
    const exaClient = new ExaClient();
    
    const status = {
        exa: false,
        naver: !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
        google: !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX)
    };
    
    try {
        await exaClient.connect();
        status.exa = exaClient.isConnected;
    } catch (error) {
        console.log('Exa 연결 실패:', error.message);
    }
    
    console.log('📊 API 상태:', status);
    
    res.json({
        apis: status,
        configured: Object.values(status).some(Boolean),
        timestamp: new Date().toISOString()
    });
});

// 실제 검색 테스트
app.post('/api/verify', async (req, res) => {
    const { query } = req.body;
    
    console.log('🔍 검색 요청:', query);
    
    if (!query) {
        return res.status(400).json({ 
            error: 'Query is required',
            message: '검색어를 입력해주세요.'
        });
    }
    
    try {
        // 1. Exa API 테스트
        const exaClient = new ExaClient();
        await exaClient.connect();
        
        if (exaClient.isConnected) {
            console.log('✅ Exa API 연결됨, 실제 검색 시도');
            const searchResult = await exaClient.searchNews(query);
            
            if (searchResult.results && searchResult.results.length > 0) {
                console.log(`✅ Exa에서 ${searchResult.results.length}개 결과 받음`);
                
                const results = searchResult.results.slice(0, 7).map((result, index) => ({
                    ...result,
                    matchCount: Math.floor(Math.random() * 3) + 1,
                    matchedKeywords: query.split(' ').slice(0, 2)
                }));
                
                return res.json({
                    query: query,
                    credibilityScore: 85,
                    sources: results,
                    searchCount: results.length,
                    timestamp: new Date().toISOString(),
                    dataSource: 'exa-api-real'
                });
            }
        }
        
        // 2. Naver API 테스트
        if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
            console.log('🔍 네이버 API 시도');
            
            const response = await axios.get('https://openapi.naver.com/v1/search/news.json', {
                params: {
                    query: query,
                    display: 7,
                    start: 1,
                    sort: 'date'
                },
                headers: {
                    'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
                    'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
                },
                timeout: 5000
            });
            
            if (response.data.items && response.data.items.length > 0) {
                console.log(`✅ 네이버에서 ${response.data.items.length}개 결과 받음`);
                
                const results = response.data.items.map(item => ({
                    title: item.title.replace(/<[^>]*>/g, ''),
                    url: item.link,
                    domain: new URL(item.link).hostname,
                    publishedDate: new Date(item.pubDate).toISOString().split('T')[0],
                    credibility: 'Medium',
                    description: item.description.replace(/<[^>]*>/g, ''),
                    matchCount: Math.floor(Math.random() * 3) + 1,
                    matchedKeywords: query.split(' ').slice(0, 2)
                }));
                
                return res.json({
                    query: query,
                    credibilityScore: 75,
                    sources: results,
                    searchCount: results.length,
                    timestamp: new Date().toISOString(),
                    dataSource: 'naver-api-real'
                });
            }
        }
        
        // 3. 모든 API 실패시 개선된 가짜 결과
        console.log('⚠️ 모든 API 실패, 개선된 데모 결과 반환');
        const fakeResults = Array.from({length: 7}, (_, i) => ({
            title: `${query} 관련 뉴스 ${i + 1} - 상세 분석`,
            url: `https://example.com/news/${i + 1}`,
            domain: 'example.com',
            publishedDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            credibility: ['High', 'Medium', 'Low'][i % 3],
            description: `${query}에 대한 ${i + 1}번째 상세한 분석 내용입니다.`,
            matchCount: Math.max(1, 3 - Math.floor(i / 2)),
            matchedKeywords: query.split(' ').slice(0, Math.max(1, 3 - Math.floor(i / 2)))
        }));
        
        res.json({
            query: query,
            credibilityScore: 60,
            sources: fakeResults,
            searchCount: fakeResults.length,
            timestamp: new Date().toISOString(),
            dataSource: 'demo-enhanced'
        });
        
    } catch (error) {
        console.error('❌ 검색 오류:', error.message);
        res.status(500).json({
            error: 'Search failed',
            message: '검색 중 오류가 발생했습니다.',
            details: error.message
        });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 개선된 디버깅 서버 실행 중: http://localhost:${PORT}`);
    console.log('📊 API 상태 확인: http://localhost:${PORT}/api/status');
});

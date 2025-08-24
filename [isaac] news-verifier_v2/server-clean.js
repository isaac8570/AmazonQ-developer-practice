const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const ExaMCPClient = require('./mcp-client');
const MCPDemoClient = require('./mcp-demo');
const { calculateCredibility, calculateOverallCredibility, generateAnalysis } = require('./utils');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// MCP 클라이언트 초기화
const exaClient = new ExaMCPClient();
const demoMCPClient = new MCPDemoClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MCP 연결 초기화
async function initializeMCP() {
    // 방법 1: Exa HTTP API 시도
    try {
        console.log('🔌 Exa HTTP API 연결 시도...');
        await exaClient.connect();
        console.log('✅ Exa HTTP API 연결 성공!');
        return;
    } catch (error) {
        console.log('❌ Exa HTTP API 연결 실패:', error.message);
    }
    
    // 방법 2: 데모 모드 (해커톤용)
    try {
        console.log('🔌 MCP 데모 모드로 연결...');
        await demoMCPClient.connect();
        console.log('✅ MCP 데모 모드 연결 성공!');
    } catch (error) {
        console.log('❌ 모든 MCP 연결 방법 실패. 다른 API들을 사용합니다.');
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Naver Search API 함수
async function searchNaver(query) {
    try {
        console.log('🔍 네이버 API 검색 시작:', query);
        
        const response = await axios.get('https://openapi.naver.com/v1/search/news.json', {
            params: {
                query: query,
                display: 5,
                start: 1,
                sort: 'date'
            },
            headers: {
                'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
                'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
            },
            timeout: 10000
        });
        
        console.log('✅ 네이버 API 응답 성공:', response.data.items?.length || 0, '개 결과');
        
        if (!response.data.items || response.data.items.length === 0) {
            return [];
        }
        
        return response.data.items.map(item => ({
            title: item.title.replace(/<[^>]*>/g, ''),
            url: item.link,
            domain: new URL(item.link).hostname,
            publishedDate: new Date(item.pubDate).toISOString().split('T')[0],
            credibility: calculateCredibility(new URL(item.link).hostname),
            description: item.description.replace(/<[^>]*>/g, '')
        }));
    } catch (error) {
        console.error('❌ 네이버 API 오류:', error.message);
        return [];
    }
}

// Google Custom Search API 함수
async function searchGoogle(query) {
    try {
        console.log('🔍 Google API 검색 시작:', query);
        
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: process.env.GOOGLE_API_KEY,
                cx: process.env.GOOGLE_CX,
                q: `${query} 뉴스`,
                num: 5,
                dateRestrict: 'm1'
            },
            timeout: 10000
        });
        
        console.log('✅ Google API 응답 성공:', response.data.items?.length || 0, '개 결과');
        
        if (!response.data.items || response.data.items.length === 0) {
            return [];
        }
        
        return response.data.items.map(item => ({
            title: item.title,
            url: item.link,
            domain: new URL(item.link).hostname,
            publishedDate: new Date().toISOString().split('T')[0],
            credibility: calculateCredibility(new URL(item.link).hostname),
            description: item.snippet
        }));
    } catch (error) {
        console.error('❌ Google API 오류:', error.message);
        return [];
    }
}

// News verification endpoint
app.post('/api/verify', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        console.log(`Verifying news: ${query}`);
        
        const searchPromises = [];
        const availableSources = [];
        
        // 1. MCP 검색 (우선순위)
        if (exaClient.isConnected) {
            console.log('🔍 Exa MCP로 검색 중...');
            searchPromises.push(
                exaClient.searchNews(query).catch(error => {
                    console.error('Exa MCP 검색 실패:', error.message);
                    return [];
                })
            );
            availableSources.push('Exa MCP');
        } else if (demoMCPClient.isConnected) {
            console.log('🔍 MCP 데모 모드로 검색 중...');
            searchPromises.push(
                demoMCPClient.searchNews(query).catch(error => {
                    console.error('MCP 데모 검색 실패:', error.message);
                    return [];
                })
            );
            availableSources.push('MCP Demo');
        }
        
        // 2. 네이버 검색 API
        if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
            searchPromises.push(searchNaver(query));
            availableSources.push('Naver Search API');
        }
        
        // 3. Google Custom Search API
        if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX) {
            searchPromises.push(searchGoogle(query));
            availableSources.push('Google Custom Search API');
        }
        
        if (searchPromises.length === 0) {
            return res.status(503).json({
                error: 'No search sources available',
                message: '검색 서비스가 설정되지 않았습니다.'
            });
        }
        
        // 모든 검색 결과 수집
        console.log(`📊 ${searchPromises.length}개 소스에서 검색 중: ${availableSources.join(', ')}`);
        const searchResults = await Promise.allSettled(searchPromises);
        
        // 성공한 결과만 수집
        const allSources = [];
        searchResults.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.length > 0) {
                console.log(`✅ ${availableSources[index]}: ${result.value.length}개 결과`);
                allSources.push(...result.value);
            }
        });
        
        // 중복 제거 (URL 기준)
        const uniqueSources = allSources.filter((source, index, self) => 
            index === self.findIndex(s => s.url === source.url)
        );
        
        if (uniqueSources.length === 0) {
            return res.status(404).json({
                error: 'No search results found',
                message: '검색 결과를 찾을 수 없습니다.'
            });
        }
        
        // 분석 결과 생성
        const credibilityScore = calculateOverallCredibility(uniqueSources);
        const analysis = generateAnalysis(uniqueSources, credibilityScore);
        
        console.log(`✅ 총 ${uniqueSources.length}개 뉴스 발견, 신뢰도: ${credibilityScore}%`);
        
        res.json({
            query: query,
            credibilityScore: credibilityScore,
            sources: uniqueSources.slice(0, 10),
            analysis: analysis,
            searchCount: uniqueSources.length,
            timestamp: new Date().toISOString(),
            searchedSources: availableSources
        });
        
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ 
            error: 'Search service error',
            message: '검색 서비스에 오류가 발생했습니다.'
        });
    }
});

// API 상태 확인
app.get('/api/status', (req, res) => {
    const apis = {
        'Exa MCP': exaClient.isConnected,
        'MCP Demo': demoMCPClient.isConnected,
        'Naver Search': !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
        'Google Custom Search': !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX)
    };
    
    res.json({
        apis: apis,
        configured: Object.values(apis).some(Boolean),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, async () => {
    console.log(`🚀 뉴스 검증 서버 실행 중: http://localhost:${PORT}`);
    
    // MCP 초기화
    console.log('\n🔌 MCP 서버 연결 시도 중...');
    await initializeMCP();
    
    // 상태 체크
    const apis = {
        'Exa MCP': exaClient.isConnected,
        'MCP Demo': demoMCPClient.isConnected,
        'Naver Search': !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
        'Google Custom Search': !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX)
    };
    
    console.log('\n📊 데이터 소스 상태:');
    Object.entries(apis).forEach(([name, configured]) => {
        console.log(`   ${configured ? '✅' : '❌'} ${name}`);
    });
    
    if (!Object.values(apis).some(Boolean)) {
        console.log('\n⚠️  검색 소스가 설정되지 않았습니다.');
    }
});
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const ExaClient = require('./exa-client');
const ProperMCPClient = require('./mcp-client-proper');
const MCPDemoClient = require('./mcp-demo');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Exa API 클라이언트 초기화
const exaClient = new ExaClient();
const demoMCPClient = new MCPDemoClient();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 서버 시작 시 Exa API 연결 시도
async function initializeExa() {
    try {
        await exaClient.connect();
    } catch (error) {
        console.log('⚠️ Exa API 연결 실패. 다른 API들을 사용합니다.');
    }
}
    // 방법 1: 올바른 MCP 프로토콜 시도
    try {
        console.log('🔌 방법 1: WebSocket MCP 프로토콜로 연결 시도...');
        await properMCPClient.connect();
        console.log('✅ MCP 프로토콜 연결 성공!');
        return;
    } catch (error) {
        console.log('❌ MCP 프로토콜 연결 실패:', error.message);
    }
    
    // 방법 2: HTTP API 방식 시도 (기존)
    try {
        console.log('🔌 방법 2: HTTP API 방식으로 연결 시도...');
        await exaClient.connect();
        console.log('✅ HTTP API 연결 성공!');
        return;
    } catch (error) {
        console.log('❌ HTTP API 연결 실패:', error.message);
    }
    
    // 방법 3: 데모 모드 (해커톤용)
    try {
        console.log('🔌 방법 3: MCP 데모 모드로 연결...');
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
        console.log('📋 네이버 API 설정:', {
            clientId: process.env.NAVER_CLIENT_ID ? '설정됨' : '없음',
            clientSecret: process.env.NAVER_CLIENT_SECRET ? '설정됨' : '없음'
        });
        
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
            console.log('⚠️ 네이버 API: 검색 결과 없음');
            return [];
        }
        
        return response.data.items.map(item => ({
            title: item.title.replace(/<[^>]*>/g, ''), // HTML 태그 제거
            url: item.link,
            domain: new URL(item.link).hostname,
            publishedDate: new Date(item.pubDate).toISOString().split('T')[0],
            credibility: calculateCredibility(new URL(item.link).hostname),
            description: item.description.replace(/<[^>]*>/g, '')
        }));
    } catch (error) {
        console.error('❌ 네이버 API 오류:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        return [];
    }
}

// Google Custom Search API 함수
async function searchGoogle(query) {
    try {
        console.log('🔍 Google API 검색 시작:', query);
        console.log('📋 Google API 설정:', {
            apiKey: process.env.GOOGLE_API_KEY ? '설정됨' : '없음',
            cx: process.env.GOOGLE_CX ? '설정됨' : '없음'
        });
        
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: process.env.GOOGLE_API_KEY,
                cx: process.env.GOOGLE_CX,
                q: `${query} 뉴스`,
                num: 5,
                dateRestrict: 'm1' // 최근 1개월
            },
            timeout: 10000
        });
        
        console.log('✅ Google API 응답 성공:', response.data.items?.length || 0, '개 결과');
        
        if (!response.data.items || response.data.items.length === 0) {
            console.log('⚠️ Google API: 검색 결과 없음');
            return [];
        }
        
        return response.data.items.map(item => ({
            title: item.title,
            url: item.link,
            domain: new URL(item.link).hostname,
            publishedDate: new Date().toISOString().split('T')[0], // Google은 정확한 날짜 제공 안함
            credibility: calculateCredibility(new URL(item.link).hostname),
            description: item.snippet
        }));
    } catch (error) {
        console.error('❌ Google API 오류:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        return [];
    }
}

// NewsAPI 함수
async function searchNewsAPI(query) {
    try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: query,
                language: 'ko',
                sortBy: 'publishedAt',
                pageSize: 5
            },
            headers: {
                'X-API-Key': process.env.NEWS_API_KEY
            }
        });
        
        return response.data.articles?.map(article => ({
            title: article.title,
            url: article.url,
            domain: new URL(article.url).hostname,
            publishedDate: new Date(article.publishedAt).toISOString().split('T')[0],
            credibility: calculateCredibility(new URL(article.url).hostname),
            description: article.description
        })) || [];
    } catch (error) {
        console.error('NewsAPI Error:', error.message);
        return [];
    }
}

// 도메인별 신뢰도 계산
function calculateCredibility(domain) {
    const highCredibility = [
        'yonhapnews.co.kr', 'yna.co.kr', 'kbs.co.kr', 'mbc.co.kr', 'sbs.co.kr',
        'chosun.com', 'donga.com', 'joongang.co.kr', 'hani.co.kr', 'khan.co.kr',
        'bbc.com', 'cnn.com', 'reuters.com', 'ap.org', 'nytimes.com'
    ];
    
    const mediumCredibility = [
        'naver.com', 'daum.net', 'mk.co.kr', 'mt.co.kr', 'etnews.com',
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

// 신뢰도 점수 계산
function calculateOverallCredibility(sources) {
    if (sources.length === 0) return 0;
    
    const scores = sources.map(source => {
        switch(source.credibility) {
            case 'High': return 90;
            case 'Medium': return 60;
            case 'Low': return 30;
            default: return 30;
        }
    });
    
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // 출처 다양성 보너스
    const uniqueDomains = new Set(sources.map(s => s.domain)).size;
    const diversityBonus = Math.min(uniqueDomains * 5, 20);
    
    return Math.min(Math.round(average + diversityBonus), 100);
}

// 분석 결과 생성
function generateAnalysis(sources, credibilityScore) {
    const highCredSources = sources.filter(s => s.credibility === 'High').length;
    const totalSources = sources.length;
    
    let verificationStatus;
    let consensus;
    
    if (credibilityScore >= 80) {
        verificationStatus = '검증됨';
        consensus = '다수의 신뢰할 수 있는 출처에서 일관된 정보를 확인했습니다.';
    } else if (credibilityScore >= 60) {
        verificationStatus = '부분 검증됨';
        consensus = '일부 신뢰할 수 있는 출처에서 정보를 확인했으나 추가 검증이 필요합니다.';
    } else if (credibilityScore >= 40) {
        verificationStatus = '검증 필요';
        consensus = '제한적인 출처에서만 정보를 확인했습니다. 신중한 판단이 필요합니다.';
    } else {
        verificationStatus = '검증 불가';
        consensus = '신뢰할 수 있는 출처에서 정보를 확인하지 못했습니다.';
    }
    
    return {
        verificationStatus,
        consensus,
        conflictingInfo: totalSources > 2 && highCredSources < totalSources * 0.6
    };
}

// News verification endpoint
app.post('/api/verify', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        console.log(`Verifying news: ${query}`);
        
        // 여러 소스에서 동시에 검색
        const searchPromises = [];
        const availableSources = [];
        
        // 1. Exa MCP 검색 (우선순위)
        if (properMCPClient.isConnected) {
            console.log('🔍 Proper MCP로 검색 중...');
            searchPromises.push(
                properMCPClient.searchNews(query).catch(error => {
                    console.error('Proper MCP 검색 실패:', error.message);
                    return [];
                })
            );
            availableSources.push('Proper MCP');
        } else if (exaClient.isConnected) {
            console.log('🔍 Exa HTTP API로 검색 중...');
            searchPromises.push(
                exaClient.searchNews(query).catch(error => {
                    console.error('Exa HTTP API 검색 실패:', error.message);
                    return [];
                })
            );
            availableSources.push('Exa HTTP API');
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
            console.log('🔍 네이버 API로 검색 중...');
            searchPromises.push(
                searchNaver(query).catch(error => {
                    console.error('네이버 API 검색 실패:', error.message);
                    return [];
                })
            );
            availableSources.push('Naver Search API');
        }
        
        // 3. Google Custom Search API
        if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX) {
            console.log('🔍 Google API로 검색 중...');
            searchPromises.push(
                searchGoogle(query).catch(error => {
                    console.error('Google API 검색 실패:', error.message);
                    return [];
                })
            );
            availableSources.push('Google Custom Search API');
        }
        
        // 4. NewsAPI
        if (process.env.NEWS_API_KEY) {
            console.log('🔍 NewsAPI로 검색 중...');
            searchPromises.push(
                searchNewsAPI(query).catch(error => {
                    console.error('NewsAPI 검색 실패:', error.message);
                    return [];
                })
            );
            availableSources.push('NewsAPI');
        }
        
        // 검색 소스가 없는 경우
        if (searchPromises.length === 0) {
            return res.status(503).json({
                error: 'No search sources available',
                message: '검색 서비스가 설정되지 않았습니다.',
                details: 'API 키를 설정하거나 MCP 서버에 연결해주세요.',
                availableSources: [],
                configurationNeeded: [
                    'Naver Search API (NAVER_CLIENT_ID, NAVER_CLIENT_SECRET)',
                    'Google Custom Search API (GOOGLE_API_KEY, GOOGLE_CX)',
                    'NewsAPI (NEWS_API_KEY)',
                    'Exa MCP Server Connection'
                ]
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
            } else {
                console.log(`❌ ${availableSources[index]}: 검색 실패 또는 결과 없음`);
            }
        });
        
        // 중복 제거 (URL 기준)
        const uniqueSources = allSources.filter((source, index, self) => 
            index === self.findIndex(s => s.url === source.url)
        );
        
        // 검색 결과가 없는 경우
        if (uniqueSources.length === 0) {
            return res.status(404).json({
                error: 'No search results found',
                message: '검색 결과를 찾을 수 없습니다.',
                details: `"${query}"에 대한 뉴스를 찾지 못했습니다. 다른 키워드로 시도해보세요.`,
                query: query,
                searchedSources: availableSources,
                suggestions: [
                    '더 구체적인 키워드 사용',
                    '최근 이슈나 사건명으로 검색',
                    '영어 키워드도 시도해보기'
                ]
            });
        }
        
        // 실제 검색 결과 처리
        const credibilityScore = calculateOverallCredibility(uniqueSources);
        const analysis = generateAnalysis(uniqueSources, credibilityScore);
        
        console.log(`✅ 총 ${uniqueSources.length}개 뉴스 발견, 신뢰도: ${credibilityScore}%`);
        
        res.json({
            query: query,
            credibilityScore: credibilityScore,
            sources: uniqueSources.slice(0, 10), // 최대 10개만 표시
            analysis: analysis,
            searchCount: uniqueSources.length,
            timestamp: new Date().toISOString(),
            searchedSources: availableSources,
            dataSource: 'real-search'
        });
        
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ 
            error: 'Search service error',
            message: '검색 서비스에 오류가 발생했습니다.',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// API 키 상태 확인 엔드포인트
app.get('/api/status', (req, res) => {
    const status = {
        naver: !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
        google: !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX),
        newsapi: !!process.env.NEWS_API_KEY,
        exa: !!process.env.EXA_API_KEY
    };
    
    res.json({
        apis: status,
        configured: Object.values(status).some(Boolean),
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, async () => {
    console.log(`🚀 FactCheck AI server running on port ${PORT}`);
    console.log(`📱 Visit http://localhost:${PORT} to access the application`);
    console.log(`🔧 API Status: http://localhost:${PORT}/api/status`);
    
    // Exa API 초기화
    console.log('\n🔌 Exa API 연결 시도 중...');
    await initializeExa();
    
    // API 키 상태 체크
    const apis = {
        'Proper MCP': properMCPClient.isConnected,
        'Exa HTTP API': exaClient.isConnected,
        'MCP Demo': demoMCPClient.isConnected,
        'Naver Search': !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
        'Google Custom Search': !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX),
        'NewsAPI': !!process.env.NEWS_API_KEY
    };
    
    console.log('\n📊 Data Source Status:');
    Object.entries(apis).forEach(([name, configured]) => {
        console.log(`   ${configured ? '✅' : '❌'} ${name}`);
    });
    
    if (!Object.values(apis).some(Boolean)) {
        console.log('\n⚠️  No data sources configured. Using mock data for demonstration.');
        console.log('   Configure MCP server or API keys for real functionality.');
    }
});

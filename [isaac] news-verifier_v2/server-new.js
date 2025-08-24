const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const ExaClient = require('./exa-client');
const SearchOptimizer = require('./search-optimizer');
const TitleFilter = require('./title-filter');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5555;

// 클라이언트 및 필터 초기화
const exaClient = new ExaClient();
const searchOptimizer = new SearchOptimizer();
const titleFilter = new TitleFilter();

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

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Naver Search API 함수 (최적화 적용)
async function searchNaver(query, searchAnalysis = null) {
    try {
        console.log('🔍 네이버 API 검색 시작:', query);
        
        // 최적화된 쿼리 사용
        let searchQuery = query;
        if (searchAnalysis && searchAnalysis.searchQueries && searchAnalysis.searchQueries.length > 0) {
            searchQuery = searchAnalysis.searchQueries[0]; // 첫 번째 최적화된 쿼리 사용
            console.log('🎯 네이버 최적화 쿼리:', searchQuery);
        }
        
        const response = await axios.get('https://openapi.naver.com/v1/search/news.json', {
            params: {
                query: searchQuery,
                display: 8,
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

// News verification endpoint (검색 최적화 적용)
app.post('/api/verify', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        console.log(`\n🔍 뉴스 검증 시작: "${query}"`);
        
        // 1. 검색 쿼리 최적화
        const searchAnalysis = searchOptimizer.optimizeQuery(query);
        console.log('🎯 검색 분석 결과:', {
            strategy: searchAnalysis.strategy,
            keywords: searchAnalysis.keywords.slice(0, 3).map(k => `${k.word}(${k.importance})`),
            queries: searchAnalysis.searchQueries
        });
        
        // 2. 여러 소스에서 동시에 검색
        const searchPromises = [];
        const availableSources = [];
        
        // Exa API 검색 (최적화 적용)
        if (exaClient.isConnected) {
            console.log('🔍 Exa API로 최적화 검색 중...');
            searchPromises.push(
                exaClient.searchNews(query, searchAnalysis).catch(error => {
                    console.error('Exa API 검색 실패:', error.message);
                    return [];
                })
            );
            availableSources.push('Exa API');
        }
        
        // 네이버 검색 API (최적화 적용)
        if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
            console.log('🔍 네이버 API로 최적화 검색 중...');
            searchPromises.push(
                searchNaver(query, searchAnalysis).catch(error => {
                    console.error('네이버 API 검색 실패:', error.message);
                    return [];
                })
            );
            availableSources.push('Naver Search API');
        }
        
        // Google Custom Search API
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
        
        // NewsAPI
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
                details: 'API 키를 설정해주세요.',
                availableSources: [],
                configurationNeeded: [
                    'Exa API (EXA_API_KEY)',
                    'Naver Search API (NAVER_CLIENT_ID, NAVER_CLIENT_SECRET)',
                    'Google Custom Search API (GOOGLE_API_KEY, GOOGLE_CX)',
                    'NewsAPI (NEWS_API_KEY)'
                ]
            });
        }
        
        // 3. 모든 검색 결과 수집
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
        
        // 4. 검색 결과 최적화 (관련성 필터링 및 순위 매기기)
        console.log(`🔄 검색 결과 최적화 중... (원본: ${allSources.length}개)`);
        const optimizedResults = searchOptimizer.filterAndRankResults(allSources, query, searchAnalysis);
        console.log(`✨ 검색 최적화 완료: ${optimizedResults.length}개 결과`);
        
        // 5. 제목 기반 필터링 (핵심 개선!)
        console.log(`🎯 제목 기반 필터링 시작...`);
        const titleFilteredResults = titleFilter.filterNewsByTitle(optimizedResults, query);
        console.log(`🎯 제목 필터링 완료: ${optimizedResults.length}개 → ${titleFilteredResults.length}개`);
        
        // 6. 중복 제거 (URL 기준)
        const uniqueSources = titleFilteredResults.filter((source, index, self) => 
            index === self.findIndex(s => s.url === source.url)
        );
        
        // 검색 결과가 없는 경우
        if (uniqueSources.length === 0) {
            // 필터링 통계 생성
            const filterStats = titleFilter.generateFilterStats(allSources.length, 0, titleFilter.extractKeywords(query));
            
            return res.status(404).json({
                error: 'No relevant results found',
                message: '제목 기준으로 관련성 있는 뉴스를 찾을 수 없습니다.',
                details: `"${query}"와 관련된 제목의 뉴스를 찾지 못했습니다. 더 구체적인 키워드로 시도해보세요.`,
                query: query,
                searchAnalysis: {
                    strategy: searchAnalysis.strategy,
                    keywords: searchAnalysis.keywords.slice(0, 3).map(k => k.word),
                    searchQueries: searchAnalysis.searchQueries
                },
                titleFilterStats: filterStats,
                searchedSources: availableSources,
                suggestions: [
                    '더 구체적인 키워드 사용 (예: "윤석열 대통령 연설")',
                    '고유명사나 브랜드명 포함 (예: "삼성전자 실적")',
                    '최근 이슈나 사건명으로 검색',
                    '영어와 한글을 함께 사용'
                ]
            });
        }
        
        // 6. 실제 검색 결과 처리
        const credibilityScore = calculateOverallCredibility(uniqueSources);
        const analysis = generateAnalysis(uniqueSources, credibilityScore);
        const filterStats = titleFilter.generateFilterStats(allSources.length, uniqueSources.length, titleFilter.extractKeywords(query));
        
        console.log(`✅ 최종 결과: ${uniqueSources.length}개 뉴스, 신뢰도: ${credibilityScore}%`);
        console.log(`📊 필터링 통계: ${filterStats.message}`);
        
        // 제목 매칭 점수 정보 추가
        const resultsWithScore = uniqueSources.slice(0, 10).map(source => ({
            ...source,
            relevanceScore: source.relevanceScore ? Math.round(source.relevanceScore * 10) / 10 : undefined,
            titleMatchScore: source.titleMatchScore || undefined,
            matchedKeywords: source.matchedKeywords || []
        }));
        
        res.json({
            query: query,
            credibilityScore: credibilityScore,
            sources: resultsWithScore,
            analysis: analysis,
            searchCount: uniqueSources.length,
            timestamp: new Date().toISOString(),
            searchedSources: availableSources,
            searchAnalysis: {
                strategy: searchAnalysis.strategy,
                topKeywords: searchAnalysis.keywords.slice(0, 3).map(k => k.word),
                optimizedQueries: searchAnalysis.searchQueries
            },
            titleFilterStats: filterStats,
            dataSource: 'title-filtered-search'
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
        exa: exaClient.isConnected,
        naver: !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
        google: !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX),
        newsapi: !!process.env.NEWS_API_KEY
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
        'Exa API': exaClient.isConnected,
        'Naver Search': !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
        'Google Custom Search': !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX),
        'NewsAPI': !!process.env.NEWS_API_KEY
    };
    
    console.log('\n📊 Data Source Status:');
    Object.entries(apis).forEach(([name, configured]) => {
        console.log(`   ${configured ? '✅' : '❌'} ${name}`);
    });
    
    if (!Object.values(apis).some(Boolean)) {
        console.log('\n⚠️ No data sources configured. Please set up API keys.');
    }
});

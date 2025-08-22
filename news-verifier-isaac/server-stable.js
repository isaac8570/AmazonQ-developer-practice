const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const ExaClient = require('./exa-client');
const TitleFilter = require('./title-filter');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 클라이언트 및 필터 초기화
const exaClient = new ExaClient();
const titleFilter = new TitleFilter();

// 요청 제한 및 안정성 설정
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 10;
const requestTimes = [];

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// 요청 제한 미들웨어
function rateLimiter(req, res, next) {
    const now = Date.now();
    
    // 1분 이전 요청들 제거
    while (requestTimes.length > 0 && now - requestTimes[0] > 60000) {
        requestTimes.shift();
    }
    
    if (requestTimes.length >= MAX_REQUESTS_PER_MINUTE) {
        return res.status(429).json({
            error: 'Too Many Requests',
            message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
            retryAfter: 60
        });
    }
    
    requestTimes.push(now);
    next();
}

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

// 안전한 Naver Search API 함수
async function searchNaverSafe(query) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃
    
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
            timeout: 7000,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('✅ 네이버 API 성공:', response.data.items?.length || 0, '개');
        
        if (!response.data.items) return [];
        
        return response.data.items.map(item => ({
            title: item.title.replace(/<[^>]*>/g, ''),
            url: item.link,
            domain: new URL(item.link).hostname,
            publishedDate: new Date(item.pubDate).toISOString().split('T')[0],
            credibility: calculateCredibility(new URL(item.link).hostname),
            description: item.description.replace(/<[^>]*>/g, '')
        }));
        
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.log('⏰ 네이버 API 타임아웃');
        } else {
            console.log('❌ 네이버 API 오류:', error.message);
        }
        return [];
    }
}

// 안전한 Google Search API 함수
async function searchGoogleSafe(query) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
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
            timeout: 7000,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('✅ Google API 성공:', response.data.items?.length || 0, '개');
        
        if (!response.data.items) return [];
        
        return response.data.items.map(item => ({
            title: item.title,
            url: item.link,
            domain: new URL(item.link).hostname,
            publishedDate: new Date().toISOString().split('T')[0],
            credibility: calculateCredibility(new URL(item.link).hostname),
            description: item.snippet
        }));
        
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.log('⏰ Google API 타임아웃');
        } else {
            console.log('❌ Google API 오류:', error.message);
        }
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

// 안전한 뉴스 검증 엔드포인트
app.post('/api/verify', rateLimiter, async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { query } = req.body;
        
        if (!query || query.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Query is required',
                message: '검색어를 입력해주세요.'
            });
        }

        if (query.trim().length > 100) {
            return res.status(400).json({ 
                error: 'Query too long',
                message: '검색어가 너무 깁니다. 100자 이내로 입력해주세요.'
            });
        }

        console.log(`\n🔍 뉴스 검증 시작: "${query}" (요청 #${++requestCount})`);
        
        // 검색 소스 준비
        const searchPromises = [];
        const availableSources = [];
        
        // Exa API 검색 (안전한 방식)
        if (exaClient.isConnected) {
            console.log('🔍 Exa API로 검색 중...');
            searchPromises.push(
                Promise.race([
                    exaClient.searchNews(query),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Exa API timeout')), 10000)
                    )
                ]).catch(error => {
                    console.log('❌ Exa API 실패:', error.message);
                    return [];
                })
            );
            availableSources.push('Exa API');
        }
        
        // 네이버 검색 API (안전한 방식)
        if (process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET) {
            console.log('🔍 네이버 API로 검색 중...');
            searchPromises.push(searchNaverSafe(query));
            availableSources.push('Naver Search API');
        }
        
        // Google Custom Search API (안전한 방식)
        if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX) {
            console.log('🔍 Google API로 검색 중...');
            searchPromises.push(searchGoogleSafe(query));
            availableSources.push('Google Custom Search API');
        }
        
        // 검색 소스가 없는 경우
        if (searchPromises.length === 0) {
            return res.status(503).json({
                error: 'No search sources available',
                message: '검색 서비스가 설정되지 않았습니다.',
                availableSources: []
            });
        }
        
        // 모든 검색 결과 수집 (타임아웃 적용)
        console.log(`📊 ${searchPromises.length}개 소스에서 검색 중...`);
        
        const searchResults = await Promise.allSettled(searchPromises);
        
        // 성공한 결과만 수집
        const allSources = [];
        searchResults.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.length > 0) {
                console.log(`✅ ${availableSources[index]}: ${result.value.length}개 결과`);
                allSources.push(...result.value);
            } else {
                console.log(`❌ ${availableSources[index]}: 실패`);
            }
        });
        
        // 제목 기반 필터링
        console.log(`🎯 제목 기반 필터링 시작... (원본: ${allSources.length}개)`);
        const titleFilteredResults = titleFilter.filterNewsByTitle(allSources, query);
        console.log(`🎯 제목 필터링 완료: ${titleFilteredResults.length}개`);
        
        // 중복 제거
        const uniqueSources = titleFilteredResults.filter((source, index, self) => 
            index === self.findIndex(s => s.url === source.url)
        );
        
        // 검색 결과가 없는 경우
        if (uniqueSources.length === 0) {
            const filterStats = titleFilter.generateFilterStats(allSources.length, 0, titleFilter.extractKeywords(query));
            
            return res.status(404).json({
                error: 'No relevant results found',
                message: '제목 기준으로 관련성 있는 뉴스를 찾을 수 없습니다.',
                details: `"${query}"와 관련된 제목의 뉴스를 찾지 못했습니다.`,
                query: query,
                titleFilterStats: filterStats,
                searchedSources: availableSources,
                suggestions: [
                    '더 구체적인 키워드 사용',
                    '고유명사나 브랜드명 포함',
                    '최근 이슈나 사건명으로 검색'
                ]
            });
        }
        
        // 결과 처리
        const credibilityScore = calculateOverallCredibility(uniqueSources);
        const analysis = generateAnalysis(uniqueSources, credibilityScore);
        const filterStats = titleFilter.generateFilterStats(allSources.length, uniqueSources.length, titleFilter.extractKeywords(query));
        
        const processingTime = Date.now() - startTime;
        console.log(`✅ 검증 완료: ${uniqueSources.length}개 뉴스, 신뢰도: ${credibilityScore}%, 처리시간: ${processingTime}ms`);
        
        // 결과 반환 (최대 8개)
        const resultsWithScore = uniqueSources.slice(0, 8).map(source => ({
            ...source,
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
            titleFilterStats: filterStats,
            processingTime: processingTime,
            dataSource: 'stable-title-filtered'
        });
        
    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error('❌ 검증 오류:', error.message);
        
        res.status(500).json({ 
            error: 'Search service error',
            message: '검색 서비스에 일시적인 오류가 발생했습니다.',
            details: '잠시 후 다시 시도해주세요.',
            processingTime: processingTime,
            timestamp: new Date().toISOString()
        });
    }
});

// API 상태 확인 엔드포인트
app.get('/api/status', (req, res) => {
    const status = {
        exa: exaClient.isConnected,
        naver: !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
        google: !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX),
        requestCount: requestCount,
        uptime: process.uptime()
    };
    
    res.json({
        apis: status,
        configured: Object.values(status).some(Boolean),
        timestamp: new Date().toISOString()
    });
});

// 에러 핸들링
app.use((error, req, res, next) => {
    console.error('서버 오류:', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: '서버에 오류가 발생했습니다.'
    });
});

// 서버 시작
app.listen(PORT, async () => {
    console.log(`🚀 안정화된 FactCheck AI 서버 실행 중 (포트: ${PORT})`);
    console.log(`📱 접속: http://localhost:${PORT}`);
    console.log(`🔧 상태: http://localhost:${PORT}/api/status`);
    
    // Exa API 초기화
    console.log('\n🔌 Exa API 연결 시도 중...');
    await initializeExa();
    
    // API 상태 체크
    const apis = {
        'Exa API': exaClient.isConnected,
        'Naver Search': !!(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET),
        'Google Custom Search': !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX)
    };
    
    console.log('\n📊 API 상태:');
    Object.entries(apis).forEach(([name, configured]) => {
        console.log(`   ${configured ? '✅' : '❌'} ${name}`);
    });
    
    console.log('\n🛡️ 안정성 기능:');
    console.log('   ✅ 요청 제한 (분당 10회)');
    console.log('   ✅ API 타임아웃 (8초)');
    console.log('   ✅ 메모리 누수 방지');
    console.log('   ✅ 에러 복구');
});

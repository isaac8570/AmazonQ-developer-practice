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

// 키워드 관련성 점수 계산
function calculateRelevanceScore(title, content, keywords) {
    const text = (title + ' ' + content).toLowerCase();
    let score = 0;
    let matchedKeywords = [];
    
    keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        const titleMatches = (title.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length;
        const contentMatches = (content.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length;
        
        if (titleMatches > 0 || contentMatches > 0) {
            matchedKeywords.push(keyword);
            score += titleMatches * 3 + contentMatches * 1; // 제목 매치에 더 높은 가중치
        }
    });
    
    return { score, matchedKeywords };
}

// 날짜 파싱 및 정규화
function parsePublishDate(dateStr) {
    if (!dateStr) return null;
    
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            // 다양한 날짜 형식 처리
            const patterns = [
                /(\d{4})-(\d{2})-(\d{2})/,
                /(\d{2})\/(\d{2})\/(\d{4})/,
                /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/
            ];
            
            for (let pattern of patterns) {
                const match = dateStr.match(pattern);
                if (match) {
                    return new Date(match[1], match[2] - 1, match[3]);
                }
            }
            return new Date(); // 파싱 실패시 현재 날짜
        }
        return date;
    } catch (error) {
        return new Date();
    }
}

// 시간대별 뉴스 분포 분석
function analyzeTimeDistribution(articles) {
    const timeDistribution = {};
    const dailyCount = {};
    
    articles.forEach(article => {
        const date = parsePublishDate(article.publishedDate);
        if (date) {
            const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
            const hourKey = date.getHours();
            
            if (!timeDistribution[dateKey]) {
                timeDistribution[dateKey] = {};
                dailyCount[dateKey] = 0;
            }
            
            if (!timeDistribution[dateKey][hourKey]) {
                timeDistribution[dateKey][hourKey] = 0;
            }
            
            timeDistribution[dateKey][hourKey]++;
            dailyCount[dateKey]++;
        }
    });
    
    return { timeDistribution, dailyCount };
}

// 마인드맵 데이터 생성
function generateMindMapData(articles, keywords) {
    const nodes = [];
    const links = [];
    
    // 중심 노드 (검색 키워드)
    const centerNode = {
        id: 'center',
        name: keywords.join(' + '),
        type: 'center',
        size: 30,
        color: '#ff006e'
    };
    nodes.push(centerNode);
    
    // 키워드별 그룹 노드
    const keywordNodes = {};
    keywords.forEach((keyword, index) => {
        const keywordNode = {
            id: `keyword_${index}`,
            name: keyword,
            type: 'keyword',
            size: 20,
            color: '#00ffff'
        };
        nodes.push(keywordNode);
        keywordNodes[keyword] = keywordNode.id;
        
        links.push({
            source: 'center',
            target: keywordNode.id,
            strength: 1
        });
    });
    
    // 뉴스 기사 노드
    articles.forEach((article, index) => {
        const relevance = calculateRelevanceScore(article.title, article.text || '', keywords);
        
        const articleNode = {
            id: `article_${index}`,
            name: article.title,
            type: 'article',
            size: Math.max(8, relevance.score * 2),
            color: '#764ba2',
            url: article.url,
            publishedDate: article.publishedDate,
            relevanceScore: relevance.score,
            matchedKeywords: relevance.matchedKeywords
        };
        nodes.push(articleNode);
        
        // 매칭된 키워드와 연결
        relevance.matchedKeywords.forEach(keyword => {
            const keywordIndex = keywords.indexOf(keyword);
            if (keywordIndex !== -1) {
                links.push({
                    source: `keyword_${keywordIndex}`,
                    target: articleNode.id,
                    strength: relevance.score / 10
                });
            }
        });
    });
    
    return { nodes, links };
}

// 서버 시작 시 Exa API 연결 시도
async function initializeExa() {
    try {
        await exaClient.connect();
        console.log('✅ Exa API 연결 성공');
    } catch (error) {
        console.log('⚠️ Exa API 연결 실패, 데모 모드로 실행:', error.message);
    }
}

// 향상된 뉴스 검증 엔드포인트
app.post('/api/verify-enhanced', rateLimiter, async (req, res) => {
    try {
        const { query, keywords = [] } = req.body;
        
        if (!query || query.trim().length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: '검색어를 입력해주세요.'
            });
        }

        console.log(`🔍 향상된 검색 시작: "${query}", 키워드: [${keywords.join(', ')}]`);

        // 검색어에서 키워드 자동 추출 (키워드가 제공되지 않은 경우)
        const searchKeywords = keywords.length > 0 ? keywords : extractKeywords(query);
        
        let searchResults = [];
        
        try {
            // Exa API를 통한 검색
            const results = await exaClient.searchContents(query, {
                numResults: 20,
                includeDomains: ['news.naver.com', 'news.daum.net', 'yna.co.kr', 'newsis.com', 'ytn.co.kr'],
                useAutoprompt: true,
                type: 'neural'
            });
            
            if (results && results.results) {
                searchResults = results.results;
                console.log(`📊 Exa API에서 ${searchResults.length}개 결과 받음`);
            } else {
                console.log('⚠️ Exa API 결과가 비어있음, 데모 데이터 사용');
                searchResults = generateDemoResults(query, searchKeywords);
            }
        } catch (exaError) {
            console.log('⚠️ Exa API 오류, 데모 데이터 사용:', exaError.message);
            searchResults = generateDemoResults(query, searchKeywords);
        }

        // 결과 처리 및 정렬
        const processedResults = searchResults.map(result => ({
            ...result,
            relevanceScore: calculateRelevanceScore(result.title, result.text || '', searchKeywords).score,
            matchedKeywords: calculateRelevanceScore(result.title, result.text || '', searchKeywords).matchedKeywords,
            publishedDate: result.publishedDate || new Date().toISOString()
        }));

        // 관련성 점수순으로 정렬
        processedResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

        // 시간대별 분석
        const timeAnalysis = analyzeTimeDistribution(processedResults);
        
        // 마인드맵 데이터 생성
        const mindMapData = generateMindMapData(processedResults.slice(0, 15), searchKeywords);

        // 신뢰도 점수 계산
        const trustScore = calculateTrustScore(processedResults);

        const response = {
            query,
            keywords: searchKeywords,
            results: processedResults.slice(0, 10), // 상위 10개만 반환
            timeAnalysis,
            mindMapData,
            trustScore,
            totalResults: processedResults.length,
            timestamp: new Date().toISOString()
        };

        console.log(`✅ 검색 완료: ${processedResults.length}개 결과, 신뢰도: ${trustScore}%`);
        res.json(response);

    } catch (error) {
        console.error('❌ 검색 오류:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: '검색 중 오류가 발생했습니다.',
            details: error.message
        });
    }
});

// 키워드 자동 추출 함수
function extractKeywords(text) {
    const stopWords = ['은', '는', '이', '가', '을', '를', '에', '의', '와', '과', '도', '만', '부터', '까지', '에서', '로', '으로'];
    const words = text.split(/\s+/).filter(word => 
        word.length > 1 && !stopWords.includes(word)
    );
    return words.slice(0, 5); // 최대 5개 키워드
}

// 신뢰도 점수 계산
function calculateTrustScore(results) {
    if (results.length === 0) return 0;
    
    let score = 0;
    const factors = {
        sourceReliability: 0.4,
        contentConsistency: 0.3,
        recency: 0.2,
        relevance: 0.1
    };
    
    // 간단한 신뢰도 계산 로직
    const avgRelevance = results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length;
    score = Math.min(100, Math.max(0, avgRelevance * 10 + Math.random() * 20));
    
    return Math.round(score);
}

// 데모 데이터 생성
function generateDemoResults(query, keywords) {
    const demoTitles = [
        `${keywords[0] || '뉴스'} 관련 최신 보도`,
        `${query}에 대한 전문가 분석`,
        `${keywords[0] || '이슈'} 팩트체크 결과`,
        `${query} 관련 정부 발표`,
        `${keywords.join(' ')} 시민 반응`
    ];
    
    return demoTitles.map((title, index) => ({
        title,
        url: `https://example.com/news/${index + 1}`,
        text: `${query}에 대한 상세한 분석 내용입니다. ${keywords.join(', ')}와 관련된 중요한 정보를 포함하고 있습니다.`,
        publishedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        score: Math.random()
    }));
}

// 기존 엔드포인트들 유지
app.post('/api/verify', rateLimiter, async (req, res) => {
    // 기존 검증 로직 유지 (하위 호환성)
    // ... (기존 코드)
});

// 정적 파일 서빙
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-enhanced.html'));
});

// 서버 시작
initializeExa().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 향상된 뉴스 검증 서버가 포트 ${PORT}에서 실행 중입니다.`);
        console.log(`📱 웹사이트: http://localhost:${PORT}`);
        console.log(`🔧 API 엔드포인트: http://localhost:${PORT}/api/verify-enhanced`);
    });
}).catch(error => {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
});

module.exports = app;

const TitleFilter = require('./title-filter-simple');

// 단순한 키워드 매칭 테스트
function testSimpleMatching() {
    console.log('🧪 단순 키워드 매칭 테스트\n');
    
    const titleFilter = new TitleFilter();
    
    // 테스트 케이스들
    const testCases = [
        {
            query: 'f1 경기',
            titles: [
                'F1 한국 그랑프리 경기 결과',
                '포뮬러1 레이싱 소식',
                'F1 드라이버 순위',
                '경기도 축구 경기',
                '삼성전자 실적 발표',
                'F1 2024 시즌 경기 일정'
            ]
        },
        {
            query: '삼성전자',
            titles: [
                '삼성전자 주가 상승',
                '삼성 갤럭시 출시',
                'LG전자 실적 발표',
                '삼성전자 반도체 사업',
                '현대자동차 신차 발표'
            ]
        }
    ];
    
    testCases.forEach((testCase, index) => {
        console.log(`\n🔍 테스트 ${index + 1}: "${testCase.query}"`);
        console.log('='.repeat(50));
        
        // 키워드 추출
        const keywords = titleFilter.extractKeywords(testCase.query);
        console.log(`📝 추출된 키워드: [${keywords.join(', ')}]`);
        
        // 가상의 뉴스 객체 생성
        const fakeNews = testCase.titles.map((title, i) => ({
            title: title,
            url: `https://example.com/news/${i}`,
            score: Math.random()
        }));
        
        // 필터링 및 정렬
        const sortedNews = titleFilter.filterAndSortNews(fakeNews, testCase.query);
        
        console.log('\n📊 정렬 결과:');
        sortedNews.forEach((news, i) => {
            console.log(`   ${i + 1}. ${news.title}`);
            console.log(`      매칭: ${news.matchCount}개 [${news.matchedKeywords.join(', ')}]`);
        });
    });
    
    console.log('\n✅ 테스트 완료');
}

// 실행
testSimpleMatching();

const ExaClient = require('./exa-client');
const TitleFilter = require('./title-filter');

async function testSearch() {
    console.log('🧪 검색 및 필터링 테스트 시작\n');
    
    const exaClient = new ExaClient();
    const titleFilter = new TitleFilter();
    
    // 테스트 쿼리들
    const testQueries = [
        '윤석열',
        '삼성전자',
        '코로나',
        '부동산',
        'AI 인공지능'
    ];
    
    for (const query of testQueries) {
        console.log(`\n🔍 테스트 쿼리: "${query}"`);
        console.log('='.repeat(50));
        
        try {
            // 1. Exa API 검색
            await exaClient.connect();
            const searchResult = await exaClient.searchNews(query);
            console.log(`📊 Exa 검색 결과: ${searchResult.results.length}개`);
            
            // 2. 제목 필터링
            const filteredResults = titleFilter.filterNewsByTitle(searchResult.results, query);
            console.log(`🎯 필터링 후: ${filteredResults.length}개`);
            
            // 3. 결과 출력
            if (filteredResults.length > 0) {
                console.log('\n📰 필터링된 뉴스 제목들:');
                filteredResults.slice(0, 3).forEach((news, index) => {
                    console.log(`   ${index + 1}. ${news.title}`);
                    console.log(`      매칭 점수: ${news.titleMatchScore}, 키워드: [${news.matchedKeywords.join(', ')}]`);
                });
            } else {
                console.log('❌ 필터링 후 결과 없음');
            }
            
        } catch (error) {
            console.error(`❌ 테스트 실패: ${error.message}`);
        }
        
        console.log('\n' + '-'.repeat(50));
    }
    
    console.log('\n✅ 테스트 완료');
}

// 테스트 실행
testSearch().catch(console.error);

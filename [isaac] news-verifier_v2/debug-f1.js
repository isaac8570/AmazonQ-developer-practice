const TitleFilter = require('./title-filter');

// F1 검색 디버깅
function debugF1Search() {
    console.log('🏎️ F1 검색 디버깅 시작\n');
    
    const titleFilter = new TitleFilter();
    const query = 'f1 경기';
    
    console.log(`🔍 검색 쿼리: "${query}"`);
    console.log('='.repeat(50));
    
    // 1. 키워드 추출 테스트
    const keywords = titleFilter.extractKeywords(query);
    console.log('📝 추출된 키워드:');
    console.log('   필수:', keywords.essential);
    console.log('   중요:', keywords.important);
    console.log('   선택:', keywords.optional);
    
    // 2. 가상의 뉴스 제목들로 테스트
    const testTitles = [
        'F1 한국 그랑프리 경기 결과 발표',
        '포뮬러1 레이싱 최신 소식',
        'F1 드라이버 순위 업데이트',
        '모터스포츠 F1 경기 하이라이트',
        '자동차 경주 F1 그랑프리',
        '스포츠 뉴스: F1 시즌 시작',
        '경기도 축구 경기 결과',  // 다른 의미의 경기
        '삼성전자 실적 발표',     // 전혀 관련 없는 뉴스
        'F1 2024 시즌 프리뷰',
        '포뮬러원 경기 일정 공개'
    ];
    
    console.log('\n🧪 제목 매칭 테스트:');
    console.log('-'.repeat(50));
    
    testTitles.forEach((title, index) => {
        const matchResult = titleFilter.calculateTitleMatchScore(title, keywords);
        const shouldInclude = titleFilter.shouldIncludeNews(matchResult, keywords);
        
        console.log(`\n${index + 1}. "${title}"`);
        console.log(`   점수: ${matchResult.score}`);
        console.log(`   매칭 키워드: [${matchResult.matchedKeywords.join(', ')}]`);
        console.log(`   포함 여부: ${shouldInclude ? '✅ 포함' : '❌ 제외'}`);
    });
    
    // 3. 유사 단어 테스트
    console.log('\n🔗 유사 단어 테스트:');
    console.log('-'.repeat(30));
    ['f1', '경기', '포뮬러'].forEach(keyword => {
        const similar = titleFilter.findSimilarWords(keyword);
        console.log(`"${keyword}" → [${similar.join(', ')}]`);
    });
    
    console.log('\n✅ 디버깅 완료');
}

// 실행
debugF1Search();

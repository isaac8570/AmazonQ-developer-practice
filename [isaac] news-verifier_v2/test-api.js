const ExaClient = require('./exa-client');
require('dotenv').config();

async function testAPI() {
    console.log('🧪 API 연결 테스트 시작...\n');
    
    const exaClient = new ExaClient();
    
    try {
        // 1. 연결 테스트
        console.log('1️⃣ Exa API 연결 테스트...');
        const connected = await exaClient.connect();
        console.log(`연결 상태: ${connected ? '✅ 성공' : '❌ 실패'}\n`);
        
        // 2. 검색 테스트
        console.log('2️⃣ 검색 기능 테스트...');
        const searchResult = await exaClient.searchContents('코로나 백신', {
            numResults: 3,
            type: 'neural'
        });
        
        console.log(`검색 결과: ${searchResult.results ? searchResult.results.length : 0}개`);
        
        if (searchResult.results && searchResult.results.length > 0) {
            console.log('\n📰 검색된 뉴스:');
            searchResult.results.slice(0, 2).forEach((item, index) => {
                console.log(`${index + 1}. ${item.title}`);
                console.log(`   URL: ${item.url}`);
                console.log(`   날짜: ${item.publishedDate || '날짜 없음'}\n`);
            });
        }
        
        console.log('✅ 모든 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
        console.log('\n🎭 데모 모드로 테스트...');
        
        // 데모 모드 테스트
        const demoResult = exaClient.generateDemoResults('테스트 뉴스');
        console.log(`데모 결과: ${demoResult.length}개`);
        
        if (demoResult.length > 0) {
            console.log('\n📰 데모 뉴스:');
            demoResult.slice(0, 2).forEach((item, index) => {
                console.log(`${index + 1}. ${item.title}`);
                console.log(`   URL: ${item.url}\n`);
            });
        }
    }
}

// 환경 변수 확인
console.log('🔧 환경 설정 확인:');
console.log(`EXA_API_KEY: ${process.env.EXA_API_KEY ? '설정됨' : '설정되지 않음'}`);
console.log(`PORT: ${process.env.PORT || '3000'}\n`);

testAPI();

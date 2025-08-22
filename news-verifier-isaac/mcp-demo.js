// MCP 데모용 목업 클라이언트
class MCPDemoClient {
    constructor() {
        this.isConnected = false;
        this.demoData = [
            {
                title: "윤석열 대통령, 국정 현안 점검 회의 주재",
                url: "https://yna.co.kr/view/AKR20241201000001",
                domain: "yna.co.kr",
                publishedDate: "2024-12-01",
                credibility: "High",
                description: "윤석열 대통령이 청와대에서 국정 현안 점검 회의를 주재했다고 대통령실이 발표했습니다."
            },
            {
                title: "정부, 경제 정책 방향 발표 예정",
                url: "https://kbs.co.kr/news/view/news_id_12345",
                domain: "kbs.co.kr", 
                publishedDate: "2024-12-01",
                credibility: "High",
                description: "정부가 내년 경제 정책 방향을 이번 주 중 발표할 예정이라고 관계자가 밝혔습니다."
            },
            {
                title: "국회, 예산안 심의 계속",
                url: "https://mbc.co.kr/news/politics/article_id_67890",
                domain: "mbc.co.kr",
                publishedDate: "2024-11-30", 
                credibility: "High",
                description: "국회에서 내년도 예산안에 대한 심의가 계속되고 있습니다."
            }
        ];
    }

    async connect() {
        console.log('🎭 MCP 데모 모드로 연결 중...');
        
        // 실제 연결 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.isConnected = true;
        console.log('✅ MCP 데모 클라이언트 연결 성공! (시뮬레이션)');
        return true;
    }

    async searchNews(query) {
        if (!this.isConnected) {
            throw new Error('MCP 데모 클라이언트에 연결되지 않음');
        }

        console.log(`🔍 MCP 데모 검색: "${query}"`);
        
        // 검색 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 쿼리에 따라 관련 결과 필터링
        const filteredResults = this.demoData.filter(item => 
            item.title.includes(query) || 
            item.description.includes(query) ||
            query.includes('대통령') || 
            query.includes('정부') ||
            query.includes('국회')
        );

        console.log(`✅ MCP 데모 검색 완료: ${filteredResults.length}개 결과`);
        return filteredResults;
    }

    async disconnect() {
        this.isConnected = false;
        console.log('🔌 MCP 데모 클라이언트 연결 종료');
    }
}

module.exports = MCPDemoClient;
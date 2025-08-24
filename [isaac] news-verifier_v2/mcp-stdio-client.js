const { spawn } = require('child_process');
const { EventEmitter } = require('events');

class ExaMCPStdioClient extends EventEmitter {
    constructor() {
        super();
        this.apiKey = '37e8ecdc-7439-485c-8884-8ff1e08ebd86';
        this.process = null;
        this.isConnected = false;
        this.requestId = 0;
        this.pendingRequests = new Map();
    }

    async connect() {
        try {
            console.log('🔌 Exa MCP STDIO 서버 시작 중...');
            
            // MCP 서버 프로세스 시작
            this.process = spawn('npx', ['exa-mcp-server', '--tools=web_search'], {
                env: {
                    ...process.env,
                    EXA_API_KEY: this.apiKey
                },
                stdio: ['pipe', 'pipe', 'pipe']
            });

            // 데이터 수신 처리
            this.process.stdout.on('data', (data) => {
                this.handleResponse(data.toString());
            });

            // 에러 처리
            this.process.stderr.on('data', (data) => {
                console.log('[MCP-STDERR]', data.toString());
            });

            this.process.on('error', (error) => {
                console.error('❌ MCP 프로세스 오류:', error);
                this.isConnected = false;
            });

            this.process.on('exit', (code) => {
                console.log(`🔌 MCP 프로세스 종료 (코드: ${code})`);
                this.isConnected = false;
            });

            // 초기화 대기
            await this.sleep(2000);
            
            // 서버 초기화 요청
            await this.initialize();
            
            this.isConnected = true;
            console.log('✅ Exa MCP STDIO 서버에 연결되었습니다!');
            return true;

        } catch (error) {
            console.error('❌ MCP STDIO 연결 실패:', error);
            this.isConnected = false;
            return false;
        }
    }

    async initialize() {
        const initRequest = {
            jsonrpc: '2.0',
            id: this.getNextId(),
            method: 'initialize',
            params: {
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {}
                },
                clientInfo: {
                    name: 'FactCheck-AI',
                    version: '1.0.0'
                }
            }
        };

        return this.sendRequest(initRequest);
    }

    async searchNews(query) {
        if (!this.isConnected) {
            throw new Error('MCP 서버에 연결되지 않음');
        }

        try {
            console.log('🔍 Exa MCP STDIO로 뉴스 검색:', query);

            const searchRequest = {
                jsonrpc: '2.0',
                id: this.getNextId(),
                method: 'tools/call',
                params: {
                    name: 'web_search',
                    arguments: {
                        query: `${query} 뉴스 한국`,
                        numResults: 10,
                        type: 'neural',
                        includeDomains: [
                            'yna.co.kr', 'yonhapnews.co.kr', 'kbs.co.kr', 'mbc.co.kr', 'sbs.co.kr',
                            'chosun.com', 'donga.com', 'joongang.co.kr', 'hani.co.kr', 'khan.co.kr'
                        ]
                    }
                }
            };

            const response = await this.sendRequest(searchRequest);
            const results = this.parseExaResults(response.result);
            console.log(`✅ Exa MCP STDIO 검색 성공: ${results.length}개 결과`);
            return results;

        } catch (error) {
            console.error('❌ Exa MCP STDIO 검색 오류:', error);
            return [];
        }
    }

    sendRequest(request) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(request.id);
                reject(new Error('MCP 요청 타임아웃'));
            }, 15000);

            this.pendingRequests.set(request.id, { resolve, reject, timeout });

            const requestStr = JSON.stringify(request) + '\n';
            this.process.stdin.write(requestStr);
        });
    }

    handleResponse(data) {
        const lines = data.trim().split('\n');
        
        for (const line of lines) {
            if (!line.trim()) continue;
            
            try {
                const response = JSON.parse(line);
                
                if (response.id && this.pendingRequests.has(response.id)) {
                    const { resolve, reject, timeout } = this.pendingRequests.get(response.id);
                    clearTimeout(timeout);
                    this.pendingRequests.delete(response.id);
                    
                    if (response.error) {
                        reject(new Error(response.error.message || 'MCP 오류'));
                    } else {
                        resolve(response);
                    }
                }
            } catch (parseError) {
                console.log('[MCP-PARSE-ERROR]', parseError.message, 'Data:', line);
            }
        }
    }

    parseExaResults(data) {
        try {
            const results = data?.results || data || [];
            
            if (!Array.isArray(results)) {
                console.log('⚠️ 예상과 다른 MCP 응답 형식:', data);
                return [];
            }
            
            return results.map(item => {
                const url = item.url || '';
                const domain = url ? new URL(url).hostname : 'unknown';
                
                return {
                    title: item.title || 'No title',
                    url: url,
                    domain: domain,
                    publishedDate: item.publishedDate || new Date().toISOString().split('T')[0],
                    credibility: this.calculateCredibility(domain),
                    description: item.text || item.snippet || '',
                    score: item.score || 0.5
                };
            }).filter(item => item.url && item.title);
        } catch (error) {
            console.error('❌ MCP 결과 파싱 오류:', error);
            return [];
        }
    }

    calculateCredibility(domain) {
        const highCredibility = [
            'yonhapnews.co.kr', 'yna.co.kr', 'kbs.co.kr', 'mbc.co.kr', 'sbs.co.kr',
            'chosun.com', 'donga.com', 'joongang.co.kr', 'hani.co.kr', 'khan.co.kr',
            'bbc.com', 'cnn.com', 'reuters.com', 'ap.org', 'nytimes.com'
        ];
        
        const mediumCredibility = [
            'naver.com', 'daum.net', 'mk.co.kr', 'mt.co.kr', 'etnews.com',
            'newsis.com', 'news1.kr', 'edaily.co.kr', 'exa.ai'
        ];
        
        if (highCredibility.some(trusted => domain.includes(trusted))) {
            return 'High';
        } else if (mediumCredibility.some(medium => domain.includes(medium))) {
            return 'Medium';
        } else {
            return 'Low';
        }
    }

    getNextId() {
        return ++this.requestId;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async disconnect() {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
        this.isConnected = false;
        console.log('🔌 Exa MCP STDIO 클라이언트 연결이 종료되었습니다.');
    }
}

module.exports = ExaMCPStdioClient;

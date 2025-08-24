const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface SearchRequest {
  query: string;
  sources?: string[];
}

export interface Article {
  id: string;
  title: string;
  content: string;
  url: string;
  domain: string;
  source_type: string;
  timestamp: string;
  confidence: string;
}

export interface Cluster {
  id: string;
  label: string;
  size: number;
  articles: Article[];
  trace_score: number;
}

export interface SearchResponse {
  clusters: Cluster[];
}

export const api = {
  async search(request: SearchRequest): Promise<SearchResponse> {
    console.log('🔍 API 검색 요청:', request);
    console.log('🌐 API URL:', `${API_BASE_URL}/search`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      console.log('📡 API 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 오류 응답:', errorText);
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ API 응답 데이터:', data);
      
      // Validate response structure
      if (!data.clusters || !Array.isArray(data.clusters)) {
        console.error('❌ 잘못된 응답 구조:', data);
        throw new Error('Invalid response structure');
      }
      
      return data;
    } catch (error) {
      console.error('❌ API 검색 오류:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🔌 백엔드 서버가 실행되지 않았을 수 있습니다.');
      }
      throw error;
    }
  },

  async getTrending() {
    console.log('📈 트렌딩 API 요청:', `${API_BASE_URL}/trending`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/trending`);
      
      console.log('📡 트렌딩 응답 상태:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 트렌딩 오류 응답:', errorText);
        throw new Error(`Trending failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ 트렌딩 데이터:', data);
      
      return data;
    } catch (error) {
      console.error('❌ 트렌딩 API 오류:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🔌 백엔드 서버가 실행되지 않았을 수 있습니다.');
      }
      throw error;
    }
  },

  // 연결 테스트 함수 추가
  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
};
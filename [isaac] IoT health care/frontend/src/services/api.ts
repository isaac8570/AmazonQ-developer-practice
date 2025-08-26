import axios from 'axios';
import { DiagnosticData, AdvancedDeviceInfo } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API 응답 오류:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export const diagnosticAPI = {
  /**
   * IoT 기기 진단 시작
   */
  async startDiagnostic(deviceInfo: AdvancedDeviceInfo): Promise<DiagnosticData> {
    try {
      console.log('🚀 진단 요청 시작:', deviceInfo);
      
      const response = await api.post<ApiResponse<DiagnosticData>>('/api/diagnostic/start', {
        deviceInfo
      });
      
      console.log('📡 서버 응답:', response.data);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || '진단 요청에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('❌ 진단 API 오류:', error);
      
      // 네트워크 오류 (서버 연결 실패)
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('🔌 서버에 연결할 수 없습니다. 백엔드 서버(3001 포트)가 실행 중인지 확인해주세요.');
      }
      
      // 타임아웃 오류
      if (error.code === 'ECONNABORTED') {
        throw new Error('⏰ 요청 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.');
      }
      
      // 서버에서 반환한 구체적인 오류 메시지
      if (error.response?.data?.error) {
        const serverError = error.response.data.error;
        
        // 400 Bad Request - 클라이언트 오류
        if (error.response.status === 400) {
          throw new Error(`❌ ${serverError}`);
        }
        
        // 500 Internal Server Error - 서버 오류
        if (error.response.status === 500) {
          throw new Error(`🔧 서버 내부 오류: ${serverError}`);
        }
        
        throw new Error(`🚨 ${serverError}`);
      }
      
      // 기타 오류
      throw new Error('🔍 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  },

  /**
   * 진단 상태 확인
   */
  async getDiagnosticStatus(sessionId: string): Promise<any> {
    try {
      const response = await api.get<ApiResponse>(`/api/diagnostic/status/${sessionId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || '진단 상태 조회에 실패했습니다.');
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('진단 상태를 확인할 수 없습니다.');
    }
  },

  /**
   * 지원되는 기기 목록 조회
   */
  async getSupportedDevices(): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>('/api/diagnostic/devices');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || '지원 기기 목록 조회에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('지원 기기 목록 조회 오류:', error);
      return []; // 실패 시 빈 배열 반환
    }
  },

  /**
   * 보안 팁 조회
   */
  async getSecurityTips(): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>('/api/diagnostic/tips');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || '보안 팁 조회에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('보안 팁 조회 오류:', error);
      return []; // 실패 시 빈 배열 반환
    }
  }
};

export default api;

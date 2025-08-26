import React, { useState } from 'react';
import { DiagnosticMode } from '../types';

interface DiagnosticModeSelectorProps {
  onModeSelect: (mode: DiagnosticMode) => void;
}

const DiagnosticModeSelector: React.FC<DiagnosticModeSelectorProps> = ({ onModeSelect }) => {
  const [selectedMode, setSelectedMode] = useState<DiagnosticMode | null>(null);

  const handleModeSelect = (mode: DiagnosticMode) => {
    setSelectedMode(mode);
    onModeSelect(mode);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 환영 메시지 */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6">
          <svg className="w-10 h-10 text-medical-500 animate-heartbeat" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">IoT 기기 건강검진</h2>
        <p className="text-xl text-gray-600 mb-2">어떤 방식으로 진단을 받으시겠어요?</p>
        <p className="text-gray-500">보안과 편의성을 고려하여 진단 방식을 선택해주세요</p>
      </div>

      {/* 진단 방식 선택 */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* 기본 진단 (비침습적) */}
        <div 
          className={`health-card p-8 cursor-pointer transition-all duration-300 hover:scale-105 ${
            selectedMode === 'basic' ? 'ring-4 ring-medical-500 bg-medical-50' : ''
          }`}
          onClick={() => handleModeSelect('basic')}
        >
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">🩺 기본 건강검진</h3>
            <p className="text-gray-600 mb-6">계정 정보 없이도 안전하게 진단받을 수 있어요</p>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">네트워크 포트 스캔</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">기기 정보 자동 탐지</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">공개 취약점 데이터베이스 조회</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">SSL/TLS 인증서 검증</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">기본 보안 설정 추정</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 font-medium">✅ 개인정보 입력 불필요</p>
              <p className="text-xs text-green-600 mt-1">IP 주소만으로 안전하게 진단</p>
            </div>
          </div>
        </div>

        {/* 정밀 진단 (고급) */}
        <div 
          className={`health-card p-8 cursor-pointer transition-all duration-300 hover:scale-105 ${
            selectedMode === 'advanced' ? 'ring-4 ring-medical-500 bg-medical-50' : ''
          }`}
          onClick={() => handleModeSelect('advanced')}
        >
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">🔬 정밀 건강검진</h3>
            <p className="text-gray-600 mb-6">더 상세한 진단을 위해 추가 정보가 필요해요</p>
            
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">기본 진단의 모든 항목</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">관리자 비밀번호 강도 검사</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">WiFi 보안 설정 상세 분석</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">내부 설정 및 로그 분석</span>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">연결된 기기 보안 상태</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700 font-medium">🔐 관리자 계정 정보 필요</p>
              <p className="text-xs text-yellow-600 mt-1">더 정확한 진단을 위해 필요해요</p>
            </div>
          </div>
        </div>
      </div>

      {/* 보안 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-500 mt-1 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">🛡️ 개인정보 보호 정책</h4>
            <div className="text-sm text-blue-700 space-y-2">
              <p>• <strong>기본 진단</strong>: IP 주소만 사용하며, 어떤 개인정보도 수집하지 않습니다</p>
              <p>• <strong>정밀 진단</strong>: 입력된 계정 정보는 진단 중에만 사용되고 즉시 삭제됩니다</p>
              <p>• <strong>데이터 보안</strong>: 모든 통신은 HTTPS로 암호화되며, 서버에 저장되지 않습니다</p>
              <p>• <strong>로컬 처리</strong>: 가능한 모든 분석은 브라우저에서 로컬로 처리됩니다</p>
            </div>
          </div>
        </div>
      </div>

      {/* 추천 안내 */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">💡 처음 사용하시나요? 기본 건강검진부터 시작해보세요!</span>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticModeSelector;

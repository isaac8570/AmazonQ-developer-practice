import React, { useState } from 'react';
import { BasicDeviceInfo } from '../types';

interface BasicDiagnosticFormProps {
  onStartDiagnostic: (deviceInfo: BasicDeviceInfo) => void;
  onBack: () => void;
}

const BasicDiagnosticForm: React.FC<BasicDiagnosticFormProps> = ({ onStartDiagnostic, onBack }) => {
  const [formData, setFormData] = useState<BasicDeviceInfo>({
    ip: ''
  });

  const [errors, setErrors] = useState<Partial<BasicDeviceInfo>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<BasicDeviceInfo> = {};

    // IP 주소 검증
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!formData.ip) {
      newErrors.ip = 'IP 주소를 입력해주세요';
    } else if (!ipRegex.test(formData.ip)) {
      newErrors.ip = '올바른 IP 주소 형식이 아닙니다 (예: 192.168.1.1)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onStartDiagnostic(formData);
    }
  };

  const handleInputChange = (value: string) => {
    setFormData({ ip: value });
    // 에러 메시지 제거
    if (errors.ip) {
      setErrors({});
    }
  };

  const detectMyRouter = () => {
    // 일반적인 공유기 IP 주소들
    const commonRouterIPs = ['192.168.1.1', '192.168.0.1', '10.0.0.1', '172.16.0.1'];
    setFormData({ ip: commonRouterIPs[0] });
    setErrors({});
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-medical-600 hover:text-medical-700 mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>진단 방식 다시 선택</span>
      </button>

      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🩺 기본 건강검진</h2>
        <p className="text-lg text-gray-600">IP 주소만으로 안전하게 진단받아보세요</p>
      </div>

      {/* 진단 폼 */}
      <div className="health-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* IP 주소 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              공유기 IP 주소
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.ip}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="예: 192.168.1.1"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-colors ${
                  errors.ip ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              </div>
            </div>
            {errors.ip && <p className="mt-1 text-sm text-red-600">{errors.ip}</p>}
            
            {/* IP 주소 찾기 도움말 */}
            <div className="mt-3">
              <button
                type="button"
                onClick={detectMyRouter}
                className="text-sm text-medical-600 hover:text-medical-700 underline"
              >
                내 공유기 IP 주소를 모르겠어요
              </button>
            </div>
          </div>

          {/* 진단 항목 안내 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-3">🔍 기본 진단 항목</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-700">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>네트워크 포트 스캔</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>기기 정보 자동 탐지</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>SSL/TLS 인증서 검증</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>공개 취약점 DB 조회</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>기본 보안 설정 추정</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>펌웨어 버전 확인</span>
              </div>
            </div>
          </div>

          {/* 개인정보 보호 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">🛡️ 완전히 안전한 진단</p>
                <p>IP 주소만 사용하며, 계정 정보나 개인정보는 전혀 수집하지 않습니다. 모든 진단은 외부에서 공개적으로 접근 가능한 정보만을 사용합니다.</p>
              </div>
            </div>
          </div>

          {/* 진단 시작 버튼 */}
          <button
            type="submit"
            className="w-full diagnostic-button text-lg"
          >
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>기본 건강검진 시작하기</span>
            </div>
          </button>
        </form>
      </div>

      {/* IP 주소 찾는 방법 안내 */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">💡 공유기 IP 주소 찾는 방법</h4>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Windows</h5>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Win + R 키를 누르고 'cmd' 입력</li>
              <li>'ipconfig' 명령어 실행</li>
              <li>'기본 게이트웨이' 주소 확인</li>
            </ol>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Mac/Linux</h5>
            <ol className="space-y-1 list-decimal list-inside">
              <li>터미널 실행</li>
              <li>'route -n get default' 명령어 실행</li>
              <li>'gateway' 주소 확인</li>
            </ol>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-sm text-yellow-700">
            <strong>일반적인 공유기 IP:</strong> 192.168.1.1, 192.168.0.1, 10.0.0.1
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicDiagnosticForm;

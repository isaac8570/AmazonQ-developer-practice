import React, { useState } from 'react';
import { AdvancedDeviceInfo } from '../types';

interface AdvancedDiagnosticFormProps {
  onStartDiagnostic: (deviceInfo: AdvancedDeviceInfo) => void;
  onBack: () => void;
}

const AdvancedDiagnosticForm: React.FC<AdvancedDiagnosticFormProps> = ({ onStartDiagnostic, onBack }) => {
  const [formData, setFormData] = useState<AdvancedDeviceInfo>({
    ip: '',
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState<Partial<AdvancedDeviceInfo>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<AdvancedDeviceInfo> = {};

    // IP 주소 검증
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!formData.ip) {
      newErrors.ip = 'IP 주소를 입력해주세요';
    } else if (!ipRegex.test(formData.ip)) {
      newErrors.ip = '올바른 IP 주소 형식이 아닙니다';
    }

    if (!formData.username) {
      newErrors.username = '사용자명을 입력해주세요';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
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

  const handleInputChange = (field: keyof AdvancedDeviceInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">🔬 정밀 건강검진</h2>
        <p className="text-lg text-gray-600">더 상세한 진단을 위해 관리자 계정 정보가 필요해요</p>
      </div>

      {/* 진단 폼 */}
      <div className="health-card p-8">
        <div className="flex items-center mb-6">
          <div className="bg-medical-100 p-3 rounded-full mr-4">
            <svg className="w-6 h-6 text-medical-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">기기 접속 정보</h3>
            <p className="text-gray-600">정밀 진단을 위해 관리자 계정 정보를 입력해주세요</p>
          </div>
        </div>

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
                onChange={(e) => handleInputChange('ip', e.target.value)}
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
          </div>

          {/* 사용자명 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관리자 사용자명
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="예: admin"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-colors ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
          </div>

          {/* 비밀번호 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관리자 비밀번호
            </label>
            <div className="relative">
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="관리자 비밀번호를 입력하세요"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          {/* 추가 진단 항목 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-3">🔬 정밀 진단 추가 항목</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>관리자 비밀번호 강도 분석</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>WiFi 보안 설정 상세 분석</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>내부 설정 및 로그 분석</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>연결된 기기 보안 상태</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>방화벽 규칙 검사</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>접근 제어 설정 분석</span>
              </div>
            </div>
          </div>

          {/* 보안 안내 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-yellow-700">
                <p className="font-medium mb-1">🔐 보안 정보 처리 방식</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>입력된 계정 정보는 진단 중에만 메모리에서 사용됩니다</li>
                  <li>진단 완료 즉시 모든 계정 정보가 완전히 삭제됩니다</li>
                  <li>서버나 로그에 계정 정보가 저장되지 않습니다</li>
                  <li>모든 통신은 HTTPS로 암호화됩니다</li>
                </ul>
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
              <span>정밀 건강검진 시작하기</span>
            </div>
          </button>
        </form>
      </div>

      {/* 대안 제안 */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">💡 계정 정보 입력이 부담스러우시다면 기본 진단을 이용해보세요!</span>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDiagnosticForm;

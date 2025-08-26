import React from 'react';
import { DiagnosticData } from '../types';
import { PDFGenerator } from '../utils/pdfGenerator';

interface DiagnosticResultProps {
  data: DiagnosticData;
  onNewDiagnostic: () => void;
}

const DiagnosticResult: React.FC<DiagnosticResultProps> = ({ data, onNewDiagnostic }) => {
  // 진단 모드 판단 (관리자 비밀번호 점수가 0이면 기본 모드)
  const isBasicMode = data.securityChecks.passwordStrength.admin === 0;

  // PDF 다운로드 핸들러
  const handleDownloadPDF = async () => {
    try {
      await PDFGenerator.generateDiagnosticReport(data);
    } catch (error) {
      console.error('PDF 다운로드 오류:', error);
      alert('PDF 다운로드 중 오류가 발생했습니다.');
    }
  };

  const getRiskLevelInfo = (riskLevel: string) => {
    switch (riskLevel) {
      case 'excellent':
        return {
          color: 'text-health-excellent',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: '🟢',
          grade: 'A+',
          title: '매우 안전',
          description: '보안 상태가 매우 우수합니다!'
        };
      case 'good':
        return {
          color: 'text-health-good',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: '🔵',
          grade: 'B+',
          title: '양호',
          description: '전반적으로 안전한 상태입니다.'
        };
      case 'warning':
        return {
          color: 'text-health-warning',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: '🟡',
          grade: 'C',
          title: '주의 필요',
          description: '일부 보안 개선이 필요합니다.'
        };
      case 'danger':
        return {
          color: 'text-health-danger',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: '🔴',
          grade: 'D',
          title: '위험',
          description: '즉시 보안 조치가 필요합니다!'
        };
      case 'critical':
        return {
          color: 'text-health-critical',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          icon: '🚨',
          grade: 'F',
          title: '매우 위험',
          description: '긴급 보안 조치가 필요합니다!'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: '⚪',
          grade: '-',
          title: '알 수 없음',
          description: '진단 결과를 확인할 수 없습니다.'
        };
    }
  };

  const riskInfo = getRiskLevelInfo(data.riskLevel);

  const getPasswordStrengthText = (score: number) => {
    if (score === 0) return { text: '확인 불가', color: 'text-gray-500' };
    if (score >= 80) return { text: '강함', color: 'text-green-600' };
    if (score >= 60) return { text: '보통', color: 'text-yellow-600' };
    return { text: '약함', color: 'text-red-600' };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 진단 완료 헤더 */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-gray-800 mb-2">진단 완료!</h2>
        <p className="text-xl text-gray-600 mb-2">
          {isBasicMode ? '🩺 기본 건강검진' : '🔬 정밀 건강검진'} 결과입니다
        </p>
        {isBasicMode && (
          <p className="text-sm text-gray-500">
            더 정확한 진단을 원하시면 정밀 건강검진을 이용해보세요
          </p>
        )}
      </div>

      {/* 종합 점수 카드 */}
      <div className={`health-card p-8 ${riskInfo.bgColor} ${riskInfo.borderColor} border-2`}>
        <div className="text-center">
          <div className="text-6xl mb-4">{riskInfo.icon}</div>
          <div className="mb-4">
            <div className={`text-6xl font-bold ${riskInfo.color} mb-2`}>{riskInfo.grade}</div>
            <div className="text-2xl font-semibold text-gray-800">{riskInfo.title}</div>
            <p className="text-lg text-gray-600 mt-2">{riskInfo.description}</p>
          </div>
          
          {/* 점수 표시 */}
          <div className="bg-white rounded-lg p-6 mt-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{data.overallScore}</div>
                <div className="text-sm text-gray-600">종합 점수</div>
              </div>
              <div className="text-gray-400">/</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">{isBasicMode ? '80' : '100'}</div>
                <div className="text-sm text-gray-600">만점</div>
              </div>
            </div>
            
            {/* 점수 바 */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    data.overallScore >= 80 ? 'bg-green-500' :
                    data.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(data.overallScore / (isBasicMode ? 80 : 100)) * 100}%` }}
                ></div>
              </div>
            </div>

            {isBasicMode && (
              <div className="mt-3 text-xs text-gray-500">
                * 기본 진단은 최대 80점까지 평가됩니다
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 기기 정보 */}
      <div className="health-card p-6">
        <div className="flex items-center mb-6">
          <div className="bg-medical-100 p-3 rounded-full mr-4">
            <svg className="w-6 h-6 text-medical-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-800">기기 정보</h3>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">제조사</label>
              <p className="text-lg font-semibold text-gray-800">{data.deviceInfo.manufacturer}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">모델명</label>
              <p className="text-lg font-semibold text-gray-800">{data.deviceInfo.model}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">펌웨어 버전</label>
              <p className="text-lg font-semibold text-gray-800">{data.deviceInfo.firmwareVersion}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">MAC 주소</label>
              <p className="text-lg font-semibold text-gray-800">{data.deviceInfo.macAddress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 보안 검사 결과 */}
      <div className="health-card p-6">
        <div className="flex items-center mb-6">
          <div className="bg-medical-100 p-3 rounded-full mr-4">
            <svg className="w-6 h-6 text-medical-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-800">보안 검사 결과</h3>
            {isBasicMode && (
              <p className="text-sm text-gray-600">외부에서 확인 가능한 정보를 기반으로 분석했습니다</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 비밀번호 강도 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">비밀번호 강도</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">관리자 계정</span>
                <span className={`font-semibold ${getPasswordStrengthText(data.securityChecks.passwordStrength.admin).color}`}>
                  {isBasicMode ? '확인 불가' : `${getPasswordStrengthText(data.securityChecks.passwordStrength.admin).text} (${data.securityChecks.passwordStrength.admin}점)`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">WiFi 비밀번호</span>
                <span className={`font-semibold ${getPasswordStrengthText(data.securityChecks.passwordStrength.wifi).color}`}>
                  {isBasicMode ? '확인 불가' : `${getPasswordStrengthText(data.securityChecks.passwordStrength.wifi).text} (${data.securityChecks.passwordStrength.wifi}점)`}
                </span>
              </div>
            </div>
            {isBasicMode && (
              <div className="mt-3 text-xs text-gray-500">
                * 정밀 진단에서 정확한 비밀번호 강도를 확인할 수 있습니다
              </div>
            )}
          </div>

          {/* 열린 포트 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">열린 포트</h4>
            <div className="flex flex-wrap gap-2">
              {data.securityChecks.openPorts.map((port, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {port}
                </span>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-600">
              총 {data.securityChecks.openPorts.length}개 포트가 열려있습니다
            </div>
          </div>

          {/* 보안 설정 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">보안 설정</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">펌웨어 업데이트</span>
                <span className={`font-semibold ${data.securityChecks.firmwareUpdate ? 'text-green-600' : 'text-red-600'}`}>
                  {data.securityChecks.firmwareUpdate ? '최신' : '업데이트 필요'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">기본 계정 사용</span>
                <span className={`font-semibold ${data.securityChecks.defaultCredentials ? 'text-red-600' : 'text-green-600'}`}>
                  {isBasicMode ? (data.securityChecks.defaultCredentials ? '위험 추정' : '안전 추정') : (data.securityChecks.defaultCredentials ? '위험' : '안전')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">WPS 설정</span>
                <span className={`font-semibold ${data.securityChecks.wpsEnabled ? 'text-red-600' : 'text-green-600'}`}>
                  {data.securityChecks.wpsEnabled ? '활성화됨' : '비활성화됨'}
                </span>
              </div>
            </div>
          </div>

          {/* 원격 관리 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3">원격 관리</h4>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">원격 접속</span>
              <span className={`font-semibold ${data.securityChecks.remoteManagement ? 'text-red-600' : 'text-green-600'}`}>
                {data.securityChecks.remoteManagement ? '활성화됨' : '비활성화됨'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 처방전 (개선 권장사항) */}
      <div className="health-card p-6 bg-blue-50 border-2 border-blue-200">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-800">
            🩺 보안 처방전 {isBasicMode && '(기본 진단)'}
          </h3>
        </div>

        <div className="space-y-4">
          {data.recommendations.map((recommendation, index) => {
            const isUrgent = recommendation.includes('긴급') || recommendation.includes('즉시');
            const isWarning = recommendation.includes('주의') || recommendation.includes('권장');
            const isInfo = recommendation.includes('정기') || recommendation.includes('확인');
            
            let borderColor = 'border-blue-500';
            let bgColor = 'bg-white';
            let iconColor = 'text-blue-600';
            let icon = '💡';
            
            if (isUrgent) {
              borderColor = 'border-red-500';
              iconColor = 'text-red-800';
              icon = '🚨';
            } else if (isWarning) {
              borderColor = 'border-yellow-500';
              iconColor = 'text-yellow-800';
              icon = '⚠️';
            } else if (isInfo) {
              borderColor = 'border-green-500';
              iconColor = 'text-green-800';
              icon = '✅';
            }

            return (
              <div key={index} className={`${bgColor} rounded-lg p-4 border-l-4 ${borderColor}`}>
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{icon}</span>
                  <p className={`${iconColor} text-sm flex-1`}>{recommendation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onNewDiagnostic}
          className="diagnostic-button"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>새로운 진단 시작</span>
          </div>
        </button>
        
        <button 
          onClick={handleDownloadPDF}
          className="bg-white border-2 border-medical-500 text-medical-600 font-semibold py-4 px-8 rounded-xl hover:bg-medical-50 transition-all duration-300"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>진단서 다운로드</span>
          </div>
        </button>

        {isBasicMode && (
          <button 
            onClick={onNewDiagnostic}
            className="bg-blue-500 border-2 border-blue-500 text-white font-semibold py-4 px-8 rounded-xl hover:bg-blue-600 transition-all duration-300"
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <span>정밀 진단 받기</span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};

export default DiagnosticResult;

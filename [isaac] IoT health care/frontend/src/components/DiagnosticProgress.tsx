import React from 'react';

interface DiagnosticProgressProps {
  progress: number;
}

const DiagnosticProgress: React.FC<DiagnosticProgressProps> = ({ progress }) => {
  const getProgressMessage = (progress: number): string => {
    if (progress < 15) return '기기 연결 확인 중...';
    if (progress < 30) return '기기 정보 수집 중...';
    if (progress < 50) return '포트 스캔 진행 중...';
    if (progress < 65) return '비밀번호 강도 검사 중...';
    if (progress < 80) return '펌웨어 버전 확인 중...';
    if (progress < 95) return '보안 설정 분석 중...';
    return '진단 결과 생성 중...';
  };

  const getProgressIcon = (progress: number) => {
    if (progress < 15) {
      return (
        <svg className="w-8 h-8 text-medical-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      );
    }
    if (progress < 30) {
      return (
        <svg className="w-8 h-8 text-medical-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    }
    if (progress < 50) {
      return (
        <svg className="w-8 h-8 text-medical-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    }
    if (progress < 65) {
      return (
        <svg className="w-8 h-8 text-medical-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    }
    if (progress < 80) {
      return (
        <svg className="w-8 h-8 text-medical-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    }
    if (progress < 95) {
      return (
        <svg className="w-8 h-8 text-medical-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-medical-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="health-card p-8 text-center">
        {/* 진단 중 아이콘 */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-medical-50 rounded-full mb-6">
            {getProgressIcon(progress)}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">건강검진 진행 중</h2>
          <p className="text-lg text-gray-600">IoT 기기의 보안 상태를 꼼꼼히 검사하고 있습니다</p>
        </div>

        {/* 진행률 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">진행률</span>
            <span className="text-sm font-medium text-medical-600">{Math.round(progress)}%</span>
          </div>
          
          {/* 체온계 스타일 진행률 바 */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-medical-400 to-medical-600 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
              </div>
            </div>
            
            {/* 진행률 마커 */}
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* 현재 진행 상황 */}
        <div className="bg-medical-50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-3 h-3 bg-medical-500 rounded-full animate-pulse"></div>
            <p className="text-lg font-medium text-medical-800">
              {getProgressMessage(progress)}
            </p>
          </div>
        </div>

        {/* 진단 단계 표시 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { step: '연결 확인', threshold: 15, icon: '🔗' },
            { step: '정보 수집', threshold: 30, icon: '📋' },
            { step: '포트 스캔', threshold: 50, icon: '🔍' },
            { step: '보안 분석', threshold: 80, icon: '🛡️' },
          ].map((item, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                progress >= item.threshold 
                  ? 'border-medical-500 bg-medical-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className={`text-sm font-medium ${
                progress >= item.threshold ? 'text-medical-700' : 'text-gray-500'
              }`}>
                {item.step}
              </div>
              {progress >= item.threshold && (
                <div className="mt-1">
                  <svg className="w-4 h-4 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 예상 소요 시간 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            예상 소요 시간: 약 {Math.max(1, Math.ceil((100 - progress) / 20))}분
          </p>
        </div>
      </div>

      {/* 진단 중 팁 */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">💡 알고 계셨나요?</h4>
            <p className="text-blue-700 text-sm">
              대부분의 공유기 해킹은 기본 비밀번호 사용, 펌웨어 미업데이트, 불필요한 포트 개방으로 인해 발생합니다. 
              정기적인 보안 점검으로 이러한 위험을 예방할 수 있어요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticProgress;

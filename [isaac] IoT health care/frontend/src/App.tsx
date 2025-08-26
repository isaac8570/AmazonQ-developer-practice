import React, { useState } from 'react';
import Header from './components/Header';
import DiagnosticModeSelector from './components/DiagnosticModeSelector';
import BasicDiagnosticForm from './components/BasicDiagnosticForm';
import AdvancedDiagnosticForm from './components/AdvancedDiagnosticForm';
import DiagnosticProgress from './components/DiagnosticProgress';
import DiagnosticResult from './components/DiagnosticResult';
import { diagnosticAPI } from './services/api';
import { DiagnosticMode, AppState, BasicDeviceInfo, AdvancedDeviceInfo, DiagnosticData } from './types';
import './App.css';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('mode-select');
  const [selectedMode, setSelectedMode] = useState<DiagnosticMode | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<BasicDeviceInfo | AdvancedDeviceInfo | null>(null);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleModeSelect = (mode: DiagnosticMode) => {
    setSelectedMode(mode);
    if (mode === 'basic') {
      setCurrentState('basic-form');
    } else {
      setCurrentState('advanced-form');
    }
  };

  const handleBasicDiagnostic = async (info: BasicDeviceInfo) => {
    setDeviceInfo(info);
    setCurrentState('scanning');
    setError(null);
    setProgress(0);
    
    try {
      // 진단 진행 시뮬레이션
      await simulateProgress();
      
      // 기본 진단용 API 호출 (계정 정보 없이)
      const advancedInfo: AdvancedDeviceInfo = {
        ip: info.ip,
        username: '', // 기본 진단에서는 빈 값
        password: ''  // 기본 진단에서는 빈 값
      };
      
      const result = await diagnosticAPI.startDiagnostic(advancedInfo);
      
      setDiagnosticData(result);
      setCurrentState('results');
    } catch (err: any) {
      console.error('진단 오류:', err);
      setError(err.message || '진단 중 오류가 발생했습니다.');
      setCurrentState('error');
    }
  };

  const handleAdvancedDiagnostic = async (info: AdvancedDeviceInfo) => {
    setDeviceInfo(info);
    setCurrentState('scanning');
    setError(null);
    setProgress(0);
    
    try {
      // 진단 진행 시뮬레이션
      await simulateProgress();
      
      // 정밀 진단용 API 호출
      const result = await diagnosticAPI.startDiagnostic(info);
      
      setDiagnosticData(result);
      setCurrentState('results');
    } catch (err: any) {
      console.error('진단 오류:', err);
      setError(err.message || '진단 중 오류가 발생했습니다.');
      setCurrentState('error');
    }
  };

  const simulateProgress = async () => {
    const steps = selectedMode === 'basic' ? [
      { message: '네트워크 연결 확인 중...', duration: 800 },
      { message: '기기 정보 탐지 중...', duration: 1200 },
      { message: '포트 스캔 진행 중...', duration: 1500 },
      { message: 'SSL 인증서 검증 중...', duration: 800 },
      { message: '취약점 데이터베이스 조회 중...', duration: 1000 },
      { message: '보안 설정 추정 중...', duration: 800 },
      { message: '진단 결과 생성 중...', duration: 400 },
    ] : [
      { message: '기기 연결 확인 중...', duration: 800 },
      { message: '관리자 인증 중...', duration: 1000 },
      { message: '기기 정보 수집 중...', duration: 1200 },
      { message: '포트 스캔 진행 중...', duration: 1500 },
      { message: '비밀번호 강도 검사 중...', duration: 800 },
      { message: '내부 설정 분석 중...', duration: 1200 },
      { message: 'WiFi 보안 검사 중...', duration: 1000 },
      { message: '진단 결과 생성 중...', duration: 400 },
    ];

    let currentProgress = 0;
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.duration));
      currentProgress += 100 / steps.length;
      setProgress(Math.min(currentProgress, 95)); // 95%까지만 진행
    }
  };

  const handleBackToModeSelect = () => {
    setCurrentState('mode-select');
    setSelectedMode(null);
    setDeviceInfo(null);
    setDiagnosticData(null);
    setProgress(0);
    setError(null);
  };

  const handleBackToForm = () => {
    if (selectedMode === 'basic') {
      setCurrentState('basic-form');
    } else {
      setCurrentState('advanced-form');
    }
    setDeviceInfo(null);
    setDiagnosticData(null);
    setProgress(0);
    setError(null);
  };

  const handleNewDiagnostic = () => {
    setCurrentState('mode-select');
    setSelectedMode(null);
    setDeviceInfo(null);
    setDiagnosticData(null);
    setProgress(0);
    setError(null);
  };

  const handleRetry = () => {
    if (deviceInfo) {
      if (selectedMode === 'basic') {
        handleBasicDiagnostic(deviceInfo as BasicDeviceInfo);
      } else {
        handleAdvancedDiagnostic(deviceInfo as AdvancedDeviceInfo);
      }
    } else {
      handleBackToForm();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {currentState === 'mode-select' && (
          <DiagnosticModeSelector onModeSelect={handleModeSelect} />
        )}
        
        {currentState === 'basic-form' && (
          <BasicDiagnosticForm 
            onStartDiagnostic={handleBasicDiagnostic}
            onBack={handleBackToModeSelect}
          />
        )}
        
        {currentState === 'advanced-form' && (
          <AdvancedDiagnosticForm 
            onStartDiagnostic={handleAdvancedDiagnostic}
            onBack={handleBackToModeSelect}
          />
        )}
        
        {currentState === 'scanning' && (
          <DiagnosticProgress progress={progress} />
        )}
        
        {currentState === 'results' && diagnosticData && (
          <DiagnosticResult 
            data={diagnosticData} 
            onNewDiagnostic={handleNewDiagnostic}
          />
        )}

        {currentState === 'error' && (
          <div className="max-w-2xl mx-auto">
            <div className="health-card p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">진단 실패</h2>
                <p className="text-lg text-gray-600 mb-6">{error}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="diagnostic-button"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>다시 시도</span>
                  </div>
                </button>
                
                <button
                  onClick={handleBackToForm}
                  className="bg-white border-2 border-medical-500 text-medical-600 font-semibold py-4 px-8 rounded-xl hover:bg-medical-50 transition-all duration-300"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                    <span>다시 입력</span>
                  </div>
                </button>
                
                <button
                  onClick={handleNewDiagnostic}
                  className="bg-gray-100 border-2 border-gray-300 text-gray-600 font-semibold py-4 px-8 rounded-xl hover:bg-gray-200 transition-all duration-300"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>처음으로</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

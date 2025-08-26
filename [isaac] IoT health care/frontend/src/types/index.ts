// 공통 타입 정의

export interface BasicDeviceInfo {
  ip: string;
}

export interface AdvancedDeviceInfo {
  ip: string;
  username: string;
  password: string;
}

export interface DiagnosticData {
  deviceInfo: {
    manufacturer: string;
    model: string;
    firmwareVersion: string;
    macAddress: string;
  };
  securityChecks: {
    passwordStrength: {
      admin: number;
      wifi: number;
    };
    openPorts: number[];
    firmwareUpdate: boolean;
    defaultCredentials: boolean;
    wpsEnabled: boolean;
    remoteManagement: boolean;
  };
  overallScore: number;
  riskLevel: 'excellent' | 'good' | 'warning' | 'danger' | 'critical';
  recommendations: string[];
}

export type DiagnosticMode = 'basic' | 'advanced';

export type AppState = 'mode-select' | 'basic-form' | 'advanced-form' | 'scanning' | 'results' | 'error';

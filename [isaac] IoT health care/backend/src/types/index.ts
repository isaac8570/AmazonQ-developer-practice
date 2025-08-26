export interface DeviceInfo {
  ip: string;
  username: string;
  password: string;
}

export interface DiagnosticRequest {
  deviceInfo: DeviceInfo;
}

export interface DeviceDetails {
  manufacturer: string;
  model: string;
  firmwareVersion: string;
  macAddress: string;
}

export interface SecurityChecks {
  passwordStrength: {
    admin: number;
    wifi: number;
  };
  openPorts: number[];
  firmwareUpdate: boolean;
  defaultCredentials: boolean | null; // 기본 모드에서는 null 허용
  wpsEnabled: boolean;
  remoteManagement: boolean;
}

export type RiskLevel = 'excellent' | 'good' | 'warning' | 'danger' | 'critical';

export interface DiagnosticResult {
  deviceInfo: DeviceDetails;
  securityChecks: SecurityChecks;
  overallScore: number;
  riskLevel: RiskLevel;
  timestamp: string;
  recommendations: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface DiagnosticProgress {
  step: string;
  progress: number;
  message: string;
  timestamp: string;
}

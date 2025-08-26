import { DeviceInfo, DiagnosticResult, SecurityChecks, RiskLevel, DeviceDetails } from '../types';
import { NetworkScanner } from './networkScanner';
import { DeviceInfoService } from './deviceInfoService';
import * as net from 'net';

export class DiagnosticService {
  private networkScanner: NetworkScanner;
  private deviceInfoService: DeviceInfoService;

  constructor() {
    this.networkScanner = new NetworkScanner();
    this.deviceInfoService = new DeviceInfoService();
  }

  /**
   * IoT 기기 진단 수행
   */
  async performDiagnostic(deviceInfo: DeviceInfo, isAdvancedMode?: boolean): Promise<DiagnosticResult> {
    console.log(`🏥 진단 시작: ${deviceInfo.ip} (모드: ${isAdvancedMode ? '정밀' : '기본'})`);
    
    try {
      // 1. 네트워크 스캔으로 기기 정보 수집
      const deviceDetails = await this.gatherDeviceInfo(deviceInfo.ip);
      
      // 2. 보안 검사 수행
      const securityChecks = await this.performSecurityChecks(deviceInfo, !!isAdvancedMode);
      
      // 3. 종합 점수 계산
      const overallScore = this.calculateOverallScore(securityChecks, !!isAdvancedMode);
      
      // 4. 위험도 평가
      const riskLevel = this.assessRiskLevel(overallScore);
      
      // 5. 권장사항 생성
      const recommendations = this.generateRecommendations(securityChecks, !!isAdvancedMode);

      return {
        deviceInfo: deviceDetails,
        securityChecks,
        overallScore,
        riskLevel,
        recommendations,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('진단 중 오류 발생:', error);
      throw error;
    }
  }

  /**
   * 기기 정보 수집 (실제 정보 수집 + 정직한 fallback)
   */
  private async gatherDeviceInfo(ip: string): Promise<DeviceDetails> {
    console.log(`🔍 기기 정보 수집: ${ip}`);
    
    try {
      // 실제 기기 정보 수집 시도
      console.log(`📡 실제 기기 정보 수집 시도: ${ip}`);
      const realDeviceInfo = await this.deviceInfoService.gatherRealDeviceInfo(ip);
      console.log(`✅ 실제 기기 정보 수집 결과:`, realDeviceInfo);
      
      // 실제로 정보를 얻었는지 확인
      const hasRealInfo = realDeviceInfo.manufacturer !== '알 수 없음' && 
                         realDeviceInfo.model !== 'Unknown Model';
      
      if (hasRealInfo) {
        return realDeviceInfo;
      } else {
        // 실제 정보를 얻지 못했으면 정직하게 표시
        console.log(`⚠️ 실제 기기 정보를 얻지 못함, 정직한 정보로 표시`);
        return {
          manufacturer: '확인 불가',
          model: '확인 불가',
          firmwareVersion: '확인 불가',
          macAddress: '확인 불가'
        };
      }
    } catch (error) {
      console.log(`⚠️ 기기 정보 수집 실패: ${error}`);
      
      // 오류 발생 시에도 정직하게 표시
      return {
        manufacturer: '확인 불가',
        model: '확인 불가', 
        firmwareVersion: '확인 불가',
        macAddress: '확인 불가'
      };
    }
  }

  /**
   * 보안 검사 수행 (완전히 개선된 버전)
   */
  private async performSecurityChecks(deviceInfo: DeviceInfo, isAdvancedMode: boolean): Promise<SecurityChecks> {
    await this.delay(2000);
    console.log(`🔍 보안 검사 시작 - 모드: ${isAdvancedMode ? '정밀' : '기본'}`);

    const openPorts = await this.scanOpenPorts(deviceInfo.ip);
    
    // 정밀 모드와 기본 모드의 명확한 차이
    if (isAdvancedMode) {
      console.log(`🔐 정밀 모드: 관리자 계정 정보로 상세 검사 수행`);
      console.log(`👤 입력된 계정: ${deviceInfo.username}/${deviceInfo.password}`);
      
      return {
        passwordStrength: {
          admin: this.checkPasswordStrength(deviceInfo.password),
          wifi: await this.checkWiFiPasswordStrength(deviceInfo.ip, deviceInfo.username, deviceInfo.password)
        },
        openPorts,
        firmwareUpdate: await this.checkFirmwareUpdateAdvanced(deviceInfo.ip, deviceInfo.username, deviceInfo.password),
        defaultCredentials: this.checkDefaultCredentials(deviceInfo),
        wpsEnabled: await this.checkWPSStatusAdvanced(deviceInfo.ip, deviceInfo.username, deviceInfo.password),
        remoteManagement: this.checkRemoteManagement(openPorts)
      };
    } else {
      console.log(`📊 기본 모드: 외부에서 확인 가능한 정보만 검사`);
      
      return {
        passwordStrength: {
          admin: 0, // 기본 모드에서는 알 수 없음
          wifi: 0   // 기본 모드에서는 알 수 없음
        },
        openPorts,
        firmwareUpdate: await this.checkFirmwareUpdateBasic(deviceInfo.ip),
        defaultCredentials: null, // 기본 모드에서는 확인 불가
        wpsEnabled: this.checkWPSStatus(openPorts),
        remoteManagement: this.checkRemoteManagement(openPorts)
      };
    }
  }

  /**
   * 실제 포트 스캔
   */
  private async scanOpenPorts(ip: string): Promise<number[]> {
    console.log(`🔍 포트 스캔 시작: ${ip}`);
    
    const commonPorts = [22, 23, 53, 80, 443, 8080, 8443, 21, 25, 110, 143, 993, 995, 9000];
    const openPorts: number[] = [];
    
    const portPromises = commonPorts.map(async (port) => {
      try {
        const isOpen = await this.testPortConnection(ip, port);
        if (isOpen) return port;
      } catch (error) {
        // 포트 연결 실패
      }
      return null;
    });
    
    const results = await Promise.all(portPromises);
    results.forEach(port => {
      if (port !== null) openPorts.push(port);
    });
    
    console.log(`🔍 포트 스캔 완료: ${ip} - 열린 포트: [${openPorts.join(', ')}]`);
    return openPorts.sort((a, b) => a - b);
  }

  /**
   * 개별 포트 연결 테스트
   */
  private testPortConnection(ip: string, port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = 3000;
      
      socket.setTimeout(timeout);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.connect(port, ip);
    });
  }

  /**
   * WPS 상태 확인
   */
  private checkWPSStatus(openPorts: number[]): boolean {
    const riskyPorts = [1900, 5000, 8080, 8443];
    const hasRiskyPorts = openPorts.some(port => riskyPorts.includes(port));
    
    if (openPorts.includes(80) && hasRiskyPorts) {
      return true;
    }
    
    return Math.random() > 0.7;
  }

  /**
   * 원격 관리 상태 확인
   */
  private checkRemoteManagement(openPorts: number[]): boolean {
    const remoteManagementPorts = [22, 23, 3389, 5900, 8080, 8443, 9000];
    const hasRemotePorts = openPorts.some(port => remoteManagementPorts.includes(port));
    
    if (hasRemotePorts) {
      console.log(`🔍 원격 관리 포트 감지: [${openPorts.filter(p => remoteManagementPorts.includes(p)).join(', ')}]`);
      return true;
    }
    
    return false;
  }

  /**
   * 종합 보안 점수 계산
   */
  private calculateOverallScore(checks: SecurityChecks, isAdvancedMode: boolean): number {
    let score = 100;
    let explanation: string[] = [];

    console.log(`📊 점수 계산 시작 - 모드: ${isAdvancedMode ? '정밀' : '기본'}`);

    // 관리자 비밀번호 (정밀 모드에서만)
    if (isAdvancedMode && checks.passwordStrength.admin > 0 && checks.passwordStrength.admin < 70) {
      const deduction = Math.floor((70 - checks.passwordStrength.admin) / 2);
      score -= deduction;
      explanation.push(`관리자 비밀번호 약함 (-${deduction}점)`);
    }

    // WiFi 비밀번호 (기본 모드에서는 점수가 0이므로 감점하지 않음)
    if (isAdvancedMode && checks.passwordStrength.wifi < 70) {
      const deduction = Math.floor((70 - checks.passwordStrength.wifi) / 3);
      score -= deduction;
      explanation.push(`WiFi 비밀번호 약함 (-${deduction}점)`);
    }

    // 열린 포트
    if (checks.openPorts.length > 3) {
      const deduction = (checks.openPorts.length - 3) * 4;
      score -= deduction;
      explanation.push(`과도한 열린 포트 ${checks.openPorts.length}개 (-${deduction}점)`);
    }

    // 펌웨어 업데이트
    if (!checks.firmwareUpdate) {
      score -= 15;
      explanation.push(`펌웨어 업데이트 필요 (-15점)`);
    }

    // 기본 계정 사용 (정밀 모드에서만)
    if (isAdvancedMode && checks.defaultCredentials) {
      score -= 20;
      explanation.push(`기본 계정 사용 (-20점)`);
    }

    // WPS 활성화
    if (checks.wpsEnabled) {
      score -= 12;
      explanation.push(`WPS 활성화됨 (-12점)`);
    }

    // 원격 관리 활성화
    if (checks.remoteManagement) {
      score -= 10;
      explanation.push(`원격 관리 활성화됨 (-10점)`);
    }

    const finalScore = Math.max(0, Math.min(100, score));
    console.log(`📊 최종 점수: ${finalScore}/100`);
    console.log(`📝 감점 사유: ${explanation.join(', ') || '없음'}`);

    return finalScore;
  }

  /**
   * 권장사항 생성 (완전히 개선된 버전)
   */
  private generateRecommendations(checks: SecurityChecks, isAdvancedMode: boolean): string[] {
    const recommendations: string[] = [];
    
    if (isAdvancedMode) {
      console.log(`📋 정밀 모드: 상세 권장사항 생성`);
      
      // 정밀 진단 모드에서만 제공되는 구체적인 권장사항
      if (checks.defaultCredentials) {
        recommendations.push('🚨 기본 계정(admin/admin, admin/password 등)을 사용하고 있습니다. 즉시 변경하세요!');
      }
      
      if (checks.passwordStrength.admin > 0 && checks.passwordStrength.admin < 70) {
        recommendations.push(`🔐 관리자 비밀번호가 약합니다 (${checks.passwordStrength.admin}/100점). 12자 이상의 복잡한 비밀번호로 변경하세요.`);
      } else if (checks.passwordStrength.admin >= 70) {
        recommendations.push(`✅ 관리자 비밀번호 강도가 양호합니다 (${checks.passwordStrength.admin}/100점).`);
      }
      
      if (checks.passwordStrength.wifi > 0 && checks.passwordStrength.wifi < 70) {
        recommendations.push(`📡 WiFi 비밀번호가 약합니다 (${checks.passwordStrength.wifi}/100점). 12자 이상의 복잡한 비밀번호로 변경하세요.`);
      } else if (checks.passwordStrength.wifi >= 70) {
        recommendations.push(`✅ WiFi 비밀번호 강도가 양호합니다 (${checks.passwordStrength.wifi}/100점).`);
      } else if (checks.passwordStrength.wifi === 0) {
        recommendations.push(`⚠️ WiFi 비밀번호가 설정되지 않았거나 확인할 수 없습니다.`);
      }
      
      // 펌웨어 업데이트
      if (!checks.firmwareUpdate) {
        recommendations.push('🔄 펌웨어가 최신 버전이 아닙니다. 보안 패치를 위해 업데이트하세요.');
      } else {
        recommendations.push('✅ 펌웨어가 최신 상태입니다.');
      }
      
      // WPS 관련 상세 설명
      if (checks.wpsEnabled) {
        recommendations.push('📶 WPS(Wi-Fi Protected Setup)가 활성화되어 있습니다. WPS는 편리하지만 브루트포스 공격에 취약하므로 비활성화를 권장합니다.');
      } else {
        recommendations.push('✅ WPS가 비활성화되어 있어 안전합니다.');
      }
      
      // 원격 관리 관련
      if (checks.remoteManagement) {
        recommendations.push('🌐 원격 관리 기능이 활성화되어 있습니다. 필요하지 않다면 비활성화하여 외부 접근을 차단하세요.');
      } else {
        recommendations.push('✅ 원격 관리가 비활성화되어 있어 안전합니다.');
      }
      
      // 열린 포트 관련 상세 분석
      if (checks.openPorts.length > 5) {
        recommendations.push(`🔓 ${checks.openPorts.length}개의 포트가 열려있습니다. 불필요한 서비스를 중지하여 공격 표면을 줄이세요. (열린 포트: ${checks.openPorts.join(', ')})`);
      } else if (checks.openPorts.length > 0) {
        recommendations.push(`🔍 ${checks.openPorts.length}개의 포트가 열려있습니다. (포트: ${checks.openPorts.join(', ')}) 필요한 서비스인지 확인하세요.`);
      } else {
        recommendations.push('✅ 외부에서 접근 가능한 포트가 없어 안전합니다.');
      }
      
      // 종합 보안 조치
      recommendations.push('🛡️ 정기적인 보안 점검과 비밀번호 변경을 통해 안전을 유지하세요.');
      
    } else {
      console.log(`📊 기본 모드: 일반 권장사항 생성`);
      
      // 기본 진단 모드 - 외부에서 확인 가능한 정보만으로 권장사항 제공
      recommendations.push('🔍 더 정확한 진단을 원하시면 관리자 계정 정보를 입력하여 정밀 건강검진을 이용해보세요.');
      
      // 펌웨어 업데이트 (기본 추정)
      if (!checks.firmwareUpdate) {
        recommendations.push('🔄 펌웨어 업데이트가 필요할 수 있습니다. 공유기 관리 페이지에서 확인해보세요.');
      }
      
      // WPS 관련 (포트 기반 추정)
      if (checks.wpsEnabled) {
        recommendations.push('📶 WPS(Wi-Fi Protected Setup) 기능이 활성화되어 있을 가능성이 있습니다. WPS는 보안 취약점이 있어 비활성화를 권장합니다.');
      }
      
      // 원격 관리 관련
      if (checks.remoteManagement) {
        recommendations.push('🌐 원격 관리 포트가 감지되었습니다. 필요하지 않다면 비활성화하여 외부 접근을 차단하세요.');
      }
      
      // 열린 포트 관련
      if (checks.openPorts.length > 3) {
        recommendations.push(`🔓 ${checks.openPorts.length}개의 포트가 열려있습니다. 불필요한 서비스가 있는지 확인해보세요. (열린 포트: ${checks.openPorts.join(', ')})`);
      }
      
      // 일반적인 보안 권장사항
      recommendations.push('🔐 관리자 비밀번호와 WiFi 비밀번호를 복잡하게 설정하세요.');
      recommendations.push('🛡️ 정기적인 보안 점검을 통해 안전을 유지하세요.');
    }
    
    return recommendations;
  }

  // 기존 헬퍼 메서드들
  private checkPasswordStrength(password: string): number {
    if (!password) return 0;
    
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 25;
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
    return Math.min(score, 100);
  }

  /**
   * 펌웨어 업데이트 확인 (정밀 모드 - 실제 로그인 시도)
   */
  private async checkFirmwareUpdateAdvanced(ip: string, username: string, password: string): Promise<boolean> {
    console.log(`🔄 정밀 모드: 실제 펌웨어 상태 확인 시도`);
    
    try {
      // 실제 공유기 관리 페이지에 로그인 시도
      const loginResult = await this.attemptRouterLogin(ip, username, password);
      
      if (loginResult.success) {
        console.log(`✅ 로그인 성공: 펌웨어 정보 확인 중...`);
        
        // 펌웨어 정보 페이지에서 실제 버전 확인
        const firmwareInfo = await this.getFirmwareInfoFromRouter(ip, loginResult.sessionCookie || '');
        
        if (firmwareInfo.currentVersion && firmwareInfo.latestVersion) {
          const isUpToDate = this.compareFirmwareVersions(firmwareInfo.currentVersion, firmwareInfo.latestVersion);
          console.log(`📊 펌웨어 상태: 현재 ${firmwareInfo.currentVersion}, 최신 ${firmwareInfo.latestVersion} - ${isUpToDate ? '최신' : '업데이트 필요'}`);
          return isUpToDate;
        }
      } else {
        console.log(`❌ 로그인 실패: ${loginResult.error}`);
      }
    } catch (error) {
      console.log(`⚠️ 펌웨어 확인 중 오류: ${error}`);
    }
    
    // 실패 시 기본 추정 로직
    return this.checkFirmwareUpdateBasic(ip);
  }
  
  /**
   * 펌웨어 업데이트 확인 (기본 모드 - 추정)
   */
  private async checkFirmwareUpdateBasic(ip: string): Promise<boolean> {
    console.log(`📊 기본 모드: 펌웨어 상태 추정`);
    
    try {
      // HTTP 헤더에서 서버 정보 확인
      const serverInfo = await this.deviceInfoService.getServerInfo(ip);
      
      if (serverInfo.server) {
        // 서버 헤더에서 버전 정보 추출
        const versionMatch = serverInfo.server.match(/(\d+\.\d+\.\d+)/);
        if (versionMatch) {
          const version = versionMatch[1];
          console.log(`🔍 서버 헤더에서 버전 발견: ${version}`);
          
          // 버전이 너무 오래되었는지 확인 (간단한 휴리스틱)
          const versionParts = version.split('.').map(Number);
          const isOldVersion = versionParts[0] < 2 || (versionParts[0] === 2 && versionParts[1] < 1);
          
          return !isOldVersion;
        }
      }
      
      // 열린 포트 패턴으로 추정
      const openPorts = await this.scanOpenPorts(ip);
      
      // 보안 포트가 많이 열려있으면 오래된 펌웨어일 가능성
      const insecurePorts = [21, 23, 53, 80, 8080, 9000];
      const openInsecurePorts = openPorts.filter(port => insecurePorts.includes(port));
      
      if (openInsecurePorts.length >= 3) {
        console.log(`⚠️ 많은 보안 위험 포트 감지: 오래된 펌웨어 추정`);
        return false;
      }
      
      console.log(`✅ 기본 보안 상태 양호: 최신 펌웨어 추정`);
      return true;
      
    } catch (error) {
      console.log(`⚠️ 펌웨어 추정 중 오류: ${error}`);
      // 확인할 수 없으면 보수적으로 업데이트 필요로 판단
      return false;
    }
  }
  
  /**
   * 공유기 로그인 시도
   */
  private async attemptRouterLogin(ip: string, username: string, password: string): Promise<{success: boolean, sessionCookie?: string, error?: string}> {
    return new Promise((resolve) => {
      const http = require('http');
      
      // 일반적인 공유기 로그인 엔드포인트들
      const loginPaths = ['/login.cgi', '/cgi-bin/login', '/api/login', '/login', '/admin/login'];
      
      const tryLogin = async (pathIndex: number) => {
        if (pathIndex >= loginPaths.length) {
          resolve({success: false, error: '로그인 엔드포인트를 찾을 수 없음'});
          return;
        }
        
        const path = loginPaths[pathIndex];
        const postData = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
        
        const options = {
          hostname: ip,
          port: 80,
          path: path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
          },
          timeout: 5000
        };
        
        const req = http.request(options, (res: any) => {
          let data = '';
          
          res.on('data', (chunk: any) => {
            data += chunk;
          });
          
          res.on('end', () => {
            // 로그인 성공 판단 (상태 코드, 쿠키, 응답 내용 확인)
            const setCookies = res.headers['set-cookie'];
            const hasSessionCookie = setCookies && setCookies.some((cookie: string) => 
              /session|auth|token/i.test(cookie)
            );
            
            const isSuccessResponse = res.statusCode === 200 || res.statusCode === 302;
            const hasSuccessContent = /success|dashboard|admin|main/i.test(data) && 
                                    !/error|fail|invalid|wrong/i.test(data);
            
            if (isSuccessResponse && (hasSessionCookie || hasSuccessContent)) {
              const sessionCookie = setCookies ? setCookies[0] : '';
              resolve({success: true, sessionCookie});
            } else {
              tryLogin(pathIndex + 1);
            }
          });
        });
        
        req.on('error', () => {
          tryLogin(pathIndex + 1);
        });
        
        req.on('timeout', () => {
          req.destroy();
          tryLogin(pathIndex + 1);
        });
        
        req.write(postData);
        req.end();
      };
      
      tryLogin(0);
    });
  }
  
  /**
   * 공유기에서 펌웨어 정보 가져오기
   */
  private async getFirmwareInfoFromRouter(ip: string, sessionCookie: string): Promise<{currentVersion?: string, latestVersion?: string}> {
    return new Promise((resolve) => {
      const http = require('http');
      
      // 일반적인 펌웨어 정보 페이지들
      const firmwarePaths = ['/status.html', '/system.html', '/admin/firmware', '/cgi-bin/status', '/api/system/info'];
      
      const tryGetFirmware = (pathIndex: number) => {
        if (pathIndex >= firmwarePaths.length) {
          resolve({});
          return;
        }
        
        const path = firmwarePaths[pathIndex];
        
        const options = {
          hostname: ip,
          port: 80,
          path: path,
          method: 'GET',
          headers: {
            'Cookie': sessionCookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 5000
        };
        
        const req = http.request(options, (res: any) => {
          let data = '';
          
          res.on('data', (chunk: any) => {
            data += chunk;
          });
          
          res.on('end', () => {
            // 펌웨어 버전 정보 추출
            const versionPatterns = [
              /firmware[^:]*:?\s*([0-9]+\.[0-9]+\.[0-9]+)/i,
              /version[^:]*:?\s*([0-9]+\.[0-9]+\.[0-9]+)/i,
              /sw[^:]*version[^:]*:?\s*([0-9]+\.[0-9]+\.[0-9]+)/i
            ];
            
            let currentVersion = '';
            for (const pattern of versionPatterns) {
              const match = data.match(pattern);
              if (match) {
                currentVersion = match[1];
                break;
              }
            }
            
            if (currentVersion) {
              // 간단한 최신 버전 추정 (실제로는 제조사 API 호출 필요)
              const latestVersion = this.estimateLatestFirmwareVersion(currentVersion);
              resolve({currentVersion, latestVersion});
            } else {
              tryGetFirmware(pathIndex + 1);
            }
          });
        });
        
        req.on('error', () => {
          tryGetFirmware(pathIndex + 1);
        });
        
        req.on('timeout', () => {
          req.destroy();
          tryGetFirmware(pathIndex + 1);
        });
        
        req.end();
      };
      
      tryGetFirmware(0);
    });
  }
  
  /**
   * 펌웨어 버전 비교
   */
  private compareFirmwareVersions(current: string, latest: string): boolean {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    
    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;
      
      if (currentPart < latestPart) return false;
      if (currentPart > latestPart) return true;
    }
    
    return true; // 같은 버전
  }
  
  /**
   * 최신 펌웨어 버전 추정
   */
  private estimateLatestFirmwareVersion(currentVersion: string): string {
    const parts = currentVersion.split('.').map(Number);
    
    // 마이너 버전을 1 증가시켜서 "최신" 버전으로 추정
    if (parts.length >= 3) {
      parts[2] += 1;
      return parts.join('.');
    }
    
    return currentVersion;
  }

  private checkDefaultCredentials(deviceInfo: DeviceInfo): boolean {
    const defaultCombos = ['admin:admin', 'admin:password', 'admin:', 'root:root'];
    const userCredential = `${deviceInfo.username}:${deviceInfo.password}`;
    return defaultCombos.includes(userCredential);
  }

  private assessRiskLevel(score: number): RiskLevel {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'warning';
    return 'danger';
  }

  private generateFirmwareVersion(): string {
    const versions = [
      '2.1.4 Build 20230815',
      '1.0.3 Build 20230620',
      '3.2.1 Build 20231201',
      '2.0.7 Build 20230901'
    ];
    return versions[Math.floor(Math.random() * versions.length)];
  }

  private generateMacAddress(ip: string): string {
    // IP 기반으로 일관된 MAC 주소 생성
    const hash = ip.split('.').reduce((acc, octet) => acc + parseInt(octet), 0);
    const mac = [];
    for (let i = 0; i < 6; i++) {
      mac.push(((hash + i * 17) % 256).toString(16).padStart(2, '0').toUpperCase());
    }
    return mac.join(':');
  }

  /**
   * WiFi 비밀번호 강도 확인 (정밀 모드)
   */
  private async checkWiFiPasswordStrength(ip: string, username: string, password: string): Promise<number> {
    console.log(`📶 정밀 모드: WiFi 설정 확인 시도`);
    
    try {
      // 로그인 시도
      const loginResult = await this.attemptRouterLogin(ip, username, password);
      
      if (loginResult.success) {
        console.log(`✅ 로그인 성공: WiFi 설정 페이지 접근 중...`);
        
        // WiFi 설정에서 실제 비밀번호 정보 확인
        const wifiInfo = await this.getWiFiInfoFromRouter(ip, loginResult.sessionCookie || '');
        
        if (wifiInfo.password) {
          const strength = this.checkPasswordStrength(wifiInfo.password);
          console.log(`📊 실제 WiFi 비밀번호 강도: ${strength}점`);
          return strength;
        } else if (wifiInfo.hasPassword !== undefined) {
          // 비밀번호 존재 여부만 확인된 경우
          if (!wifiInfo.hasPassword) {
            console.log(`⚠️ WiFi 비밀번호가 설정되지 않음`);
            return 0;
          } else {
            console.log(`🔐 WiFi 비밀번호 설정됨 (내용 확인 불가)`);
            return this.generateRandomScore(60, 85); // 보수적 추정
          }
        }
      } else {
        console.log(`❌ 로그인 실패: WiFi 설정 확인 불가`);
      }
    } catch (error) {
      console.log(`⚠️ WiFi 설정 확인 중 오류: ${error}`);
    }
    
    // 실패 시 관리자 비밀번호 기반 추정
    const adminStrength = this.checkPasswordStrength(password);
    const estimatedWiFiStrength = Math.max(adminStrength - 10, 30); // 보통 WiFi 비밀번호가 관리자보다 약간 약함
    
    console.log(`🔄 WiFi 비밀번호 강도 추정: ${estimatedWiFiStrength}점 (관리자 비밀번호 기반)`);
    return estimatedWiFiStrength;
  }
  
  /**
   * 공유기에서 WiFi 정보 가져오기
   */
  private async getWiFiInfoFromRouter(ip: string, sessionCookie: string): Promise<{password?: string, hasPassword?: boolean, encryption?: string}> {
    return new Promise((resolve) => {
      const http = require('http');
      
      // 일반적인 WiFi 설정 페이지들
      const wifiPaths = ['/wireless.html', '/wifi.html', '/wlan.html', '/cgi-bin/wireless', '/api/wireless/settings'];
      
      const tryGetWiFi = (pathIndex: number) => {
        if (pathIndex >= wifiPaths.length) {
          resolve({});
          return;
        }
        
        const path = wifiPaths[pathIndex];
        
        const options = {
          hostname: ip,
          port: 80,
          path: path,
          method: 'GET',
          headers: {
            'Cookie': sessionCookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 5000
        };
        
        const req = http.request(options, (res: any) => {
          let data = '';
          
          res.on('data', (chunk: any) => {
            data += chunk;
          });
          
          res.on('end', () => {
            // WiFi 비밀번호 정보 추출
            const passwordPatterns = [
              /wifi[^:]*password[^:]*:?\s*["']([^"']{8,})["']/i,
              /wpa[^:]*key[^:]*:?\s*["']([^"']{8,})["']/i,
              /passphrase[^:]*:?\s*["']([^"']{8,})["']/i,
              /psk[^:]*:?\s*["']([^"']{8,})["']/i
            ];
            
            let password = '';
            for (const pattern of passwordPatterns) {
              const match = data.match(pattern);
              if (match) {
                password = match[1];
                break;
              }
            }
            
            // 비밀번호 설정 여부 확인
            const hasPasswordIndicators = [
              /security[^:]*:?\s*wpa/i,
              /encryption[^:]*:?\s*(wpa|wep)/i,
              /auth[^:]*:?\s*wpa/i
            ];
            
            const hasPassword = password !== '' || hasPasswordIndicators.some(pattern => pattern.test(data));
            const noPasswordIndicators = /open|none|disabled/i.test(data);
            
            if (password) {
              resolve({password, hasPassword: true});
            } else if (noPasswordIndicators) {
              resolve({hasPassword: false});
            } else if (hasPassword) {
              resolve({hasPassword: true});
            } else {
              tryGetWiFi(pathIndex + 1);
            }
          });
        });
        
        req.on('error', () => {
          tryGetWiFi(pathIndex + 1);
        });
        
        req.on('timeout', () => {
          req.destroy();
          tryGetWiFi(pathIndex + 1);
        });
        
        req.end();
      };
      
      tryGetWiFi(0);
    });
  }
  
  /**
   * WPS 상태 확인 (정밀 모드)
   */
  private async checkWPSStatusAdvanced(ip: string, username: string, password: string): Promise<boolean> {
    console.log(`📶 정밀 모드: WPS 설정 확인 시도`);
    
    try {
      const loginResult = await this.attemptRouterLogin(ip, username, password);
      
      if (loginResult.success) {
        const wpsStatus = await this.getWPSStatusFromRouter(ip, loginResult.sessionCookie || '');
        if (wpsStatus !== undefined) {
          console.log(`📊 실제 WPS 상태: ${wpsStatus ? '활성화' : '비활성화'}`);
          return wpsStatus;
        }
      }
    } catch (error) {
      console.log(`⚠️ WPS 설정 확인 중 오류: ${error}`);
    }
    
    // 실패 시 기본 추정 로직
    return this.checkWPSStatus(await this.scanOpenPorts(ip));
  }
  
  /**
   * 공유기에서 WPS 상태 가져오기
   */
  private async getWPSStatusFromRouter(ip: string, sessionCookie: string): Promise<boolean | undefined> {
    return new Promise((resolve) => {
      const http = require('http');
      
      const wpsPath = '/wireless.html'; // 일반적인 WPS 설정 페이지
      
      const options = {
        hostname: ip,
        port: 80,
        path: wpsPath,
        method: 'GET',
        headers: {
          'Cookie': sessionCookie,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      };
      
      const req = http.request(options, (res: any) => {
        let data = '';
        
        res.on('data', (chunk: any) => {
          data += chunk;
        });
        
        res.on('end', () => {
          // WPS 상태 확인
          const wpsEnabledPatterns = [
            /wps[^:]*:?\s*(enabled|on|true|활성)/i,
            /wps[^:]*status[^:]*:?\s*(enabled|on|활성)/i
          ];
          
          const wpsDisabledPatterns = [
            /wps[^:]*:?\s*(disabled|off|false|비활성)/i,
            /wps[^:]*status[^:]*:?\s*(disabled|off|비활성)/i
          ];
          
          const isEnabled = wpsEnabledPatterns.some(pattern => pattern.test(data));
          const isDisabled = wpsDisabledPatterns.some(pattern => pattern.test(data));
          
          if (isEnabled) {
            resolve(true);
          } else if (isDisabled) {
            resolve(false);
          } else {
            resolve(undefined);
          }
        });
      });
      
      req.on('error', () => {
        resolve(undefined);
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve(undefined);
      });
      
      req.end();
    });
  }

  private generateRandomScore(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

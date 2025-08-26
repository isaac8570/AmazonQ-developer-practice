import { Request, Response } from 'express';
import { DiagnosticService } from '../services/diagnosticService';
import { DiagnosticRequest, ApiResponse } from '../types';
import { AppError } from '../middleware/errorHandler';

const diagnosticService = new DiagnosticService();

/**
 * IoT 기기 진단 시작
 */
export const startDiagnostic = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📥 진단 요청 받음:', JSON.stringify(req.body, null, 2));
    
    // 요청 본문이 비어있는지 확인
    if (!req.body) {
      console.log('❌ 요청 본문이 비어있음');
      throw new AppError('요청 데이터가 없습니다. 네트워크 연결을 확인해주세요.', 400);
    }

    const { deviceInfo }: DiagnosticRequest = req.body;
    console.log('🔍 추출된 deviceInfo:', JSON.stringify(deviceInfo, null, 2));

    // deviceInfo 객체 자체가 없는 경우
    if (!deviceInfo) {
      console.log('❌ deviceInfo 객체가 없음');
      throw new AppError('기기 정보 객체가 누락되었습니다. 클라이언트 오류일 수 있습니다.', 400);
    }

    // IP 주소가 없는 경우
    if (!deviceInfo.ip) {
      console.log('❌ IP 주소가 없음');
      throw new AppError('IP 주소를 입력해주세요. (예: 192.168.1.1)', 400);
    }

    // IP 주소가 빈 문자열인 경우
    if (deviceInfo.ip.trim() === '') {
      console.log('❌ IP 주소가 빈 문자열');
      throw new AppError('IP 주소를 입력해주세요. 공백만 입력할 수 없습니다.', 400);
    }

    // username과 password는 선택사항 (기본 진단 모드에서는 빈 문자열 허용)
    if (deviceInfo.username === undefined) deviceInfo.username = '';
    if (deviceInfo.password === undefined) deviceInfo.password = '';

    console.log('✅ 검증 통과, 진단 시작:', deviceInfo.ip);

    // IP 주소 형식 검증
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(deviceInfo.ip)) {
      throw new AppError('올바른 IP 주소 형식이 아닙니다.', 400);
    }

    // 정밀 모드 판단: username과 password가 모두 입력되었는지 확인
    const isAdvancedMode = !!(deviceInfo.username && deviceInfo.username.trim() !== '' && 
                             deviceInfo.password && deviceInfo.password.trim() !== '');
    
    console.log(`🔍 진단 모드: ${isAdvancedMode ? '정밀 건강검진' : '기본 건강검진'}`);
    if (isAdvancedMode) {
      console.log(`👤 입력된 계정: ${deviceInfo.username}/${deviceInfo.password}`);
    }

    // 진단 수행
    const result = await diagnosticService.performDiagnostic(deviceInfo, isAdvancedMode);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: '진단이 성공적으로 완료되었습니다.',
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('진단 중 오류가 발생했습니다.', 500);
  }
};

/**
 * 진단 상태 확인 (향후 비동기 처리용)
 */
export const getDiagnosticStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    // 실제로는 Redis나 DB에서 세션 상태 조회
    const mockStatus = {
      sessionId,
      status: 'completed',
      progress: 100,
      message: '진단이 완료되었습니다.'
    };

    const response: ApiResponse = {
      success: true,
      data: mockStatus,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    throw new AppError('진단 상태 조회 중 오류가 발생했습니다.', 500);
  }
};

/**
 * 지원되는 기기 목록 조회
 */
export const getSupportedDevices = async (req: Request, res: Response): Promise<void> => {
  try {
    const supportedDevices = [
      {
        manufacturer: 'TP-Link',
        models: ['Archer C7', 'Archer C9', 'Archer AX50'],
        category: 'router'
      },
      {
        manufacturer: 'ASUS',
        models: ['RT-AC68U', 'RT-AX88U', 'RT-AC86U'],
        category: 'router'
      },
      {
        manufacturer: 'Netgear',
        models: ['R7000', 'R8000', 'AX12'],
        category: 'router'
      },
      {
        manufacturer: 'Linksys',
        models: ['WRT3200ACM', 'EA7500', 'MR9000'],
        category: 'router'
      }
    ];

    const response: ApiResponse = {
      success: true,
      data: supportedDevices,
      message: '지원되는 기기 목록입니다.',
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    throw new AppError('지원 기기 목록 조회 중 오류가 발생했습니다.', 500);
  }
};

/**
 * 보안 팁 조회
 */
export const getSecurityTips = async (req: Request, res: Response): Promise<void> => {
  try {
    const securityTips = [
      {
        category: 'password',
        title: '강력한 비밀번호 사용',
        description: '8자 이상, 대소문자, 숫자, 특수문자를 포함한 복잡한 비밀번호를 사용하세요.',
        priority: 'high'
      },
      {
        category: 'firmware',
        title: '정기적인 펌웨어 업데이트',
        description: '제조사에서 제공하는 최신 펌웨어로 정기적으로 업데이트하세요.',
        priority: 'high'
      },
      {
        category: 'network',
        title: 'WPS 기능 비활성화',
        description: 'WPS(Wi-Fi Protected Setup) 기능은 보안 취약점이 있으므로 비활성화하세요.',
        priority: 'medium'
      },
      {
        category: 'access',
        title: '원격 관리 기능 제한',
        description: '불필요한 원격 관리 기능을 비활성화하고, 필요시에만 활성화하세요.',
        priority: 'medium'
      },
      {
        category: 'monitoring',
        title: '정기적인 보안 점검',
        description: '3개월마다 정기적으로 보안 상태를 점검하여 안전을 유지하세요.',
        priority: 'low'
      }
    ];

    const response: ApiResponse = {
      success: true,
      data: securityTips,
      message: 'IoT 기기 보안 팁입니다.',
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);
  } catch (error) {
    throw new AppError('보안 팁 조회 중 오류가 발생했습니다.', 500);
  }
};

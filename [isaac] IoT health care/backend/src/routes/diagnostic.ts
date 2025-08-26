import { Router } from 'express';
import { 
  startDiagnostic, 
  getDiagnosticStatus, 
  getSupportedDevices, 
  getSecurityTips 
} from '../controllers/diagnosticController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * @route   POST /api/diagnostic/start
 * @desc    IoT 기기 보안 진단 시작
 * @access  Public
 */
router.post('/start', asyncHandler(startDiagnostic));

/**
 * @route   GET /api/diagnostic/status/:sessionId
 * @desc    진단 상태 확인
 * @access  Public
 */
router.get('/status/:sessionId', asyncHandler(getDiagnosticStatus));

/**
 * @route   GET /api/diagnostic/devices
 * @desc    지원되는 기기 목록 조회
 * @access  Public
 */
router.get('/devices', asyncHandler(getSupportedDevices));

/**
 * @route   GET /api/diagnostic/tips
 * @desc    보안 팁 조회
 * @access  Public
 */
router.get('/tips', asyncHandler(getSecurityTips));

export default router;

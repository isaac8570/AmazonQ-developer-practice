import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import diagnosticRoutes from './routes/diagnostic';
import { errorHandler } from './middleware/errorHandler';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 기본 보안 헤더 설정 (helmet 대신)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined')); // 로깅
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/api/diagnostic', diagnosticRoutes);

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'IoT Health Care API',
    version: '1.0.0'
  });
});

// 루트 엔드포인트
app.get('/', (req, res) => {
  res.json({
    message: '🏥 IoT Health Care API Server',
    description: 'IoT 기기 보안 진단 서비스 API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      diagnostic: '/api/diagnostic'
    }
  });
});

// 에러 핸들링 미들웨어
app.use(errorHandler);

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🏥 IoT Health Care API Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 API Documentation: http://localhost:${PORT}/`);
});

export default app;

import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    API 서버 상태 확인
 * @access  Public
 */
router.get('/', async (_req, res) => {
  try {
    // 데이터베이스 연결 상태 확인
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // 메모리 사용량 확인
    const memoryUsage = process.memoryUsage();
    
    // 시간대 정보 확인
    const now = new Date();
    const timezoneInfo = {
      envTimezone: process.env.TZ || 'Not Set',
      systemTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currentTime: now.toISOString(),
      utcTime: now.toUTCString(),
      koreaTime: now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
      timezoneOffset: now.getTimezoneOffset(),
      isKoreanTime: now.getTimezoneOffset() === -540 && 
                   (process.env.TZ === 'Asia/Seoul' || 
                    Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Seoul'),
    };
    
    // 응답
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
      },
      server: {
        uptime: process.uptime(),
        memoryUsage: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        },
        version: process.version,
      },
      timezone: timezoneInfo,
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
});

export default router; 
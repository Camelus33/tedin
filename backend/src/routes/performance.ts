import express from 'express';
import PerformanceMonitor from '../middlewares/performanceMonitor';
import { authenticate } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = express.Router();
const performanceMonitor = PerformanceMonitor.getInstance();

// 성능 모니터링 미들웨어 적용
router.use(performanceMonitor.monitor());

// 관리자만 접근 가능한 성능 통계 조회
router.get('/stats', authenticate, isAdmin, (req, res) => {
  try {
    const stats = performanceMonitor.getPerformanceStats();
    res.status(200).json({
      message: '성능 통계 조회 성공',
      data: stats,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('성능 통계 조회 중 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 메트릭 초기화 (관리자만)
router.delete('/metrics', authenticate, isAdmin, (req, res) => {
  try {
    performanceMonitor.clearMetrics();
    res.status(200).json({
      message: '성능 메트릭이 초기화되었습니다.',
      timestamp: new Date()
    });
  } catch (error) {
    console.error('메트릭 초기화 중 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router; 
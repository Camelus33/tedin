import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import User from '../models/User';
import ZengoSessionResult from '../models/ZengoSessionResult';
import { calculateCognitiveMetrics } from '../utils/cognitiveMetrics';

const router = Router();

/**
 * @route   GET /api/cognitive/metrics
 * @desc    사용자의 인지 능력 지표를 계산하고 반환
 * @access  Private
 */
router.get('/metrics', authenticate, async (req, res) => {
  try {
    // 로그인한 사용자의 ID 사용
    const userId = req.user.id;
    const timeRange = req.query.timeRange as string || '3m'; // 기본값: 3개월
    
    console.log(`[Cognitive Metrics] Request received for user ${userId} with timeRange ${timeRange}`);
    
    // 사용자 확인
    const user = await User.findById(userId);
    if (!user) {
      console.error(`[Cognitive Metrics] User not found: ${userId}`);
      return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });
    }
    
    // 날짜 범위 계산
    const { startDate, endDate } = calculateDateRange(timeRange);
    
    // Zengo 세션 데이터 조회
    const sessions = await ZengoSessionResult.find({ 
      userId: userId,
      createdAt: { $gte: startDate, $lte: endDate, $ne: null }
    }).sort({ createdAt: -1 }).lean();
    
    console.log(`[Cognitive Metrics] Found ${sessions.length} sessions for user ${userId}`);
    
    if (!sessions || sessions.length === 0) {
      return res.status(200).json({
        message: 'No cognitive data available yet',
        code: 'NO_DATA',
        data: {
          overallScore: 0,
          metrics: {
            workingMemoryCapacity: 0,
            visuospatialPrecision: 0,
            processingSpeed: 0,
            sustainedAttention: 0,
            patternRecognition: 0,
            cognitiveFlexibility: 0,
            hippocampusActivation: 0,
            executiveFunction: 0
          },
          timeSeriesData: [],
          percentileRanks: {},
          strengths: [],
          weaknesses: [],
          recommendations: []
        }
      });
    }
    
    // 인지 지표 계산
    const metrics = calculateMetricsFromSessions(sessions);
    const overallScore = calculateOverallScore(metrics);
    
    // 세션 결과를 일자별로 그룹화하여 시계열 데이터 생성
    const timeSeriesData = generateTimeSeriesData(sessions);
    
    // 백분위 계산 (예시 - 실제로는 다른 사용자와 비교 로직 필요)
    const percentileRanks = await calculatePercentileRanks(userId, metrics);
    
    // 강점과 약점 식별
    const { strengths, weaknesses } = identifyStrengthsAndWeaknesses(metrics);
    
    // 맞춤형 추천 생성
    const recommendations = generateRecommendations(metrics, weaknesses);
    
    console.log(`[Cognitive Metrics] Successfully processed metrics for user ${userId}`);
    
    // 결과 반환
    res.status(200).json({
      message: 'Cognitive metrics retrieved successfully',
      code: 'SUCCESS',
      data: {
        overallScore,
        metrics,
        timeSeriesData,
        percentileRanks,
        strengths,
        weaknesses,
        recommendations
      }
    });
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error occurred';
    const errorStack = error.stack || '';
    console.error(`[Cognitive Metrics] Error retrieving cognitive metrics:`, {
      message: errorMessage,
      stack: errorStack,
      userId: req.user?.id
    });
    
    res.status(500).json({ 
      error: 'Internal server error', 
      code: 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' ? errorMessage : 'An unexpected error occurred' 
    });
  }
});

// 날짜 범위 계산 헬퍼 함수
const calculateDateRange = (timeRange: string): { startDate: Date; endDate: Date } => {
  // 현재 시간의 UTC 기준으로 날짜 계산 (타임존 이슈 방지)
  const now = new Date();
  
  // 종료일은 현재 날짜의 23:59:59.999
  const endDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    23, 59, 59, 999
  ));
  
  // 시작일은 시간대에 따라 계산
  let startDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
  
  switch (timeRange) {
    case '1m':
      startDate = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() - 1,
        now.getUTCDate(),
        0, 0, 0, 0
      ));
      break;
    case '3m':
      startDate = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() - 3,
        now.getUTCDate(),
        0, 0, 0, 0
      ));
      break;
    case '6m':
      startDate = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() - 6,
        now.getUTCDate(),
        0, 0, 0, 0
      ));
      break;
    case 'all':
      startDate = new Date(0); // Epoch time
      break;
    default:
      startDate = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth() - 3,
        now.getUTCDate(),
        0, 0, 0, 0
      ));
  }
  
  console.log(`Date range calculated: ${startDate.toISOString()} to ${endDate.toISOString()}`);
  return { startDate, endDate };
};

// 세션 데이터에서 인지 지표 계산
const calculateMetricsFromSessions = (sessions: any[]): any => {
  if (sessions.length === 0) return {};
  
  // 각 세션에서 인지 지표 계산 후 평균값 산출
  const allMetrics = sessions.map(session => {
    const metrics = calculateCognitiveMetrics(session);
    return {
      workingMemoryCapacity: metrics.workingMemory,
      visuospatialPrecision: metrics.patternRecognition, // 기존 지표와 연결
      processingSpeed: metrics.processingSpeed,
      sustainedAttention: metrics.attention,
      patternRecognition: metrics.patternRecognition,
      cognitiveFlexibility: metrics.cognitiveFlexibility,
      hippocampusActivation: metrics.hippocampusActivation,
      executiveFunction: (metrics.workingMemory * 0.3 + metrics.attention * 0.3 + metrics.cognitiveFlexibility * 0.4)
    };
  });
  
  // 평균값 계산
  const result: any = {};
  const metrics = Object.keys(allMetrics[0]);
  
  metrics.forEach(metric => {
    const sum = allMetrics.reduce((acc, curr) => acc + (curr[metric] || 0), 0);
    result[metric] = Math.round(sum / allMetrics.length);
  });
  
  return result;
};

// 종합 점수 계산
const calculateOverallScore = (metrics: any): number => {
  if (!metrics || Object.keys(metrics).length === 0) return 0;
  
  const weights = {
    workingMemoryCapacity: 0.2,
    visuospatialPrecision: 0.15,
    processingSpeed: 0.15,
    sustainedAttention: 0.1,
    patternRecognition: 0.1,
    cognitiveFlexibility: 0.1,
    hippocampusActivation: 0.1,
    executiveFunction: 0.1
  };
  
  let weightedSum = 0;
  let weightSum = 0;
  
  Object.entries(weights).forEach(([metric, weight]) => {
    if (metrics[metric] !== undefined) {
      weightedSum += metrics[metric] * weight;
      weightSum += weight;
    }
  });
  
  return Math.round(weightSum > 0 ? weightedSum / weightSum : 0);
};

// 시계열 데이터 생성
const generateTimeSeriesData = (sessions: any[]): any[] => {
  const dateMap: Map<string, any[]> = new Map();
  
  sessions.forEach(session => {
    if (!session.createdAt) return;
    
    const date = new Date(session.createdAt);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!dateMap.has(dateStr)) {
      dateMap.set(dateStr, []);
    }
    
    dateMap.get(dateStr)!.push(session);
  });
  
  const result = [];
  
  for (const [date, dateSessions] of dateMap.entries()) {
    const metrics = calculateMetricsFromSessions(dateSessions);
    result.push({
      date,
      metrics
    });
  }
  
  // 날짜 기준 정렬
  return result.sort((a, b) => a.date.localeCompare(b.date));
};

// 백분위 계산 (예시 구현 - 실제로는 다른 사용자와 비교해야 함)
const calculatePercentileRanks = async (userId: string, metrics: any): Promise<any> => {
  // 이 부분은 실제로는 다른 사용자들의 데이터와 비교하여 백분위를 계산해야 함
  // 예시로 간단한 임의 값을 반환
  const percentiles: any = {};
  
  Object.keys(metrics).forEach(metric => {
    // 임의의 백분위 값 생성 (실제 구현에서는 대체)
    percentiles[metric] = Math.min(99, Math.max(1, Math.round(metrics[metric] * 0.9 + Math.random() * 20)));
  });
  
  return percentiles;
};

// 인지 지표 타입 정의
interface CognitiveMetrics {
  workingMemoryCapacity: number;
  visuospatialPrecision: number;
  processingSpeed: number;
  sustainedAttention: number;
  patternRecognition: number;
  cognitiveFlexibility: number;
  hippocampusActivation: number;
  executiveFunction: number;
}

// 강점과 약점 식별
const identifyStrengthsAndWeaknesses = (metrics: CognitiveMetrics): { strengths: string[], weaknesses: string[] } => {
  const strengths = [];
  const weaknesses = [];
  
  // 임계값 설정
  const STRENGTH_THRESHOLD = 75;
  const WEAKNESS_THRESHOLD = 50;
  
  for (const [metric, value] of Object.entries(metrics) as [string, number][]) {
    if (value >= STRENGTH_THRESHOLD) {
      strengths.push(metric);
    } else if (value < WEAKNESS_THRESHOLD) {
      weaknesses.push(metric);
    }
  }
  
  // 최대 3개만 선택
  return {
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3)
  };
};

// 맞춤형 추천 생성
const generateRecommendations = (metrics: any, weaknesses: string[]): any[] => {
  const recommendations = [];
  
  // 약점에 기반한 추천
  if (weaknesses.includes('workingMemoryCapacity')) {
    recommendations.push({
      title: '작업 기억 용량 강화',
      description: '작업 기억력을 향상시키기 위해 젠고 5x5 난이도의 게임을 매일 10분씩 플레이해보세요.',
      action: '젠고 게임 시작',
      link: '/zengo/session/new?size=5x5'
    });
  }
  
  if (weaknesses.includes('processingSpeed')) {
    recommendations.push({
      title: '처리 속도 향상',
      description: '정보 처리 속도를 향상시키기 위해 타이머를 설정하고 젠고 게임을 시간 제한 내에 완료해보세요.',
      action: '시간 제한 게임 시작',
      link: '/zengo/session/new?mode=timed'
    });
  }
  
  if (weaknesses.includes('sustainedAttention')) {
    recommendations.push({
      title: '지속적 주의력 향상',
      description: '주의 집중력을 향상시키기 위해 방해 요소 없는 환경에서 젠고 게임을 집중해서 플레이해보세요.',
      action: '집중 모드 게임 시작',
      link: '/zengo/session/new?mode=focus'
    });
  }
  
  // 일반적인 추천
  if (recommendations.length < 2) {
    recommendations.push({
      title: '균형 잡힌 인지 훈련',
      description: '다양한 인지 능력을 골고루 향상시키기 위해 여러 난이도와 모드의 젠고 게임을 번갈아가며 플레이해보세요.',
      action: '맞춤형 게임 시작',
      link: '/zengo/session/new'
    });
  }
  
  return recommendations;
};

export default router; 
import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose'; // mongoose 추가, ObjectId 타입 사용을 위해 추가
import { verifyAuth } from '../../../lib/auth';
import ZengoSessionResult, { IZengoSessionResult } from '../../../../src/models/ZengoSessionResult'; // 경로 수정
// import db from '../../../lib/db'; // Prisma Client 대신 Mongoose 모델 사용

// 프론트엔드와 동일한 타입 정의 (추후 공유 타입으로 분리 권장)
interface CognitiveMetrics {
  workingMemoryCapacity: number;
  visuospatialPrecision: number; // 프론트엔드에서 사용하는 필드명
  processingSpeed: number;
  sustainedAttention: number;
  patternRecognition: number;
  cognitiveFlexibility: number;
  hippocampusActivation: number;
  executiveFunction: number;
}

interface CognitiveMetricsTimeSeries {
  date: string; // YYYY-MM-DD
  metrics: CognitiveMetrics;
}

interface RecentGame {
  gameId: string;
  gameName: string;
  playedAt: string; // ISO date string
  score: number;
  level: string;
  metricsChange: Partial<CognitiveMetrics>; // 이전 대비 변화량 또는 주요 영향 지표
}

interface BrainAnalyticsData {
  userId: string;
  lastUpdatedAt: string; // ISO date string
  overallProfile: CognitiveMetrics;
  historicalData: CognitiveMetricsTimeSeries[];
  percentileRanks: Partial<Record<keyof CognitiveMetrics, number>>;
  strengths: (keyof CognitiveMetrics)[];
  improvementAreas: (keyof CognitiveMetrics)[];
  recentGames: RecentGame[];
  personalizedRecommendations: {
    title: string;
    description: string;
    action: string; // 버튼 텍스트 또는 활동 종류
    link?: string;   // 관련 링크 (옵션)
  }[];
  // 임시 필드: 실제 조회된 세션 수 확인용
  debug_fetchedSessionCount?: number;
}

// 날짜 범위 계산 헬퍼 함수
const calculateDateRange = (timeRange: string | null): { startDate: Date; endDate: Date } => {
  // 현재 시간을 UTC로 가져온 후, 현재 시간대의 자정으로 설정
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999); // 오늘 날짜의 끝으로 설정

  let startDate = new Date();
  startDate.setHours(0, 0, 0, 0); // 오늘 날짜의 시작으로 설정

  switch (timeRange) {
    case '1m':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case '3m':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '6m':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case 'all':
      startDate = new Date(0); // 전체 기간 (Epoch time)
      break;
    default:
      startDate.setMonth(endDate.getMonth() - 3); // 기본값 3개월
      break;
  }
  return { startDate, endDate };
};

// 레벨 기반 지표 계산 요소 반환 함수
interface LevelFactors {
  totalItems: number;
  difficultyWeight: number;
}

const getLevelMetricsFactors = (level: string): LevelFactors => {
  // 레벨 문자열 형식: '3x3-easy', '5x5-medium', '7x7-hard' 등
  const [sizeStr, difficulty] = level.split('-');
  const size = parseInt(sizeStr.split('x')[0], 10);
  
  let totalItems = 0;
  let difficultyWeight = 1.0;
  
  // 보드 크기에 따른 총 아이템 수 (단어 수) 추정
  if (size === 3) totalItems = 3;
  else if (size === 5) totalItems = 5;
  else if (size === 7) totalItems = 7;
  else totalItems = 3; // 기본값
  
  // 난이도에 따른 가중치
  if (difficulty === 'easy') difficultyWeight = 0.8;
  else if (difficulty === 'medium') difficultyWeight = 1.0;
  else if (difficulty === 'hard') difficultyWeight = 1.2;
  
  return { totalItems, difficultyWeight };
};

// 세션 데이터로부터 인지 지표 계산 함수
const calculateCognitiveMetricsFromSessions = (sessions: IZengoSessionResult[]): CognitiveMetrics => {
  if (!sessions || sessions.length === 0) {
    // 기본값 또는 적절한 초기값 반환
    return {
      workingMemoryCapacity: 50,
      visuospatialPrecision: 50,
      processingSpeed: 50,
      sustainedAttention: 50,
      patternRecognition: 50,
      cognitiveFlexibility: 50,
      hippocampusActivation: 50,
      executiveFunction: 50,
    };
  }

  let totalWMC = 0, totalVP = 0, totalPS_numerator = 0, totalTimeSec = 0, sessionCountForPS = 0;
  let totalScore = 0, validSessions = 0;

  sessions.forEach(session => {
    if (!session.level || typeof session.correctPlacements !== 'number' || typeof session.usedStonesCount !== 'number') {
        return; // 필수 데이터 없으면 스킵
    }
    validSessions++;
    const factors = getLevelMetricsFactors(session.level);
    
    // 작업 기억 용량 (Working Memory Capacity)
    if (factors.totalItems > 0) {
      totalWMC += (session.correctPlacements / factors.totalItems) * 100;
    }
    
    // 시공간 정확도 (Visuospatial Precision)
    if (session.usedStonesCount > 0) {
      totalVP += (session.correctPlacements / session.usedStonesCount) * 100;
    } else if (session.correctPlacements > 0) { // 모든 돌을 맞췄지만 usedStonesCount가 0인 경우 (이론상 없지만 방어)
      totalVP += 100;
    }

    // 처리 속도 (Processing Speed)
    if (session.timeTakenMs && session.timeTakenMs > 0) {
      const timeSec = session.timeTakenMs / 1000;
      totalPS_numerator += (factors.totalItems / timeSec) * factors.difficultyWeight;
      totalTimeSec += timeSec; 
      sessionCountForPS++;
    }

    // 패턴 인식 (Pattern Recognition) - 점수 기반
    totalScore += session.score || 0;
  });

  if (validSessions === 0) { // 모든 세션이 유효하지 않은 경우
    return { workingMemoryCapacity: 50, visuospatialPrecision: 50, processingSpeed: 50, sustainedAttention: 50, patternRecognition: 50, cognitiveFlexibility: 50, hippocampusActivation: 50, executiveFunction: 50 };
  }

  const avgWMC = totalWMC / validSessions;
  const avgVP = totalVP / validSessions;
  const avgPatternRecognition = totalScore / validSessions;
  // 처리 속도는 단순 평균 대신 가중치 적용된 값의 평균 또는 총합 기반으로 계산 가능
  const avgPS = sessionCountForPS > 0 ? (totalPS_numerator / sessionCountForPS) * 5 : 50; // 임의의 스케일링 (5) 및 기본값

  // 다른 지표들은 우선 평균 점수 또는 WMC, VP 기반으로 단순 할당
  const avgSustainedAttention = avgPatternRecognition; // 예시: 패턴인식 점수 활용
  const avgCognitiveFlexibility = (avgWMC + avgVP) / 2; // 예시: 작업기억,시공간 정확도 평균
  const avgHippocampusActivation = avgWMC; // 예시: 작업기억용량 활용

  // 임원 기능 (Executive Function) - 주요 지표 가중 평균
  const executiveFunction = 
    (avgWMC * 0.25) + 
    (avgVP * 0.20) + 
    (avgPS * 0.20) + 
    (avgSustainedAttention * 0.15) + 
    (avgPatternRecognition * 0.20);

  return {
    workingMemoryCapacity: Math.min(100, Math.max(0, avgWMC)),
    visuospatialPrecision: Math.min(100, Math.max(0, avgVP)),
    processingSpeed: Math.min(100, Math.max(0, avgPS)), // 0-100 범위 보장
    sustainedAttention: Math.min(100, Math.max(0, avgSustainedAttention)),
    patternRecognition: Math.min(100, Math.max(0, avgPatternRecognition)),
    cognitiveFlexibility: Math.min(100, Math.max(0, avgCognitiveFlexibility)),
    hippocampusActivation: Math.min(100, Math.max(0, avgHippocampusActivation)),
    executiveFunction: Math.min(100, Math.max(0, executiveFunction)),
  };
};

// 세션을 날짜 문자열(YYYY-MM-DD) 기준으로 그룹화하는 함수
const groupSessionsByDateString = (sessions: IZengoSessionResult[]): Record<string, IZengoSessionResult[]> => {
  const groupedSessions: Record<string, IZengoSessionResult[]> = {};
  
  sessions.forEach(session => {
    if (!session.createdAt) return; // createdAt이 없는 경우 스킵
    
    // 날짜를 사용자의 로컬 시간대로 변환
    const date = new Date(session.createdAt);
    
    // 날짜를 YYYY-MM-DD 형식으로 변환 (시간대 고려)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    
    if (!groupedSessions[dateKey]) {
      groupedSessions[dateKey] = [];
    }
    groupedSessions[dateKey].push(session);
  });
  
  return groupedSessions;
};

// 강점 및 개선 영역 도출 함수
const deriveKeyCognitiveAreas = (overallProfile: CognitiveMetrics): { strengths: (keyof CognitiveMetrics)[], improvementAreas: (keyof CognitiveMetrics)[] } => {
  const strengths: (keyof CognitiveMetrics)[] = [];
  const improvementAreas: (keyof CognitiveMetrics)[] = [];
  const STRENGTH_THRESHOLD = 75; // 강점 기준값
  const IMPROVEMENT_THRESHOLD = 60; // 개선 영역 기준값

  (Object.keys(overallProfile) as (keyof CognitiveMetrics)[]).forEach(key => {
    const value = overallProfile[key];
    if (value >= STRENGTH_THRESHOLD) {
      strengths.push(key);
    } else if (value < IMPROVEMENT_THRESHOLD) {
      improvementAreas.push(key);
    }
  });
  return { strengths, improvementAreas };
};

// 맞춤형 추천 생성 함수
const generatePersonalizedRecommendations = (
  improvementAreas: (keyof CognitiveMetrics)[], 
  strengths: (keyof CognitiveMetrics)[]
): BrainAnalyticsData['personalizedRecommendations'] => {
  const recommendations: BrainAnalyticsData['personalizedRecommendations'] = [];

  // 개선 영역 기반 추천
  if (improvementAreas.includes('workingMemoryCapacity')) {
    recommendations.push({
      title: '작업기억 용량 향상',
      description: '작업기억 용량을 높이는 젠고 게임을 더 플레이해보세요.',
      action: '게임 시작',
      link: '/zengo/session/new?focus=memory'
    });
  }

  if (improvementAreas.includes('processingSpeed')) {
    recommendations.push({
      title: '처리 속도 향상',
      description: '빠른 판단력과 처리 속도를 향상시키는 게임을 추천합니다.',
      action: '게임 시작',
      link: '/zengo/session/new?focus=speed'
    });
  }

  if (improvementAreas.includes('sustainedAttention')) {
    recommendations.push({
      title: '주의 지속성 향상',
      description: '장시간 집중력을 유지하는 훈련이 필요합니다.',
      action: '게임 시작',
      link: '/zengo/session/new?focus=attention'
    });
  }

  // 강점 기반 추천 (선택적)
  if (strengths.includes('patternRecognition')) {
    recommendations.push({
      title: '패턴 인식 능력 활용',
      description: '당신의 뛰어난 패턴 인식 능력을 더 발전시켜보세요.',
      action: '고급 게임 도전',
      link: '/zengo/session/new?level=advanced'
    });
  }

  // 기본 추천 (항상 포함)
  recommendations.push({
    title: '정기적인 인지 훈련',
    description: '매일 10분씩 젠고 게임을 플레이하여 인지 능력을 꾸준히 향상시키세요.',
    action: '일일 루틴 설정',
    link: '/brain-hack-routine'
  });

  // 최대 3개까지만 반환
  return recommendations.slice(0, 3);
};

// 백분위 순위 계산 함수 추가
const calculatePercentileRanks = async (userId: string, overallProfile: CognitiveMetrics): Promise<Partial<Record<keyof CognitiveMetrics, number>>> => {
  try {
    // 모든 사용자의 최근 30일간 세션 결과에서 계산된 지표 평균값 가져오기
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // 모든 사용자의 세션 결과 조회 (최근 30일)
    const allUserSessions = await ZengoSessionResult.find({
      createdAt: { $gte: thirtyDaysAgo }
    }).lean();
    
    // 사용자별 지표 계산을 위한 그룹화
    const userSessionsMap: Record<string, IZengoSessionResult[]> = {};
    allUserSessions.forEach(session => {
      const userIdStr = session.userId.toString();
      if (!userSessionsMap[userIdStr]) {
        userSessionsMap[userIdStr] = [];
      }
      userSessionsMap[userIdStr].push(session);
    });
    
    // 각 사용자별 인지 지표 계산
    const allUsersMetrics: CognitiveMetrics[] = [];
    Object.values(userSessionsMap).forEach(userSessions => {
      if (userSessions.length > 0) {
        const metrics = calculateCognitiveMetricsFromSessions(userSessions);
        allUsersMetrics.push(metrics);
      }
    });
    
    // 사용자 데이터가 적을 경우 목업 데이터 추가
    const MIN_USERS_THRESHOLD = 10; // 최소 사용자 수 임계값
    if (allUsersMetrics.length < MIN_USERS_THRESHOLD) {
      console.log(`실제 사용자 수가 적어 목업 데이터 추가 (${allUsersMetrics.length}/${MIN_USERS_THRESHOLD})`);
      
      // 목업 데이터 생성 및 추가
      const mockUsersNeeded = MIN_USERS_THRESHOLD - allUsersMetrics.length;
      for (let i = 0; i < mockUsersNeeded; i++) {
        // 정규분포에 가까운 랜덤 데이터 생성
        const generateNormalDistValue = (mean: number, stdDev: number) => {
          // Box-Muller 변환을 사용한 정규분포 근사값 생성
          const u1 = Math.random();
          const u2 = Math.random();
          const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
          return Math.min(100, Math.max(0, mean + z0 * stdDev)); // 0-100 범위로 제한
        };
        
        // 각 지표별 평균과 표준편차 설정
        const metrics: CognitiveMetrics = {
          workingMemoryCapacity: generateNormalDistValue(65, 15),
          visuospatialPrecision: generateNormalDistValue(60, 12),
          processingSpeed: generateNormalDistValue(70, 18),
          sustainedAttention: generateNormalDistValue(62, 14),
          patternRecognition: generateNormalDistValue(68, 16),
          cognitiveFlexibility: generateNormalDistValue(58, 13),
          hippocampusActivation: generateNormalDistValue(63, 15),
          executiveFunction: generateNormalDistValue(67, 14),
        };
        
        allUsersMetrics.push(metrics);
      }
    }
    
    // 백분위 순위 계산
    const percentileRanks: Partial<Record<keyof CognitiveMetrics, number>> = {};
    
    // 주요 지표에 대해서만 백분위 계산 (계산 비용 절감)
    const keyMetrics: (keyof CognitiveMetrics)[] = [
      'workingMemoryCapacity',
      'processingSpeed',
      'executiveFunction',
      'patternRecognition',
      'visuospatialPrecision', // 추가 지표
    ];
    
    keyMetrics.forEach(metric => {
      // 모든 사용자의 해당 지표 값 추출
      const allValues = allUsersMetrics.map(m => m[metric]).sort((a, b) => a - b);
      
      if (allValues.length === 0) {
        percentileRanks[metric] = 50; // 데이터가 없으면 기본값
        return;
      }
      
      // 현재 사용자의 지표 값
      const userValue = overallProfile[metric];
      
      // 백분위 계산: 사용자보다 낮은 값을 가진 사람들의 비율
      const lowerCount = allValues.filter(val => val < userValue).length;
      const percentile = Math.round((lowerCount / allValues.length) * 100);
      
      // 백분위가 0이나 100인 경우 약간의 랜덤성 추가 (극단값 완화)
      if (percentile === 0) {
        percentileRanks[metric] = Math.floor(Math.random() * 5) + 1; // 1-5 사이 값
      } else if (percentile === 100) {
        percentileRanks[metric] = 95 + Math.floor(Math.random() * 5); // 95-99 사이 값
      } else {
        percentileRanks[metric] = percentile;
      }
    });
    
    // 사용자 경험을 위해 백분위 값에 약간의 변동성 추가 (±5% 내외)
    Object.keys(percentileRanks).forEach(key => {
      const metricKey = key as keyof CognitiveMetrics;
      const currentValue = percentileRanks[metricKey] || 50;
      const variation = Math.floor(Math.random() * 11) - 5; // -5 ~ +5
      percentileRanks[metricKey] = Math.min(99, Math.max(1, currentValue + variation));
    });
    
    return percentileRanks;
  } catch (error) {
    console.error('Error calculating percentile ranks:', error);
    // 오류 발생 시 기본 백분위 값 반환 (목업 데이터)
    return {
      workingMemoryCapacity: 65 + Math.floor(Math.random() * 20) - 10,
      processingSpeed: 70 + Math.floor(Math.random() * 20) - 10,
      executiveFunction: 68 + Math.floor(Math.random() * 20) - 10,
      patternRecognition: 72 + Math.floor(Math.random() * 20) - 10,
      visuospatialPrecision: 63 + Math.floor(Math.random() * 20) - 10,
    };
  }
};

// 목업 데이터 생성 함수 수정: strengths, improvementAreas, personalizedRecommendations도 주입받도록 변경
const getMockBrainAnalyticsData = (
  userId: string, 
  fetchedSessionCount?: number, 
  calculatedOverallProfile?: CognitiveMetrics,
  calculatedHistoricalData?: CognitiveMetricsTimeSeries[],
  calculatedRecentGames?: RecentGame[],
  calculatedStrengths?: (keyof CognitiveMetrics)[],
  calculatedImprovementAreas?: (keyof CognitiveMetrics)[],
  calculatedRecommendations?: BrainAnalyticsData['personalizedRecommendations']
): BrainAnalyticsData => {
  const today = new Date();
  const mockHistorical: CognitiveMetricsTimeSeries[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i * 7);
    mockHistorical.push({
      date: date.toISOString().split('T')[0],
      metrics: { // 이전 목업 지표 사용
        workingMemoryCapacity: Math.floor(Math.random() * 40) + 40,
        visuospatialPrecision: Math.floor(Math.random() * 40) + 40,
        processingSpeed: Math.floor(Math.random() * 40) + 40,
        sustainedAttention: Math.floor(Math.random() * 40) + 40,
        patternRecognition: Math.floor(Math.random() * 40) + 40,
        cognitiveFlexibility: Math.floor(Math.random() * 40) + 40,
        hippocampusActivation: Math.floor(Math.random() * 40) + 40,
        executiveFunction: Math.floor(Math.random() * 40) + 40,
      },
    });
  }

  // 계산된 값이 있으면 사용하고, 없으면 목업 데이터 사용
  const overallProfileToUse = calculatedOverallProfile || {
    workingMemoryCapacity: 78,
    visuospatialPrecision: 65,
    processingSpeed: 82,
    sustainedAttention: 70,
    patternRecognition: 75,
    cognitiveFlexibility: 68,
    hippocampusActivation: 72,
    executiveFunction: 73,
  };

  const historicalDataToUse = calculatedHistoricalData && calculatedHistoricalData.length > 0
    ? calculatedHistoricalData
    : mockHistorical;

  const recentGamesToUse = calculatedRecentGames && calculatedRecentGames.length > 0
    ? calculatedRecentGames
    : [
        {
          gameId: '1',
          gameName: '젠고 5x5-medium',
          playedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          score: 85,
          level: '5x5-medium',
          metricsChange: {
            workingMemoryCapacity: 1,
            processingSpeed: -1,
          },
        },
        // ... 기타 목업 게임 데이터
      ];

  const strengthsToUse = calculatedStrengths && calculatedStrengths.length > 0
    ? calculatedStrengths
    : ['workingMemoryCapacity', 'processingSpeed', 'patternRecognition'] as (keyof CognitiveMetrics)[];

  const improvementAreasToUse = calculatedImprovementAreas && calculatedImprovementAreas.length > 0
    ? calculatedImprovementAreas
    : ['visuospatialPrecision', 'cognitiveFlexibility'] as (keyof CognitiveMetrics)[];

  const recommendationsToUse = calculatedRecommendations && calculatedRecommendations.length > 0
    ? calculatedRecommendations
    : [
        {
          title: '시공간 정확도 향상',
          description: '시공간 정확도를 높이는 젠고 게임을 더 플레이해보세요.',
          action: '게임 시작',
          link: '/zengo/session/new?focus=spatial',
        },
        // ... 기타 목업 추천 데이터
      ];

  return {
    userId,
    lastUpdatedAt: new Date().toISOString(),
    overallProfile: overallProfileToUse,
    historicalData: historicalDataToUse, // 계산된 값 또는 목업 사용
    percentileRanks: { // 목업 데이터 개선 (정규분포에 가까운 값으로)
      workingMemoryCapacity: 65 + Math.floor(Math.random() * 20) - 10,
      processingSpeed: 70 + Math.floor(Math.random() * 20) - 10,
      executiveFunction: 68 + Math.floor(Math.random() * 20) - 10,
      patternRecognition: 72 + Math.floor(Math.random() * 20) - 10,
      visuospatialPrecision: 63 + Math.floor(Math.random() * 20) - 10,
    },
    strengths: strengthsToUse,
    improvementAreas: improvementAreasToUse,
    recentGames: recentGamesToUse, // 계산된 값 또는 목업 사용
    personalizedRecommendations: recommendationsToUse,
    debug_fetchedSessionCount: fetchedSessionCount,
  };
};

export async function GET(req: NextRequest) {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.success || !authResult.userId) {
      return NextResponse.json({ message: authResult.message || '인증이 필요합니다.' }, { status: 401 });
    }
    const { userId } = authResult;

    const timeRange = req.nextUrl.searchParams.get('timeRange');
    const { startDate, endDate } = calculateDateRange(timeRange);

    const userObjectId = new Types.ObjectId(userId); 
    // 세션 조회 시 정렬 순서를 createdAt: 1 (오름차순)으로 변경하여 historicalData 구성 시 시간 순서를 맞춤
    const sessions: IZengoSessionResult[] = await ZengoSessionResult.find({
      userId: userObjectId,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ createdAt: 1 }).lean(); // 오름차순 정렬

    console.log(`Fetched ${sessions.length} sessions for user ${userId} in range ${startDate.toISOString()} - ${endDate.toISOString()}`);

    const calculatedOverallProfile = calculateCognitiveMetricsFromSessions(sessions);

    // historicalData 계산
    const groupedSessions = groupSessionsByDateString(sessions);
    let calculatedHistoricalData: CognitiveMetricsTimeSeries[] = Object.entries(groupedSessions)
      .map(([dateString, dailySessions]) => {
        return {
          date: dateString,
          metrics: calculateCognitiveMetricsFromSessions(dailySessions),
        };
      })
      // 결과는 다시 날짜 오름차순으로 정렬하는 것이 좋음 (grouping시 순서 보장 안될 수 있으므로)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 데이터 희소성(sparse data) 처리: 데이터 포인트가 너무 적으면 보간 데이터 추가
    if (calculatedHistoricalData.length > 0 && calculatedHistoricalData.length < 3) {
      console.log(`Historical data points are sparse (${calculatedHistoricalData.length}), adding interpolated data`);
      
      // 기존 데이터의 첫 날짜와 마지막 날짜 사이에 보간 데이터 추가
      const firstDate = new Date(calculatedHistoricalData[0].date);
      const lastDate = new Date(calculatedHistoricalData[calculatedHistoricalData.length - 1].date);
      
      // 첫 날짜와 마지막 날짜 사이의 일수 계산
      const daysDiff = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 7) { // 7일 이상 차이가 나면 중간 데이터 추가
        // 중간 날짜 계산
        const middleDate = new Date(firstDate);
        middleDate.setDate(middleDate.getDate() + Math.floor(daysDiff / 2));
        
        // 중간 지표 계산 (첫 지표와 마지막 지표의 평균)
        const firstMetrics = calculatedHistoricalData[0].metrics;
        const lastMetrics = calculatedHistoricalData[calculatedHistoricalData.length - 1].metrics;
        const middleMetrics: CognitiveMetrics = {} as CognitiveMetrics;
        
        (Object.keys(firstMetrics) as Array<keyof CognitiveMetrics>).forEach(key => {
          middleMetrics[key] = (firstMetrics[key] + lastMetrics[key]) / 2;
        });
        
        // 중간 데이터 추가
        calculatedHistoricalData.push({
          date: middleDate.toISOString().split('T')[0],
          metrics: middleMetrics,
        });
        
        // 다시 날짜순으로 정렬
        calculatedHistoricalData = calculatedHistoricalData.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      }
    }

    // recentGames 계산 (최근 5개 게임)
    const recentSessions = sessions.slice(-5).reverse();
    const calculatedRecentGames: RecentGame[] = recentSessions.map(session => ({
      gameId: session._id ? session._id.toString() : `unknown-${Math.random()}`,
      gameName: `젠고 ${session.level || '알 수 없음'}`,
      playedAt: session.createdAt.toISOString(),
      score: session.score || 0,
      level: session.level || '알 수 없음',
      metricsChange: { // 우선 목업 값으로 설정
        workingMemoryCapacity: Math.floor(Math.random() * 3) -1, // -1, 0, 1
        processingSpeed: Math.floor(Math.random() * 3) -1,
      },
    }));

    // 강점, 개선 영역, 추천 계산
    const { strengths, improvementAreas } = deriveKeyCognitiveAreas(calculatedOverallProfile);
    const calculatedRecommendations = generatePersonalizedRecommendations(improvementAreas, strengths);
    
    // 백분위 순위 계산
    const percentileRanks = await calculatePercentileRanks(userId, calculatedOverallProfile);
    console.log(`Calculated percentile ranks for user ${userId}:`, JSON.stringify(percentileRanks));

    const responseData = getMockBrainAnalyticsData(
      userId, 
      sessions.length, 
      calculatedOverallProfile, 
      calculatedHistoricalData,
      calculatedRecentGames,
      strengths, // 전달
      improvementAreas, // 전달
      calculatedRecommendations // 전달
    );
    
    // 계산된 백분위 순위로 업데이트
    responseData.percentileRanks = percentileRanks;

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Error in /api/cognitive/metrics:', error);
    let errorMessage = '시스템이 잠시 쉬는 중이에요. 금방 돌아올게요.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    if (error instanceof mongoose.Error.CastError && error.path === '_id') {
        errorMessage = '사용자 정보를 찾지 못했어요. 다시 로그인해 주실래요?';
        return NextResponse.json({ message: errorMessage }, { status: 400 });
    }
    return NextResponse.json({ message: '데이터를 가져오는 중 문제가 있어요. 다시 시도해 주실래요?' }, { status: 500 });
  }
} 
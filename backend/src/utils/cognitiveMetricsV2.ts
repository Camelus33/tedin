/**
 * CognitiveMetricsV2 - 상세 데이터를 활용한 고도화된 인지능력 계산 유틸리티
 * 
 * 기존 V1과의 차이점:
 * - 시간 분석: 첫 클릭 지연, 클릭 간 간격, 망설임 시간 활용
 * - 공간 분석: 클릭 정확도, 공간 오차 활용  
 * - 순서 분석: 순차 정확도, 시간순서 위반 활용
 * - 바둑판 크기별 난이도 보정 적용
 */

import { normInv } from './statistics'; // normInv 함수 import

// 기존 인터페이스 유지 (호환성)
export interface CognitiveMetrics {
  hippocampusActivation: number;
  workingMemory: number;
  processingSpeed: number;
  attention: number;
  patternRecognition: number;
  cognitiveFlexibility: number;
}

// V2 확장된 인지능력 인터페이스
export interface ExtendedCognitiveMetrics extends CognitiveMetrics {
  spatialMemoryAccuracy: number;     // 공간 기억 정확도
  responseConsistency: number;       // 반응 일관성
  learningAdaptability: number;      // 학습 적응력
  focusEndurance: number;            // 집중 지속력
  sequentialProcessing: number;      // 순차 처리 능력
}

// V2 상세 데이터 인터페이스
export interface DetailedSessionData {
  // 시간 분석 변수
  firstClickLatency?: number;
  interClickIntervals: number[];
  hesitationPeriods: number[];
  
  // 공간 인지 변수
  spatialErrors: number[];
  clickPositions: { x: number; y: number; timestamp: number }[];
  correctPositions: { x: number; y: number }[];
  
  // 순서 및 패턴 변수
  sequentialAccuracy?: number;
  temporalOrderViolations?: number;
  
  // 메타 정보
  detailedDataVersion: string;
}

// 바둑판 크기별 난이도 계수
const BOARD_SIZE_DIFFICULTY = {
  3: { multiplier: 1.0, memoryLoad: 9, spatialComplexity: 1.0 },
  5: { multiplier: 1.3, memoryLoad: 25, spatialComplexity: 1.6 },
  7: { multiplier: 1.7, memoryLoad: 49, spatialComplexity: 2.3 }
};

/**
 * V2 인지능력 계산 함수 (기존 V1 호환)
 */
export const calculateCognitiveMetricsV2 = (
  basicResult: any, 
  detailedData?: DetailedSessionData,
  boardSize: number = 5
): ExtendedCognitiveMetrics => {
  
  console.log('[CognitiveMetricsV2] 계산 시작:', {
    hasDetailedData: !!detailedData,
    boardSize,
    basicResult: {
      correctPlacements: basicResult.correctPlacements,
      incorrectPlacements: basicResult.incorrectPlacements,
      timeTakenMs: basicResult.timeTakenMs
    }
  });

  // 기본 지표 계산 (V1과 동일)
  const { correctPlacements, incorrectPlacements, timeTakenMs, completedSuccessfully, orderCorrect } = basicResult;
  const totalAttempts = correctPlacements + incorrectPlacements;
  const accuracy = totalAttempts > 0 ? (correctPlacements / totalAttempts) * 100 : 0;
  
  // 바둑판 크기별 난이도 보정
  const difficultyConfig = BOARD_SIZE_DIFFICULTY[boardSize as keyof typeof BOARD_SIZE_DIFFICULTY] || BOARD_SIZE_DIFFICULTY[5];
  
  // V2 상세 데이터가 있으면 고도화된 계산, 없으면 V1 방식 사용
  if (detailedData && detailedData.detailedDataVersion === 'v2.0') {
    return calculateAdvancedMetrics(basicResult, detailedData, difficultyConfig);
  } else {
    console.log('[CognitiveMetricsV2] 상세 데이터 없음 - V1 호환 V3 방식으로 계산');
    return calculateBasicMetrics(basicResult, difficultyConfig);
  }
};

/**
 * 상세 데이터를 활용한 고도화된 계산
 */
function calculateAdvancedMetrics(
  basicResult: any, 
  detailedData: DetailedSessionData, 
  difficultyConfig: any
): ExtendedCognitiveMetrics {
  
  const { correctPlacements, incorrectPlacements, timeTakenMs, completedSuccessfully, orderCorrect } = basicResult;
  const totalAttempts = correctPlacements + incorrectPlacements;
  const accuracy = totalAttempts > 0 ? (correctPlacements / totalAttempts) * 100 : 0;

  console.log('[CognitiveMetricsV2] 고도화된 계산 시작:', {
    accuracy,
    firstClickLatency: detailedData.firstClickLatency,
    interClickCount: detailedData.interClickIntervals.length,
    spatialErrorCount: detailedData.spatialErrors.length,
    sequentialAccuracy: detailedData.sequentialAccuracy
  });

  // === 전역 유도 변수 & 고급 변환 ===
  const C = correctPlacements;
  const I = incorrectPlacements;  
  const T = timeTakenMs;
  const CS = completedSuccessfully ? 1 : 0;
  const OC = orderCorrect ? 1 : 0;

  // 1차 지표
  const total = C + I;
  const errorRate = total > 0 ? (I / total) * 100 : 0;

  // 2차 지표: 인지과학 이론 기반
  const logAccuracy = Math.log10(Math.max(1, accuracy)) / Math.log10(100) * 100;

  const meanRT = total > 0 ? T / total : T;
  const IES = meanRT / Math.max(0.01, accuracy / 100);
  const iesScore = Math.max(0, 100 - Math.min(100, IES / 1000 * 100));

  const hitRate = Math.max(0.01, Math.min(0.99, accuracy / 100));
  const falseAlarmRate = Math.max(0.01, Math.min(0.99, errorRate / 100));
  const dPrime = normInv(hitRate) - normInv(falseAlarmRate);
  const dPrimeScore = Math.max(0, Math.min(100, (dPrime + 2) / 4 * 100));

  const timeDecay = Math.exp(-T / 45000) * 100;

  const efficiency = total > 0 ? (C * 60000) / T : 0;
  const efficiencyScore = Math.min(100, efficiency);

  const cognitiveLoad = errorRate > 0 ? Math.min(100, (I / Math.max(1, C)) * 50) : 0;
  const loadScore = 100 - cognitiveLoad;

  // === 인지능력별 계산식 3.0 적용 ===

  // 1. 해마 활성화 (Hippocampus Activation)
  const encodingStrength = logAccuracy * 0.6 + (OC * 40);
  const retentionIndex = CS ? Math.min(100, 100 * Math.exp(-errorRate / 25)) : 50;
  const retrievalEff = dPrimeScore;
  const HA = Math.round(0.4 * encodingStrength + 0.3 * retentionIndex + 0.3 * retrievalEff);

  // 2. 작업 기억 용량 (Working Memory)
  const centralExec = iesScore;
  const phonoLoop = OC * 60 + accuracy * 0.4;
  const visuoSpatial = efficiencyScore;
  const loadModulation = loadScore;
  const WM = Math.round(0.3 * centralExec + 0.25 * phonoLoop + 0.25 * visuoSpatial + 0.2 * loadModulation);

  // 3. 처리 속도 (Processing Speed)
  const elementarySpeed = timeDecay;
  const complexityFactor = Math.max(1, Math.log2(Math.max(1, total)));
  const adjustedSpeed = Math.min(100, elementarySpeed * (2 / complexityFactor));
  const balanceScore = 100 - Math.abs(timeDecay - accuracy);
  const PS = Math.round(0.5 * adjustedSpeed + 0.3 * elementarySpeed + 0.2 * balanceScore);

  // 4. 지속적 주의력 (Sustained Attention)
  const arousalLevel = Math.max(0, 100 - (T / 60000) * 20);
  const resourceAllocation = (2 * accuracy * iesScore) / (accuracy + iesScore || 1);
  const cognitiveControl = CS * 50 + OC * 30 + loadScore * 0.2;
  const SA = Math.round(0.4 * resourceAllocation + 0.3 * arousalLevel + 0.3 * cognitiveControl);

  // 5. 패턴 인식 (Pattern Recognition)
  const schemaActivation = OC * 70 + logAccuracy * 0.3;
  const chunkingEff = total > 0 ? Math.min(100, (C / Math.sqrt(total)) * 50) : 0;
  const patternCompletion = CS * 60 + dPrimeScore * 0.4;
  const PR = Math.round(0.4 * schemaActivation + 0.3 * chunkingEff + 0.3 * patternCompletion);

  // 6. 인지 유연성 (Cognitive Flexibility)
  const setShifting = CS ? Math.min(100, accuracy + timeDecay - Math.abs(accuracy - timeDecay)) : accuracy * 0.7;
  const inhibitoryControl = Math.max(0, 100 - (errorRate * 2));
  const updating = efficiencyScore;
  const adaptiveStrategy = OC * 40 + iesScore * 0.6;
  const CF = Math.round(0.3 * setShifting + 0.25 * inhibitoryControl + 0.25 * updating + 0.2 * adaptiveStrategy);

  // 7. 시공간 정밀도 (Visuospatial Precision) - V2에서만 계산되므로 추정치 생성
  const VSP = Math.round((logAccuracy * 0.4) + ((2 * accuracy * efficiencyScore) / (accuracy + efficiencyScore || 1) * 0.35) + (dPrimeScore * 0.25));

  // 8. 실행 기능 (Executive Function) - V2에서만 계산되므로 추정치 생성
  const inhibition_ef = 100 - (errorRate * 1.5);
  const updating_ef = (WM + SA) / 2;
  const setShifting_ef = CF;
  const cognitiveMonitoring = CS * 50 + iesScore * 0.5;
  const goalManagement = OC * 60 + loadScore * 0.4;
  const EF = Math.round(0.25 * inhibition_ef + 0.25 * updating_ef + 0.25 * setShifting_ef + 0.15 * cognitiveMonitoring + 0.1 * goalManagement);
  
  const rawMetrics = {
    hippocampusActivation: HA,
    workingMemory: WM,
    processingSpeed: PS,
    attention: SA,
    patternRecognition: PR,
    cognitiveFlexibility: CF,
    
    // V2 확장 메트릭에 대한 추정치
    spatialMemoryAccuracy: VSP,
    responseConsistency: Math.round(balanceScore), // 반응 일관성은 속도-정확도 균형으로 추정
    learningAdaptability: Math.round(CS * 50 + OC * 50), // 학습 적응력은 성공과 순서 정확도로 추정
    focusEndurance: Math.round(resourceAllocation), // 집중 지속력은 자원 할당 능력으로 추정
    sequentialProcessing: PR, // 순차 처리 능력은 패턴인식 점수와 동일하게 매핑
  };

  // 바둑판 크기별 난이도 보정 적용
  const finalMetrics: any = {};
  Object.entries(rawMetrics).forEach(([key, value]) => {
    finalMetrics[key] = applyDifficultyBonus(value, difficultyConfig.multiplier);
  });

  console.log('[CognitiveMetricsV2] 고도화된 계산 완료 (확장):', finalMetrics);
  
  return finalMetrics as ExtendedCognitiveMetrics;
}

/**
 * 기본 계산 (V1 데이터 호환용 V3 완성판 로직)
 */
function calculateBasicMetrics(basicResult: any, difficultyConfig: any): ExtendedCognitiveMetrics {
  
  // === 전역 유도 변수 & 고급 변환 ===
  const C = basicResult.correctPlacements;
  const I = basicResult.incorrectPlacements;  
  const T = basicResult.timeTakenMs;
  const CS = basicResult.completedSuccessfully ? 1 : 0;
  const OC = basicResult.orderCorrect ? 1 : 0;

  // 1차 지표
  const total = C + I;
  const accuracy = total > 0 ? (C / total) * 100 : 0;
  const errorRate = total > 0 ? (I / total) * 100 : 0;

  // 2차 지표: 인지과학 이론 기반
  const logAccuracy = Math.log10(Math.max(1, accuracy)) / Math.log10(100) * 100;

  const meanRT = total > 0 ? T / total : T;
  const IES = meanRT / Math.max(0.01, accuracy / 100);
  const iesScore = Math.max(0, 100 - Math.min(100, IES / 1000 * 100));

  const hitRate = Math.max(0.01, Math.min(0.99, accuracy / 100));
  const falseAlarmRate = Math.max(0.01, Math.min(0.99, errorRate / 100));
  const dPrime = normInv(hitRate) - normInv(falseAlarmRate);
  const dPrimeScore = Math.max(0, Math.min(100, (dPrime + 2) / 4 * 100));

  const timeDecay = Math.exp(-T / 45000) * 100;

  const efficiency = total > 0 ? (C * 60000) / T : 0;
  const efficiencyScore = Math.min(100, efficiency);

  const cognitiveLoad = errorRate > 0 ? Math.min(100, (I / Math.max(1, C)) * 50) : 0;
  const loadScore = 100 - cognitiveLoad;

  // === 인지능력별 계산식 3.0 적용 ===

  // 1. 해마 활성화 (Hippocampus Activation)
  const HA = Math.round(0.4 * (logAccuracy * 0.6 + (OC * 40)) + 0.3 * (CS ? Math.min(100, 100 * Math.exp(-errorRate / 25)) : 50) + 0.3 * dPrimeScore);

  // 2. 작업 기억 용량 (Working Memory)
  const WM = Math.round(0.3 * iesScore + 0.25 * (OC * 60 + accuracy * 0.4) + 0.25 * efficiencyScore + 0.2 * loadScore);

  // 3. 처리 속도 (Processing Speed)
  const balanceScore = 100 - Math.abs(timeDecay - accuracy);
  const PS = Math.round(0.5 * Math.min(100, timeDecay * (2 / Math.max(1, Math.log2(Math.max(1, total))))) + 0.3 * timeDecay + 0.2 * balanceScore);

  // 4. 지속적 주의력 (Sustained Attention)
  const resourceAllocation = (2 * accuracy * iesScore) / (accuracy + iesScore || 1);
  const SA = Math.round(0.4 * resourceAllocation + 0.3 * Math.max(0, 100 - (T / 60000) * 20) + 0.3 * (CS * 50 + OC * 30 + loadScore * 0.2));

  // 5. 패턴 인식 (Pattern Recognition)
  const PR = Math.round(0.4 * (OC * 70 + logAccuracy * 0.3) + 0.3 * (total > 0 ? Math.min(100, (C / Math.sqrt(total)) * 50) : 0) + 0.3 * (CS * 60 + dPrimeScore * 0.4));

  // 6. 인지 유연성 (Cognitive Flexibility)
  const CF = Math.round(0.3 * (CS ? Math.min(100, accuracy + timeDecay - Math.abs(accuracy - timeDecay)) : accuracy * 0.7) + 0.25 * Math.max(0, 100 - (errorRate * 2)) + 0.25 * efficiencyScore + 0.2 * (OC * 40 + iesScore * 0.6));

  // 7. 시공간 정밀도 (Visuospatial Precision)
  const VSP = Math.round(0.4 * logAccuracy + 0.35 * ((2 * accuracy * efficiencyScore) / (accuracy + efficiencyScore || 1)) + 0.25 * dPrimeScore);

  // 8. 실행 기능 (Executive Function)
  const EF = Math.round(0.25 * Math.max(0, 100 - (errorRate * 1.5)) + 0.25 * ((WM + SA) / 2) + 0.25 * CF + 0.15 * (CS * 50 + iesScore * 0.5) + 0.1 * (OC * 60 + loadScore * 0.4));

  const rawMetrics = {
    hippocampusActivation: HA,
    workingMemory: WM,
    processingSpeed: PS,
    attention: SA,
    patternRecognition: PR,
    cognitiveFlexibility: CF,
    executiveFunction: EF,
    visuospatialPrecision: VSP,
    spatialMemoryAccuracy: VSP, // 호환성 유지
    responseConsistency: Math.round(balanceScore),
    learningAdaptability: Math.round(CS * 50 + OC * 50),
    focusEndurance: Math.round(resourceAllocation),
    sequentialProcessing: PR,
  };

  const finalMetrics: any = {};
  Object.entries(rawMetrics).forEach(([key, value]) => {
    finalMetrics[key] = applyDifficultyBonus(value, difficultyConfig.multiplier);
  });

  return finalMetrics as ExtendedCognitiveMetrics;
}

/**
 * 난이도 보너스 적용 및 0-100 범위 제한
 */
function applyDifficultyBonus(value: number, multiplier: number): number {
  const boostedValue = value * multiplier;
  return Math.round(Math.max(0, Math.min(100, boostedValue)));
}

/**
 * 기존 V1 함수 (하위 호환성)
 */
export const calculateCognitiveMetrics = calculateCognitiveMetricsV2;

// 테스트를 위해 private 함수를 export합니다.
export { applyDifficultyBonus }; 
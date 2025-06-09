/**
 * CognitiveMetricsV2 - 상세 데이터를 활용한 고도화된 인지능력 계산 유틸리티
 * 
 * 기존 V1과의 차이점:
 * - 시간 분석: 첫 클릭 지연, 클릭 간 간격, 망설임 시간 활용
 * - 공간 분석: 클릭 정확도, 공간 오차 활용  
 * - 순서 분석: 순차 정확도, 시간순서 위반 활용
 * - 바둑판 크기별 난이도 보정 적용
 */

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
    console.log('[CognitiveMetricsV2] 상세 데이터 없음 - V1 방식으로 계산');
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

  // === 1. 작업 기억 용량 (Working Memory) ===
  let workingMemoryScore = accuracy * 0.4; // 기본 정확도 (40%)
  
  // 공간 오차 분석 (30%)
  if (detailedData.spatialErrors.length > 0) {
    const avgSpatialError = detailedData.spatialErrors.reduce((a, b) => a + b, 0) / detailedData.spatialErrors.length;
    const spatialAccuracy = Math.max(0, 100 - (avgSpatialError * 20)); // 오차가 클수록 점수 감소
    workingMemoryScore += spatialAccuracy * 0.3;
  } else {
    workingMemoryScore += 100 * 0.3; // 오차가 없으면 만점
  }
  
  // 순차 정확도 (30%)
  if (detailedData.sequentialAccuracy !== undefined) {
    workingMemoryScore += (detailedData.sequentialAccuracy * 100) * 0.3;
  } else {
    workingMemoryScore += (orderCorrect ? 100 : 50) * 0.3;
  }

  // === 2. 처리 속도 (Processing Speed) ===
  let processingSpeedScore = 0;
  
  // 첫 클릭 지연시간 분석 (40%)
  if (detailedData.firstClickLatency !== undefined) {
    // 1초 이내면 만점, 5초 이상이면 0점
    const latencyScore = Math.max(0, 100 - ((detailedData.firstClickLatency - 1000) / 4000) * 100);
    processingSpeedScore += Math.max(0, Math.min(100, latencyScore)) * 0.4;
  }
  
  // 클릭 간 간격 일관성 (30%)
  if (detailedData.interClickIntervals.length > 1) {
    const avgInterval = detailedData.interClickIntervals.reduce((a, b) => a + b, 0) / detailedData.interClickIntervals.length;
    const variance = detailedData.interClickIntervals.reduce((acc, interval) => acc + Math.pow(interval - avgInterval, 2), 0) / detailedData.interClickIntervals.length;
    const consistency = Math.max(0, 100 - (Math.sqrt(variance) / 1000) * 50); // 일관성이 높을수록 높은 점수
    processingSpeedScore += consistency * 0.3;
  }
  
  // 전체 시간 효율성 (30%)
  const timeEfficiencyScore = Math.max(0, 100 - Math.min(100, (timeTakenMs / 60000) * 100));
  processingSpeedScore += timeEfficiencyScore * 0.3;

  // === 3. 주의집중력 (Attention) ===
  let attentionScore = accuracy * 0.3; // 기본 정확도 (30%)
  
  // 망설임 분석 (40%)
  if (detailedData.hesitationPeriods.length > 0) {
    const totalHesitation = detailedData.hesitationPeriods.reduce((a, b) => a + b, 0);
    const hesitationRatio = totalHesitation / timeTakenMs;
    const focusScore = Math.max(0, 100 - (hesitationRatio * 200)); // 망설임이 적을수록 높은 점수
    attentionScore += focusScore * 0.4;
  } else {
    attentionScore += 100 * 0.4; // 망설임이 없으면 만점
  }
  
  // 시간순서 위반 분석 (30%)
  if (detailedData.temporalOrderViolations !== undefined) {
    const violationPenalty = Math.min(100, detailedData.temporalOrderViolations * 20);
    attentionScore += Math.max(0, 100 - violationPenalty) * 0.3;
  } else {
    attentionScore += (orderCorrect ? 100 : 70) * 0.3;
  }

  // === 4. 패턴 인식 (Pattern Recognition) ===
  let patternRecognitionScore = (orderCorrect ? 60 : 30); // 기본 순서 정확도 (60%)
  
  // 순차 정확도 세밀 분석 (40%)
  if (detailedData.sequentialAccuracy !== undefined) {
    patternRecognitionScore += (detailedData.sequentialAccuracy * 100) * 0.4;
  } else {
    patternRecognitionScore += accuracy * 0.4;
  }

  // === 5. 해마 활성화 (Hippocampus Activation) ===
  let hippocampusScore = accuracy * 0.5; // 기본 정확도 (50%)
  
  // 공간 기억 정확도 (30%)
  if (detailedData.spatialErrors.length > 0) {
    const avgSpatialError = detailedData.spatialErrors.reduce((a, b) => a + b, 0) / detailedData.spatialErrors.length;
    const spatialMemoryScore = Math.max(0, 100 - (avgSpatialError * 15));
    hippocampusScore += spatialMemoryScore * 0.3;
  } else {
    hippocampusScore += 100 * 0.3;
  }
  
  // 완료 보너스 (20%)
  hippocampusScore += (completedSuccessfully ? 100 : 0) * 0.2;

  // === 6. 인지 유연성 (Cognitive Flexibility) ===
  let flexibilityScore = (completedSuccessfully ? 50 : 20); // 기본 완료 점수 (50%)
  
  // 적응적 반응 시간 (30%)
  if (detailedData.interClickIntervals.length > 2) {
    // 시간이 지날수록 빨라지는지 분석 (학습 효과)
    const firstHalf = detailedData.interClickIntervals.slice(0, Math.floor(detailedData.interClickIntervals.length / 2));
    const secondHalf = detailedData.interClickIntervals.slice(Math.floor(detailedData.interClickIntervals.length / 2));
    
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const improvement = Math.max(0, (firstAvg - secondAvg) / firstAvg * 100);
      flexibilityScore += Math.min(100, improvement) * 0.3;
    }
  }
  
  // 오류 회복 능력 (20%)
  const errorRecovery = incorrectPlacements > 0 ? Math.max(0, 100 - (incorrectPlacements * 25)) : 100;
  flexibilityScore += errorRecovery * 0.2;

  // === 7. 공간 기억 정확도 (Spatial Memory Accuracy) ===
  let spatialMemoryScore = accuracy * 0.6; // 기본 정확도 (60%)
  
  // 공간 오차 세밀 분석 (40%)
  if (detailedData.spatialErrors.length > 0) {
    const minError = Math.min(...detailedData.spatialErrors);
    const maxError = Math.max(...detailedData.spatialErrors);
    const avgError = detailedData.spatialErrors.reduce((a, b) => a + b, 0) / detailedData.spatialErrors.length;
    
    // 오차의 일관성 점수 (오차가 일정하면 높은 점수)
    const errorConsistency = Math.max(0, 100 - (maxError - minError) * 30);
    spatialMemoryScore += errorConsistency * 0.4;
  } else {
    spatialMemoryScore += 100 * 0.4; // 오차가 없으면 만점
  }

  // === 8. 반응 일관성 (Response Consistency) ===
  let responseConsistencyScore = 50; // 기본값
  
  if (detailedData.interClickIntervals.length > 2) {
    const intervals = detailedData.interClickIntervals;
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((acc, interval) => acc + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // 표준편차가 낮을수록 일관성이 높음
    responseConsistencyScore = Math.max(0, 100 - (stdDev / 500) * 100);
  }

  // === 9. 학습 적응력 (Learning Adaptability) ===
  let learningAdaptabilityScore = 50; // 기본값
  
  if (detailedData.interClickIntervals.length > 3) {
    // 시간 경과에 따른 개선도 측정
    const firstQuarter = detailedData.interClickIntervals.slice(0, Math.floor(detailedData.interClickIntervals.length / 4));
    const lastQuarter = detailedData.interClickIntervals.slice(-Math.floor(detailedData.interClickIntervals.length / 4));
    
    if (firstQuarter.length > 0 && lastQuarter.length > 0) {
      const firstAvg = firstQuarter.reduce((a, b) => a + b, 0) / firstQuarter.length;
      const lastAvg = lastQuarter.reduce((a, b) => a + b, 0) / lastQuarter.length;
      const improvement = Math.max(0, (firstAvg - lastAvg) / firstAvg * 100);
      
      learningAdaptabilityScore = Math.min(100, 50 + improvement * 2); // 개선도에 따라 가산점
    }
  }

  // === 10. 집중 지속력 (Focus Endurance) ===
  let focusEnduranceScore = accuracy * 0.4; // 기본 정확도 (40%)
  
  // 망설임 패턴 분석 (60%)
  if (detailedData.hesitationPeriods.length > 0) {
    const totalGameTime = timeTakenMs;
    const totalHesitation = detailedData.hesitationPeriods.reduce((a, b) => a + b, 0);
    const hesitationRatio = totalHesitation / totalGameTime;
    
    // 게임 후반부로 갈수록 망설임이 증가하는지 분석
    const midIndex = Math.floor(detailedData.hesitationPeriods.length / 2);
    const firstHalf = detailedData.hesitationPeriods.slice(0, midIndex);
    const secondHalf = detailedData.hesitationPeriods.slice(midIndex);
    
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      const enduranceRatio = firstAvg > 0 ? Math.max(0, 1 - (secondAvg / firstAvg)) : 0.5;
      
      focusEnduranceScore += enduranceRatio * 100 * 0.6;
    } else {
      focusEnduranceScore += Math.max(0, 100 - (hesitationRatio * 200)) * 0.6;
    }
  } else {
    focusEnduranceScore += 100 * 0.6; // 망설임이 없으면 만점
  }

  // === 11. 순차 처리 능력 (Sequential Processing) ===
  let sequentialProcessingScore = (orderCorrect ? 70 : 30); // 기본 순서 정확도 (70%)
  
  // 순차 정확도 세밀 분석 (30%)
  if (detailedData.sequentialAccuracy !== undefined) {
    sequentialProcessingScore += (detailedData.sequentialAccuracy * 100) * 0.3;
  } else if (detailedData.temporalOrderViolations !== undefined) {
    const violationPenalty = Math.min(30, detailedData.temporalOrderViolations * 10);
    sequentialProcessingScore += Math.max(0, 30 - violationPenalty);
  } else {
    sequentialProcessingScore += 15; // 기본값
  }

  // === 바둑판 크기별 난이도 보정 적용 ===
  const finalMetrics = {
    workingMemory: applyDifficultyBonus(workingMemoryScore, difficultyConfig.multiplier),
    processingSpeed: applyDifficultyBonus(processingSpeedScore, difficultyConfig.multiplier),
    attention: applyDifficultyBonus(attentionScore, difficultyConfig.multiplier),
    patternRecognition: applyDifficultyBonus(patternRecognitionScore, difficultyConfig.multiplier),
    hippocampusActivation: applyDifficultyBonus(hippocampusScore, difficultyConfig.multiplier),
    cognitiveFlexibility: applyDifficultyBonus(flexibilityScore, difficultyConfig.multiplier),
    
    // === V2 새로운 인지능력 ===
    spatialMemoryAccuracy: applyDifficultyBonus(spatialMemoryScore, difficultyConfig.multiplier),
    responseConsistency: applyDifficultyBonus(responseConsistencyScore, difficultyConfig.multiplier),
    learningAdaptability: applyDifficultyBonus(learningAdaptabilityScore, difficultyConfig.multiplier),
    focusEndurance: applyDifficultyBonus(focusEnduranceScore, difficultyConfig.multiplier),
    sequentialProcessing: applyDifficultyBonus(sequentialProcessingScore, difficultyConfig.multiplier)
  };

  console.log('[CognitiveMetricsV2] 고도화된 계산 완료 (확장):', finalMetrics);
  
  return finalMetrics as ExtendedCognitiveMetrics;
}

/**
 * 기본 계산 (V1 방식, 호환성 유지)
 */
function calculateBasicMetrics(basicResult: any, difficultyConfig: any): ExtendedCognitiveMetrics {
  const { correctPlacements, incorrectPlacements, timeTakenMs, completedSuccessfully, orderCorrect } = basicResult;
  const totalAttempts = correctPlacements + incorrectPlacements;
  const accuracy = totalAttempts > 0 ? (correctPlacements / totalAttempts) * 100 : 0;
  const timeEfficiencyScore = Math.max(0, 100 - Math.min(100, (timeTakenMs / 60000) * 100));

  const rawMetrics = {
    hippocampusActivation: accuracy * 0.8 + (completedSuccessfully ? 20 : 0),
    workingMemory: accuracy * 0.6 + Math.max(0, (1 - (incorrectPlacements / (correctPlacements || 1)))) * 40,
    processingSpeed: timeEfficiencyScore,
    attention: timeEfficiencyScore * 0.5 + accuracy * 0.5,
    patternRecognition: (orderCorrect ? 60 : 30) + accuracy * 0.4,
    cognitiveFlexibility: (completedSuccessfully ? 50 : 20) + timeEfficiencyScore * 0.3 + accuracy * 0.2,
    
    // === V2 새로운 인지능력 (V1 데이터에 대한 추정값) ===
    spatialMemoryAccuracy: accuracy * 0.8, // 기본 정확도 기반 추정
    responseConsistency: Math.max(50, timeEfficiencyScore), // 시간 효율성 기반 추정
    learningAdaptability: (completedSuccessfully ? 70 : 40), // 완료 여부 기반 추정
    focusEndurance: accuracy * 0.9, // 정확도 기반 추정
    sequentialProcessing: (orderCorrect ? 80 : 50) // 순서 정확도 기반 추정
  };

  // 바둑판 크기별 난이도 보정 적용
  const finalMetrics: any = {};
  Object.entries(rawMetrics).forEach(([key, value]) => {
    finalMetrics[key] = applyDifficultyBonus(value, difficultyConfig.multiplier);
  });

  return finalMetrics as ExtendedCognitiveMetrics;
}

/**
 * 난이도 보정 적용 함수
 */
function applyDifficultyBonus(score: number, multiplier: number): number {
  // 기본 점수에 난이도 보너스 적용 후 0-100 범위로 제한
  const bonusScore = score * multiplier;
  return Math.round(Math.max(0, Math.min(100, bonusScore)));
}

/**
 * 기존 V1 함수 (하위 호환성)
 */
export const calculateCognitiveMetrics = calculateCognitiveMetricsV2; 
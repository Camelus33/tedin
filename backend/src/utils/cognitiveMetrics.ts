// Utility for calculating cognitive metrics from Zengo session results

export interface CognitiveMetrics {
  hippocampusActivation: number;
  workingMemory: number;
  processingSpeed: number;
  attention: number;
  patternRecognition: number;
  cognitiveFlexibility: number;
}

export const calculateCognitiveMetrics = (result: any): CognitiveMetrics => {
  const { correctPlacements, incorrectPlacements, timeTakenMs, completedSuccessfully, orderCorrect } = result;

  // 기본 지표 계산
  const totalAttempts = correctPlacements + incorrectPlacements;
  const accuracy = totalAttempts > 0 ? (correctPlacements / totalAttempts) * 100 : 0;
  const timeEfficiencyScore = Math.max(0, 100 - Math.min(100, (timeTakenMs / 60000) * 100));

  // 인지 능력 메트릭 계산
  const rawMetrics = {
    hippocampusActivation: accuracy * 0.8 + (completedSuccessfully ? 20 : 0),
    workingMemory: accuracy * 0.6 + Math.max(0, (1 - (incorrectPlacements / (correctPlacements || 1)))) * 40,
    processingSpeed: timeEfficiencyScore,
    attention: timeEfficiencyScore * 0.5 + accuracy * 0.5,
    patternRecognition: (orderCorrect ? 60 : 30) + accuracy * 0.4,
    cognitiveFlexibility: (completedSuccessfully ? 50 : 20) + timeEfficiencyScore * 0.3 + accuracy * 0.2,
  };

  // 0~100 범위 제한 및 반올림
  const finalMetrics: any = {};
  Object.entries(rawMetrics).forEach(([key, value]) => {
    finalMetrics[key] = Math.round(Math.max(0, Math.min(value, 100)));
  });

  return {
    hippocampusActivation: finalMetrics.hippocampusActivation,
    workingMemory: finalMetrics.workingMemory,
    processingSpeed: finalMetrics.processingSpeed,
    attention: finalMetrics.attention,
    patternRecognition: finalMetrics.patternRecognition,
    cognitiveFlexibility: finalMetrics.cognitiveFlexibility,
  };
}; 
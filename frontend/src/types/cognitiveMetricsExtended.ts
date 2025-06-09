// === V2 확장 인지 메트릭 타입 (13개 인지능력) ===
export interface ExtendedCognitiveMetrics {
  // === 기존 V1 인지능력 (8개) ===
  workingMemoryCapacity: number;       // 작업 기억 용량
  visuospatialPrecision: number;       // 시공간 정확도
  processingSpeed: number;             // 처리 속도
  sustainedAttention: number;          // 주의 지속성
  patternRecognition: number;          // 패턴 인식
  cognitiveFlexibility: number;        // 인지적 유연성
  hippocampusActivation: number;       // 해마 활성화
  executiveFunction: number;           // 실행 기능
  
  // === V2 새로운 "감각/감" 시리즈 (5개) ===
  spatialMemoryAccuracy: number;       // 🗺️ 길찾기감각
  responseConsistency: number;         // 🎵 리듬감
  learningAdaptability: number;        // 📈 성장감각
  focusEndurance: number;              // 🔥 몰입감
  sequentialProcessing: number;        // 📋 순서감
}

// V2 기본값 생성 함수
export function createDefaultExtendedMetrics(): ExtendedCognitiveMetrics {
  return {
    // V1 기본값
    workingMemoryCapacity: 50,
    visuospatialPrecision: 50,
    processingSpeed: 50,
    sustainedAttention: 50,
    patternRecognition: 50,
    cognitiveFlexibility: 50,
    hippocampusActivation: 50,
    executiveFunction: 50,
    // V2 "감각/감" 시리즈 기본값
    spatialMemoryAccuracy: 50,
    responseConsistency: 50,
    learningAdaptability: 50,
    focusEndurance: 50,
    sequentialProcessing: 50,
  };
}

// V1 메트릭을 V2로 매핑하는 함수
export function mapV1ToExtended(v1Metrics: {
  workingMemoryCapacity: number;
  visuospatialPrecision: number;
  processingSpeed: number;
  sustainedAttention: number;
  patternRecognition: number;
  cognitiveFlexibility: number;
  hippocampusActivation: number;
  executiveFunction: number;
}): ExtendedCognitiveMetrics {
  return {
    // V1 필드 그대로 복사
    ...v1Metrics,
    
    // V2 새로운 필드들은 V1 필드들의 조합으로 추정
    spatialMemoryAccuracy: Math.round((v1Metrics.visuospatialPrecision + v1Metrics.workingMemoryCapacity) / 2),
    responseConsistency: Math.round((v1Metrics.processingSpeed + v1Metrics.sustainedAttention) / 2),
    learningAdaptability: Math.round((v1Metrics.cognitiveFlexibility + v1Metrics.patternRecognition) / 2),
    focusEndurance: Math.round((v1Metrics.sustainedAttention + v1Metrics.executiveFunction) / 2),
    sequentialProcessing: Math.round((v1Metrics.workingMemoryCapacity + v1Metrics.executiveFunction) / 2),
  };
}

// 메트릭 표시명 매핑
export const extendedMetricDisplayNames: Record<keyof ExtendedCognitiveMetrics, string> = {
  // V1 메트릭 (8개)
  workingMemoryCapacity: '작업 기억 용량',
  visuospatialPrecision: '시공간 정확도',
  processingSpeed: '처리 속도',
  sustainedAttention: '주의 지속성',
  patternRecognition: '패턴 인식',
  cognitiveFlexibility: '인지적 유연성',
  hippocampusActivation: '해마 활성화',
  executiveFunction: '실행 기능',
  
  // V2 "감각/감" 시리즈 (5개)
  spatialMemoryAccuracy: '🗺️ 길찾기감각',
  responseConsistency: '🎵 리듬감',
  learningAdaptability: '📈 성장감각',
  focusEndurance: '🔥 몰입감',
  sequentialProcessing: '📋 순서감',
};

// Analytics 페이지에서 사용할 메트릭 그룹
export const analyticsMetricGroups = {
  // 기존 V1 컨테이너는 그대로 유지 (8개)
  v1Container: [
    'workingMemoryCapacity',
    'visuospatialPrecision', 
    'processingSpeed',
    'sustainedAttention',
    'patternRecognition',
    'cognitiveFlexibility',
    'hippocampusActivation',
    'executiveFunction'
  ] as (keyof ExtendedCognitiveMetrics)[],
  
  // Analytics 페이지 전용 (8개 + 5개 = 13개)
  analyticsPage: [
    'workingMemoryCapacity',
    'visuospatialPrecision', 
    'processingSpeed',
    'sustainedAttention',
    'patternRecognition',
    'cognitiveFlexibility',
    'hippocampusActivation',
    'executiveFunction',
    'spatialMemoryAccuracy',
    'responseConsistency',
    'learningAdaptability',
    'focusEndurance',
    'sequentialProcessing'
  ] as (keyof ExtendedCognitiveMetrics)[],
  
  // 새로운 "감각/감" 시리즈만 (5개)
  newV2Series: [
    'spatialMemoryAccuracy',
    'responseConsistency',
    'learningAdaptability',
    'focusEndurance',
    'sequentialProcessing'
  ] as (keyof ExtendedCognitiveMetrics)[],
}; 
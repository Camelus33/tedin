// 확장된 인지능력 타입 정의 (V2 - "감각/감" 시리즈)
export interface ExtendedCognitiveMetrics {
  // === 기존 V1 인지능력 ===
  workingMemoryCapacity: number;
  visuospatialPrecision: number;
  processingSpeed: number;
  sustainedAttention: number;
  patternRecognition: number;
  cognitiveFlexibility: number;
  hippocampusActivation: number;
  executiveFunction: number;
  
  // === V2 새로운 "감각/감" 시리즈 ===
  spatialMemoryAccuracy: number;     // 🗺️ 길찾기감각
  responseConsistency: number;       // 🎵 리듬감
  learningAdaptability: number;      // 📈 성장감각
  focusEndurance: number;            // 🔥 몰입감
  sequentialProcessing: number;      // 📋 순서감
}

// V2 기본값 생성 헬퍼 함수
export const createDefaultExtendedMetrics = (): ExtendedCognitiveMetrics => ({
  // === 기존 V1 인지능력 ===
  workingMemoryCapacity: 50,
  visuospatialPrecision: 50,
  processingSpeed: 50,
  sustainedAttention: 50,
  patternRecognition: 50,
  cognitiveFlexibility: 50,
  hippocampusActivation: 50,
  executiveFunction: 50,
  
  // === V2 새로운 인지능력 ===
  spatialMemoryAccuracy: 50,
  responseConsistency: 50,
  learningAdaptability: 50,
  focusEndurance: 50,
  sequentialProcessing: 50,
});

// V2 계산 결과를 ExtendedCognitiveMetrics로 변환하는 헬퍼 함수
export const mapV2ToExtended = (v2Result: any): ExtendedCognitiveMetrics => ({
  // === 기존 V1 인지능력 매핑 ===
  workingMemoryCapacity: Math.round(Math.min(100, Math.max(0, v2Result.workingMemory || 50))),
  visuospatialPrecision: Math.round(Math.min(100, Math.max(0, v2Result.attention || 50))), // attention을 visuospatial로 매핑
  processingSpeed: Math.round(Math.min(100, Math.max(0, v2Result.processingSpeed || 50))),
  sustainedAttention: Math.round(Math.min(100, Math.max(0, v2Result.attention || 50))),
  patternRecognition: Math.round(Math.min(100, Math.max(0, v2Result.patternRecognition || 50))),
  cognitiveFlexibility: Math.round(Math.min(100, Math.max(0, v2Result.cognitiveFlexibility || 50))),
  hippocampusActivation: Math.round(Math.min(100, Math.max(0, v2Result.hippocampusActivation || 50))),
  executiveFunction: Math.round(Math.min(100, Math.max(0, 
    (v2Result.workingMemory * 0.25 + 
     v2Result.attention * 0.20 + 
     v2Result.processingSpeed * 0.20 + 
     v2Result.patternRecognition * 0.15 + 
     v2Result.cognitiveFlexibility * 0.20) || 50
  ))),
  
  // === V2 새로운 인지능력 매핑 ===
  spatialMemoryAccuracy: Math.round(Math.min(100, Math.max(0, v2Result.spatialMemoryAccuracy || 50))),
  responseConsistency: Math.round(Math.min(100, Math.max(0, v2Result.responseConsistency || 50))),
  learningAdaptability: Math.round(Math.min(100, Math.max(0, v2Result.learningAdaptability || 50))),
  focusEndurance: Math.round(Math.min(100, Math.max(0, v2Result.focusEndurance || 50))),
  sequentialProcessing: Math.round(Math.min(100, Math.max(0, v2Result.sequentialProcessing || 50))),
});

// 평균 계산 헬퍼 함수
export const calculateAverage = (metrics: any[], fieldName: string): number => {
  const sum = metrics.reduce((acc, m) => acc + (m[fieldName] || 50), 0);
  return sum / metrics.length;
};
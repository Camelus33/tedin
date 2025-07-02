export interface CognitiveProvenance {
  '@type': 'CognitiveContext';
  readingPace: 'deep_focus' | 'steady_reading' | 'skimming_review' | 'unknown';
  sessionPPM?: number;
  timeOfDayContext: 'late_night_insight' | 'morning_routine' | 'day_activity' | 'evening_learning' | 'unknown';
  memoMaturity: 'fully_evolved' | 'partially_evolved' | 'initial_idea';
  description: string;
}

export interface KnowledgePersonality {
  '@type': 'KnowledgePersonality';
  primaryType: 'Visualizer' | 'Connector' | 'Theorist' | 'Pragmatist' | 'Balanced';
  profileDescription: string;
  interactionStrategyForLLM: {
    communicationStyle: string;
    questioningStyle: string;
  };
}

export interface ActionModule {
  '@type': 'HowToAction';
  name: string;
  description: string;
  llmPrompt: string;
}

// PBAM (확률적 신념 및 논증 모델) 관련 인터페이스들
export interface ArgumentUnit {
  '@type': 'ArgumentUnit';
  type: 'Claim' | 'Premise';
  text: string;
  sourceNoteId: string;
  confidence?: number; // 0-1 사이의 신뢰도 (선택적)
}

export interface RhetoricalRelation {
  '@type': 'RhetoricalRelation';
  sourceUnit: ArgumentUnit;
  targetUnit: ArgumentUnit;
  relationType: 'supports' | 'attacks' | 'elaborates';
  strength?: number; // 0-1 사이의 관계 강도 (선택적)
}

export interface BeliefNode {
  '@type': 'BeliefNode';
  id: string;
  label: string;
  probability: number; // 0-1 사이의 신념 확률
  sourceArgumentUnit?: ArgumentUnit; // 이 노드의 근거가 되는 논증 단위 (선택적)
}

export interface BeliefEdge {
  '@type': 'BeliefEdge';
  sourceNodeId: string;
  targetNodeId: string;
  conditionalProbability: number; // 0-1 사이의 조건부 확률
  relationSource?: RhetoricalRelation; // 이 엣지의 근거가 되는 수사적 관계 (선택적)
} 
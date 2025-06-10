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
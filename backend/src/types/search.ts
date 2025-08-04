export interface SearchResult {
  _id: string;
  content: string;
  tags: string[];
  createdAt: string;
  type: string;
  importanceReason?: string;
  momentContext?: string;
  relatedKnowledge?: string;
  mentalImage?: string;
  score: number;
  keywordScore?: number;
  vectorScore?: number;
  combinedScore?: number;
}

export interface SearchContext {
  query: string;
  results: SearchResult[];
  filters?: any;
}

export interface RecommendationQuery {
  id: string;
  text: string;
  relevance: number;
  category?: string;
  usageCount?: number;
}

export interface SearchStatistics {
  totalResults: number;
  averageScore: number;
  scoreDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  typeDistribution: Record<string, number>;
  tagFrequency: Record<string, number>;
} 
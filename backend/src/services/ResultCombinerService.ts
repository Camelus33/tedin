import { loggingService } from './LoggingService';

/**
 * Result Combiner Service
 * Handles combining and ranking results from different search methods
 */
export class ResultCombinerService {
  // Configuration for different combination strategies
  private readonly WEIGHTED_RANKING = 'weighted';
  private readonly RECIPROCAL_RANK_FUSION = 'rrf';
  private readonly HYBRID_APPROACH = 'hybrid';

  /**
   * Combine search results using different strategies
   */
  async combineResults(
    keywordResults: any[],
    vectorResults: any[],
    strategy: 'weighted' | 'rrf' | 'hybrid' = 'weighted',
    options: {
      keywordWeight?: number;
      vectorWeight?: number;
      rrfConstant?: number;
      minScoreThreshold?: number;
      maxResults?: number;
    } = {}
  ) {
    try {
      const startTime = Date.now();

      let combinedResults: any[] = [];

      switch (strategy) {
        case 'weighted':
          combinedResults = this.weightedRanking(keywordResults, vectorResults, options);
          break;
        case 'rrf':
          combinedResults = this.reciprocalRankFusion(keywordResults, vectorResults, options);
          break;
        case 'hybrid':
          combinedResults = this.hybridApproach(keywordResults, vectorResults, options);
          break;
        default:
          combinedResults = this.weightedRanking(keywordResults, vectorResults, options);
      }

      const duration = Date.now() - startTime;
      loggingService.logPerformance('result_combination', duration, {
        strategy,
        keywordResults: keywordResults.length,
        vectorResults: vectorResults.length,
        combinedResults: combinedResults.length,
      });

      return {
        results: combinedResults,
        total: combinedResults.length,
        strategy,
        options,
        combinationStats: {
          duration: `${duration}ms`,
          keywordResults: keywordResults.length,
          vectorResults: vectorResults.length,
          combinedResults: combinedResults.length,
        },
      };
    } catch (error) {
      console.error('Result combination error:', error);
      loggingService.error('Result combination failed', error);
      throw error;
    }
  }

  /**
   * Weighted ranking approach
   */
  private weightedRanking(
    keywordResults: any[],
    vectorResults: any[],
    options: {
      keywordWeight?: number;
      vectorWeight?: number;
      minScoreThreshold?: number;
      maxResults?: number;
    } = {}
  ) {
    const keywordWeight = options.keywordWeight || 0.4;
    const vectorWeight = options.vectorWeight || 0.6;
    const minScoreThreshold = options.minScoreThreshold || 0.1;
    const maxResults = options.maxResults || 50;

    // Normalize scores
    const normalizedKeywordResults = this.normalizeScores(keywordResults, 'keyword');
    const normalizedVectorResults = this.normalizeScores(vectorResults, 'vector');

    // Combine results
    const combinedMap = new Map();

    // Process keyword results
    normalizedKeywordResults.forEach(result => {
      const key = result._id.toString();
      combinedMap.set(key, {
        ...result,
        keywordScore: result.normalizedScore || 0,
        vectorScore: 0,
        combinedScore: (result.normalizedScore || 0) * keywordWeight,
      });
    });

    // Process vector results
    normalizedVectorResults.forEach(result => {
      const key = result._id.toString();
      if (combinedMap.has(key)) {
        // Document exists in both results
        const existing = combinedMap.get(key);
        existing.vectorScore = result.normalizedScore || 0;
        existing.combinedScore += (result.normalizedScore || 0) * vectorWeight;
      } else {
        // Document only in vector results
        combinedMap.set(key, {
          ...result,
          keywordScore: 0,
          vectorScore: result.normalizedScore || 0,
          combinedScore: (result.normalizedScore || 0) * vectorWeight,
        });
      }
    });

    // Convert to array, filter by threshold, and sort
    return Array.from(combinedMap.values())
      .filter(result => result.combinedScore >= minScoreThreshold)
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, maxResults);
  }

  /**
   * Reciprocal Rank Fusion approach
   */
  private reciprocalRankFusion(
    keywordResults: any[],
    vectorResults: any[],
    options: {
      rrfConstant?: number;
      minScoreThreshold?: number;
      maxResults?: number;
    } = {}
  ) {
    const rrfConstant = options.rrfConstant || 60;
    const minScoreThreshold = options.minScoreThreshold || 0.1;
    const maxResults = options.maxResults || 50;

    const combinedMap = new Map();

    // Process keyword results with rank
    keywordResults.forEach((result, index) => {
      const key = result._id.toString();
      const rank = index + 1;
      const rrfScore = 1 / (rrfConstant + rank);

      combinedMap.set(key, {
        ...result,
        keywordRank: rank,
        keywordRrfScore: rrfScore,
        vectorRank: 0,
        vectorRrfScore: 0,
        combinedRrfScore: rrfScore,
      });
    });

    // Process vector results with rank
    vectorResults.forEach((result, index) => {
      const key = result._id.toString();
      const rank = index + 1;
      const rrfScore = 1 / (rrfConstant + rank);

      if (combinedMap.has(key)) {
        // Document exists in both results
        const existing = combinedMap.get(key);
        existing.vectorRank = rank;
        existing.vectorRrfScore = rrfScore;
        existing.combinedRrfScore += rrfScore;
      } else {
        // Document only in vector results
        combinedMap.set(key, {
          ...result,
          keywordRank: 0,
          keywordRrfScore: 0,
          vectorRank: rank,
          vectorRrfScore: rrfScore,
          combinedRrfScore: rrfScore,
        });
      }
    });

    // Convert to array, filter by threshold, and sort
    return Array.from(combinedMap.values())
      .filter(result => result.combinedRrfScore >= minScoreThreshold)
      .sort((a, b) => b.combinedRrfScore - a.combinedRrfScore)
      .slice(0, maxResults);
  }

  /**
   * Hybrid approach combining weighted ranking and RRF
   */
  private hybridApproach(
    keywordResults: any[],
    vectorResults: any[],
    options: {
      keywordWeight?: number;
      vectorWeight?: number;
      rrfConstant?: number;
      minScoreThreshold?: number;
      maxResults?: number;
    } = {}
  ) {
    // Get weighted ranking results
    const weightedResults = this.weightedRanking(keywordResults, vectorResults, options);
    
    // Get RRF results
    const rrfResults = this.reciprocalRankFusion(keywordResults, vectorResults, options);

    // Combine both approaches
    const hybridMap = new Map();

    // Process weighted results
    weightedResults.forEach((result, index) => {
      const key = result._id.toString();
      hybridMap.set(key, {
        ...result,
        weightedRank: index + 1,
        rrfRank: 0,
        hybridScore: result.combinedScore * 0.7, // 70% weight for weighted ranking
      });
    });

    // Process RRF results
    rrfResults.forEach((result, index) => {
      const key = result._id.toString();
      if (hybridMap.has(key)) {
        // Document exists in both approaches
        const existing = hybridMap.get(key);
        existing.rrfRank = index + 1;
        existing.hybridScore += result.combinedRrfScore * 0.3; // 30% weight for RRF
      } else {
        // Document only in RRF results
        hybridMap.set(key, {
          ...result,
          weightedRank: 0,
          rrfRank: index + 1,
          hybridScore: result.combinedRrfScore * 0.3,
        });
      }
    });

    // Convert to array and sort by hybrid score
    return Array.from(hybridMap.values())
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, options.maxResults || 50);
  }

  /**
   * Normalize scores to 0-1 range
   */
  private normalizeScores(results: any[], searchType: 'keyword' | 'vector') {
    if (results.length === 0) return results;

    const scores = results.map(r => r.score).filter(s => s !== undefined);
    if (scores.length === 0) return results;

    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const range = maxScore - minScore;

    if (range === 0) {
      // All scores are the same, assign equal normalized scores
      return results.map(r => ({ ...r, normalizedScore: 0.5 }));
    }

    return results.map(r => ({
      ...r,
      normalizedScore: r.score !== undefined ? (r.score - minScore) / range : 0,
    }));
  }

  /**
   * Calculate search result diversity
   */
  calculateDiversity(results: any[]): number {
    if (results.length <= 1) return 1;

    const tags = new Set();
    const contentLengths = new Set();

    results.forEach(result => {
      if (result.tags) {
        result.tags.forEach((tag: string) => tags.add(tag));
      }
      if (result.content) {
        contentLengths.add(result.content.length);
      }
    });

    const tagDiversity = tags.size / results.length;
    const contentDiversity = contentLengths.size / results.length;

    return (tagDiversity + contentDiversity) / 2;
  }

  /**
   * Calculate search result relevance score
   */
  calculateRelevanceScore(results: any[], query: string): number {
    if (results.length === 0) return 0;

    const queryTerms = query.toLowerCase().split(/\s+/);
    let totalRelevance = 0;

    results.forEach(result => {
      const content = (result.content || '').toLowerCase();
      const tags = (result.tags || []).join(' ').toLowerCase();
      const allText = `${content} ${tags}`;

      let relevance = 0;
      queryTerms.forEach(term => {
        if (allText.includes(term)) {
          relevance += 1;
        }
      });

      totalRelevance += relevance / queryTerms.length;
    });

    return totalRelevance / results.length;
  }

  /**
   * Optimize search results based on user feedback
   */
  optimizeResults(
    results: any[],
    userFeedback: {
      clickedResults: string[];
      skippedResults: string[];
      searchQuery: string;
    }
  ) {
    const optimizedResults = [...results];

    // Boost clicked results
    optimizedResults.forEach(result => {
      if (userFeedback.clickedResults.includes(result._id.toString())) {
        result.score = (result.score || 0) * 1.5;
      }
    });

    // Penalize skipped results
    optimizedResults.forEach(result => {
      if (userFeedback.skippedResults.includes(result._id.toString())) {
        result.score = (result.score || 0) * 0.7;
      }
    });

    // Re-sort by optimized scores
    return optimizedResults.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
}

// Singleton instance
export const resultCombinerService = new ResultCombinerService(); 
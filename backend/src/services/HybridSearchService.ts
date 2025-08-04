import { MongoClient, Db } from 'mongodb';
import { embeddingService } from './EmbeddingService';
import { loggingService } from './LoggingService';
import { resultCombinerService } from './ResultCombinerService';
import { cacheService } from './CacheService';

/**
 * Hybrid Search Service
 * Combines keyword search and vector search for improved accuracy
 */
export class HybridSearchService {
  private client: MongoClient;
  private db: Db;

  // Hybrid search configuration
  private readonly KEYWORD_WEIGHT = 0.4;  // 40% weight for keyword search
  private readonly VECTOR_WEIGHT = 0.6;   // 60% weight for vector search
  private readonly MIN_SCORE_THRESHOLD = 0.1; // Minimum score threshold
  private readonly MAX_RESULTS = 50;      // Maximum results to return

  constructor() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';
    this.client = new MongoClient(MONGODB_URI);
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      await this.client.connect();
      this.db = this.client.db();
      console.log('HybridSearchService initialized');
    } catch (error) {
      console.error('HybridSearchService initialization error:', error);
      throw error;
    }
  }

  /**
   * Perform keyword search using MongoDB Atlas Search
   */
  private async performKeywordSearch(
    query: string,
    filters: {
      userId?: string;
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
    } = {}
  ) {
    try {
      const startTime = Date.now();
      
      // Build keyword search pipeline
      const pipeline: any[] = [];

      // Add match stage for filters
      const matchStage: any = {};
      if (filters.userId) {
        matchStage.userId = filters.userId;
      }
      if (filters.tags && filters.tags.length > 0) {
        matchStage.tags = { $in: filters.tags };
      }
      if (filters.dateRange) {
        matchStage.createdAt = {
          $gte: filters.dateRange.start,
          $lte: filters.dateRange.end,
        };
      }

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Add text search stage
      pipeline.push({
        $search: {
          index: 'notes_text_index',
          text: {
            query,
            path: ['content', 'tags'],
            fuzzy: {
              maxEdits: 1,
              prefixLength: 3,
            },
          },
        },
      });

      // Add projection stage
      pipeline.push({
        $project: {
          _id: 1,
          content: 1,
          tags: 1,
          createdAt: 1,
          userId: 1,
          type: 1,
          importanceReason: 1,
          momentContext: 1,
          relatedKnowledge: 1,
          mentalImage: 1,
          score: { $meta: 'searchScore' },
        },
      });

      // Add sort stage
      pipeline.push({
        $sort: { score: -1 },
      });

      // Add limit stage
      pipeline.push({
        $limit: filters.limit || this.MAX_RESULTS,
      });

      const collection = this.db.collection('notes');
      const results = await collection.aggregate(pipeline).toArray();

      const duration = Date.now() - startTime;
      loggingService.logPerformance('keyword_search', duration, { query, results: results.length });

      return results;
    } catch (error) {
      console.error('Keyword search error:', error);
      loggingService.error('Keyword search failed', error);
      return [];
    }
  }

  /**
   * Perform vector search using MongoDB Atlas Vector Search
   */
  private async performVectorSearch(
    query: string,
    filters: {
      userId?: string;
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
    } = {}
  ) {
    try {
      const startTime = Date.now();
      
      // Generate embedding for the query
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // Build vector search pipeline
      const pipeline: any[] = [];

      // Add match stage for filters
      const matchStage: any = {};
      if (filters.userId) {
        matchStage.userId = filters.userId;
      }
      if (filters.tags && filters.tags.length > 0) {
        matchStage.tags = { $in: filters.tags };
      }
      if (filters.dateRange) {
        matchStage.createdAt = {
          $gte: filters.dateRange.start,
          $lte: filters.dateRange.end,
        };
      }

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

      // Add vector search stage
      pipeline.push({
        $vectorSearch: {
          index: 'notes_vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: filters.limit || this.MAX_RESULTS,
        },
      });

      // Add projection stage
      pipeline.push({
        $project: {
          _id: 1,
          content: 1,
          tags: 1,
          createdAt: 1,
          userId: 1,
          type: 1,
          importanceReason: 1,
          momentContext: 1,
          relatedKnowledge: 1,
          mentalImage: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      });

      // Add sort stage
      pipeline.push({
        $sort: { score: -1 },
      });

      const collection = this.db.collection('notes');
      const results = await collection.aggregate(pipeline).toArray();

      const duration = Date.now() - startTime;
      loggingService.logPerformance('vector_search', duration, { query, results: results.length });

      return results;
    } catch (error) {
      console.error('Vector search error:', error);
      loggingService.error('Vector search failed', error);
      return [];
    }
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
   * Combine and rank results from both searches
   */
  private combineResults(keywordResults: any[], vectorResults: any[]) {
    const combinedMap = new Map();

    // Process keyword results
    keywordResults.forEach(result => {
      const key = result._id.toString();
      combinedMap.set(key, {
        ...result,
        keywordScore: result.normalizedScore || 0,
        vectorScore: 0,
        combinedScore: (result.normalizedScore || 0) * this.KEYWORD_WEIGHT,
      });
    });

    // Process vector results
    vectorResults.forEach(result => {
      const key = result._id.toString();
      if (combinedMap.has(key)) {
        // Document exists in both results
        const existing = combinedMap.get(key);
        existing.vectorScore = result.normalizedScore || 0;
        existing.combinedScore += (result.normalizedScore || 0) * this.VECTOR_WEIGHT;
      } else {
        // Document only in vector results
        combinedMap.set(key, {
          ...result,
          keywordScore: 0,
          vectorScore: result.normalizedScore || 0,
          combinedScore: (result.normalizedScore || 0) * this.VECTOR_WEIGHT,
        });
      }
    });

    // Convert to array and sort by combined score
    const combinedResults = Array.from(combinedMap.values())
      .filter(result => result.combinedScore >= this.MIN_SCORE_THRESHOLD)
      .sort((a, b) => b.combinedScore - a.combinedScore);

    return combinedResults;
  }

  /**
   * Perform hybrid search combining keyword and vector search
   */
  async hybridSearch(
    query: string,
    filters: {
      userId?: string;
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
    } = {},
    options: {
      strategy?: 'weighted' | 'rrf' | 'hybrid';
      keywordWeight?: number;
      vectorWeight?: number;
      rrfConstant?: number;
      minScoreThreshold?: number;
      useCache?: boolean;
      cacheTTL?: number;
    } = {}
  ) {
    try {
      const startTime = Date.now();
      
      // Check cache first if enabled
      if (options.useCache !== false) {
        const cachedResult = cacheService.getCachedSearchResult(query, filters);
        if (cachedResult) {
          loggingService.info('Cache hit for hybrid search', { query });
          return {
            ...cachedResult,
            fromCache: true,
          };
        }
      }

      loggingService.info('Starting hybrid search', { query, filters, options });

      // Perform both searches in parallel with error handling
      let keywordResults: any[] = [];
      let vectorResults: any[] = [];

      try {
        [keywordResults, vectorResults] = await Promise.allSettled([
          this.performKeywordSearch(query, filters),
          this.performVectorSearch(query, filters),
        ]).then(results => [
          results[0].status === 'fulfilled' ? results[0].value : [],
          results[1].status === 'fulfilled' ? results[1].value : [],
        ]);
      } catch (error) {
        loggingService.error('Search execution failed', error);
        // Fallback to individual searches
        try {
          keywordResults = await this.performKeywordSearch(query, filters);
        } catch (keywordError) {
          loggingService.error('Keyword search failed', keywordError);
        }
        
        try {
          vectorResults = await this.performVectorSearch(query, filters);
        } catch (vectorError) {
          loggingService.error('Vector search failed', vectorError);
        }
      }

      // Use ResultCombinerService to combine results
      const combinedResults = await resultCombinerService.combineResults(
        keywordResults,
        vectorResults,
        options.strategy || 'weighted',
        {
          keywordWeight: options.keywordWeight || this.KEYWORD_WEIGHT,
          vectorWeight: options.vectorWeight || this.VECTOR_WEIGHT,
          rrfConstant: options.rrfConstant,
          minScoreThreshold: options.minScoreThreshold || this.MIN_SCORE_THRESHOLD,
          maxResults: filters.limit || this.MAX_RESULTS,
        }
      );

      const duration = Date.now() - startTime;
      loggingService.logPerformance('hybrid_search', duration, {
        query,
        keywordResults: keywordResults.length,
        vectorResults: vectorResults.length,
        combinedResults: combinedResults.results.length,
        strategy: options.strategy || 'weighted',
      });

      const result = {
        ...combinedResults,
        query,
        filters,
        searchStats: {
          keywordResults: keywordResults.length,
          vectorResults: vectorResults.length,
          combinedResults: combinedResults.results.length,
          duration: `${duration}ms`,
          strategy: options.strategy || 'weighted',
        },
      };

      // Cache the result if enabled
      if (options.useCache !== false) {
        cacheService.cacheSearchResult(query, filters, result, options.cacheTTL);
      }

      return result;
    } catch (error) {
      console.error('Hybrid search error:', error);
      loggingService.error('Hybrid search failed', error);
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  async close() {
    try {
      await this.client.close();
      console.log('HybridSearchService connection closed');
    } catch (error) {
      console.error('Error closing HybridSearchService:', error);
    }
  }
}

// Singleton instance
export const hybridSearchService = new HybridSearchService(); 
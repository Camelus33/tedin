import { MongoClient, Db } from 'mongodb';
import { embeddingService } from './EmbeddingService';
import { loggingService } from './LoggingService';
import { resultCombinerService } from './ResultCombinerService';
import { cacheService } from './CacheService';
import { NaturalLanguageParserService } from './NaturalLanguageParserService';

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
      timeRange?: { start: string; end: string };
      comprehensionScore?: { min: number; max?: number; operator: 'gte' | 'lte' | 'eq' | 'range' };
      limit?: number;
    } = {}
  ) {
    try {
      const startTime = Date.now();
      
      // Build keyword search pipeline
      const pipeline: any[] = [];

      // Add text search stage FIRST (required for Atlas Search)
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

      // Add match stage for filters AFTER search
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
      if (filters.timeRange) {
        // 시간 필터링을 위한 추가 조건
        matchStage.$expr = {
          $and: [
            {
              $gte: [
                { $dateToString: { format: '%H:%M', date: '$createdAt' } },
                filters.timeRange.start
              ]
            },
            {
              $lte: [
                { $dateToString: { format: '%H:%M', date: '$createdAt' } },
                filters.timeRange.end
              ]
            }
          ]
        };
      }
      if (filters.comprehensionScore) {
        // 이해도점수 필터링
        const { min, max, operator } = filters.comprehensionScore;
        if (operator === 'gte') {
          matchStage.comprehensionScore = { $gte: min };
        } else if (operator === 'lte') {
          matchStage.comprehensionScore = { $lte: min };
        } else if (operator === 'eq') {
          matchStage.comprehensionScore = min;
        } else if (operator === 'range' && max) {
          matchStage.comprehensionScore = { $gte: min, $lte: max };
        }
      }

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

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
          comprehensionScore: 1,
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
      timeRange?: { start: string; end: string };
      comprehensionScore?: { min: number; max?: number; operator: 'gte' | 'lte' | 'eq' | 'range' };
      limit?: number;
    } = {}
  ) {
    try {
      const startTime = Date.now();
      
      // Generate embedding for the query
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // Build vector search pipeline
      const pipeline: any[] = [];

      // Add vector search stage FIRST (required for Atlas Vector Search)
      pipeline.push({
        $vectorSearch: {
          index: 'notes_vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: filters.limit || this.MAX_RESULTS,
        },
      });

      // Add match stage for filters AFTER search
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
      if (filters.timeRange) {
        // 시간 필터링을 위한 추가 조건
        matchStage.$expr = {
          $and: [
            {
              $gte: [
                { $dateToString: { format: '%H:%M', date: '$createdAt' } },
                filters.timeRange.start
              ]
            },
            {
              $lte: [
                { $dateToString: { format: '%H:%M', date: '$createdAt' } },
                filters.timeRange.end
              ]
            }
          ]
        };
      }
      if (filters.comprehensionScore) {
        // 이해도점수 필터링
        const { min, max, operator } = filters.comprehensionScore;
        if (operator === 'gte') {
          matchStage.comprehensionScore = { $gte: min };
        } else if (operator === 'lte') {
          matchStage.comprehensionScore = { $lte: min };
        } else if (operator === 'eq') {
          matchStage.comprehensionScore = min;
        } else if (operator === 'range' && max) {
          matchStage.comprehensionScore = { $gte: min, $lte: max };
        }
      }

      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }

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
          comprehensionScore: 1,
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
      timeRange?: { start: string; end: string };
      comprehensionScore?: { min: number; max?: number; operator: 'gte' | 'lte' | 'eq' | 'range' };
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
      
      // Extract natural language information from query
      const { cleanQuery, naturalLanguageInfo } = NaturalLanguageParserService.extractNaturalLanguageInfo(query);
      
      // Update filters with extracted natural language information
      const updatedFilters = { ...filters };
      if (naturalLanguageInfo) {
        if (naturalLanguageInfo.type === 'date' || naturalLanguageInfo.type === 'range') {
          updatedFilters.dateRange = {
            start: naturalLanguageInfo.start,
            end: naturalLanguageInfo.end,
          };
        }
        if (naturalLanguageInfo.type === 'time') {
          updatedFilters.timeRange = naturalLanguageInfo.timeRange;
        }
        if (naturalLanguageInfo.type === 'comprehension') {
          updatedFilters.comprehensionScore = naturalLanguageInfo.comprehensionScore;
        }
      }
      
      // Use clean query for search
      const searchQuery = cleanQuery || query;
      
      // Check cache first if enabled
      if (options.useCache !== false) {
        const cachedResult = cacheService.getCachedSearchResult(searchQuery, updatedFilters);
        if (cachedResult) {
          loggingService.info('Cache hit for hybrid search', { query: searchQuery });
          return {
            ...cachedResult,
            fromCache: true,
            dateTimeInfo: naturalLanguageInfo,
          };
        }
      }

      loggingService.info('Starting hybrid search', { 
        originalQuery: query, 
        searchQuery, 
        filters: updatedFilters, 
        dateTimeInfo: naturalLanguageInfo,
        options 
      });

      // Perform both searches in parallel with error handling
      let keywordResults: any[] = [];
      let vectorResults: any[] = [];

      try {
        [keywordResults, vectorResults] = await Promise.allSettled([
          this.performKeywordSearch(searchQuery, updatedFilters),
          this.performVectorSearch(searchQuery, updatedFilters),
        ]).then(results => [
          results[0].status === 'fulfilled' ? results[0].value : [],
          results[1].status === 'fulfilled' ? results[1].value : [],
        ]);
      } catch (error) {
        loggingService.error('Search execution failed', error);
        // Fallback to individual searches
        try {
          keywordResults = await this.performKeywordSearch(searchQuery, updatedFilters);
        } catch (keywordError) {
          loggingService.error('Keyword search failed', keywordError);
        }
        
        try {
          vectorResults = await this.performVectorSearch(searchQuery, updatedFilters);
        } catch (vectorError) {
          loggingService.error('Vector search failed', vectorError);
        }
      }

      // Normalize scores
      const normalizedKeywordResults = this.normalizeScores(keywordResults, 'keyword');
      const normalizedVectorResults = this.normalizeScores(vectorResults, 'vector');

      // Combine results based on strategy
      let combinedResults: any[] = [];
      
      switch (options.strategy || 'weighted') {
        case 'weighted':
          combinedResults = this.combineResults(
            normalizedKeywordResults,
            normalizedVectorResults
          );
          break;
          
        case 'rrf':
          const rrfResult = await resultCombinerService.combineResults(
            normalizedKeywordResults,
            normalizedVectorResults,
            'rrf',
            { rrfConstant: options.rrfConstant || 60 }
          );
          combinedResults = rrfResult.results;
          break;
          
        case 'hybrid':
          const hybridResult = await resultCombinerService.combineResults(
            normalizedKeywordResults,
            normalizedVectorResults,
            'hybrid'
          );
          combinedResults = hybridResult.results;
          break;
          
        default:
          combinedResults = this.combineResults(
            normalizedKeywordResults,
            normalizedVectorResults
          );
      }

      // Apply minimum score threshold
      const minThreshold = options.minScoreThreshold || this.MIN_SCORE_THRESHOLD;
      combinedResults = combinedResults.filter(result => result.combinedScore >= minThreshold);

      // Limit results
      const limit = updatedFilters.limit || this.MAX_RESULTS;
      combinedResults = combinedResults.slice(0, limit);

      const duration = Date.now() - startTime;
      loggingService.logPerformance('hybrid_search', duration, { 
        query: searchQuery, 
        results: combinedResults.length,
        dateTimeInfo: naturalLanguageInfo 
      });

      const result = {
        results: combinedResults,
        total: combinedResults.length,
        query: searchQuery,
        originalQuery: query,
        dateTimeInfo: naturalLanguageInfo,
        filters: updatedFilters,
        strategy: options.strategy || 'weighted',
        performance: {
          duration,
          keywordResults: keywordResults.length,
          vectorResults: vectorResults.length,
        },
      };

      // Cache the result if enabled
      if (options.useCache !== false) {
        cacheService.cacheSearchResult(searchQuery, updatedFilters, result, options.cacheTTL);
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
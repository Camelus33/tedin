import { MongoClient, Db } from 'mongodb';
import { loggingService } from './LoggingService';

/**
 * Keyword Search Service
 * Handles text-based search using MongoDB Atlas Search
 */
export class KeywordSearchService {
  private client: MongoClient;
  private db: Db;

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
      console.log('KeywordSearchService initialized');
    } catch (error) {
      console.error('KeywordSearchService initialization error:', error);
      throw error;
    }
  }

  /**
   * Perform keyword search with advanced options
   */
  async keywordSearch(
    query: string,
    filters: {
      userId?: string;
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
      searchFields?: string[];
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

      // Determine search fields
      const searchFields = filters.searchFields || ['content', 'tags'];

      // Add text search stage
      pipeline.push({
        $search: {
          index: 'notes_text_index',
          text: {
            query,
            path: searchFields,
            fuzzy: {
              maxEdits: 1,
              prefixLength: 3,
            },
            synonyms: {
              analyzer: 'lucene.korean',
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
        $limit: filters.limit || 50,
      });

      const collection = this.db.collection('notes');
      const results = await collection.aggregate(pipeline).toArray();

      const duration = Date.now() - startTime;
      loggingService.logPerformance('keyword_search', duration, { 
        query, 
        results: results.length,
        searchFields 
      });

      return {
        results,
        total: results.length,
        query,
        filters,
        searchStats: {
          duration: `${duration}ms`,
          searchFields,
        },
      };
    } catch (error) {
      console.error('Keyword search error:', error);
      loggingService.error('Keyword search failed', error);
      throw error;
    }
  }

  /**
   * Search for specific content types
   */
  async searchByContentType(
    query: string,
    contentType: 'content' | 'tags' | 'importanceReason' | 'momentContext' | 'relatedKnowledge' | 'mentalImage',
    filters: {
      userId?: string;
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
    } = {}
  ) {
    return this.keywordSearch(query, {
      ...filters,
      searchFields: [contentType],
    });
  }

  /**
   * Search for incomplete memos using keyword search
   */
  async searchIncompleteMemos(
    userId: string,
    subject?: string,
    limit: number = 20
  ) {
    try {
      // Search for memos with empty or missing fields
      const pipeline: any[] = [
        { $match: { userId } },
        {
          $match: {
            $or: [
              { importanceReason: { $exists: false } },
              { importanceReason: '' },
              { momentContext: { $exists: false } },
              { momentContext: '' },
              { relatedKnowledge: { $exists: false } },
              { relatedKnowledge: '' },
              { mentalImage: { $exists: false } },
              { mentalImage: '' },
            ],
          },
        },
      ];

      if (subject) {
        pipeline.push({
          $match: { tags: { $in: [subject] } },
        });
      }

      pipeline.push(
        { $sort: { createdAt: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 1,
            content: 1,
            tags: 1,
            createdAt: 1,
            importanceReason: 1,
            momentContext: 1,
            relatedKnowledge: 1,
            mentalImage: 1,
          },
        }
      );

      const collection = this.db.collection('notes');
      const results = await collection.aggregate(pipeline).toArray();

      return {
        results,
        total: results.length,
        searchType: 'incomplete_memos',
        filters: { userId, subject },
      };
    } catch (error) {
      console.error('Search incomplete memos error:', error);
      loggingService.error('Search incomplete memos failed', error);
      throw error;
    }
  }

  /**
   * Search for memos by date range
   */
  async searchByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    query?: string,
    limit: number = 50
  ) {
    try {
      const filters = {
        userId,
        dateRange: { start: startDate, end: endDate },
        limit,
      };

      if (query) {
        return this.keywordSearch(query, filters);
      } else {
        // Return all memos in date range
        const pipeline = [
          { $match: { userId } },
          {
            $match: {
              createdAt: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: limit },
        ];

        const collection = this.db.collection('notes');
        const results = await collection.aggregate(pipeline).toArray();

        return {
          results,
          total: results.length,
          searchType: 'date_range',
          filters: { userId, startDate, endDate },
        };
      }
    } catch (error) {
      console.error('Search by date range error:', error);
      loggingService.error('Search by date range failed', error);
      throw error;
    }
  }

  /**
   * Search for memos by tags
   */
  async searchByTags(
    userId: string,
    tags: string[],
    query?: string,
    limit: number = 50
  ) {
    try {
      const filters = {
        userId,
        tags,
        limit,
      };

      if (query) {
        return this.keywordSearch(query, filters);
      } else {
        // Return all memos with specified tags
        const pipeline = [
          { $match: { userId } },
          { $match: { tags: { $in: tags } } },
          { $sort: { createdAt: -1 } },
          { $limit: limit },
        ];

        const collection = this.db.collection('notes');
        const results = await collection.aggregate(pipeline).toArray();

        return {
          results,
          total: results.length,
          searchType: 'tags',
          filters: { userId, tags },
        };
      }
    } catch (error) {
      console.error('Search by tags error:', error);
      loggingService.error('Search by tags failed', error);
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  async close() {
    try {
      await this.client.close();
      console.log('KeywordSearchService connection closed');
    } catch (error) {
      console.error('Error closing KeywordSearchService:', error);
    }
  }
}

// Singleton instance
export const keywordSearchService = new KeywordSearchService(); 
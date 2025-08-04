import { MongoClient, Db } from 'mongodb';
import { embeddingService } from './EmbeddingService';
import { ObjectId } from 'mongodb';

/**
 * Semantic Search Service
 * Handles semantic search using MongoDB Atlas Vector Search
 */
export class SemanticSearchService {
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
      console.log('SemanticSearchService initialized');
    } catch (error) {
      console.error('SemanticSearchService initialization error:', error);
      throw error;
    }
  }

  /**
   * Perform semantic search with filters
   */
  async semanticSearch(
    query: string,
    filters: {
      userId?: string;
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
      numCandidates?: number;
    } = {}
  ) {
    try {
      // Generate embedding for the query
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // Build aggregation pipeline
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
          numCandidates: filters.numCandidates || 100,
          limit: filters.limit || 10,
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

      return {
        results,
        total: results.length,
        query,
        filters,
      };
    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }

  /**
   * Search for incomplete memos (for exam students)
   */
  async searchIncompleteMemos(
    userId: string,
    subject?: string,
    limit: number = 20
  ) {
    try {
      const query = 'incomplete memo cards that need more details';
      
      const filters = {
        userId,
        tags: subject ? [subject] : undefined,
        limit,
      };

      const results = await this.semanticSearch(query, filters);

      // Filter for incomplete memos
      const incompleteMemos = results.results.filter((memo: any) => {
        return !memo.importanceReason || 
               !memo.momentContext || 
               !memo.relatedKnowledge ||
               !memo.mentalImage;
      });

      return {
        ...results,
        results: incompleteMemos,
        total: incompleteMemos.length,
      };
    } catch (error) {
      console.error('Search incomplete memos error:', error);
      throw error;
    }
  }

  /**
   * Search for memos by specific learning criteria
   */
  async searchByLearningCriteria(
    criteria: string,
    userId: string,
    options: {
      subject?: string;
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
    } = {}
  ) {
    try {
      const filters = {
        userId,
        tags: options.subject ? [options.subject, ...(options.tags || [])] : options.tags,
        dateRange: options.dateRange,
        limit: options.limit || 20,
      };

      return await this.semanticSearch(criteria, filters);
    } catch (error) {
      console.error('Search by learning criteria error:', error);
      throw error;
    }
  }

  /**
   * Find similar memos
   */
  async findSimilarMemos(
    memoId: string,
    userId: string,
    limit: number = 10
  ) {
    try {
      // Get the target memo
      const collection = this.db.collection('notes');
      const targetMemo = await collection.findOne({ _id: new ObjectId(memoId), userId });

      if (!targetMemo || !targetMemo.embedding) {
        throw new Error('Memo not found or no embedding available');
      }

      // Search for similar memos using the target memo's embedding
      const pipeline = [
        { $match: { userId, _id: { $ne: memoId } } },
        {
          $vectorSearch: {
            index: 'notes_vector_index',
            path: 'embedding',
            queryVector: targetMemo.embedding,
            numCandidates: 50,
            limit,
          },
        },
        {
          $project: {
            _id: 1,
            content: 1,
            tags: 1,
            createdAt: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
        { $sort: { score: -1 } },
      ];

      const results = await collection.aggregate(pipeline).toArray();

      return {
        results,
        total: results.length,
        targetMemo: {
          _id: targetMemo._id,
          content: targetMemo.content,
          tags: targetMemo.tags,
        },
      };
    } catch (error) {
      console.error('Find similar memos error:', error);
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  async close() {
    try {
      await this.client.close();
      console.log('SemanticSearchService connection closed');
    } catch (error) {
      console.error('Error closing SemanticSearchService:', error);
    }
  }
}

// Singleton instance
export const semanticSearchService = new SemanticSearchService(); 
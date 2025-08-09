import { MongoClient, Db } from 'mongodb';
import OpenAI from 'openai';
import { loggingService } from './LoggingService';

/**
 * Vector Search Service for MongoDB Atlas
 * Handles semantic search using OpenAI embeddings
 */
export class VectorSearchService {
  private client: MongoClient;
  private db: Db;
  private openai: OpenAI | null = null;

  constructor() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';
    this.client = new MongoClient(MONGODB_URI);
    // Don't initialize OpenAI client immediately
    // Will be initialized lazily when needed
  }

  /**
   * Initialize OpenAI client lazily
   */
  private initializeOpenAI() {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for vector search');
      }
      this.openai = new OpenAI({
        apiKey,
      });
    }
    return this.openai;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    try {
      await this.client.connect();
      this.db = this.client.db();
      console.log('VectorSearchService initialized');
    } catch (error) {
      console.error('VectorSearchService initialization error:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings using OpenAI API
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const openai = this.initializeOpenAI();
      
      // Truncate text if too long (OpenAI has token limits)
      const truncatedText = text.length > 8000 ? text.substring(0, 8000) : text;

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: truncatedText,
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding generation error:', error);
      loggingService.error('Embedding generation failed', error);
      throw error;
    }
  }

  /**
   * Store document with embedding
   */
  async storeDocumentWithEmbedding(
    collectionName: string,
    document: any,
    textField: string
  ) {
    try {
      const embedding = await this.generateEmbedding(document[textField]);
      const documentWithEmbedding = {
        ...document,
        embedding,
        embeddingGeneratedAt: new Date(),
      };

      const collection = this.db.collection(collectionName);
      await collection.insertOne(documentWithEmbedding);
      
      console.log(`Document stored with embedding in ${collectionName}`);
      loggingService.info('Document stored with embedding', { 
        collectionName, 
        documentId: document._id 
      });
    } catch (error) {
      console.error('Error storing document with embedding:', error);
      loggingService.error('Failed to store document with embedding', error);
      throw error;
    }
  }

  /**
   * Perform semantic search with advanced options
   */
  async semanticSearch(
    query: string,
    filters: {
      userId?: string;
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
      numCandidates?: number;
      similarityThreshold?: number;
    } = {}
  ) {
    try {
      const startTime = Date.now();
      
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
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
          limit: filters.limit || 50,
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

      // Apply similarity threshold if specified
      if (filters.similarityThreshold) {
        pipeline.push({
          $match: {
            score: { $gte: filters.similarityThreshold },
          },
        });
      }

      const collection = this.db.collection('notes');
      const results = await collection.aggregate(pipeline).toArray();

      const duration = Date.now() - startTime;
      loggingService.logPerformance('vector_search', duration, { 
        query, 
        results: results.length,
        numCandidates: filters.numCandidates || 100,
        similarityThreshold: filters.similarityThreshold 
      });

      return {
        results,
        total: results.length,
        query,
        filters,
        searchStats: {
          duration: `${duration}ms`,
          numCandidates: filters.numCandidates || 100,
          similarityThreshold: filters.similarityThreshold,
        },
      };
    } catch (error) {
      console.error('Semantic search error:', error);
      loggingService.error('Semantic search failed', error);
      throw error;
    }
  }

  /**
   * Search for similar memos based on content
   */
  async findSimilarMemos(
    content: string,
    userId: string,
    limit: number = 10,
    similarityThreshold: number = 0.7
  ) {
    try {
      return await this.semanticSearch(content, {
        userId,
        limit,
        similarityThreshold,
      });
    } catch (error) {
      console.error('Find similar memos error:', error);
      loggingService.error('Find similar memos failed', error);
      throw error;
    }
  }

  /**
   * Search for memos by semantic concepts
   */
  async searchByConcept(
    concept: string,
    userId: string,
    filters: {
      tags?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
    } = {}
  ) {
    try {
      // Expand concept with related terms for better semantic search
      const expandedQuery = this.expandConceptQuery(concept);
      
      return await this.semanticSearch(expandedQuery, {
        userId,
        ...filters,
      });
    } catch (error) {
      console.error('Search by concept error:', error);
      loggingService.error('Search by concept failed', error);
      throw error;
    }
  }

  /**
   * Expand concept query with related terms
   */
  private expandConceptQuery(concept: string): string {
    // Simple concept expansion - can be enhanced with more sophisticated methods
    const conceptExpansions: { [key: string]: string[] } = {
      '수학': ['수학', '계산', '공식', '문제', '풀이', '미적분', '미분', '적분'],
      '영어': ['영어', '문법', '단어', '독해', '회화', '영작'],
      '과학': ['과학', '실험', '이론', '법칙', '물리', '화학', '생물'],
      '국어': ['국어', '문학', '문법', '독서', '작문', '어휘'],
      '역사': ['역사', '사건', '인물', '시대', '문화', '정치'],
    };

    const expandedTerms = conceptExpansions[concept] || [concept];
    return expandedTerms.join(' ');
  }

  /**
   * Search for memos by learning difficulty
   */
  async searchByDifficulty(
    difficulty: 'easy' | 'medium' | 'hard',
    userId: string,
    subject?: string,
    limit: number = 20
  ) {
    try {
      const difficultyQueries = {
        easy: '기초 개념 이해하기 쉬운 내용',
        medium: '중간 수준의 개념과 문제',
        hard: '어려운 개념과 복잡한 문제',
      };

      const query = difficultyQueries[difficulty];
      const filters: any = { userId, limit };

      if (subject) {
        filters.tags = [subject];
      }

      return await this.semanticSearch(query, filters);
    } catch (error) {
      console.error('Search by difficulty error:', error);
      loggingService.error('Search by difficulty failed', error);
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  async close() {
    try {
      await this.client.close();
      console.log('VectorSearchService connection closed');
    } catch (error) {
      console.error('Error closing VectorSearchService:', error);
    }
  }
}

// Singleton instance
export const vectorSearchService = new VectorSearchService(); 
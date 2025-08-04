import { Request, Response } from 'express';
import { semanticSearchService } from '../services/SemanticSearchService';
import { hybridSearchService } from '../services/HybridSearchService';
import Note from '../models/Note';

/**
 * Memo Search Controller
 * Handles hybrid search (keyword + vector) for memo cards
 */
export class MemoSearchController {
  /**
   * Initialize search services
   */
  static async initialize() {
    try {
      await semanticSearchService.initialize();
      await hybridSearchService.initialize();
      console.log('MemoSearchController initialized');
    } catch (error) {
      console.error('MemoSearchController initialization error:', error);
      throw error;
    }
  }

  /**
   * Search memos using hybrid search (keyword + vector)
   */
  static async searchMemos(req: Request, res: Response) {
    try {
      const { 
        query, 
        limit = 10, 
        userId,
        strategy = 'weighted',
        keywordWeight = 0.4,
        vectorWeight = 0.6,
        useCache = true
      } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Perform hybrid search
      const searchResults = await hybridSearchService.hybridSearch(query, {
        userId,
        limit,
      }, {
        strategy,
        keywordWeight,
        vectorWeight,
        useCache,
      });

      // Include natural language information in response
      const response = {
        ...searchResults,
        naturalLanguageInfo: searchResults.dateTimeInfo,
        originalQuery: searchResults.originalQuery,
        searchQuery: searchResults.query,
      };

      res.json(response);
    } catch (error) {
      console.error('Hybrid search memos error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Search memos by specific criteria using hybrid search
   */
  static async searchMemosByCriteria(req: Request, res: Response) {
    try {
      const { 
        criteria, 
        subject, 
        tags, 
        dateRange, 
        completionStatus,
        userId,
        strategy = 'weighted',
        keywordWeight = 0.4,
        vectorWeight = 0.6
      } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Build filters for hybrid search
      const filters: any = { userId };

      if (subject) {
        filters.tags = [subject];
      }

      if (tags && tags.length > 0) {
        filters.tags = tags;
      }

      if (dateRange) {
        filters.dateRange = {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end),
        };
      }

      // If criteria is provided, use hybrid search
      if (criteria) {
        const searchResults = await hybridSearchService.hybridSearch(criteria, filters, {
          strategy,
          keywordWeight,
          vectorWeight,
        });

        // Apply completion status filter if specified
        let filteredResults = searchResults.results;
        if (completionStatus === 'incomplete') {
          filteredResults = searchResults.results.filter((memo: any) => 
            !memo.importanceReason || 
            !memo.momentContext || 
            !memo.relatedKnowledge
          );
        }

        return res.json({
          ...searchResults,
          results: filteredResults,
          total: filteredResults.length,
        });
      }

      // If no criteria, get filtered memos using traditional query
      let query: any = { userId };

      if (subject) {
        query.tags = { $in: [subject] };
      }

      if (tags && tags.length > 0) {
        query.tags = { $in: tags };
      }

      if (dateRange) {
        query.createdAt = {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end),
        };
      }

      if (completionStatus === 'incomplete') {
        query.$or = [
          { importanceReason: { $exists: false } },
          { importanceReason: '' },
          { momentContext: { $exists: false } },
          { momentContext: '' },
        ];
      }

      // Get filtered memos
      const memos = await Note.find(query).lean();

      res.json({
        results: memos,
        total: memos.length,
        criteria,
        filters: { subject, tags, dateRange, completionStatus },
      });
    } catch (error) {
      console.error('Search memos by criteria error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Search for incomplete memos using hybrid search
   */
  static async searchIncompleteMemos(req: Request, res: Response) {
    try {
      const { userId, subject, limit = 20, strategy = 'weighted' } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Build filters
      const filters: any = { userId, limit };
      if (subject) {
        filters.tags = [subject];
      }

      // Use hybrid search with "incomplete" as the query
      const searchResults = await hybridSearchService.hybridSearch('incomplete', filters, {
        strategy,
      });

      // Filter for actually incomplete memos
      const incompleteResults = searchResults.results.filter((memo: any) => 
        !memo.importanceReason || 
        !memo.momentContext || 
        !memo.relatedKnowledge
      );

      res.json({
        ...searchResults,
        results: incompleteResults,
        total: incompleteResults.length,
      });
    } catch (error) {
      console.error('Search incomplete memos error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Search by learning criteria using hybrid search
   */
  static async searchByLearningCriteria(req: Request, res: Response) {
    try {
      const { criteria, userId, subject, tags, dateRange, limit = 20, strategy = 'weighted' } = req.body;

      if (!criteria || !userId) {
        return res.status(400).json({ error: 'Criteria and User ID are required' });
      }

      // Build filters
      const filters: any = { userId, limit };
      if (subject) {
        filters.tags = [subject];
      }
      if (tags && tags.length > 0) {
        filters.tags = tags;
      }
      if (dateRange) {
        filters.dateRange = {
          start: new Date(dateRange.start),
          end: new Date(dateRange.end),
        };
      }

      // Use hybrid search
      const searchResults = await hybridSearchService.hybridSearch(criteria, filters, {
        strategy,
      });

      res.json(searchResults);
    } catch (error) {
      console.error('Search by learning criteria error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Find similar memos using hybrid search
   */
  static async findSimilarMemos(req: Request, res: Response) {
    try {
      const { memoId, userId, limit = 10, strategy = 'weighted' } = req.body;

      if (!memoId || !userId) {
        return res.status(400).json({ error: 'Memo ID and User ID are required' });
      }

      // Get the target memo
      const targetMemo = await Note.findOne({ _id: memoId, userId }).lean();
      if (!targetMemo) {
        return res.status(404).json({ error: 'Memo not found' });
      }

      // Use the memo content as query for hybrid search
      const query = targetMemo.content || targetMemo.tags?.join(' ') || '';
      
      const searchResults = await hybridSearchService.hybridSearch(query, {
        userId,
        limit,
      }, {
        strategy,
      });

      // Filter out the target memo itself
      const similarResults = searchResults.results.filter((memo: any) => 
        memo._id.toString() !== memoId
      );

      res.json({
        ...searchResults,
        results: similarResults,
        total: similarResults.length,
        targetMemo,
      });
    } catch (error) {
      console.error('Find similar memos error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Get learning progress analysis
   */
  static async getLearningProgress(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Get all user memos
      const memos = await Note.find({ userId }).lean();

      // Analyze learning progress
      const analysis = {
        totalMemos: memos.length,
        subjects: {} as any,
        completionRate: 0,
        recentActivity: 0,
        weakAreas: [] as string[],
      };

      // Analyze by subject
      const subjectStats: any = {};
      let completedMemos = 0;

      memos.forEach((memo) => {
        const isCompleted = memo.importanceReason && 
                          memo.momentContext && 
                          memo.relatedKnowledge;

        if (isCompleted) {
          completedMemos++;
        }

        memo.tags?.forEach((tag) => {
          if (!subjectStats[tag]) {
            subjectStats[tag] = {
              total: 0,
              completed: 0,
              recent: 0,
            };
          }
          subjectStats[tag].total++;
          if (isCompleted) {
            subjectStats[tag].completed++;
          }
          if (new Date(memo.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
            subjectStats[tag].recent++;
          }
        });
      });

      analysis.subjects = subjectStats;
      analysis.completionRate = memos.length > 0 ? (completedMemos / memos.length) * 100 : 0;
      analysis.recentActivity = memos.filter(m => 
        new Date(m.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;

      // Identify weak areas
      Object.entries(subjectStats).forEach(([subject, stats]: [string, any]) => {
        const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
        if (completionRate < 50) {
          analysis.weakAreas.push(subject);
        }
      });

      res.json(analysis);
    } catch (error) {
      console.error('Get learning progress error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 
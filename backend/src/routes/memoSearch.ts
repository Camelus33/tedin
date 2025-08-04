import express from 'express';
import { MemoSearchController } from '../controllers/MemoSearchController';
import { authenticate } from '../middlewares/auth';
import { searchRateLimiter, validateSearchInput, contentSecurityMiddleware } from '../middlewares/security';
import { asyncHandler } from '../middlewares/errorHandler';

const router = express.Router();

// Initialize vector search service on startup
MemoSearchController.initialize().catch(console.error);

/**
 * @route POST /api/memo-search/search
 * @desc Search memos semantically
 * @access Private
 */
router.post('/search', asyncHandler(MemoSearchController.searchMemos));

/**
 * @route POST /api/memo-search/search-by-criteria
 * @desc Search memos by specific criteria (for exam students)
 * @access Private
 */
router.post('/search-by-criteria', asyncHandler(MemoSearchController.searchMemosByCriteria));

/**
 * @route POST /api/memo-search/incomplete
 * @desc Search for incomplete memos
 * @access Private
 */
router.post('/incomplete', asyncHandler(MemoSearchController.searchIncompleteMemos));

/**
 * @route POST /api/memo-search/learning-criteria
 * @desc Search by learning criteria
 * @access Private
 */
router.post('/learning-criteria', asyncHandler(MemoSearchController.searchByLearningCriteria));

/**
 * @route POST /api/memo-search/similar
 * @desc Find similar memos
 * @access Private
 */
router.post('/similar', asyncHandler(MemoSearchController.findSimilarMemos));

/**
 * @route GET /api/memo-search/progress/:userId
 * @desc Get learning progress analysis
 * @access Private
 */
router.get('/progress/:userId', asyncHandler(MemoSearchController.getLearningProgress));

export default router; 
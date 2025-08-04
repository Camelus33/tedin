import express from 'express';
import { embeddingService } from '../services/EmbeddingService';
import { authenticate } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';

const router = express.Router();

/**
 * @route POST /api/admin/generate-embeddings
 * @desc Generate embeddings for all memos (Admin only)
 * @access Private (Admin)
 */
router.post('/generate-embeddings', authenticate, isAdmin, async (req, res) => {
  try {
    const result = await embeddingService.generateEmbeddingsForAllMemos();
    res.json({
      success: true,
      message: 'Embedding generation completed',
      result,
    });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate embeddings',
    });
  }
});

/**
 * @route GET /api/admin/embedding-stats
 * @desc Get embedding statistics (Admin only)
 * @access Private (Admin)
 */
router.get('/embedding-stats', authenticate, isAdmin, async (req, res) => {
  try {
    const stats = await embeddingService.getEmbeddingStats();
    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error getting embedding stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get embedding stats',
    });
  }
});

/**
 * @route POST /api/admin/generate-embedding/:memoId
 * @desc Generate embedding for a specific memo (Admin only)
 * @access Private (Admin)
 */
router.post('/generate-embedding/:memoId', authenticate, isAdmin, async (req, res) => {
  try {
    const { memoId } = req.params;
    const embedding = await embeddingService.generateEmbeddingForMemo(memoId);
    res.json({
      success: true,
      message: 'Embedding generated successfully',
      memoId,
      embeddingLength: embedding.length,
    });
  } catch (error) {
    console.error('Error generating embedding for memo:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate embedding',
    });
  }
});

export default router; 
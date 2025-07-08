import { Router } from 'express';
import { executeAILink } from '../controllers/AILinkController';
import { authenticate } from '../middlewares/auth';
// import { authMiddleware } from '../middlewares/auth'; // 실제 서비스에서는 인증 미들웨어 추가

const router = Router();

/**
 * @route   POST /api/ai-link/execute
 * @desc    Execute an AI-Link workflow
 * @access  Private (TODO: add authMiddleware)
 */
router.post(
  '/execute',
  authenticate, // Ensure request has valid JWT and req.user
  executeAILink
);

export default router; 
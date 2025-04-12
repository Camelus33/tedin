import express from 'express';
import { 
  getUserBadges, 
  getBadgeById, 
  getBadgesByType, 
  getBadgesByContext, 
  createBadge, 
  deleteBadge 
} from '../controllers/badgeController';
import { authenticate } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';

const router = express.Router();

// All badge routes require authentication
router.use(authenticate);

// Validation for creating a badge (admin only)
const createBadgeValidation = [
  body('targetUserId')
    .notEmpty()
    .withMessage('대상 사용자 ID가 필요합니다'),
  body('type')
    .notEmpty()
    .withMessage('배지 타입이 필요합니다'),
  body('context')
    .isIn(['TS', 'Zengo'])
    .withMessage('유효한 컨텍스트가 아닙니다'),
  body('relatedSessionId')
    .notEmpty()
    .withMessage('관련 세션 ID가 필요합니다'),
];

// Get all badges for the current user
router.get('/', getUserBadges);

// Get a specific badge by ID
router.get('/:badgeId', getBadgeById);

// Get all badges of a specific type
router.get('/type/:type', getBadgesByType);

// Get all badges for a specific context
router.get('/context/:context', getBadgesByContext);

// Admin routes below
// Create a new badge (admin only)
router.post(
  '/',
  isAdmin,
  createBadgeValidation,
  validateRequest,
  createBadge
);

// Delete a badge (admin only)
router.delete('/:badgeId', isAdmin, deleteBadge);

export default router; 
import express from 'express';
import { getProfile, updateProfile, getSettings, updateSettings, searchUsers, getUserStats } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Validation for profile update
const profileUpdateValidation = [
  body('nickname')
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage('닉네임은 2자 이상, 20자 이하이어야 합니다')
    .trim(),
];

// Validation for settings update
const settingsUpdateValidation = [
  body('goals')
    .isArray({ min: 1 })
    .withMessage('최소 하나 이상의 목표를 선택해야 합니다')
    .bail()
    .custom((arr) => arr.every((g: any) => ['focus', 'memory', 'exam'].includes(g)))
    .withMessage('유효하지 않은 목표가 포함되어 있습니다'),
  body('memorySpanScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('유효하지 않은 기억력 점수입니다'),
  body('attentionScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('유효하지 않은 집중력 점수입니다'),
  body('notificationTime')
    .optional()
    .isString()
    .withMessage('유효하지 않은 알림 시간입니다'),
  body('communityInterest')
    .optional()
    .isBoolean()
    .withMessage('유효하지 않은 커뮤니티 참여 여부입니다'),
];

// Get current user profile
router.get('/profile', getProfile);

// Search users by nickname
router.get('/search', searchUsers);

// Get user statistics
router.get('/me/stats', getUserStats);

// Update user profile
router.put(
  '/profile',
  profileUpdateValidation,
  validateRequest,
  updateProfile
);

// Get user settings
router.get('/settings', getSettings);

// Update user settings
router.put(
  '/settings',
  settingsUpdateValidation,
  validateRequest,
  updateSettings
);

export default router; 
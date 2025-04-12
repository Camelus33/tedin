import express from 'express';
import { getProfile, updateProfile, getSettings, updateSettings } from '../controllers/userController';
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
  body('goal')
    .optional()
    .isIn(['speed', 'comprehension', 'memorization', 'exam'])
    .withMessage('유효하지 않은 목표입니다'),
  body('genre')
    .optional()
    .isString()
    .withMessage('유효하지 않은 장르입니다'),
  body('focusDuration')
    .optional()
    .isInt({ min: 7, max: 25 })
    .withMessage('집중 시간은 7분에서 25분 사이여야 합니다'),
  body('warmupEnabled')
    .optional()
    .isBoolean()
    .withMessage('예열 활성화 여부는 boolean 값이어야 합니다'),
];

// Get current user profile
router.get('/profile', getProfile);

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
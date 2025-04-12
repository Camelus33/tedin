import express from 'express';
import { 
  getUserZengo, 
  getZengoById, 
  createZengo, 
  startZengo, 
  updateModuleResults, 
  completeZengo, 
  cancelZengo,
  getZengoStats,
  getProverbContent,
  saveSessionResult,
  regeneratePositions,
  getCognitiveProfile
} from '../controllers/zengoController';
import { authenticate } from '../middlewares/auth';
import { body, query } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';

const router = express.Router();

// All zengo routes require authentication
router.use(authenticate);  // 인증 미들웨어 활성화

// Validation for creating a new zengo activity
const createZengoValidation = [
  body('boardSize')
    .isIn(['3x3', '5x5', '9x9', '19x19'])
    .withMessage('유효한 보드 사이즈가 아닙니다'),
  body('modules')
    .isArray({ min: 1, max: 5 })
    .withMessage('모듈은 1개 이상 5개 이하여야 합니다'),
  body('modules.*.name')
    .notEmpty()
    .withMessage('모듈 이름이 필요합니다'),
];

// Validation for updating module results
const updateModuleResultsValidation = [
  body('accuracy')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('정확도는 0에서 100 사이여야 합니다'),
  body('reactionTimeAvg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('반응 시간은 0 이상이어야 합니다'),
  body('memoryScore')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('기억력 점수는 0에서 100 사이여야 합니다'),
  body('languageScore')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('언어 점수는 0에서 100 사이여야 합니다'),
  body('logicScore')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('논리력 점수는 0에서 100 사이여야 합니다'),
];

// Validation for completing a zengo activity
const completeZengoValidation = [
  body('overallScore')
    .isFloat({ min: 0, max: 100 })
    .withMessage('종합 점수는 0에서 100 사이여야 합니다'),
];

// Validation for getting proverb content
const getProverbContentValidation = [
  query('level').notEmpty().withMessage('Level query parameter is required.'),
  query('lang').notEmpty().isIn(['ko', 'en', 'zh', 'ja']).withMessage('Valid language query parameter (ko, en, zh, ja) is required.'),
];

// Validation for saving session result (basic validation, adjust as needed)
const saveSessionResultValidation = [
  body('contentId').notEmpty().withMessage('ContentId is required.'),
  body('level').notEmpty().withMessage('Level is required.'),
  body('language').isIn(['ko', 'en', 'zh', 'ja']).withMessage('Valid language is required.'),
  body('usedStonesCount').isInt({ min: 0 }).withMessage('usedStonesCount must be a non-negative integer.'),
  body('correctPlacements').isInt({ min: 0 }).withMessage('correctPlacements must be a non-negative integer.'),
  body('incorrectPlacements').isInt({ min: 0 }).withMessage('incorrectPlacements must be a non-negative integer.'),
  body('timeTakenMs').isInt({ min: 0 }).withMessage('timeTakenMs must be a non-negative integer.'),
  body('completedSuccessfully').isBoolean().withMessage('completedSuccessfully must be a boolean.'),
  body('resultType').optional().isIn(['EXCELLENT', 'SUCCESS', 'FAIL']).withMessage('resultType must be EXCELLENT, SUCCESS, or FAIL.')
];

// 위치 재생성 API 검증
const regeneratePositionsValidation = [
  query('contentId').isMongoId().withMessage('Valid contentId is required.')
];

// General routes first - 모든 일반 경로는 파라미터 경로보다 먼저 정의
router.get('/', getUserZengo);

// 통계 엔드포인트들 - 문자열 경로에 대한 명시적 라우트들
router.get('/stats', getZengoStats);
router.get('/cognitive-profile', getCognitiveProfile);

// 프로버브 콘텐츠 엔드포인트
router.get(
  '/proverb-content',
  getProverbContentValidation,
  validateRequest,
  getProverbContent
);

// 세션 결과 저장 엔드포인트
router.post(
  '/session-result',
  saveSessionResultValidation,
  validateRequest,
  saveSessionResult
);

// 특정 콘텐츠에 대한 위치 재생성 API
router.get(
  '/content/:contentId/regenerate-positions',
  validateRequest,
  regeneratePositions
);

// 같은 문장에 새로운 위치 생성 API (기존 방식)
router.get(
  '/regenerate-positions',
  regeneratePositionsValidation,
  validateRequest,
  regeneratePositions
);

// Create a new zengo activity
router.post(
  '/',
  createZengoValidation,
  validateRequest,
  createZengo
);

// Parameterized routes last - 파라미터 경로는 항상 마지막에 정의
router.get('/:zengoId', getZengoById);

// Other parameterized routes
router.put('/:zengoId/start', startZengo);
router.put(
  '/:zengoId/module/:moduleName',
  updateModuleResultsValidation,
  validateRequest,
  updateModuleResults
);
router.put(
  '/:zengoId/complete',
  completeZengoValidation,
  validateRequest,
  completeZengo
);
router.put('/:zengoId/cancel', cancelZengo);

export default router; 
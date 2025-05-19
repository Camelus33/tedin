import express from 'express';
import { 
  getUserSessions, 
  getSessionById, 
  createSession, 
  completeSession, 
  cancelSession, 
  getSessionsByBook, 
  activateSession 
} from '../controllers/sessionController';
import { authenticate } from '../middlewares/auth';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';

const router = express.Router();

// All session routes require authentication
router.use(authenticate);

// Validation for creating a new session
const createSessionValidation = [
  body('bookId')
    .notEmpty()
    .withMessage('책 ID가 필요합니다'),
  body('mode')
    .notEmpty()
    .withMessage('독서 모드가 필요합니다'),
  body('startPage')
    .isInt({ min: 0 })
    .withMessage('시작 페이지는 0 이상이어야 합니다'),
  body('endPage')
    .isInt({ min: 1 })
    .withMessage('종료 페이지는 1 이상이어야 합니다')
    .custom((value, { req }) => {
      return value > req.body.startPage;
    })
    .withMessage('종료 페이지는 시작 페이지보다 커야 합니다'),
];

// Validation for completing a session
const completeSessionValidation = [
  body('actualEndPage')
    .optional()
    .isInt({ min: 1 })
    .withMessage('실제 종료 페이지는 1 이상이어야 합니다'),
  body('durationSec')
    .isInt({ min: 1 })
    .withMessage('소요 시간은 1초 이상이어야 합니다'),
  body('ppm')
    .optional()
    .isNumeric()
    .withMessage('유효한 PPM 값이 아닙니다'),
  body('memo')
    .optional()
    .isString()
    .withMessage('메모는 문자열이어야 합니다'),
  body('selfRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('자체 평가는 1에서 5 사이여야 합니다'),
];

// Get all sessions for the current user
router.get('/', getUserSessions);

// Get a specific session by ID
router.get('/:sessionId', getSessionById);

// Get all sessions for a specific book
router.get('/book/:bookId', getSessionsByBook);

// Create a new session
router.post(
  '/',
  createSessionValidation,
  validateRequest,
  createSession
);

// Complete a session
router.put(
  '/:sessionId/complete',
  completeSessionValidation,
  validateRequest,
  completeSession
);

// Cancel a session
router.put('/:sessionId/cancel', cancelSession);

// Activate a pending session after warmup
router.put('/:sessionId/activate', activateSession);

export default router; 
import express from 'express';
import { authenticate } from '../middlewares/auth';
import {
  getGamesByCollection,
  createMyverseGame,
  getMyverseGame,
  updateMyverseGame,
  deleteMyverseGame,
  getSharedGames,
  getAccessibleGames,
  getGamesByType,
  saveMyVerseSessionResult,
  getSentGames,
  getNextGameInCollection
} from '../controllers/myverseGameController';
import { body, query, param } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Nested games under collections
router.get('/collections/:collectionId/games', getGamesByCollection);
router.post('/collections/:collectionId/games', createMyverseGame);

// New aggregated game routes
router.get('/games/accessible', getAccessibleGames);
router.get('/games/type/:type', getGamesByType);

// Shared games
router.get('/games/shared', getSharedGames);

// Sent games
router.get('/games/sent', getSentGames);

// Single game CRUD
router.get('/games/:gameId', getMyverseGame);
router.put('/games/:gameId', updateMyverseGame);
router.delete('/games/:gameId', deleteMyverseGame);

// Next game API
router.get('/games/:gameId/next', getNextGameInCollection);

// Validation rules
const gameIdValidation = [
  param('gameId').isMongoId().withMessage('유효한 게임 ID가 필요합니다.')
];
const collectionIdValidation = [
  param('collectionId').isMongoId().withMessage('유효한 컬렉션 ID가 필요합니다.')
];
const createGameValidation = [
  body('collectionId').isMongoId().withMessage('유효한 컬렉션 ID가 필요합니다.'),
  body('title').notEmpty().withMessage('제목이 필요합니다.'),
  body('inputText').notEmpty().withMessage('입력 텍스트가 필요합니다.'),
  body('boardSize').isIn([3, 5, 7]).withMessage('보드 크기는 3, 5, 7 중 하나여야 합니다.')
];
// Add validation for saveMyVerseSessionResult
const saveMyVerseSessionResultValidation = [
  body('myVerseGameId').isMongoId().withMessage('유효한 MyVerse 게임 ID가 필요합니다.'),
  body('collectionId').optional().isMongoId().withMessage('유효한 컬렉션 ID가 필요합니다.'), // Optional for now
  body('level').notEmpty().withMessage('레벨 정보가 필요합니다.'),
  body('language').optional().isIn(['ko', 'en', 'zh', 'ja']).withMessage('유효한 언어 코드가 필요합니다.'),
  body('usedStonesCount').isInt({ min: 0 }).withMessage('사용한 돌 개수는 0 이상이어야 합니다.'),
  body('correctPlacements').isInt({ min: 0 }).withMessage('정확한 배치 수는 0 이상이어야 합니다.'),
  body('incorrectPlacements').isInt({ min: 0 }).withMessage('부정확한 배치 수는 0 이상이어야 합니다.'),
  body('timeTakenMs').isInt({ min: 0 }).withMessage('소요 시간(ms)은 0 이상이어야 합니다.'),
  body('completedSuccessfully').isBoolean().withMessage('완료 성공 여부는 불리언 값이어야 합니다.'),
  body('resultType').isIn(['EXCELLENT', 'SUCCESS', 'FAIL']).withMessage('결과 타입은 EXCELLENT, SUCCESS, FAIL 중 하나여야 합니다.')
];

// ** Add route for saving MyVerse session result **
router.post(
  '/session-result', // Use a clear path like /myverse/games/session-result or keep it simple?
  saveMyVerseSessionResultValidation, 
  validateRequest, 
  saveMyVerseSessionResult
);

export default router; 
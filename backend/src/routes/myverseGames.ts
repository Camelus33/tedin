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
  getGamesByType
} from '../controllers/myverseGameController';

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

// Single game CRUD
router.get('/games/:gameId', getMyverseGame);
router.put('/games/:gameId', updateMyverseGame);
router.delete('/games/:gameId', deleteMyverseGame);

export default router; 
import express from 'express';
import { 
  getReadingLeaderboard, 
  getZengoLeaderboard, 
  getBadgeLeaderboard 
} from '../controllers/leaderboardController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// All leaderboard routes require authentication
router.use(authenticate);

// Get reading sessions leaderboard
router.get('/reading', getReadingLeaderboard);

// Get Zengo scores leaderboard
router.get('/zengo', getZengoLeaderboard);

// Get badges count leaderboard
router.get('/badges', getBadgeLeaderboard);

export default router; 
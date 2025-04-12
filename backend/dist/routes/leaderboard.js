"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leaderboardController_1 = require("../controllers/leaderboardController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
// All leaderboard routes require authentication
router.use(auth_1.authenticate);
// Get reading sessions leaderboard
router.get('/reading', leaderboardController_1.getReadingLeaderboard);
// Get Zengo scores leaderboard
router.get('/zengo', leaderboardController_1.getZengoLeaderboard);
// Get badges count leaderboard
router.get('/badges', leaderboardController_1.getBadgeLeaderboard);
exports.default = router;

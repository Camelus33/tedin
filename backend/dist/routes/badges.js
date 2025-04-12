"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const badgeController_1 = require("../controllers/badgeController");
const auth_1 = require("../middlewares/auth");
const isAdmin_1 = require("../middlewares/isAdmin");
const express_validator_1 = require("express-validator");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const router = express_1.default.Router();
// All badge routes require authentication
router.use(auth_1.authenticate);
// Validation for creating a badge (admin only)
const createBadgeValidation = [
    (0, express_validator_1.body)('targetUserId')
        .notEmpty()
        .withMessage('대상 사용자 ID가 필요합니다'),
    (0, express_validator_1.body)('type')
        .notEmpty()
        .withMessage('배지 타입이 필요합니다'),
    (0, express_validator_1.body)('context')
        .isIn(['TT', 'Zengo'])
        .withMessage('유효한 컨텍스트가 아닙니다'),
    (0, express_validator_1.body)('relatedSessionId')
        .notEmpty()
        .withMessage('관련 세션 ID가 필요합니다'),
];
// Get all badges for the current user
router.get('/', badgeController_1.getUserBadges);
// Get a specific badge by ID
router.get('/:badgeId', badgeController_1.getBadgeById);
// Get all badges of a specific type
router.get('/type/:type', badgeController_1.getBadgesByType);
// Get all badges for a specific context
router.get('/context/:context', badgeController_1.getBadgesByContext);
// Admin routes below
// Create a new badge (admin only)
router.post('/', isAdmin_1.isAdmin, createBadgeValidation, validateRequest_1.default, badgeController_1.createBadge);
// Delete a badge (admin only)
router.delete('/:badgeId', isAdmin_1.isAdmin, badgeController_1.deleteBadge);
exports.default = router;

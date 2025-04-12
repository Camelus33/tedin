"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middlewares/auth");
const express_validator_1 = require("express-validator");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const router = express_1.default.Router();
// All user routes require authentication
router.use(auth_1.authenticate);
// Validation for profile update
const profileUpdateValidation = [
    (0, express_validator_1.body)('nickname')
        .optional()
        .isLength({ min: 2, max: 20 })
        .withMessage('닉네임은 2자 이상, 20자 이하이어야 합니다')
        .trim(),
];
// Validation for settings update
const settingsUpdateValidation = [
    (0, express_validator_1.body)('goal')
        .optional()
        .isIn(['speed', 'comprehension', 'memorization', 'exam'])
        .withMessage('유효하지 않은 목표입니다'),
    (0, express_validator_1.body)('genre')
        .optional()
        .isString()
        .withMessage('유효하지 않은 장르입니다'),
    (0, express_validator_1.body)('focusDuration')
        .optional()
        .isInt({ min: 7, max: 25 })
        .withMessage('집중 시간은 7분에서 25분 사이여야 합니다'),
    (0, express_validator_1.body)('warmupEnabled')
        .optional()
        .isBoolean()
        .withMessage('예열 활성화 여부는 boolean 값이어야 합니다'),
];
// Get current user profile
router.get('/profile', userController_1.getProfile);
// Update user profile
router.put('/profile', profileUpdateValidation, validateRequest_1.default, userController_1.updateProfile);
// Get user settings
router.get('/settings', userController_1.getSettings);
// Update user settings
router.put('/settings', settingsUpdateValidation, validateRequest_1.default, userController_1.updateSettings);
exports.default = router;

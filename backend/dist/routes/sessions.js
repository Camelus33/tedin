"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const sessionController_1 = require("../controllers/sessionController");
const auth_1 = require("../middlewares/auth");
const express_validator_1 = require("express-validator");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const router = express_1.default.Router();
// All session routes require authentication
router.use(auth_1.authenticate);
// Validation for creating a new session
const createSessionValidation = [
    (0, express_validator_1.body)('bookId')
        .notEmpty()
        .withMessage('책 ID가 필요합니다'),
    (0, express_validator_1.body)('mode')
        .notEmpty()
        .withMessage('독서 모드가 필요합니다'),
    (0, express_validator_1.body)('startPage')
        .isInt({ min: 0 })
        .withMessage('시작 페이지는 0 이상이어야 합니다'),
    (0, express_validator_1.body)('endPage')
        .isInt({ min: 1 })
        .withMessage('종료 페이지는 1 이상이어야 합니다')
        .custom((value, { req }) => {
        return value > req.body.startPage;
    })
        .withMessage('종료 페이지는 시작 페이지보다 커야 합니다'),
];
// Validation for completing a session
const completeSessionValidation = [
    (0, express_validator_1.body)('actualEndPage')
        .optional()
        .isInt({ min: 1 })
        .withMessage('실제 종료 페이지는 1 이상이어야 합니다'),
    (0, express_validator_1.body)('durationSec')
        .isInt({ min: 1 })
        .withMessage('소요 시간은 1초 이상이어야 합니다'),
    (0, express_validator_1.body)('ppm')
        .optional()
        .isNumeric()
        .withMessage('유효한 PPM 값이 아닙니다'),
    (0, express_validator_1.body)('memo')
        .optional()
        .isString()
        .withMessage('메모는 문자열이어야 합니다'),
    (0, express_validator_1.body)('selfRating')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('자체 평가는 1에서 5 사이여야 합니다'),
];
// Get all sessions for the current user
router.get('/', sessionController_1.getUserSessions);
// Get a specific session by ID
router.get('/:sessionId', sessionController_1.getSessionById);
// Get all sessions for a specific book
router.get('/book/:bookId', sessionController_1.getSessionsByBook);
// Create a new session
router.post('/', createSessionValidation, validateRequest_1.default, sessionController_1.createSession);
// Complete a session
router.put('/:sessionId/complete', completeSessionValidation, validateRequest_1.default, sessionController_1.completeSession);
// Cancel a session
router.put('/:sessionId/cancel', sessionController_1.cancelSession);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zengoController_1 = require("../controllers/zengoController");
const auth_1 = require("../middlewares/auth");
const express_validator_1 = require("express-validator");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const router = express_1.default.Router();
// All zengo routes require authentication
router.use(auth_1.authenticate); // 인증 미들웨어 활성화
// Validation for creating a new zengo activity
const createZengoValidation = [
    (0, express_validator_1.body)('boardSize')
        .isIn(['3x3', '5x5', '9x9', '19x19'])
        .withMessage('유효한 보드 사이즈가 아닙니다'),
    (0, express_validator_1.body)('modules')
        .isArray({ min: 1, max: 5 })
        .withMessage('모듈은 1개 이상 5개 이하여야 합니다'),
    (0, express_validator_1.body)('modules.*.name')
        .notEmpty()
        .withMessage('모듈 이름이 필요합니다'),
];
// Validation for updating module results
const updateModuleResultsValidation = [
    (0, express_validator_1.body)('accuracy')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('정확도는 0에서 100 사이여야 합니다'),
    (0, express_validator_1.body)('reactionTimeAvg')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('반응 시간은 0 이상이어야 합니다'),
    (0, express_validator_1.body)('memoryScore')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('기억력 점수는 0에서 100 사이여야 합니다'),
    (0, express_validator_1.body)('languageScore')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('언어 점수는 0에서 100 사이여야 합니다'),
    (0, express_validator_1.body)('logicScore')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('논리력 점수는 0에서 100 사이여야 합니다'),
];
// Validation for completing a zengo activity
const completeZengoValidation = [
    (0, express_validator_1.body)('overallScore')
        .isFloat({ min: 0, max: 100 })
        .withMessage('종합 점수는 0에서 100 사이여야 합니다'),
];
// Validation for getting proverb content
const getProverbContentValidation = [
    (0, express_validator_1.query)('level').notEmpty().withMessage('Level query parameter is required.'),
    (0, express_validator_1.query)('lang').notEmpty().isIn(['ko', 'en', 'zh', 'ja']).withMessage('Valid language query parameter (ko, en, zh, ja) is required.'),
];
// Validation for saving session result (basic validation, adjust as needed)
const saveSessionResultValidation = [
    (0, express_validator_1.body)('contentId').notEmpty().withMessage('ContentId is required.'),
    (0, express_validator_1.body)('level').notEmpty().withMessage('Level is required.'),
    (0, express_validator_1.body)('language').isIn(['ko', 'en', 'zh', 'ja']).withMessage('Valid language is required.'),
    (0, express_validator_1.body)('usedStonesCount').isInt({ min: 0 }).withMessage('usedStonesCount must be a non-negative integer.'),
    (0, express_validator_1.body)('correctPlacements').isInt({ min: 0 }).withMessage('correctPlacements must be a non-negative integer.'),
    (0, express_validator_1.body)('incorrectPlacements').isInt({ min: 0 }).withMessage('incorrectPlacements must be a non-negative integer.'),
    (0, express_validator_1.body)('timeTakenMs').isInt({ min: 0 }).withMessage('timeTakenMs must be a non-negative integer.'),
    (0, express_validator_1.body)('completedSuccessfully').isBoolean().withMessage('completedSuccessfully must be a boolean.'),
    (0, express_validator_1.body)('resultType').optional().isIn(['EXCELLENT', 'SUCCESS', 'FAIL']).withMessage('resultType must be EXCELLENT, SUCCESS, or FAIL.')
];
// 위치 재생성 API 검증
const regeneratePositionsValidation = [
    (0, express_validator_1.query)('contentId').isMongoId().withMessage('Valid contentId is required.')
];
// General routes first - 모든 일반 경로는 파라미터 경로보다 먼저 정의
router.get('/', zengoController_1.getUserZengo);
// 통계 엔드포인트들 - 문자열 경로에 대한 명시적 라우트들
router.get('/stats', zengoController_1.getZengoStats);
router.get('/cognitive-profile', zengoController_1.getCognitiveProfile);
// 프로버브 콘텐츠 엔드포인트
router.get('/proverb-content', getProverbContentValidation, validateRequest_1.default, zengoController_1.getProverbContent);
// 세션 결과 저장 엔드포인트
router.post('/session-result', saveSessionResultValidation, validateRequest_1.default, zengoController_1.saveSessionResult);
// 특정 콘텐츠에 대한 위치 재생성 API
router.get('/content/:contentId/regenerate-positions', validateRequest_1.default, zengoController_1.regeneratePositions);
// 같은 문장에 새로운 위치 생성 API (기존 방식)
router.get('/regenerate-positions', regeneratePositionsValidation, validateRequest_1.default, zengoController_1.regeneratePositions);
// Create a new zengo activity
router.post('/', createZengoValidation, validateRequest_1.default, zengoController_1.createZengo);
// Parameterized routes last - 파라미터 경로는 항상 마지막에 정의
router.get('/:zengoId', zengoController_1.getZengoById);
// Other parameterized routes
router.put('/:zengoId/start', zengoController_1.startZengo);
router.put('/:zengoId/module/:moduleName', updateModuleResultsValidation, validateRequest_1.default, zengoController_1.updateModuleResults);
router.put('/:zengoId/complete', completeZengoValidation, validateRequest_1.default, zengoController_1.completeZengo);
router.put('/:zengoId/cancel', zengoController_1.cancelZengo);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inviteController_1 = require("../controllers/inviteController");
const auth_1 = require("../middlewares/auth");
const isAdmin_1 = require("../middlewares/isAdmin");
const express_validator_1 = require("express-validator");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const router = express_1.default.Router();
// 초대 코드 사용 검증
const useInviteValidation = [
    (0, express_validator_1.body)('inviteCode')
        .notEmpty()
        .withMessage('초대 코드가 필요합니다'),
    (0, express_validator_1.body)('userId')
        .notEmpty()
        .withMessage('사용자 ID가 필요합니다'),
];
// 인증이 필요한 라우트
router.use(['/create', '/my'], auth_1.authenticate);
// 초대 코드 생성
router.post('/create', inviteController_1.createInvite);
// 내 초대 코드 목록 조회
router.get('/my', inviteController_1.getMyInvites);
// 초대 코드 검증 (인증 불필요)
router.get('/validate/:inviteCode', inviteController_1.validateInviteCode);
// 초대 코드 사용 (인증 불필요)
router.post('/use', useInviteValidation, validateRequest_1.default, inviteController_1.useInviteCode);
// 관리자 전용 라우트
router.use('/admin', auth_1.authenticate, isAdmin_1.isAdmin);
// 모든 초대 코드 조회 (관리자 전용)
router.get('/admin/all', inviteController_1.getAllInvites);
exports.default = router;

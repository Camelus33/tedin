"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBadge = exports.createBadge = exports.getBadgesByContext = exports.getBadgesByType = exports.getBadgeById = exports.getUserBadges = void 0;
const Badge_1 = __importDefault(require("../models/Badge"));
// 사용자의 모든 배지 조회
const getUserBadges = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const badges = yield Badge_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .select('-__v');
        res.status(200).json(badges);
    }
    catch (error) {
        console.error('배지 목록 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getUserBadges = getUserBadges;
// 특정 배지 상세 조회
const getBadgeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { badgeId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const badge = yield Badge_1.default.findOne({ _id: badgeId, userId })
            .select('-__v');
        if (!badge) {
            return res.status(404).json({ message: '해당 배지를 찾을 수 없습니다.' });
        }
        res.status(200).json(badge);
    }
    catch (error) {
        console.error('배지 상세 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getBadgeById = getBadgeById;
// 특정 타입의 배지 조회
const getBadgesByType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { type } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const badges = yield Badge_1.default.find({ userId, type })
            .sort({ createdAt: -1 })
            .select('-__v');
        res.status(200).json(badges);
    }
    catch (error) {
        console.error('타입별 배지 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getBadgesByType = getBadgesByType;
// 특정 컨텍스트의 배지 조회
const getBadgesByContext = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { context } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        if (!['TT', 'Zengo'].includes(context)) {
            return res.status(400).json({ message: '유효하지 않은 컨텍스트입니다.' });
        }
        const badges = yield Badge_1.default.find({ userId, context })
            .sort({ createdAt: -1 })
            .select('-__v');
        res.status(200).json(badges);
    }
    catch (error) {
        console.error('컨텍스트별 배지 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getBadgesByContext = getBadgesByContext;
// 관리자: 배지 수동 추가 (관리자 전용)
const createBadge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { targetUserId, type, context, relatedSessionId } = req.body;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        // 관리자 권한 확인 (isAdmin 미들웨어가 이미 적용되었다고 가정)
        const newBadge = new Badge_1.default({
            userId: targetUserId,
            type,
            context,
            relatedSessionId,
        });
        const savedBadge = yield newBadge.save();
        res.status(201).json(savedBadge);
    }
    catch (error) {
        console.error('배지 생성 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.createBadge = createBadge;
// 관리자: 배지 삭제 (관리자 전용)
const deleteBadge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { badgeId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        // 관리자 권한 확인 (isAdmin 미들웨어가 이미 적용되었다고 가정)
        const badge = yield Badge_1.default.findById(badgeId);
        if (!badge) {
            return res.status(404).json({ message: '해당 배지를 찾을 수 없습니다.' });
        }
        yield Badge_1.default.deleteOne({ _id: badgeId });
        res.status(200).json({ message: '배지가 삭제되었습니다.' });
    }
    catch (error) {
        console.error('배지 삭제 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.deleteBadge = deleteBadge;

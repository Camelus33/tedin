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
exports.updateSettings = exports.getSettings = exports.updateProfile = exports.getProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
// Get user profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        res.status(200).json({
            userId: user._id,
            email: user.email,
            nickname: user.nickname,
            trialEndsAt: user.trialEndsAt,
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: '프로필 조회 중 오류가 발생했습니다.' });
    }
});
exports.getProfile = getProfile;
// Update user profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { nickname } = req.body;
        // Find and update user
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, { nickname }, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
        }
        res.status(200).json({
            userId: updatedUser._id,
            email: updatedUser.email,
            nickname: updatedUser.nickname,
            trialEndsAt: updatedUser.trialEndsAt,
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: '프로필 업데이트 중 오류가 발생했습니다.' });
    }
});
exports.updateProfile = updateProfile;
// Get user settings
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In a real application, you would store user settings in a separate collection
        // For now, we'll just return a mock object
        res.status(200).json({
            userId: req.user._id,
            settings: {
                goal: 'speed',
                genre: '자기계발',
                focusDuration: 11,
                warmupEnabled: true,
            }
        });
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: '설정 조회 중 오류가 발생했습니다.' });
    }
});
exports.getSettings = getSettings;
// Update user settings
const updateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { goal, genre, focusDuration, warmupEnabled } = req.body;
        // In a real application, you would update user settings in a separate collection
        // For now, we'll just return the updated settings
        res.status(200).json({
            userId: req.user._id,
            settings: {
                goal,
                genre,
                focusDuration,
                warmupEnabled,
            }
        });
    }
    catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: '설정 업데이트 중 오류가 발생했습니다.' });
    }
});
exports.updateSettings = updateSettings;

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
exports.resetPassword = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Invite_1 = __importDefault(require("../models/Invite"));
// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'habitus33_jwt_secret_key';
// Register new user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, nickname, inviteCode } = req.body;
        // Check if email already exists
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: '이미 사용 중인 이메일입니다.'
            });
        }
        // Validate invite code if provided
        let inviteRecord = null;
        if (inviteCode) {
            inviteRecord = yield Invite_1.default.findOne({
                inviteCode,
                usedBy: null
            });
            if (!inviteRecord) {
                return res.status(400).json({
                    error: '유효하지 않은 초대 코드입니다.'
                });
            }
        }
        // Create new user
        const newUser = new User_1.default({
            email,
            passwordHash: password, // Will be hashed by pre-save hook
            nickname,
            invitedBy: inviteRecord ? inviteRecord.inviterId : null,
            // If invited, extend trial period to 66 days (33*2)
            trialEndsAt: inviteRecord
                ? new Date(Date.now() + 66 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
        });
        // Save user
        const savedUser = yield newUser.save();
        // Update invite record if used
        if (inviteRecord) {
            inviteRecord.usedBy = savedUser._id;
            inviteRecord.usedAt = new Date();
            yield inviteRecord.save();
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: savedUser._id,
            email: savedUser.email
        }, JWT_SECRET, { expiresIn: '7d' });
        // Return user info and token
        res.status(201).json({
            userId: savedUser._id,
            email: savedUser.email,
            nickname: savedUser.nickname,
            trialEndsAt: savedUser.trialEndsAt,
            token,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: '회원가입 처리 중 오류가 발생했습니다.'
        });
    }
});
exports.register = register;
// Login user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: '이메일 또는 비밀번호가 일치하지 않습니다.'
            });
        }
        // Compare password
        const isPasswordValid = yield user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: '이메일 또는 비밀번호가 일치하지 않습니다.'
            });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: user._id,
            email: user.email
        }, JWT_SECRET, { expiresIn: '7d' });
        // Return user info and token
        res.status(200).json({
            userId: user._id,
            email: user.email,
            nickname: user.nickname,
            trialEndsAt: user.trialEndsAt,
            token,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: '로그인 처리 중 오류가 발생했습니다.'
        });
    }
});
exports.login = login;
// Password reset request
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Check if user exists
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            // For security, don't reveal if email exists or not
            return res.status(200).json({
                message: '비밀번호 재설정 링크를 이메일로 발송했습니다.'
            });
        }
        // In a real application, you would:
        // 1. Generate a password reset token
        // 2. Save it to the user record with an expiration
        // 3. Send an email with a reset link
        // For now, just return success message
        res.status(200).json({
            message: '비밀번호 재설정 링크를 이메일로 발송했습니다.'
        });
    }
    catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            error: '비밀번호 재설정 처리 중 오류가 발생했습니다.'
        });
    }
});
exports.resetPassword = resetPassword;

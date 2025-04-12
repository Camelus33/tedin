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
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const express_validator_1 = require("express-validator");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
// Temporary route to create admin user
router.get('/setup-admin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if admin already exists
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const existingAdmin = yield User_1.default.findOne({ email: adminEmail });
        if (existingAdmin) {
            return res.status(200).json({
                message: 'Admin user already exists',
                email: adminEmail
            });
        }
        // Create admin user
        const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
        const adminUser = new User_1.default({
            email: adminEmail,
            passwordHash: adminPassword, // Will be hashed by pre-save hook
            nickname: 'Admin',
            roles: ['admin', 'user'],
            trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        });
        yield adminUser.save();
        res.status(201).json({
            message: 'Admin user created successfully',
            email: adminEmail
        });
    }
    catch (error) {
        console.error('Admin setup error:', error);
        res.status(500).json({
            error: 'Failed to create admin user'
        });
    }
}));
// Validation rules for registration
const registerValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('유효한 이메일 주소를 입력해주세요'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('비밀번호는 최소 6자 이상이어야 합니다'),
    (0, express_validator_1.body)('nickname')
        .isLength({ min: 2, max: 20 })
        .withMessage('닉네임은 2자 이상, 20자 이하이어야 합니다')
        .trim(),
];
// Validation rules for login
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('유효한 이메일 주소를 입력해주세요'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('비밀번호를 입력해주세요'),
];
// Validation rules for password reset
const resetPasswordValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('유효한 이메일 주소를 입력해주세요'),
];
// Register new user
router.post('/register', registerValidation, validateRequest_1.default, authController_1.register);
// Login user
router.post('/login', loginValidation, validateRequest_1.default, authController_1.login);
// Request password reset
router.post('/reset-password', resetPasswordValidation, validateRequest_1.default, authController_1.resetPassword);
exports.default = router;

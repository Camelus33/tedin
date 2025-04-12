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
exports.requireAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'habitus33_jwt_secret_key';
/**
 * Authentication middleware
 * Verifies JWT token from Authorization header or cookies and attaches user to request
 */
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 개발 환경에서 인증 우회 옵션
        if (process.env.BYPASS_AUTH === 'true') {
            console.log('인증 우회됨 - BYPASS_AUTH=true');
            // 유효한 MongoDB ObjectId 형식 사용 (24자 16진수 문자열)
            const validObjectId = '507f1f77bcf86cd799439011';
            req.user = {
                _id: validObjectId,
                id: validObjectId,
                email: 'dev@example.com',
                roles: ['user', 'admin'] // 관리자 권한 추가
            };
            return next();
        }
        // 토큰 소스 확인 (쿠키 또는 헤더)
        let token;
        // 쿠키에서 토큰 확인
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // 헤더에서 토큰 확인
        const authHeader = req.headers.authorization;
        if (!token && authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
        // 토큰이 없는 경우
        if (!token) {
            if (process.env.NODE_ENV === 'development') {
                console.log(`인증 실패 (토큰 없음): ${req.method} ${req.path}`);
            }
            return res.status(401).json({ error: '인증이 필요합니다.' });
        }
        // 토큰 검증
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // 사용자 찾기
            const user = yield User_1.default.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({ error: '유효하지 않은 사용자입니다.' });
            }
            // 사용자 정보 요청에 추가
            req.user = user;
            next();
        }
        catch (error) {
            // 토큰 만료 처리
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: '인증이 만료되었습니다. 다시 로그인해주세요.',
                    code: 'TOKEN_EXPIRED'
                });
            }
            // 기타 토큰 오류
            return res.status(401).json({ error: '유효하지 않은 인증 정보입니다.' });
        }
    }
    catch (error) {
        console.error('인증 처리 중 오류:', error);
        return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});
exports.authenticate = authenticate;
/**
 * Admin authorization middleware
 * Checks if authenticated user has admin role
 * Must be used after authenticate middleware
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: '인증이 필요합니다.' });
    }
    if (!req.user.roles.includes('admin')) {
        return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }
    next();
};
exports.requireAdmin = requireAdmin;

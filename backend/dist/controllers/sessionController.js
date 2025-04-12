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
exports.getSessionsByBook = exports.cancelSession = exports.completeSession = exports.createSession = exports.getSessionById = exports.getUserSessions = void 0;
const Session_1 = __importDefault(require("../models/Session"));
const Book_1 = __importDefault(require("../models/Book"));
// Helper function to calculate and update estimated reading time
const updateEstimatedTime = (bookId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 해당 책의 완료된 모든 TT 세션 조회
        const sessions = yield Session_1.default.find({
            bookId,
            userId,
            mode: 'TT',
            status: 'completed',
            ppm: { $ne: null, $gt: 0 } // 유효한 ppm 값만
        }).select('ppm');
        if (sessions.length === 0) {
            // 세션 기록이 없으면 예상 시간 계산 불가
            yield Book_1.default.findByIdAndUpdate(bookId, { $set: { estimatedRemainingMinutes: null, avgPpm: null } });
            return;
        }
        // 평균 PPM 계산
        const totalPpm = sessions.reduce((sum, s) => sum + (s.ppm || 0), 0);
        const avgPpm = totalPpm / sessions.length;
        // 책 정보 조회 (현재 페이지, 총 페이지)
        const book = yield Book_1.default.findById(bookId).select('currentPage totalPages');
        if (!book || book.totalPages <= book.currentPage) {
            // 책 정보가 없거나 이미 완독한 경우
            yield Book_1.default.findByIdAndUpdate(bookId, { $set: { estimatedRemainingMinutes: 0, avgPpm: avgPpm } });
            return;
        }
        // 예상 남은 시간 계산 (분 단위)
        const remainingPages = book.totalPages - book.currentPage;
        const estimatedRemainingMinutes = Math.round(remainingPages / avgPpm);
        // 계산된 값으로 Book 업데이트
        yield Book_1.default.findByIdAndUpdate(bookId, {
            $set: {
                estimatedRemainingMinutes,
                avgPpm
            }
        });
    }
    catch (error) {
        console.error(`[updateEstimatedTime] Error updating book ${bookId}:`, error);
        // 에러 발생 시 필드를 null로 업데이트하여 잘못된 정보 방지 (선택적)
        // await Book.findByIdAndUpdate(bookId, { $set: { estimatedRemainingMinutes: null, avgPpm: null } });
    }
});
// 사용자의 모든 세션 조회
const getUserSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const sessions = yield Session_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .select('-__v');
        res.status(200).json(sessions);
    }
    catch (error) {
        console.error('세션 목록 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getUserSessions = getUserSessions;
// 특정 세션 상세 조회
const getSessionById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { sessionId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const session = yield Session_1.default.findOne({ _id: sessionId, userId })
            .populate('bookId')
            .select('-__v');
        if (!session) {
            return res.status(404).json({ message: '해당 세션을 찾을 수 없습니다.' });
        }
        res.status(200).json(session);
    }
    catch (error) {
        console.error('세션 상세 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getSessionById = getSessionById;
// 새 세션 시작
const createSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const { bookId, mode, startPage, endPage, durationSec } = req.body;
        // 책이 존재하는지 확인
        const book = yield Book_1.default.findOne({ _id: bookId, userId });
        if (!book) {
            return res.status(404).json({ message: '해당 책을 찾을 수 없습니다.' });
        }
        const newSession = new Session_1.default({
            userId,
            bookId,
            mode,
            startPage,
            endPage,
            durationSec: durationSec || 0,
            status: 'active',
        });
        const savedSession = yield newSession.save();
        // 사용자의 책 현재 페이지 업데이트
        yield Book_1.default.findByIdAndUpdate(bookId, { $set: {
                currentPage: Math.max(book.currentPage, startPage),
                status: 'in_progress'
            }
        });
        res.status(201).json(savedSession);
    }
    catch (error) {
        console.error('세션 생성 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.createSession = createSession;
// 세션 완료
const completeSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { sessionId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { actualEndPage, durationSec, ppm, memo, summary10words, selfRating } = req.body;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const session = yield Session_1.default.findOne({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ message: '해당 세션을 찾을 수 없습니다.' });
        }
        if (session.status !== 'active') {
            return res.status(400).json({ message: '이미 완료되었거나 취소된 세션입니다.' });
        }
        // 세션 완료 처리
        const updatedSession = yield Session_1.default.findByIdAndUpdate(sessionId, {
            $set: {
                status: 'completed',
                actualEndPage: actualEndPage || session.endPage,
                durationSec,
                ppm,
                memo,
                summary10words,
                selfRating
            }
        }, { new: true })
            .populate('bookId')
            .select('-__v');
        // 책 진행 상태 업데이트
        const book = yield Book_1.default.findById(session.bookId);
        let finalCurrentPage = book ? book.currentPage : 0;
        if (book) {
            const newCurrentPage = Math.max(book.currentPage, actualEndPage || session.endPage);
            finalCurrentPage = newCurrentPage; // 예상 시간 계산 위해 저장
            yield Book_1.default.findByIdAndUpdate(session.bookId, {
                $set: {
                    currentPage: newCurrentPage,
                    completionPercentage: Math.min(Math.round((newCurrentPage / book.totalPages) * 100), 100),
                    status: newCurrentPage >= book.totalPages ? 'completed' : 'in_progress'
                }
            });
        }
        // 예상 완독 시간 업데이트 (추가)
        // 주의: session.bookId가 string/ObjectId 타입인지 확인 필요
        yield updateEstimatedTime(session.bookId.toString(), userId);
        res.status(200).json(updatedSession);
    }
    catch (error) {
        console.error('세션 완료 처리 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.completeSession = completeSession;
// 세션 취소
const cancelSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { sessionId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const session = yield Session_1.default.findOne({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ message: '해당 세션을 찾을 수 없습니다.' });
        }
        if (session.status !== 'active' && session.status !== 'pending') {
            return res.status(400).json({ message: '이미 완료되었거나 취소된 세션입니다.' });
        }
        // 세션 취소 처리
        yield Session_1.default.findByIdAndUpdate(sessionId, { $set: { status: 'cancelled' } });
        res.status(200).json({ message: '세션이 취소되었습니다.' });
    }
    catch (error) {
        console.error('세션 취소 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.cancelSession = cancelSession;
// 책별 세션 조회
const getSessionsByBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { bookId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const sessions = yield Session_1.default.find({ userId, bookId })
            .sort({ createdAt: -1 })
            .select('-__v');
        res.status(200).json(sessions);
    }
    catch (error) {
        console.error('책별 세션 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getSessionsByBook = getSessionsByBook;

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
exports.getBadgeLeaderboard = exports.getZengoLeaderboard = exports.getReadingLeaderboard = void 0;
const User_1 = __importDefault(require("../models/User"));
const Session_1 = __importDefault(require("../models/Session"));
const Zengo_1 = __importDefault(require("../models/Zengo"));
// 독서 세션 리더보드
const getReadingLeaderboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 기간 쿼리 파라미터 (기본값: last7days)
        const period = req.query.period || 'last7days';
        let dateFilter = {};
        const now = new Date();
        // 기간별 날짜 필터 설정
        if (period === 'last7days') {
            const lastWeek = new Date(now);
            lastWeek.setDate(now.getDate() - 7);
            dateFilter = { createdAt: { $gte: lastWeek } };
        }
        else if (period === 'last30days') {
            const lastMonth = new Date(now);
            lastMonth.setDate(now.getDate() - 30);
            dateFilter = { createdAt: { $gte: lastMonth } };
        }
        else if (period === 'alltime') {
            // 전체 기간은 필터 없음
            dateFilter = {};
        }
        // 완료된 세션만 필터링
        const sessionFilter = Object.assign(Object.assign({}, dateFilter), { status: 'completed' });
        // 집계 파이프라인 생성
        const leaderboard = yield Session_1.default.aggregate([
            { $match: sessionFilter },
            {
                $group: {
                    _id: '$userId',
                    totalSessions: { $sum: 1 },
                    totalDuration: { $sum: '$durationSec' },
                    avgPpm: { $avg: '$ppm' },
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    nickname: '$user.nickname',
                    totalSessions: 1,
                    totalDuration: 1,
                    avgPpm: 1,
                    totalDurationFormatted: {
                        $concat: [
                            { $toString: { $floor: { $divide: ['$totalDuration', 3600] } } },
                            'h ',
                            {
                                $toString: {
                                    $floor: {
                                        $mod: [
                                            { $divide: ['$totalDuration', 60] },
                                            60
                                        ]
                                    }
                                }
                            },
                            'm'
                        ]
                    }
                }
            },
            { $sort: { totalDuration: -1 } },
            { $limit: 10 }
        ]);
        res.status(200).json(leaderboard);
    }
    catch (error) {
        console.error('독서 리더보드 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getReadingLeaderboard = getReadingLeaderboard;
// Zengo 점수 리더보드
const getZengoLeaderboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 기간 쿼리 파라미터 (기본값: last7days)
        const period = req.query.period || 'last7days';
        let dateFilter = {};
        const now = new Date();
        // 기간별 날짜 필터 설정
        if (period === 'last7days') {
            const lastWeek = new Date(now);
            lastWeek.setDate(now.getDate() - 7);
            dateFilter = { createdAt: { $gte: lastWeek } };
        }
        else if (period === 'last30days') {
            const lastMonth = new Date(now);
            lastMonth.setDate(now.getDate() - 30);
            dateFilter = { createdAt: { $gte: lastMonth } };
        }
        else if (period === 'alltime') {
            // 전체 기간은 필터 없음
            dateFilter = {};
        }
        // 완료된 Zengo 활동만 필터링
        const zengoFilter = Object.assign(Object.assign({}, dateFilter), { status: 'completed' });
        // 집계 파이프라인 생성
        const leaderboard = yield Zengo_1.default.aggregate([
            { $match: zengoFilter },
            {
                $group: {
                    _id: '$userId',
                    highestScore: { $max: '$overallScore' },
                    avgScore: { $avg: '$overallScore' },
                    totalActivities: { $sum: 1 },
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    nickname: '$user.nickname',
                    highestScore: 1,
                    avgScore: 1,
                    totalActivities: 1,
                }
            },
            { $sort: { highestScore: -1 } },
            { $limit: 10 }
        ]);
        res.status(200).json(leaderboard);
    }
    catch (error) {
        console.error('Zengo 리더보드 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getZengoLeaderboard = getZengoLeaderboard;
// 사용자별 배지 수 리더보드
const getBadgeLeaderboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 배지 수 집계 파이프라인
        const leaderboard = yield User_1.default.aggregate([
            {
                $lookup: {
                    from: 'badges',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'badges'
                }
            },
            {
                $project: {
                    _id: 1,
                    nickname: 1,
                    totalBadges: { $size: '$badges' },
                }
            },
            { $sort: { totalBadges: -1 } },
            { $limit: 10 }
        ]);
        res.status(200).json(leaderboard);
    }
    catch (error) {
        console.error('배지 리더보드 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getBadgeLeaderboard = getBadgeLeaderboard;

import { Request, Response } from 'express';
import User from '../models/User';
import Session from '../models/Session';
import Zengo from '../models/Zengo';

// 독서 세션 리더보드
export const getReadingLeaderboard = async (req: Request, res: Response) => {
  try {
    // 기간 쿼리 파라미터 (기본값: last7days)
    const period = (req.query.period as string) || 'last7days';
    
    let dateFilter: any = {};
    const now = new Date();
    
    // 기간별 날짜 필터 설정
    if (period === 'last7days') {
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      dateFilter = { createdAt: { $gte: lastWeek } };
    } else if (period === 'last30days') {
      const lastMonth = new Date(now);
      lastMonth.setDate(now.getDate() - 30);
      dateFilter = { createdAt: { $gte: lastMonth } };
    } else if (period === 'alltime') {
      // 전체 기간은 필터 없음
      dateFilter = {};
    }

    // 완료된 세션만 필터링
    const sessionFilter = { ...dateFilter, status: 'completed' };
    
    // 집계 파이프라인 생성
    const leaderboard = await Session.aggregate([
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
  } catch (error) {
    console.error('독서 리더보드 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Zengo 점수 리더보드
export const getZengoLeaderboard = async (req: Request, res: Response) => {
  try {
    // 기간 쿼리 파라미터 (기본값: last7days)
    const period = (req.query.period as string) || 'last7days';
    
    let dateFilter: any = {};
    const now = new Date();
    
    // 기간별 날짜 필터 설정
    if (period === 'last7days') {
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      dateFilter = { createdAt: { $gte: lastWeek } };
    } else if (period === 'last30days') {
      const lastMonth = new Date(now);
      lastMonth.setDate(now.getDate() - 30);
      dateFilter = { createdAt: { $gte: lastMonth } };
    } else if (period === 'alltime') {
      // 전체 기간은 필터 없음
      dateFilter = {};
    }

    // 완료된 Zengo 활동만 필터링
    const zengoFilter = { ...dateFilter, status: 'completed' };
    
    // 집계 파이프라인 생성
    const leaderboard = await Zengo.aggregate([
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
  } catch (error) {
    console.error('Zengo 리더보드 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 사용자별 배지 수 리더보드
export const getBadgeLeaderboard = async (req: Request, res: Response) => {
  try {
    // 배지 수 집계 파이프라인
    const leaderboard = await User.aggregate([
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
  } catch (error) {
    console.error('배지 리더보드 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}; 
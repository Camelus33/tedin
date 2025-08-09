import { Request, Response } from 'express';
import User from '../models/User';
import Note from '../models/Note';
import Session from '../models/Session';
import Book from '../models/Book';
import UserStats from '../models/UserStats';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { computeXPLevel, DEFAULT_LEVEL_CONFIG } from '../services/LevelService';
import Notification from '../models/Notification';

// Multer configuration for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.resolve(process.cwd(), 'uploads', 'profiles');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '이미지 파일이 필요합니다.' });
    }

    const userId = req.user._id;
    const imageUrl = `/uploads/profiles/${req.file.filename}`;

    await User.findByIdAndUpdate(userId, { profileImage: imageUrl }, { new: true });

    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ error: '프로필 이미지 업로드 중 오류가 발생했습니다.' });
  }
};
// Get user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    res.status(200).json({
      userId: user._id,
      email: user.email,
      nickname: user.nickname,
      phone: (user as any).phone || '',
      recoveryEmail: (user as any).recoveryEmail || '',
      profileImage: (user as any).profileImage || '',
      jobCode: (user as any).jobCode || '',
      trialEndsAt: user.trialEndsAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: '프로필 조회 중 오류가 발생했습니다.' });
  }
};

// Update user profile
// 서버 측 안전 매핑: 직업 코드 -> 정적 아이콘 경로
const JOB_ICON_MAP: Record<string, string> = {
  student: '/avatars/jobs/student.svg',
  engineer: '/avatars/jobs/engineer.svg',
  doctor: '/avatars/jobs/doctor.svg',
  teacher: '/avatars/jobs/teacher.svg',
  designer: '/avatars/jobs/designer.svg',
  researcher: '/avatars/jobs/researcher.svg',
};

export const updateProfile = async (req: Request, res: Response) => {
  // Add log to check if the handler is reached
  console.log('--- Received PUT /api/users/profile request ---');
  console.log('Request Body:', req.body);
  console.log('User ID from auth middleware:', req.user?._id);

  try {
    const userId = req.user._id;
    const { nickname, phone, recoveryEmail, profileImage, jobCode } = req.body;
    
    // Find and update user
    const updateFields: any = {};
    if (nickname !== undefined) updateFields.nickname = nickname;
    if (phone !== undefined) updateFields.phone = phone;
    if (recoveryEmail !== undefined) updateFields.recoveryEmail = recoveryEmail;
    if (profileImage !== undefined) updateFields.profileImage = profileImage;
    // 직업 코드가 들어오면 서버 매핑을 통해 안전하게 아이콘 경로 설정
    if (typeof jobCode === 'string' && jobCode in JOB_ICON_MAP) {
      updateFields.jobCode = jobCode;
      updateFields.profileImage = JOB_ICON_MAP[jobCode];
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    res.status(200).json({
      userId: updatedUser._id,
      email: updatedUser.email,
      nickname: updatedUser.nickname,
      phone: updatedUser.phone || '',
      recoveryEmail: updatedUser.recoveryEmail || '',
      profileImage: updatedUser.profileImage || '',
      jobCode: (updatedUser as any).jobCode || '',
      trialEndsAt: updatedUser.trialEndsAt,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: '프로필 업데이트 중 오류가 발생했습니다.' });
  }
};

// Get user settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    const { preferences } = req.user as any;
    res.status(200).json({
      userId: req.user._id,
      preferences,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: '설정 조회 중 오류가 발생했습니다.' });
  }
};

// Update user settings
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    // Merge new preferences with existing
    const oldPrefs = (req.user as any).preferences || {};
    const newPrefs = { ...oldPrefs, ...req.body };
    // Compute recommendations: exam overrides
    if (newPrefs.goals?.includes('exam')) {
      newPrefs.recommendedZenGoLevels = ['Myverse'];
      newPrefs.recommendedTsDuration = 8;
    } else {
      const maxScore = Math.max(newPrefs.memorySpanScore || 0, newPrefs.attentionScore || 0);
      newPrefs.recommendedZenGoLevels = maxScore < 40 ? ['3×3'] : maxScore < 70 ? ['5×5'] : ['7×7'];
      const att = newPrefs.attentionScore || 0;
      newPrefs.recommendedTsDuration = att < 30 ? 5 : att < 50 ? 8 : att < 75 ? 11 : 14;
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferences: newPrefs },
      { new: true }
    );
    res.status(200).json({ userId, preferences: updatedUser?.preferences });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: '설정 업데이트 중 오류가 발생했습니다.' });
  }
};

// Search users by nickname (for group sharing)
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const q = (req.query.nickname as string) || '';
    // Case-insensitive partial match on nickname
    const users = await User.find({ nickname: { $regex: q, $options: 'i' } })
      .limit(10)
      .select('_id nickname');
    res.status(200).json(users.map(u => ({ _id: u._id, nickname: u.nickname })));
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

// Get user statistics (Added)
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    // Calculate start of today for filtering
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    // Fetch relevant data in parallel
    const [latestSession, userStats, totalBooks, todayTsCount, totalTsCount, totalNotes] = await Promise.all([
      Session.findOne({ userId: userObjectId, mode: 'TS', status: 'completed', ppm: { $ne: null, $gt: 0 } })
        .sort({ createdAt: -1 })
        .select('ppm')
        .lean(),
      UserStats.findOne({ userId: userObjectId }).lean(),
      Book.countDocuments({ userId: userObjectId }),
      Session.countDocuments({ userId: userObjectId, mode: 'TS', status: 'completed', createdAt: { $gte: startOfToday } }),
      Session.countDocuments({ userId: userObjectId, mode: 'TS', status: 'completed' }),
      Note.countDocuments({ userId: userObjectId }),
    ]);
    // Compute today's ZenGo score from history
    let todayZengoScore = 0;
    if (userStats && Array.isArray(userStats.zengoPlayHistory)) {
      todayZengoScore = userStats.zengoPlayHistory
        .filter(h => h.playedAt >= startOfToday)
        .reduce((sum, h) => sum + (h.score || 0), 0);
    }
    // Prepare response matching frontend expectations
    // Compute memoCount and concept score sum
    const [userNotesAggregate] = await Note.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$userId',
          memoCount: { $sum: 1 },
          conceptScoreSum: { $sum: { $ifNull: ['$conceptScore', 0] } },
        },
      },
    ]);

    const memoCount = userNotesAggregate?.memoCount || 0;
    const conceptScoreSum = userNotesAggregate?.conceptScoreSum || 0;
    const totalUsageMs = userStats?.totalUsageMs ?? 0;

    const levelInfo = computeXPLevel(
      { totalUsageMs, memoCount, conceptScoreSum },
      DEFAULT_LEVEL_CONFIG
    );

    // Optional: create level-up notification when crossing threshold (client can pass prevLevel header)
    const prevLevel = Number(req.headers['x-prev-level'] || 0);
    if (Number.isFinite(prevLevel) && levelInfo.level > prevLevel) {
      try {
        await Notification.create({
          userId: userObjectId,
          senderId: userObjectId,
          gameId: userObjectId, // placeholder ref
          type: 'level_up',
          message: `레벨 업! LV${levelInfo.level}에 도달했습니다 🎉`,
        } as any);
      } catch (e) {
        console.warn('level_up notification creation failed', e);
      }
    }

    const response = {
      recentPpm: latestSession?.ppm ?? null,
      todayTsCount,
      totalTsCount,
      todayZengoScore,
      totalZengoScore: userStats?.zengoTotalScore ?? 0,
      totalBooks: totalBooks || 0,
      totalNotes: totalNotes || 0,
      totalUsageMs,
      level: levelInfo.level,
      totalXP: Math.round(levelInfo.totalXP),
      nextLevel: levelInfo.nextLevel,
      progressToNext: levelInfo.progressToNext,
      xpBreakdown: levelInfo.breakdown,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error('사용자 통계 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}; 

// Increment total usage time (milliseconds)
export const addUsageTime = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const { deltaMs } = req.body as { deltaMs?: number };
    const inc = typeof deltaMs === 'number' && isFinite(deltaMs) && deltaMs > 0 ? Math.min(deltaMs, 60 * 60 * 1000) : 0; // cap 1h per call
    if (inc === 0) {
      return res.status(400).json({ message: 'deltaMs가 필요합니다.' });
    }

    const updated = await UserStats.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $inc: { totalUsageMs: inc } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.status(200).json({ ok: true, totalUsageMs: updated?.totalUsageMs ?? 0 });
  } catch (error) {
    console.error('누적 사용시간 증가 실패:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};
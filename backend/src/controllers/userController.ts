import { Request, Response } from 'express';
import User from '../models/User';
import Session from '../models/Session';
import Book from '../models/Book';
import UserStats from '../models/UserStats';
import mongoose from 'mongoose';

// Get user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    
    res.status(200).json({
      userId: user._id,
      email: user.email,
      nickname: user.nickname,
      trialEndsAt: user.trialEndsAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: '프로필 조회 중 오류가 발생했습니다.' });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  // Add log to check if the handler is reached
  console.log('--- Received PUT /api/users/profile request ---');
  console.log('Request Body:', req.body);
  console.log('User ID from auth middleware:', req.user?._id);

  try {
    const userId = req.user._id;
    const { nickname } = req.body;
    
    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { nickname },
      { new: true, runValidators: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    res.status(200).json({
      userId: updatedUser._id,
      email: updatedUser.email,
      nickname: updatedUser.nickname,
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
    const userObjectId = new mongoose.Types.ObjectId(userId); // Convert to ObjectId

    // Fetch data in parallel
    const [latestSession, userStats, totalBooks] = await Promise.all([
      // 1. Find the most recent completed TS session with a valid PPM
      Session.findOne({
        userId: userObjectId,
        mode: 'TS',
        status: 'completed',
        ppm: { $ne: null, $gt: 0 } // Ensure PPM is valid
      })
      .sort({ createdAt: -1 }) // Sort by creation date descending
      .select('ppm') // Select only the ppm field
      .lean(), // Use lean for performance

      // 2. Find user statistics
      UserStats.findOne({ userId: userObjectId })
      .select('totalTsDurationSec zengoPlayCount') // Select required fields
      .lean(), // Use lean for performance

      // 3. Count the total number of books for the user
      Book.countDocuments({ userId: userObjectId })
    ]);

    // Combine results
    const stats = {
      recentPpm: latestSession ? latestSession.ppm : null,
      totalTsTime: userStats ? userStats.totalTsDurationSec : 0,
      totalZengoCount: userStats ? userStats.zengoPlayCount : 0,
      totalBooks: totalBooks || 0, // countDocuments returns a number
    };

    res.status(200).json(stats);

  } catch (error) {
    console.error('사용자 통계 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}; 
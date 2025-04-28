import { Request, Response } from 'express';
import User from '../models/User';

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
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: '설정 조회 중 오류가 발생했습니다.' });
  }
};

// Update user settings
export const updateSettings = async (req: Request, res: Response) => {
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
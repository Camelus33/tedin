import { Request, Response } from 'express';
import Badge from '../models/Badge';

// 사용자의 모든 배지 조회
export const getUserBadges = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const badges = await Badge.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json(badges);
  } catch (error) {
    console.error('배지 목록 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 배지 상세 조회
export const getBadgeById = async (req: Request, res: Response) => {
  try {
    const { badgeId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const badge = await Badge.findOne({ _id: badgeId, userId })
      .select('-__v');

    if (!badge) {
      return res.status(404).json({ message: '해당 배지를 찾을 수 없습니다.' });
    }

    res.status(200).json(badge);
  } catch (error) {
    console.error('배지 상세 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 타입의 배지 조회
export const getBadgesByType = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const badges = await Badge.find({ userId, type })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json(badges);
  } catch (error) {
    console.error('타입별 배지 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 컨텍스트의 배지 조회
export const getBadgesByContext = async (req: Request, res: Response) => {
  try {
    const { context } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    if (!['TS', 'Zengo'].includes(context)) {
      return res.status(400).json({ message: '유효하지 않은 컨텍스트입니다.' });
    }

    const badges = await Badge.find({ userId, context })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json(badges);
  } catch (error) {
    console.error('컨텍스트별 배지 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 관리자: 배지 수동 추가 (관리자 전용)
export const createBadge = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { targetUserId, type, context, relatedSessionId } = req.body;
    
    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }
    
    // 관리자 권한 확인 (isAdmin 미들웨어가 이미 적용되었다고 가정)
    
    const newBadge = new Badge({
      userId: targetUserId,
      type,
      context,
      relatedSessionId,
    });

    const savedBadge = await newBadge.save();
    
    res.status(201).json(savedBadge);
  } catch (error) {
    console.error('배지 생성 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 관리자: 배지 삭제 (관리자 전용)
export const deleteBadge = async (req: Request, res: Response) => {
  try {
    const { badgeId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }
    
    // 관리자 권한 확인 (isAdmin 미들웨어가 이미 적용되었다고 가정)

    const badge = await Badge.findById(badgeId);

    if (!badge) {
      return res.status(404).json({ message: '해당 배지를 찾을 수 없습니다.' });
    }

    await Badge.deleteOne({ _id: badgeId });

    res.status(200).json({ message: '배지가 삭제되었습니다.' });
  } catch (error) {
    console.error('배지 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}; 
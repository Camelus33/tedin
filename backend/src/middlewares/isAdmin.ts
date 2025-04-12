import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

// 관리자 권한 확인 미들웨어
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // 사용자 정보 조회
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 관리자 권한 확인
    if (!user.roles.includes('admin')) {
      return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    }

    // 관리자 권한이 있으면 다음 미들웨어로 진행
    next();
  } catch (error) {
    console.error('관리자 권한 확인 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}; 
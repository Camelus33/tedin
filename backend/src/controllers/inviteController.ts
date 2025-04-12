import { Request, Response } from 'express';
import Invite from '../models/Invite';
import User from '../models/User';

// 초대 코드 생성
export const createInvite = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // 사용자 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 사용자가 생성할 수 있는 초대 코드 수 제한 확인 (예: 5개)
    const existingInvites = await Invite.countDocuments({
      inviterId: userId,
      usedBy: null // 사용되지 않은 코드만 계산
    });

    if (existingInvites >= 5) {
      return res.status(400).json({ 
        message: '사용하지 않은 초대 코드가 이미 5개 있습니다. 기존 코드를 사용한 후 다시 시도해주세요.' 
      });
    }

    // 새 초대 코드 생성
    const newInvite = new Invite({
      inviterId: userId,
    });

    const savedInvite = await newInvite.save();
    
    res.status(201).json({
      inviteCode: savedInvite.inviteCode,
      createdAt: savedInvite.createdAt
    });
  } catch (error) {
    console.error('초대 코드 생성 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 내가 생성한 초대 코드 목록 조회
export const getMyInvites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const invites = await Invite.find({ inviterId: userId })
      .sort({ createdAt: -1 })
      .populate('usedBy', 'nickname email')
      .select('-__v');

    res.status(200).json(invites);
  } catch (error) {
    console.error('초대 코드 목록 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 초대 코드 검증
export const validateInviteCode = async (req: Request, res: Response) => {
  try {
    const { inviteCode } = req.params;

    // 초대 코드 조회
    const invite = await Invite.findOne({ inviteCode })
      .populate('inviterId', 'nickname');

    if (!invite) {
      return res.status(404).json({ 
        isValid: false,
        message: '유효하지 않은 초대 코드입니다.' 
      });
    }

    // 이미 사용된 코드인지 확인
    if (invite.usedBy) {
      return res.status(400).json({ 
        isValid: false,
        message: '이미 사용된 초대 코드입니다.' 
      });
    }

    // 유효한 코드
    const inviter = invite.inviterId as any; // 타입 오류 방지

    res.status(200).json({
      isValid: true,
      inviterId: invite.inviterId,
      inviterNickname: inviter.nickname
    });
  } catch (error) {
    console.error('초대 코드 검증 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 초대 코드 사용 (회원 가입 시)
export const useInviteCode = async (req: Request, res: Response) => {
  try {
    const { inviteCode, userId } = req.body;

    if (!inviteCode || !userId) {
      return res.status(400).json({ 
        message: '초대 코드와 사용자 ID가 필요합니다.' 
      });
    }

    // 초대 코드 조회
    const invite = await Invite.findOne({ inviteCode });

    if (!invite) {
      return res.status(404).json({ 
        success: false,
        message: '유효하지 않은 초대 코드입니다.' 
      });
    }

    // 이미 사용된 코드인지 확인
    if (invite.usedBy) {
      return res.status(400).json({ 
        success: false,
        message: '이미 사용된 초대 코드입니다.' 
      });
    }

    // 사용자 정보 업데이트
    await User.findByIdAndUpdate(userId, {
      invitedBy: invite.inviterId
    });

    // 초대 코드 사용 처리
    await Invite.findByIdAndUpdate(invite._id, {
      usedBy: userId,
      usedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: '초대 코드가 성공적으로 사용되었습니다.'
    });
  } catch (error) {
    console.error('초대 코드 사용 중 오류 발생:', error);
    res.status(500).json({ 
      success: false,
      message: '서버 오류가 발생했습니다.' 
    });
  }
};

// 관리자 전용: 모든 초대 코드 조회
export const getAllInvites = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // 관리자 권한 확인은 미들웨어에서 처리한다고 가정

    const invites = await Invite.find()
      .sort({ createdAt: -1 })
      .populate('inviterId', 'nickname email')
      .populate('usedBy', 'nickname email')
      .select('-__v');

    res.status(200).json(invites);
  } catch (error) {
    console.error('모든 초대 코드 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}; 
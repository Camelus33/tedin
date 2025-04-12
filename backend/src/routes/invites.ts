import express from 'express';
import { 
  createInvite, 
  getMyInvites, 
  validateInviteCode, 
  useInviteCode, 
  getAllInvites 
} from '../controllers/inviteController';
import { authenticate } from '../middlewares/auth';
import { isAdmin } from '../middlewares/isAdmin';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';

const router = express.Router();

// 초대 코드 사용 검증
const useInviteValidation = [
  body('inviteCode')
    .notEmpty()
    .withMessage('초대 코드가 필요합니다'),
  body('userId')
    .notEmpty()
    .withMessage('사용자 ID가 필요합니다'),
];

// 인증이 필요한 라우트
router.use(['/create', '/my'], authenticate);

// 초대 코드 생성
router.post('/create', createInvite);

// 내 초대 코드 목록 조회
router.get('/my', getMyInvites);

// 초대 코드 검증 (인증 불필요)
router.get('/validate/:inviteCode', validateInviteCode);

// 초대 코드 사용 (인증 불필요)
router.post(
  '/use',
  useInviteValidation,
  validateRequest,
  useInviteCode
);

// 관리자 전용 라우트
router.use('/admin', authenticate, isAdmin);

// 모든 초대 코드 조회 (관리자 전용)
router.get('/admin/all', getAllInvites);

export default router; 
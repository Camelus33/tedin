import express from 'express';
import {
  createSummaryNote,
  getSummaryNoteById,
  updateSummaryNote
} from '../controllers/summaryNoteController';
import { authenticate } from '../middlewares/auth'; // 인증 미들웨어 임포트

const router = express.Router();

/**
 * @description 모든 단권화 노트(SummaryNote) 관련 라우트에 인증 미들웨어를 적용합니다.
 * 따라서 이후에 정의되는 모든 라우트는 요청 시 유효한 JWT 토큰을 필요로 하며,
 * 인증 성공 시 req.user 객체에 사용자 정보가 포함됩니다.
 */
router.use(authenticate);

/**
 * @route POST /api/summary-notes/
 * @description 새로운 단권화 노트를 생성합니다.
 * @access Private (인증 필요)
 * @handler summaryNoteController.createSummaryNote
 */
router.post('/', createSummaryNote);

/**
 * @route GET /api/summary-notes/:summaryNoteId
 * @description 특정 ID를 가진 단권화 노트를 조회합니다.
 * @access Private (인증 필요)
 * @param {string} summaryNoteId - 조회할 단권화 노트의 ID
 * @handler summaryNoteController.getSummaryNoteById
 */
router.get('/:summaryNoteId', getSummaryNoteById);

/**
 * @route PUT /api/summary-notes/:summaryNoteId
 * @description 특정 ID를 가진 단권화 노트를 업데이트합니다.
 * @access Private (인증 필요)
 * @param {string} summaryNoteId - 업데이트할 단권화 노트의 ID
 * @handler summaryNoteController.updateSummaryNote
 */
router.put('/:summaryNoteId', updateSummaryNote);

export default router; 
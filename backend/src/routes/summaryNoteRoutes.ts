import express from 'express';
import {
  createSummaryNote,
  getSummaryNoteById,
  updateSummaryNote,
  getSummaryNotesByUserId,
  deleteSummaryNote,
  createPublicShareLink,
  getSummaryNoteData
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
 * @route GET /api/summary-notes/
 * @description 현재 인증된 사용자의 모든 단권화 노트를 조회합니다.
 * @access Private (인증 필요)
 * @handler summaryNoteController.getSummaryNotesByUserId
 */
router.get('/', getSummaryNotesByUserId);

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
 * @route GET /api/summary-notes/:summaryNoteId/data
 * @description 특정 ID를 가진 단권화 노트의 순수 데이터(JSON)를 조회합니다. AI-Link 컨텍스트 주입에 사용됩니다.
 * @access Private (인증 필요)
 * @param {string} summaryNoteId - 조회할 단권화 노트의 ID
 * @handler summaryNoteController.getSummaryNoteData
 */
router.get('/:summaryNoteId/data', getSummaryNoteData);

/**
 * @route PUT /api/summary-notes/:summaryNoteId
 * @description 특정 ID를 가진 단권화 노트를 업데이트합니다.
 * @access Private (인증 필요)
 * @param {string} summaryNoteId - 업데이트할 단권화 노트의 ID
 * @handler summaryNoteController.updateSummaryNote
 */
router.put('/:summaryNoteId', updateSummaryNote);

/**
 * @route DELETE /api/summary-notes/:summaryNoteId
 * @description 특정 ID를 가진 단권화 노트를 삭제합니다.
 * @access Private (인증 필요)
 * @param {string} summaryNoteId - 삭제할 단권화 노트의 ID
 * @handler summaryNoteController.deleteSummaryNote
 */
router.delete('/:summaryNoteId', deleteSummaryNote);

/**
 * @route POST /api/summary-notes/:summaryNoteId/public-link
 * @description Creates a new public share link for a specific summary note.
 * @access Private (Requires authentication)
 */
router.post('/:summaryNoteId/public-link', createPublicShareLink);

export default router; 
import express from 'express';
import { 
  getUserNotes, 
  getNoteById, 
  createNote, 
  updateNote, 
  deleteNote, 
  getNotesByBook, 
  getNotesByTag,
  getNotesByIds,
  analyzePBAM,
  addInlineThread,
  updateInlineThread,
  deleteInlineThread,
  createPdfNote
} from '../controllers/noteController';
import { authenticate } from '../middlewares/auth';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';

const router = express.Router();

// All note routes require authentication
router.use(authenticate);

// Validation for creating a new note
const createNoteValidation = [
  body('bookId')
    .notEmpty()
    .withMessage('책 ID가 필요합니다'),
  body('type')
    .isIn(['quote', 'thought', 'question'])
    .withMessage('유효한 노트 유형이 아닙니다'),
  body('content')
    .notEmpty()
    .withMessage('내용을 입력해주세요')
    .isLength({ max: 1000 })
    .withMessage('내용은 최대 1000자까지 가능합니다'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('태그는 배열 형태여야 합니다'),
];

// Validation for creating a PDF memo
const createPdfNoteValidation = [
  body('bookId')
    .notEmpty()
    .withMessage('책 ID가 필요합니다')
    .isMongoId()
    .withMessage('유효한 책 ID가 아닙니다'),
  body('type')
    .isIn(['quote', 'thought', 'question'])
    .withMessage('유효한 노트 유형이 아닙니다'),
  body('content')
    .notEmpty()
    .withMessage('메모 내용을 입력해주세요')
    .isLength({ max: 1000 })
    .withMessage('메모 내용은 최대 1000자까지 가능합니다'),
  body('pageNumber')
    .isInt({ min: 1 })
    .withMessage('페이지 번호는 1 이상의 정수여야 합니다'),
  body('highlightedText')
    .notEmpty()
    .withMessage('하이라이트된 텍스트가 필요합니다')
    .isLength({ max: 2000 })
    .withMessage('하이라이트된 텍스트는 최대 2000자까지 가능합니다'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('태그는 배열 형태여야 합니다'),
  body('selfRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('자체 평가는 1에서 5 사이의 정수여야 합니다'),
  body('highlightData')
    .optional()
    .isObject()
    .withMessage('하이라이트 데이터는 객체 형태여야 합니다'),
  body('highlightData.x')
    .optional()
    .isNumeric()
    .withMessage('하이라이트 x 좌표는 숫자여야 합니다'),
  body('highlightData.y')
    .optional()
    .isNumeric()
    .withMessage('하이라이트 y 좌표는 숫자여야 합니다'),
  body('highlightData.width')
    .optional()
    .isNumeric()
    .withMessage('하이라이트 너비는 숫자여야 합니다'),
  body('highlightData.height')
    .optional()
    .isNumeric()
    .withMessage('하이라이트 높이는 숫자여야 합니다'),
  body('highlightData.pageIndex')
    .optional()
    .isInt({ min: 0 })
    .withMessage('하이라이트 페이지 인덱스는 0 이상의 정수여야 합니다'),
];

// Validation for updating a note
const updateNoteValidation = [
  body('type')
    .optional()
    .isIn(['quote', 'thought', 'question'])
    .withMessage('유효한 노트 유형이 아닙니다'),
  body('content')
    .optional()
    .notEmpty()
    .withMessage('내용을 입력해주세요')
    .isLength({ max: 1000 })
    .withMessage('내용은 최대 1000자까지 가능합니다'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('태그는 배열 형태여야 합니다'),
];

// Validation for PBAM analysis
const pbamaAnalysisValidation = [
  body('noteId')
    .notEmpty()
    .withMessage('노트 ID가 필요합니다'),
];

// Get all notes for the current user
router.get('/', getUserNotes);

// Get a specific note by ID
router.get('/:noteId', getNoteById);

// Get all notes for a specific book
router.get('/book/:bookId', getNotesByBook);

// Get all notes with a specific tag
router.get('/tag/:tag', getNotesByTag);

// Create a new note
router.post(
  '/',
  createNoteValidation,
  validateRequest,
  createNote
);

// Create a new PDF memo
router.post(
  '/pdf',
  createPdfNoteValidation,
  validateRequest,
  createPdfNote
);

// Update a note
router.put(
  '/:noteId',
  updateNoteValidation,
  validateRequest,
  updateNote
);

// Delete a note
router.delete('/:noteId', deleteNote);

// Batch get notes by IDs
router.post('/batch', getNotesByIds);

// PBAM analysis endpoint
router.post(
  '/analyze-pbam',
  pbamaAnalysisValidation,
  validateRequest,
  analyzePBAM
);

// 인라인메모 쓰레드 관련 엔드포인트
// 인라인메모 쓰레드 추가
router.post(
  '/:noteId/inline-threads',
  [
    body('content')
      .notEmpty()
      .withMessage('내용을 입력해주세요')
      .isLength({ max: 1000 })
      .withMessage('내용은 최대 1000자까지 가능합니다'),
  ],
  validateRequest,
  addInlineThread
);

// 인라인메모 쓰레드 수정
router.put(
  '/:noteId/inline-threads/:threadId',
  [
    body('content')
      .notEmpty()
      .withMessage('내용을 입력해주세요')
      .isLength({ max: 1000 })
      .withMessage('내용은 최대 1000자까지 가능합니다'),
  ],
  validateRequest,
  updateInlineThread
);

// 인라인메모 쓰레드 삭제
router.delete('/:noteId/inline-threads/:threadId', deleteInlineThread);

export default router; 
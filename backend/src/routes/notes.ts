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
  analyzePBAM
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

export default router; 
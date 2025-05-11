import express from 'express';
import { getUserBooks, getBookById, addBook, updateBookProgress, removeBook } from '../controllers/bookController';
import { authenticate } from '../middlewares/auth';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';

const router = express.Router();

// All book routes require authentication
router.use(authenticate);

// Validation for adding a new book
const bookAddValidation = [
  body('title')
    .notEmpty()
    .withMessage('책 제목을 입력해주세요')
    .trim(),
  body('author')
    .notEmpty()
    .withMessage('저자를 입력해주세요')
    .trim(),
  body('totalPages')
    .isInt({ min: 1 })
    .withMessage('총 페이지 수는 1 이상이어야 합니다'),
  body('isbn')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim(),
  body('readingPurpose')
    .optional()
    .isIn(['exam_prep', 'practical_knowledge', 'humanities_self_reflection', 'reading_pleasure'])
    .withMessage('읽는 목적이 올바르지 않습니다.'),
];

// Validation for updating book progress
const bookProgressValidation = [
  body('currentPage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('현재 페이지는 0 이상이어야 합니다'),
  body('status')
    .optional()
    .isIn(['not_started', 'in_progress', 'completed'])
    .withMessage('유효하지 않은 상태입니다'),
];

// Get all books for the current user
router.get('/', getUserBooks);

// Get a specific book by ID
router.get('/:bookId', getBookById);

// Add a new book
router.post(
  '/',
  bookAddValidation,
  validateRequest,
  addBook
);

// Update book progress
router.put(
  '/:bookId/progress',
  bookProgressValidation,
  validateRequest,
  updateBookProgress
);

// Delete a book
router.delete('/:bookId', removeBook);

export default router; 
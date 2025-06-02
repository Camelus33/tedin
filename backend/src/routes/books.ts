import express from 'express';
import { getUserBooks, getBookById, addBook, updateBookProgress, removeBook, getBooksByIds, updateBookInfo } from '../controllers/bookController';
import { authenticate } from '../middlewares/auth';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads'); // Adjust path as needed, assumes routes folder is in src/
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, uploadDir);
  },
  filename: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    // Sanitize filename and ensure uniqueness
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req: express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Pass an error to cb if the file is not an image
    cb(new Error('이미지 파일만 업로드 가능합니다.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// All book routes require authentication
router.use(authenticate);

// Validation for adding/updating a book (title, author, totalPages는 addBookValidation과 유사하게 사용 가능)
// 필요시 updateBookValidation을 별도로 정의하거나 기존 bookAddValidation 활용
const bookUpdateValidation = [
  body('title').optional().notEmpty().withMessage('책 제목을 입력해주세요').trim(),
  body('author').optional().notEmpty().withMessage('저자를 입력해주세요').trim(),
  body('totalPages').optional().isInt({ min: 1 }).withMessage('총 페이지 수는 1 이상이어야 합니다'),
  body('currentPage').optional().isInt({ min: 0 }).withMessage('현재 페이지는 0 이상이어야 합니다'),
  body('category').optional().trim(),
  body('readingPurpose').optional().isIn(['exam_prep', 'practical_knowledge', 'humanities_self_reflection', 'reading_pleasure']).withMessage('읽는 목적이 올바르지 않습니다.'),
  // 다른 필드에 대한 유효성 검사 추가 가능
];

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
  upload.single('coverImage'),
  bookAddValidation,
  validateRequest,
  addBook
);

// NEW ROUTE for updating book information (including cover image)
router.put(
  '/:bookId',
  upload.single('coverImage'),
  bookUpdateValidation,
  validateRequest,
  updateBookInfo
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

// Batch get books by IDs
router.post('/batch', getBooksByIds);

export default router; 
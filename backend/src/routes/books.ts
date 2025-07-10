import express from 'express';
import { getUserBooks, getBookById, addBook, updateBookProgress, removeBook, getBooksByIds, updateBookInfo, uploadPdf } from '../controllers/bookController';
import { authenticate } from '../middlewares/auth';
import { body } from 'express-validator';
import validateRequest from '../middlewares/validateRequest';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

console.log(`[BooksRoutes] Initializing book routes...`);
console.log(`[BooksRoutes] Current working directory (cwd): ${process.cwd()}`);
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(`[BooksRoutes] __dirname: ${__dirname}`);

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads');
console.log(`[BooksRoutes] Multer upload directory configured to (resolved path): ${uploadDir}`);
if (!fs.existsSync(uploadDir)) {
  console.log(`[BooksRoutes] Upload directory ${uploadDir} does not exist. Creating...`);
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`[BooksRoutes] Upload directory ${uploadDir} created.`);
} else {
  console.log(`[BooksRoutes] Upload directory ${uploadDir} already exists.`);
}

// Ensure PDF uploads directory exists
const pdfUploadDir = path.resolve(process.cwd(), 'uploads', 'pdfs');
console.log(`[BooksRoutes] PDF upload directory configured to: ${pdfUploadDir}`);
if (!fs.existsSync(pdfUploadDir)) {
  console.log(`[BooksRoutes] PDF upload directory ${pdfUploadDir} does not exist. Creating...`);
  fs.mkdirSync(pdfUploadDir, { recursive: true });
  console.log(`[BooksRoutes] PDF upload directory ${pdfUploadDir} created.`);
} else {
  console.log(`[BooksRoutes] PDF upload directory ${pdfUploadDir} already exists.`);
}

// Multer configuration for image uploads (existing)
const storage = multer.diskStorage({
  destination: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    console.log(`[BooksRoutes-MulterDest] Destination function called. Calculated uploadDir: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const newFilename = file.fieldname + '-' + uniqueSuffix + extension;
    console.log(`[BooksRoutes-MulterFilename] Filename function called. Generating filename: ${newFilename}`);
    cb(null, newFilename);
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

// Multer configuration for PDF uploads (new)
const pdfStorage = multer.diskStorage({
  destination: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    console.log(`[BooksRoutes-PDFMulterDest] PDF destination function called. Using pdfUploadDir: ${pdfUploadDir}`);
    cb(null, pdfUploadDir);
  },
  filename: function (req: express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const newFilename = file.fieldname + '-' + uniqueSuffix + extension;
    console.log(`[BooksRoutes-PDFMulterFilename] PDF filename function called. Generating filename: ${newFilename}`);
    cb(null, newFilename);
  }
});

const pdfFileFilter = (req: express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  // MIME 타입 검증
  if (file.mimetype === 'application/pdf') {
    // 파일 확장자 검증
    const extension = path.extname(file.originalname).toLowerCase();
    if (extension === '.pdf') {
      console.log(`[BooksRoutes-PDFFilter] PDF file accepted: ${file.originalname}`);
      cb(null, true);
    } else {
      console.log(`[BooksRoutes-PDFFilter] File rejected - invalid extension: ${extension}`);
      cb(new Error('PDF 파일만 업로드 가능합니다. (.pdf 확장자 필요)'));
    }
  } else {
    console.log(`[BooksRoutes-PDFFilter] File rejected - invalid MIME type: ${file.mimetype}`);
    cb(new Error('PDF 파일만 업로드 가능합니다. (application/pdf MIME 타입 필요)'));
  }
};

const pdfUpload = multer({
  storage: pdfStorage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit for PDF files
  },
  fileFilter: pdfFileFilter
});

console.log(`[BooksRoutes] Multer instances configured.`);

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
  body('purchaseLink')
    .trim()
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('유효한 URL을 입력해주세요. (예: https://...)'),
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
  body('purchaseLink')
    .trim()
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('유효한 URL을 입력해주세요. (예: https://...)'),
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

// PDF upload endpoint
router.post(
  '/:bookId/upload-pdf',
  pdfUpload.single('pdfFile'),
  uploadPdf
);

export default router; 
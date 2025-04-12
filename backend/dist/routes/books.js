"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookController_1 = require("../controllers/bookController");
const auth_1 = require("../middlewares/auth");
const express_validator_1 = require("express-validator");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const router = express_1.default.Router();
// All book routes require authentication
router.use(auth_1.authenticate);
// Validation for adding a new book
const bookAddValidation = [
    (0, express_validator_1.body)('title')
        .notEmpty()
        .withMessage('책 제목을 입력해주세요')
        .trim(),
    (0, express_validator_1.body)('author')
        .notEmpty()
        .withMessage('저자를 입력해주세요')
        .trim(),
    (0, express_validator_1.body)('totalPages')
        .isInt({ min: 1 })
        .withMessage('총 페이지 수는 1 이상이어야 합니다'),
    (0, express_validator_1.body)('isbn')
        .optional()
        .trim(),
    (0, express_validator_1.body)('category')
        .optional()
        .trim(),
];
// Validation for updating book progress
const bookProgressValidation = [
    (0, express_validator_1.body)('currentPage')
        .optional()
        .isInt({ min: 0 })
        .withMessage('현재 페이지는 0 이상이어야 합니다'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['not_started', 'in_progress', 'completed'])
        .withMessage('유효하지 않은 상태입니다'),
];
// Get all books for the current user
router.get('/', bookController_1.getUserBooks);
// Get a specific book by ID
router.get('/:bookId', bookController_1.getBookById);
// Add a new book
router.post('/', bookAddValidation, validateRequest_1.default, bookController_1.addBook);
// Update book progress
router.put('/:bookId/progress', bookProgressValidation, validateRequest_1.default, bookController_1.updateBookProgress);
// Delete a book
router.delete('/:bookId', bookController_1.removeBook);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const noteController_1 = require("../controllers/noteController");
const auth_1 = require("../middlewares/auth");
const express_validator_1 = require("express-validator");
const validateRequest_1 = __importDefault(require("../middlewares/validateRequest"));
const router = express_1.default.Router();
// All note routes require authentication
router.use(auth_1.authenticate);
// Validation for creating a new note
const createNoteValidation = [
    (0, express_validator_1.body)('bookId')
        .notEmpty()
        .withMessage('책 ID가 필요합니다'),
    (0, express_validator_1.body)('type')
        .isIn(['quote', 'thought', 'question'])
        .withMessage('유효한 노트 유형이 아닙니다'),
    (0, express_validator_1.body)('content')
        .notEmpty()
        .withMessage('내용을 입력해주세요')
        .isLength({ max: 1000 })
        .withMessage('내용은 최대 1000자까지 가능합니다'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('태그는 배열 형태여야 합니다'),
];
// Validation for updating a note
const updateNoteValidation = [
    (0, express_validator_1.body)('type')
        .optional()
        .isIn(['quote', 'thought', 'question'])
        .withMessage('유효한 노트 유형이 아닙니다'),
    (0, express_validator_1.body)('content')
        .optional()
        .notEmpty()
        .withMessage('내용을 입력해주세요')
        .isLength({ max: 1000 })
        .withMessage('내용은 최대 1000자까지 가능합니다'),
    (0, express_validator_1.body)('tags')
        .optional()
        .isArray()
        .withMessage('태그는 배열 형태여야 합니다'),
];
// Get all notes for the current user
router.get('/', noteController_1.getUserNotes);
// Get a specific note by ID
router.get('/:noteId', noteController_1.getNoteById);
// Get all notes for a specific book
router.get('/book/:bookId', noteController_1.getNotesByBook);
// Get all notes with a specific tag
router.get('/tag/:tag', noteController_1.getNotesByTag);
// Create a new note
router.post('/', createNoteValidation, validateRequest_1.default, noteController_1.createNote);
// Update a note
router.put('/:noteId', updateNoteValidation, validateRequest_1.default, noteController_1.updateNote);
// Delete a note
router.delete('/:noteId', noteController_1.deleteNote);
exports.default = router;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotesByTag = exports.getNotesByBook = exports.deleteNote = exports.updateNote = exports.createNote = exports.getNoteById = exports.getUserNotes = void 0;
const Note_1 = __importDefault(require("../models/Note"));
const Book_1 = __importDefault(require("../models/Book"));
// 사용자의 모든 노트 조회
const getUserNotes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const notes = yield Note_1.default.find({ userId })
            .sort({ createdAt: -1 })
            .select('-__v');
        res.status(200).json(notes);
    }
    catch (error) {
        console.error('노트 목록 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getUserNotes = getUserNotes;
// 특정 노트 상세 조회
const getNoteById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { noteId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const note = yield Note_1.default.findOne({ _id: noteId, userId })
            .select('-__v');
        if (!note) {
            return res.status(404).json({ message: '해당 노트를 찾을 수 없습니다.' });
        }
        res.status(200).json(note);
    }
    catch (error) {
        console.error('노트 상세 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getNoteById = getNoteById;
// 새 노트 생성
const createNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const { bookId, type, content, tags } = req.body;
        // 책이 존재하는지 확인
        const book = yield Book_1.default.findOne({ _id: bookId, userId });
        if (!book) {
            return res.status(404).json({ message: '해당 책을 찾을 수 없습니다.' });
        }
        const newNote = new Note_1.default({
            userId,
            bookId,
            type,
            content,
            tags: tags || [],
        });
        const savedNote = yield newNote.save();
        res.status(201).json(savedNote);
    }
    catch (error) {
        console.error('노트 생성 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.createNote = createNote;
// 노트 업데이트
const updateNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { noteId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { type, content, tags } = req.body;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const note = yield Note_1.default.findOne({ _id: noteId, userId });
        if (!note) {
            return res.status(404).json({ message: '해당 노트를 찾을 수 없습니다.' });
        }
        // 업데이트할 필드 설정
        const updateData = {};
        if (type !== undefined)
            updateData.type = type;
        if (content !== undefined)
            updateData.content = content;
        if (tags !== undefined)
            updateData.tags = tags;
        const updatedNote = yield Note_1.default.findByIdAndUpdate(noteId, { $set: updateData }, { new: true }).select('-__v');
        res.status(200).json(updatedNote);
    }
    catch (error) {
        console.error('노트 업데이트 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.updateNote = updateNote;
// 노트 삭제
const deleteNote = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { noteId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const note = yield Note_1.default.findOne({ _id: noteId, userId });
        if (!note) {
            return res.status(404).json({ message: '해당 노트를 찾을 수 없습니다.' });
        }
        yield Note_1.default.deleteOne({ _id: noteId });
        res.status(200).json({ message: '노트가 삭제되었습니다.' });
    }
    catch (error) {
        console.error('노트 삭제 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.deleteNote = deleteNote;
// 책별 노트 조회
const getNotesByBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { bookId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const notes = yield Note_1.default.find({ userId, bookId })
            .sort({ createdAt: -1 })
            .select('-__v');
        res.status(200).json(notes);
    }
    catch (error) {
        console.error('책별 노트 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getNotesByBook = getNotesByBook;
// 태그별 노트 조회
const getNotesByTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { tag } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: '인증이 필요합니다.' });
        }
        const notes = yield Note_1.default.find({ userId, tags: tag })
            .sort({ createdAt: -1 })
            .select('-__v');
        res.status(200).json(notes);
    }
    catch (error) {
        console.error('태그별 노트 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
});
exports.getNotesByTag = getNotesByTag;

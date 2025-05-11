import { Request, Response } from 'express';
import Note from '../models/Note';
import Book from '../models/Book';

// 사용자의 모든 노트 조회
export const getUserNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const notes = await Note.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json(notes);
  } catch (error) {
    console.error('노트 목록 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 노트 상세 조회
export const getNoteById = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const note = await Note.findOne({ _id: noteId, userId })
      .select('-__v');

    if (!note) {
      return res.status(404).json({ message: '해당 노트를 찾을 수 없습니다.' });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error('노트 상세 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 새 노트 생성
export const createNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const { bookId, type, content, tags } = req.body;

    // 책이 존재하는지 확인
    const book = await Book.findOne({ _id: bookId, userId });
    if (!book) {
      return res.status(404).json({ message: '해당 책을 찾을 수 없습니다.' });
    }

    const newNote = new Note({
      userId,
      bookId,
      type,
      content,
      tags: tags || [],
    });

    const savedNote = await newNote.save();
    
    res.status(201).json(savedNote);
  } catch (error) {
    console.error('노트 생성 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 노트 업데이트
export const updateNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const userId = req.user?.id;
    const { type, content, tags, importanceReason, momentContext, relatedKnowledge, mentalImage, relatedLinks } = req.body;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      return res.status(404).json({ message: '해당 노트를 찾을 수 없습니다.' });
    }

    // 업데이트할 필드 설정
    const updateData: any = {};
    
    if (type !== undefined) updateData.type = type;
    if (content !== undefined) updateData.content = content;
    if (tags !== undefined) updateData.tags = tags;
    if (importanceReason !== undefined) updateData.importanceReason = importanceReason;
    if (momentContext !== undefined) updateData.momentContext = momentContext;
    if (relatedKnowledge !== undefined) updateData.relatedKnowledge = relatedKnowledge;
    if (mentalImage !== undefined) updateData.mentalImage = mentalImage;
    if (relatedLinks !== undefined) updateData.relatedLinks = relatedLinks;

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { $set: updateData },
      { new: true }
    ).select('-__v');

    res.status(200).json(updatedNote);
  } catch (error) {
    console.error('노트 업데이트 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 노트 삭제
export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      return res.status(404).json({ message: '해당 노트를 찾을 수 없습니다.' });
    }

    await Note.deleteOne({ _id: noteId });

    res.status(200).json({ message: '노트가 삭제되었습니다.' });
  } catch (error) {
    console.error('노트 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 책별 노트 조회
export const getNotesByBook = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?.id;
    const originOnly = req.query.originOnly === 'true';

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // originOnly가 true일 때 TS 반추 메모만 필터링
    const filter: any = { userId, bookId };
    if (originOnly) filter.originSession = { $exists: true };
    const notes = await Note.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json(notes);
  } catch (error) {
    console.error('책별 노트 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 태그별 노트 조회
export const getNotesByTag = async (req: Request, res: Response) => {
  try {
    const { tag } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const notes = await Note.find({ userId, tags: tag })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json(notes);
  } catch (error) {
    console.error('태그별 노트 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}; 
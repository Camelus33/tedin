import { Request, Response } from 'express';
import Note from '../models/Note';
import Book from '../models/Book';
import mongoose from 'mongoose';

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

/**
 * @function getNotesByIds
 * @description 여러 개의 노트 ID를 받아 해당 노트들의 정보를 일괄적으로 조회합니다.
 * 단권화 노트 생성 시, 지식 카트에 담긴 여러 1줄 메모들의 전체 정보를 가져오는 데 사용됩니다.
 * 요청 본문(body)으로 노트 ID 배열(noteIds)을 받습니다.
 * 요청한 사용자의 소유인 노트만 반환하며, 요청된 ID 순서대로 노트를 정렬하여 반환하려고 시도합니다.
 * @param {Request} req - Express 요청 객체. body에 noteIds (string[] 타입의 노트 ID 배열) 포함.
 * @param {Response} res - Express 응답 객체.
 * @returns {Promise<void>} 성공 시 200 상태 코드와 조회된 노트 객체 배열을 JSON으로 반환합니다.
 *                        유효하지 않은 요청이나 오류 발생 시 적절한 상태 코드를 반환합니다.
 */
export const getNotesByIds = async (req: Request, res: Response) => {
  try {
    // 인증 미들웨어를 통해 설정된 사용자 ID를 가져옵니다.
    const userId = (req as any).user?.id;
    const { noteIds } = req.body; // 요청 본문에서 noteIds 배열을 가져옵니다.

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // noteIds 유효성 검사: 배열 형태인지, 비어있지 않은지 확인합니다.
    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({ message: 'noteIds must be a non-empty array.' });
    }

    // 각 noteId가 유효한 MongoDB ObjectId 형식인지 확인합니다. (선택적이지만 권장)
    for (const id of noteIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: `Invalid note ID format: ${id}` });
      }
    }

    // MongoDB에서 $in 연산자를 사용하여 여러 ID에 해당하는 노트를 조회합니다.
    // 동시에 userId 조건을 추가하여 요청한 사용자의 노트만 가져오도록 보안을 강화합니다.
    const notes = await Note.find({
      _id: { $in: noteIds.map(id => new mongoose.Types.ObjectId(id)) }, // 문자열 ID를 ObjectId로 변환
      userId: new mongoose.Types.ObjectId(userId), // userId도 ObjectId로 변환하여 비교
    }).select('-__v'); // __v 필드는 제외하고 반환

    // 조회된 노트들을 요청된 noteIds 순서대로 정렬합니다.
    // filter(Boolean)은 존재하지 않는 ID에 대한 find 결과를 제거합니다.
    const orderedNotes = noteIds.map(id => notes.find(note => note._id.toString() === id)).filter(Boolean);

    res.status(200).json(orderedNotes);
  } catch (error) {
    console.error('배치 노트 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}; 
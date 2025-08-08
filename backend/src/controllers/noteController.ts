import { Request, Response } from 'express';
import Note from '../models/Note';
import SummaryNote from '../models/SummaryNote';
import Book from '../models/Book';
import InlineThread from '../models/InlineThread';
import User from '../models/User';
import mongoose from 'mongoose';
import { updateFromNote, getBeliefNetwork } from '../services/BeliefNetworkService';
import { PrismaClient } from '@prisma/client';
import ConceptScoreService from '../services/ConceptScoreService';

const prisma = new PrismaClient();
const conceptScoreService = ConceptScoreService.getInstance();

// 사용자의 모든 노트 조회
export const getUserNotes = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // 제한 및 프로젝션으로 페이로드 최소화
    const limit = Math.min(Number((req.query as any).limit) || 30, 100);
    const notes = await Note.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('_id userId bookId type content tags createdAt clientCreatedAt')
      .lean();

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
      .populate({
        path: 'inlineThreads',
        select: '-__v',
        options: { sort: { createdAt: 1 } } // 생성일 오름차순 정렬
      })
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

    // 스냅샷 무효화: 이 노트를 포함하는 모든 SummaryNote의 스냅샷 제거 (v2, v1 관계 그래프)
    try {
      await SummaryNote.updateMany(
        { userId, orderedNoteIds: { $in: [noteId] } },
        { $set: { 
          aiDataSnapshotV2: null, 
          aiDataSnapshotUpdatedAt: null,
          aiRelGraphSnapshotV1: null,
          aiRelGraphSnapshotUpdatedAt: null
        } }
      );
    } catch {}

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

    // 스냅샷 무효화 (v2, v1 관계 그래프)
    try {
      await SummaryNote.updateMany(
        { userId, orderedNoteIds: { $in: [noteId] } },
        { $set: { 
          aiDataSnapshotV2: null, 
          aiDataSnapshotUpdatedAt: null,
          aiRelGraphSnapshotV1: null,
          aiRelGraphSnapshotUpdatedAt: null
        } }
      );
    } catch {}

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
      .populate({
        path: 'inlineThreads',
        select: '-__v',
        options: { sort: { createdAt: 1 } } // 생성일 오름차순 정렬
      })
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
    })
    .populate({
      path: 'inlineThreads',
      select: '-__v',
      options: { sort: { createdAt: 1 } } // 생성일 오름차순 정렬
    })
    .select('-__v'); // __v 필드는 제외하고 반환

    // 조회된 노트들을 요청된 noteIds 순서대로 정렬합니다.
    // filter(Boolean)은 존재하지 않는 ID에 대한 find 결과를 제거합니다.
    const orderedNotes = noteIds.map(id => notes.find(note => note._id.toString() === id)).filter(Boolean);

    res.status(200).json(orderedNotes);
  } catch (error) {
    console.error('배치 노트 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

/**
 * @function analyzePBAM
 * @description 특정 노트에 대해 PBAM(확률적 신념 및 논증 모델) 분석을 수행합니다.
 * ArgumentMiner와 RSTAnalyzer를 사용하여 사용자의 신념 네트워크를 구축합니다.
 */
export const analyzePBAM = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { noteId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    if (!noteId) {
      return res.status(400).json({ message: '노트 ID가 필요합니다.' });
    }

    // 노트 존재 여부 확인
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ message: '해당 노트를 찾을 수 없습니다.' });
    }

    // PBAM 분석 수행
    console.log(`[noteController] Starting PBAM analysis for note ${noteId}`);
    const analysisResult = await updateFromNote(userId, noteId, note.content);

    if (!analysisResult.success) {
      return res.status(500).json({ 
        message: 'PBAM 분석 중 오류가 발생했습니다.',
        error: 'Analysis failed'
      });
    }

    // 업데이트된 신념 네트워크 조회
    const beliefNetwork = await getBeliefNetwork(userId);

    res.status(200).json({
      message: 'PBAM 분석이 완료되었습니다.',
      analysis: {
        noteId,
        nodesCreated: analysisResult.nodesCreated,
        edgesCreated: analysisResult.edgesCreated,
        argumentUnits: analysisResult.argumentUnits,
        rhetoricalRelations: analysisResult.rhetoricalRelations
      },
      beliefNetwork: {
        totalNodes: beliefNetwork?.nodes.length || 0,
        totalEdges: beliefNetwork?.edges.length || 0,
        lastUpdated: beliefNetwork?.lastUpdated
      }
    });

  } catch (error) {
    console.error('[noteController] PBAM 분석 중 오류 발생:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// 인라인메모 쓰레드 추가
export const addInlineThread = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      console.warn('인라인메모 쓰레드 추가 실패: 사용자 인증 필요');
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    if (!content || !content.trim()) {
      console.warn(`인라인메모 쓰레드 추가 실패: 내용 누락 (noteId: ${noteId})`);
      return res.status(400).json({ message: '내용을 입력해주세요.' });
    }

    if (content.length > 1000) {
      console.warn(`인라인메모 쓰레드 추가 실패: 내용 길이 초과 (noteId: ${noteId}, length: ${content.length})`);
      return res.status(400).json({ message: '내용은 최대 1000자까지 가능합니다.' });
    }

    // 노트 존재 여부와 소유권 검증
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      console.warn(`인라인메모 쓰레드 추가 실패: 노트를 찾을 수 없거나 소유권 없음 (noteId: ${noteId}, userId: ${userId})`);
      return res.status(404).json({ message: '해당 노트를 찾을 수 없습니다.' });
    }

    // 사용자 정보 가져오기 (User 모델의 nickname 필드 활용)
    const user = req.user;
    const authorName = user?.nickname || '사용자';

    // 새 인라인메모 쓰레드 생성
    console.log(`[addInlineThread] 새 인라인메모 쓰레드 생성 시도: noteId=${noteId}, content=${content.substring(0, 50)}...`);
    const newThread = new InlineThread({
      content: content.trim(),
      authorId: userId,
      authorName,
      parentNoteId: noteId,
      depth: 0,
      isTemporary: false,
    });

    const savedThread = await newThread.save();
    console.log(`[addInlineThread] 인라인메모 쓰레드 저장 성공: threadId=${savedThread._id}`);

    // Note에 인라인메모 쓰레드 참조 추가 (원자적 업데이트)
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { $addToSet: { inlineThreads: savedThread._id } },
      { new: true }
    );

    if (updatedNote) {
      console.log(`[addInlineThread] 노트에 인라인메모 쓰레드 참조 추가 성공: noteId=${noteId}, threadId=${savedThread._id}`);
      // console.log(`[addInlineThread] 업데이트된 노트: ${JSON.stringify(updatedNote.inlineThreads)}`); // 필요시 상세 로그
    } else {
      console.warn(`[addInlineThread] 노트 업데이트 실패: Note.findByIdAndUpdate가 null을 반환함 (noteId: ${noteId})`);
      return res.status(500).json({ message: '노트에 인라인메모 쓰레드 참조 추가 실패했습니다.' });
    }

    // v2 스냅샷 무효화: 이 노트를 포함하는 SummaryNote들
    try {
      await SummaryNote.updateMany(
        { userId, orderedNoteIds: { $in: [noteId] } },
        { $set: { aiDataSnapshotV2: null, aiDataSnapshotUpdatedAt: null } }
      );
    } catch {}

    res.status(201).json(savedThread);
  } catch (error) {
    console.error('인라인메모 쓰레드 생성 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 인라인메모 쓰레드 수정
export const updateInlineThread = async (req: Request, res: Response) => {
  try {
    const { noteId, threadId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: '내용을 입력해주세요.' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: '내용은 최대 1000자까지 가능합니다.' });
    }

    // 노트 소유권 검증
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ message: '해당 노트를 찾을 수 없습니다.' });
    }

    // 인라인메모 쓰레드 존재 여부와 소유권 검증
    const thread = await InlineThread.findOne({ 
      _id: threadId, 
      parentNoteId: noteId, 
      authorId: userId 
    });

    if (!thread) {
      return res.status(404).json({ message: '해당 인라인메모 쓰레드를 찾을 수 없습니다.' });
    }

    // 인라인메모 쓰레드 업데이트
    const updatedThread = await InlineThread.findByIdAndUpdate(
      threadId,
      { 
        content: content.trim(),
        // updatedAt 필드가 있다면 추가 가능
      },
      { new: true }
    );

    // v2 스냅샷 무효화
    try {
      await SummaryNote.updateMany(
        { userId, orderedNoteIds: { $in: [noteId] } },
        { $set: { aiDataSnapshotV2: null, aiDataSnapshotUpdatedAt: null } }
      );
    } catch {}

    res.status(200).json(updatedThread);
  } catch (error) {
    console.error('인라인메모 쓰레드 수정 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 인라인메모 쓰레드 삭제
export const deleteInlineThread = async (req: Request, res: Response) => {
  try {
    const { noteId, threadId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // 노트 소유권 검증
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ message: '해당 노트를 찾을 수 없습니다.' });
    }

    // 인라인메모 쓰레드 존재 여부와 소유권 검증
    const thread = await InlineThread.findOne({ 
      _id: threadId, 
      parentNoteId: noteId, 
      authorId: userId 
    });

    if (!thread) {
      return res.status(404).json({ message: '해당 인라인메모 쓰레드를 찾을 수 없습니다.' });
    }

    // 트랜잭션을 사용한 원자적 삭제
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Note에서 인라인메모 쓰레드 참조 제거
      await Note.findByIdAndUpdate(
        noteId,
        { $pull: { inlineThreads: threadId } },
        { session }
      );

      // 인라인메모 쓰레드 삭제
      await InlineThread.findByIdAndDelete(threadId, { session });

      await session.commitTransaction();
      
      // v2 스냅샷 무효화
      try {
        await SummaryNote.updateMany(
          { userId, orderedNoteIds: { $in: [noteId] } },
          { $set: { aiDataSnapshotV2: null, aiDataSnapshotUpdatedAt: null } }
        );
      } catch {}

      res.status(200).json({ message: '인라인메모 쓰레드가 삭제되었습니다.' });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('인라인메모 쓰레드 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// PDF 메모 생성 (PDF 전용)
export const createPdfNote = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const { 
      bookId, 
      type, 
      content, 
      tags, 
      pageNumber, 
      highlightedText, 
      selfRating, 
      highlightData 
    } = req.body;

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
      pageNumber,
      highlightedText,
      selfRating,
      highlightData,
    });

    const savedNote = await newNote.save();
    
    res.status(201).json(savedNote);
  } catch (error) {
    console.error('PDF 메모 생성 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Get concept understanding score for a note
export const getNoteConceptScore = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // ObjectId 형식 검증
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: '유효하지 않은 노트 ID입니다.' });
    }

    // 노트 존재 여부 확인
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ message: '해당 노트를 찾을 수 없습니다.' });
    }

    // ConceptScoreService를 사용하여 점수 계산
    const calculationResult = await conceptScoreService.calculateConceptScore(noteId);

    res.status(200).json({
      noteId,
      conceptUnderstandingScore: calculationResult.score,
      lastUpdated: calculationResult.calculatedAt,
      calculationVersion: calculationResult.calculationVersion,
      performanceMetrics: calculationResult.performanceMetrics
    });

  } catch (error) {
    console.error('개념이해도 점수 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Update concept understanding score for a note
export const updateNoteConceptScore = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const userId = req.user?.id;
    const { action, data } = req.body;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // ObjectId 형식 검증
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: '유효하지 않은 노트 ID입니다.' });
    }

    // 노트 존재 여부 확인
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ message: '해당 노트를 찾을 수 없습니다.' });
    }

    // 액션 유효성 검증
    const validActions = ['add_thought', 'evolve_memo', 'add_connection', 'create_flashcard', 'add_tag', 'update_rating'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ message: '유효하지 않은 액션입니다.' });
    }

    // 노트 업데이트 (액션에 따라)
    await updateNoteBasedOnAction(noteId, action, data);

    // 캐시 무효화
    conceptScoreService.invalidateCache(noteId);

    // 새로운 점수 계산
    const calculationResult = await conceptScoreService.calculateConceptScore(noteId);

    // 새로운 개념이해도 점수 저장
    const newConceptScore = await prisma.conceptScore.create({
      data: {
        noteId: noteId,
        totalScore: calculationResult.score.totalScore,
        breakdown: calculationResult.score.breakdown,
        calculatedAt: new Date()
      }
    });

    // 노트의 conceptScore 필드 업데이트
    await Note.findByIdAndUpdate(noteId, {
      conceptScore: calculationResult.score.totalScore
    });

    res.status(200).json({
      message: '개념이해도 점수가 성공적으로 업데이트되었습니다.',
      noteId,
      conceptScore: calculationResult.score,
      lastUpdated: newConceptScore.calculatedAt,
      calculationVersion: calculationResult.calculationVersion,
      performanceMetrics: calculationResult.performanceMetrics
    });

  } catch (error) {
    console.error('개념이해도 점수 업데이트 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 액션에 따른 노트 업데이트
async function updateNoteBasedOnAction(noteId: string, action: string, data: any) {
  const updateData: any = {};

  switch (action) {
    case 'add_thought':
      if (data.importanceReason) updateData.importanceReason = data.importanceReason;
      if (data.momentContext) updateData.momentContext = data.momentContext;
      if (data.relatedKnowledge) updateData.relatedKnowledge = data.relatedKnowledge;
      if (data.mentalImage) updateData.mentalImage = data.mentalImage;
      break;

    case 'evolve_memo':
      if (data.evolutionStage) {
        updateData[data.evolutionStage] = data.content;
      }
      break;

    case 'add_connection':
      if (data.relatedLinks) {
        updateData.$push = { relatedLinks: data.relatedLinks };
      }
      break;

    case 'create_flashcard':
      if (data.flashcards) {
        updateData.$push = { flashcards: data.flashcards };
      }
      break;

    case 'add_tag':
      if (data.tags) {
        updateData.$addToSet = { tags: { $each: data.tags } };
      }
      break;

    case 'update_rating':
      if (data.rating) {
        updateData.selfRating = data.rating;
        // updatedAt은 Mongoose에서 자동으로 업데이트됨
      }
      break;
  }

  if (Object.keys(updateData).length > 0) {
    await Note.findByIdAndUpdate(noteId, updateData);
  }
} 
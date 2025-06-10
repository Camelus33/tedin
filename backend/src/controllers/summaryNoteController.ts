import { Request, Response } from 'express';
import SummaryNote, { ISummaryNote } from '../models/SummaryNote';
import Note from '../models/Note'; // Assuming Note model is in the same directory
import mongoose from 'mongoose';
import PublicShare from '../models/PublicShare';
import { nanoid } from 'nanoid';

/**
 * @function createSummaryNote
 * @description 새로운 단권화 노트를 생성합니다.
 * 요청 본문으로부터 제목, 설명, 노트 ID 목록, 책 ID 목록, 태그, 유저 마크다운 컨텐츠를 받아 단권화 노트를 생성합니다.
 * 사용자 인증이 필요하며, 요청 객체(req)의 user.id로부터 사용자 ID를 가져옵니다.
 * @param {Request} req - Express 요청 객체. 본문에 title, description, orderedNoteIds, bookIds, tags, userMarkdownContent 포함.
 * @param {Response} res - Express 응답 객체.
 * @returns {Promise<void>} 성공 시 201 상태 코드와 생성된 단권화 노트 객체를 JSON으로 반환합니다.
 *                        실패 시 적절한 상태 코드와 오류 메시지를 반환합니다.
 */
export const createSummaryNote = async (req: Request, res: Response) => {
  try {
    const { title, description, orderedNoteIds, bookIds, tags, userMarkdownContent } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: '로그인이 필요해요. 함께 시작하면 어떨까요?' });
    }

    if (!orderedNoteIds || !Array.isArray(orderedNoteIds) || orderedNoteIds.length === 0) {
      return res.status(400).json({ message: '메모가 아직 선택되지 않았어요. 메모를 선택해 볼까요?' });
    }

    const uniqueBookIds = bookIds && Array.isArray(bookIds) ? [...new Set(bookIds.map(String))] : [];

    const newSummaryNote = new SummaryNote({
      userId,
      title: title || '나의 단권화 노트',
      description,
      orderedNoteIds,
      bookIds: uniqueBookIds,
      tags: tags || [],
      userMarkdownContent: userMarkdownContent || '',
    });

    await newSummaryNote.save();
    res.status(201).json(newSummaryNote);
  } catch (error: any) {
    console.error('[CreateSummaryNote Error]', error);
    res.status(500).json({ message: '시스템이 잠시 쉬고 있어요. 조금만 기다려 주세요.', error: error.message });
  }
};

/**
 * @function getSummaryNoteById
 * @description ID를 사용하여 특정 단권화 노트를 조회합니다.
 * 요청 파라미터로부터 summaryNoteId를 받고, 해당 ID의 단권화 노트를 조회합니다.
 * 해당 단권화 노트가 요청한 사용자의 소유인지 확인하는 로직이 포함됩니다.
 * @param {Request} req - Express 요청 객체. params에 summaryNoteId 포함.
 * @param {Response} res - Express 응답 객체.
 * @returns {Promise<void>} 성공 시 200 상태 코드와 조회된 단권화 노트 객체를 JSON으로 반환합니다.
 *                        노트를 찾지 못하거나 권한이 없을 경우 적절한 상태 코드를 반환합니다.
 */
export const getSummaryNoteById = async (req: Request, res: Response) => {
  try {
    const { summaryNoteId } = req.params;
    const userId = (req as any).user?.id;

    if (!mongoose.Types.ObjectId.isValid(summaryNoteId)) {
        return res.status(400).json({ message: '노트 정보가 조금 달라요. 다시 시도해 볼래요?' });
    }

    const summaryNote = await SummaryNote.findById(summaryNoteId);

    if (!summaryNote) {
      return res.status(404).json({ message: '찾으시는 노트가 숨어있네요. 다른 곳에서 만나볼까요?' });
    }

    // Optional: Check if the note belongs to the user
    if (summaryNote.userId.toString() !== userId) {
      return res.status(403).json({ message: '이 노트에 접근할 수 없어요. 내 노트로 돌아갈까요?' });
    }

    res.status(200).json(summaryNote);
  } catch (error: any) {
    console.error('[GetSummaryNoteById Error]', error);
    res.status(500).json({ message: '데이터를 가져오는 중 문제가 있어요. 다시 시도해 주실래요?', error: error.message });
  }
};

/**
 * @function updateSummaryNote
 * @description ID를 사용하여 특정 단권화 노트를 업데이트합니다.
 * 요청 파라미터로부터 summaryNoteId를 받고, 요청 본문으로부터 업데이트할 필드(title, description, orderedNoteIds, tags, userMarkdownContent)를 받습니다.
 * 해당 단권화 노트가 요청한 사용자의 소유인지 확인하는 로직이 포함됩니다.
 * bookIds는 일반적으로 생성 시점에 결정되므로 여기서는 업데이트 대상에서 제외합니다.
 * @param {Request} req - Express 요청 객체. params에 summaryNoteId, body에 업데이트할 필드 포함.
 * @param {Response} res - Express 응답 객체.
 * @returns {Promise<void>} 성공 시 200 상태 코드와 업데이트된 단권화 노트 객체를 JSON으로 반환합니다.
 *                        노트를 찾지 못하거나 권한이 없을 경우 적절한 상태 코드를 반환합니다.
 */
export const updateSummaryNote = async (req: Request, res: Response) => {
  try {
    const { summaryNoteId } = req.params;
    const { title, description, orderedNoteIds, tags, userMarkdownContent } = req.body;
    const userId = (req as any).user?.id;

    if (!mongoose.Types.ObjectId.isValid(summaryNoteId)) {
        return res.status(400).json({ message: 'Invalid SummaryNote ID format' });
    }

    const summaryNote = await SummaryNote.findById(summaryNoteId);

    if (!summaryNote) {
      return res.status(404).json({ message: 'Summary note not found' });
    }

    if (summaryNote.userId.toString() !== userId) {
      return res.status(403).json({ message: 'User not authorized to update this summary note' });
    }

    // Fields to update
    if (title !== undefined) summaryNote.title = title;
    if (description !== undefined) summaryNote.description = description;
    if (orderedNoteIds !== undefined) summaryNote.orderedNoteIds = orderedNoteIds;
    if (tags !== undefined) summaryNote.tags = tags;
    if (userMarkdownContent !== undefined) summaryNote.userMarkdownContent = userMarkdownContent;
    // bookIds are typically not updated here, they are set at creation based on notes.

    await summaryNote.save();
    res.status(200).json(summaryNote);
  } catch (error: any) {
    console.error('[UpdateSummaryNote Error]', error);
    res.status(500).json({ message: '노트 수정이 지금은 어려워요. 잠시 후에 다시 시도해 볼까요?', error: error.message });
  }
};

/**
 * @function getSummaryNotesByUserId
 * @description 현재 인증된 사용자의 모든 단권화 노트를 조회합니다.
 * 생성일자 기준 내림차순으로 정렬하여 반환합니다.
 * @param {Request} req - Express 요청 객체. 인증 미들웨어를 통해 req.user.id에 사용자 ID가 설정되어 있어야 함.
 * @param {Response} res - Express 응답 객체.
 * @returns {Promise<void>} 성공 시 200 상태 코드와 단권화 노트 목록(ISummaryNote[])을 JSON으로 반환합니다.
 *                        사용자 인증 실패 또는 오류 발생 시 적절한 상태 코드와 메시지를 반환합니다.
 */
export const getSummaryNotesByUserId = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated for fetching summary notes' });
    }

    const summaryNotes: ISummaryNote[] = await SummaryNote.find({ userId })
      .sort({ createdAt: -1 }) // 최신순 정렬
      .exec();

    res.status(200).json(summaryNotes);
  } catch (error: any) {
    console.error('[GetSummaryNotesByUserId Error]', error);
    res.status(500).json({ message: 'Error fetching summary notes for user', error: error.message });
  }
};

/**
 * @function deleteSummaryNote
 * @description ID를 사용하여 특정 단권화 노트를 삭제합니다.
 * 해당 단권화 노트가 요청한 사용자의 소유인지 확인합니다.
 * @param {Request} req - Express 요청 객체. params에 summaryNoteId 포함.
 * @param {Response} res - Express 응답 객체.
 * @returns {Promise<void>} 성공 시 200 상태 코드와 성공 메시지를 JSON으로 반환합니다.
 *                        노트를 찾지 못하거나 권한이 없을 경우 적절한 상태 코드를 반환합니다.
 */
export const deleteSummaryNote = async (req: Request, res: Response) => {
  try {
    const { summaryNoteId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: '로그인이 필요해요. 함께 시작하면 어떨까요?' });
    }

    if (!mongoose.Types.ObjectId.isValid(summaryNoteId)) {
      return res.status(400).json({ message: '노트 정보가 조금 달라요. 다시 시도해 볼래요?' });
    }

    const summaryNote = await SummaryNote.findById(summaryNoteId);

    if (!summaryNote) {
      return res.status(404).json({ message: '찾으시는 노트가 숨어있네요. 다른 곳에서 만나볼까요?' });
    }

    if (summaryNote.userId.toString() !== userId) {
      return res.status(403).json({ message: '이 노트에 접근할 수 없어요. 내 노트로 돌아갈까요?' });
    }

    await SummaryNote.findByIdAndDelete(summaryNoteId);
    res.status(200).json({ message: '단권화 노트가 성공적으로 삭제되었습니다.' });
  } catch (error: any) {
    console.error('[DeleteSummaryNote Error]', error);
    res.status(500).json({ message: '노트 삭제가 지금은 어려워요. 잠시 후에 다시 시도해 볼까요?', error: error.message });
  }
};

/**
 * @description Creates a new public, shareable link for a summary note.
 */
export const createPublicShareLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id; // Assuming user ID is attached by auth middleware

    // 1. Verify ownership
    const summaryNote = await SummaryNote.findOne({ _id: id, userId });
    if (!summaryNote) {
      res.status(404).json({ message: '해당 노트를 찾을 수 없거나 소유자가 아닙니다.' });
      return;
    }

    // 2. Generate a unique ID for the share link
    const shareId = nanoid(12); // Generate a 12-character unique ID

    // 3. Create and save the new PublicShare document
    const newShare = new PublicShare({
      _id: shareId,
      summaryNoteId: summaryNote._id,
      userId: userId,
    });
    await newShare.save();

    // 4. Return the new shareId
    res.status(201).json({ shareId });

  } catch (error) {
    console.error('Error creating public share link:', error);
    res.status(500).json({ message: '링크를 생성하는 중 서버 오류가 발생했습니다.' });
  }
};

// (Placeholder for batch get notes - this might belong in noteController.ts)
// GET /api/notes/batch - This is part of the plan but will be handled separately
// to ensure it's in the correct controller (likely noteController.ts). 
import { Request, Response } from 'express';
import SummaryNote, { ISummaryNote, RelationshipType } from '../models/SummaryNote';
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

    // ID 유효성 검사: 임시 ID나 비정상적인 ID가 포함되어 있는지 확인합니다.
    for (const id of orderedNoteIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.warn(`[Data Integrity Warning] User ${userId} attempted to create a SummaryNote with an invalid ObjectId: ${id}`);
        return res.status(400).json({ 
          message: '아직 처리 중인 메모가 포함되어 있어요. 1~2초 후에 다시 시도해 주세요.' 
        });
      }
    }

    // 존재 & 소유권 검사: 모든 Note가 실제로 DB에 존재하고, 작성자(userId)가 동일한지 확인
    const existingNotesCount = await Note.countDocuments({
      _id: { $in: orderedNoteIds.map((id: string) => new mongoose.Types.ObjectId(id)) },
      userId: new mongoose.Types.ObjectId(userId)
    });

    if (existingNotesCount !== orderedNoteIds.length) {
      return res.status(400).json({
        message: '저장 완료되지 않은(또는 다른 소유자의) 메모가 포함돼 있어요. 잠시 후 다시 시도해 주세요.'
      });
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
 * @function validateDiagramData
 * @description 다이어그램 데이터의 유효성을 검증합니다.
 * @param {any} diagramData - 검증할 다이어그램 데이터
 * @param {Types.ObjectId[]} orderedNoteIds - 유효한 메모카드 ID 목록
 * @returns {{isValid: boolean, error?: string}} 검증 결과
 */
const validateDiagramData = (diagramData: any, orderedNoteIds: mongoose.Types.ObjectId[]) => {
  if (!diagramData || typeof diagramData !== 'object') {
    return { isValid: false, error: '다이어그램 데이터가 올바르지 않습니다.' };
  }

  // 노드 데이터 검증
  if (!Array.isArray(diagramData.nodes)) {
    return { isValid: false, error: '노드 데이터가 배열 형태가 아닙니다.' };
  }

  // 노드 ID 중복 검사
  const nodeIds = diagramData.nodes.map((n: any) => n.noteId?.toString());
  if (new Set(nodeIds).size !== nodeIds.length) {
    return { isValid: false, error: '중복된 노드가 있습니다.' };
  }

  // 노드가 실제 메모카드에 존재하는지 검사
  const validNoteIds = new Set(orderedNoteIds.map(id => id.toString()));
  for (const node of diagramData.nodes) {
    if (!node.noteId || !validNoteIds.has(node.noteId.toString())) {
      return { isValid: false, error: '존재하지 않는 메모카드를 참조하는 노드가 있습니다.' };
    }
    if (!node.content || typeof node.content !== 'string') {
      return { isValid: false, error: '노드 내용이 올바르지 않습니다.' };
    }
    if (!node.order || typeof node.order !== 'number') {
      return { isValid: false, error: '노드 순서가 올바르지 않습니다.' };
    }
    if (!node.color || typeof node.color !== 'string') {
      return { isValid: false, error: '노드 색상이 올바르지 않습니다.' };
    }
    if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      return { isValid: false, error: '노드 위치가 올바르지 않습니다.' };
    }
  }

  // 연결 데이터 검증
  if (!Array.isArray(diagramData.connections)) {
    return { isValid: false, error: '연결 데이터가 배열 형태가 아닙니다.' };
  }

  // 연결의 source/target이 실제 노드에 존재하는지 검사
  const validNodeIds = new Set(nodeIds);
  for (const conn of diagramData.connections) {
    if (!conn.id || typeof conn.id !== 'string') {
      return { isValid: false, error: '연결 ID가 올바르지 않습니다.' };
    }
    if (!conn.sourceNoteId || !validNodeIds.has(conn.sourceNoteId.toString())) {
      return { isValid: false, error: '존재하지 않는 노드를 참조하는 연결이 있습니다.' };
    }
    if (!conn.targetNoteId || !validNodeIds.has(conn.targetNoteId.toString())) {
      return { isValid: false, error: '존재하지 않는 노드를 참조하는 연결이 있습니다.' };
    }
    if (!conn.relationshipType || !Object.values(RelationshipType).includes(conn.relationshipType)) {
      return { isValid: false, error: '올바르지 않은 관계 타입입니다.' };
    }
  }

  return { isValid: true };
};

/**
 * @function updateSummaryNote
 * @description ID를 사용하여 특정 단권화 노트를 업데이트합니다.
 * 해당 단권화 노트가 요청한 사용자의 소유인지 확인합니다.
 * @param {Request} req - Express 요청 객체. params에 summaryNoteId 포함, body에 업데이트할 필드들 포함.
 * @param {Response} res - Express 응답 객체.
 * @returns {Promise<void>} 성공 시 200 상태 코드와 업데이트된 단권화 노트 객체를 JSON으로 반환합니다.
 *                        노트를 찾지 못하거나 권한이 없을 경우 적절한 상태 코드를 반환합니다.
 */
export const updateSummaryNote = async (req: Request, res: Response) => {
  try {
    const { summaryNoteId } = req.params;
    const { title, description, orderedNoteIds, tags, userMarkdownContent, diagram } = req.body;
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

    // 기본 필드 업데이트
    if (title !== undefined) summaryNote.title = title;
    if (description !== undefined) summaryNote.description = description;
    if (orderedNoteIds !== undefined) summaryNote.orderedNoteIds = orderedNoteIds;
    if (tags !== undefined) summaryNote.tags = tags;
    if (userMarkdownContent !== undefined) summaryNote.userMarkdownContent = userMarkdownContent;
    // bookIds are typically not updated here, they are set at creation based on notes.

    // 다이어그램 데이터 업데이트
    if (diagram !== undefined) {
      // 다이어그램 데이터 검증
      if (diagram.data) {
        const validationResult = validateDiagramData(diagram.data, summaryNote.orderedNoteIds);
        if (!validationResult.isValid) {
          return res.status(400).json({ 
            message: validationResult.error 
          });
        }
      }

      // 다이어그램 업데이트
      summaryNote.diagram = {
        ...summaryNote.diagram,
        ...diagram,
        lastModified: new Date()
      };

      console.log(`[Diagram Update] SummaryNote ${summaryNoteId} diagram updated by user ${userId}`);
    }

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
    const { summaryNoteId } = req.params;
    const userId = (req as any).user.id; // Assuming user ID is attached by auth middleware

    // 1. Verify ownership
    const summaryNote = await SummaryNote.findOne({ _id: summaryNoteId, userId });
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

/**
 * @function getSummaryNoteData
 * @description ID를 사용하여 특정 단권화 노트의 순수 JSON 데이터를 조회합니다. AI-Link 생성을 위해 사용됩니다.
 * 해당 단권화 노트가 요청한 사용자의 소유인지 확인하는 로직이 포함됩니다.
 * @param {Request} req - Express 요청 객체. params에 summaryNoteId 포함.
 * @param {Response} res - Express 응답 객체.
 * @returns {Promise<void>} 성공 시 200 상태 코드와 조회된 단권화 노트의 순수 데이터 객체를 JSON으로 반환합니다.
 */
export const getSummaryNoteData = async (req: Request, res: Response) => {
  try {
    const { summaryNoteId } = req.params;
    const userId = (req as any).user?.id;

    if (!mongoose.Types.ObjectId.isValid(summaryNoteId)) {
        return res.status(400).json({ message: '유효하지 않은 노트 ID 형식입니다.' });
    }

    // .lean()을 사용하여 순수 JavaScript 객체로 바로 조회합니다.
    const summaryNoteData = await SummaryNote.findById(summaryNoteId).lean();

    if (!summaryNoteData) {
        return res.status(404).json({ message: '찾으시는 노트가 숨어있네요. 다른 곳에서 만나볼까요?' });
    }

    // 권한 검증: 요청한 사용자가 노트의 소유주인지 확인합니다.
    if (summaryNoteData.userId.toString() !== userId) {
      return res.status(403).json({ message: '이 노트에 접근할 수 없어요. 내 노트로 돌아갈까요?' });
    }
    
    res.status(200).json(summaryNoteData);
    
  } catch (error: any) {
    console.error('[GetSummaryNoteData Error]', error);
    res.status(500).json({ message: '데이터를 가져오는 중 문제가 있어요. 다시 시도해 주실래요?', error: error.message });
  }
};

// (Placeholder for batch get notes - this might belong in noteController.ts)
// GET /api/notes/batch - This is part of the plan but will be handled separately
// to ensure it's in the correct controller (likely noteController.ts). 
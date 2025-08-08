import { Request, Response } from 'express';
import SummaryNote, { ISummaryNote, RelationshipType } from '../models/SummaryNote';
import Flashcard from '../models/Flashcard';
import InlineThread from '../models/InlineThread';
import Note from '../models/Note'; // Assuming Note model is in the same directory
import mongoose from 'mongoose';
import PublicShare from '../models/PublicShare';
import { nanoid } from 'nanoid';
import { buildJsonLd } from '../utils/jsonLdBuilder';

// TTL 설정(환경변수 기반, 기본 5분)
const SNAPSHOT_TTL_MS = Number(process.env.AI_DATA_SNAPSHOT_TTL_MS || 5 * 60 * 1000);
const REL_SNAPSHOT_TTL_MS = Number(process.env.AI_REL_GRAPH_SNAPSHOT_TTL_MS || 5 * 60 * 1000);

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
    
    // 크기 정보 검증 (선택적 필드)
    if (node.size !== undefined) {
      if (typeof node.size !== 'object' || node.size === null) {
        return { isValid: false, error: '노드 크기 정보가 올바르지 않습니다.' };
      }
      if (typeof node.size.width !== 'number' || typeof node.size.height !== 'number') {
        return { isValid: false, error: '노드 크기의 width와 height는 숫자여야 합니다.' };
      }
      if (node.size.width <= 0 || node.size.height <= 0) {
        return { isValid: false, error: '노드 크기는 0보다 커야 합니다.' };
      }
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
    let invalidateSnapshots = false;
    if (title !== undefined) summaryNote.title = title;
    if (description !== undefined) summaryNote.description = description;
    if (orderedNoteIds !== undefined) {
      summaryNote.orderedNoteIds = orderedNoteIds;
      invalidateSnapshots = true; // 순서 변경은 분석/그래프에 영향 → 스냅샷 무효화
    }
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
      invalidateSnapshots = true; // 다이어그램 변경은 그래프/분석에 직접 영향 → 스냅샷 무효화
    }

    // 필요한 경우 스냅샷 무효화
    if (invalidateSnapshots) {
      summaryNote.aiDataSnapshotV2 = null;
      summaryNote.aiDataSnapshotUpdatedAt = null;
      summaryNote.aiRelGraphSnapshotV1 = null;
      summaryNote.aiRelGraphSnapshotUpdatedAt = null;
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
 * @description ID를 사용하여 특정 단권화 노트의 AI-Link용 구조화된 데이터를 조회합니다.
 * jsonLdBuilder를 사용하여 LLM이 이해할 수 있는 형태로 데이터를 구조화합니다.
 * @param {Request} req - Express 요청 객체. params에 summaryNoteId 포함.
 * @param {Response} res - Express 응답 객체.
 * @returns {Promise<void>} 성공 시 200 상태 코드와 구조화된 AI 데이터를 JSON으로 반환합니다.
 */
export const getSummaryNoteData = async (req: Request, res: Response) => {
  try {
    const { summaryNoteId } = req.params;
    const userId = (req as any).user?.id;
    // 버전 플래그: v=1(기존), v=2(가산 필드 포함)
    const versionRaw = (req.query.v as string) || (req.header('X-AI-DATA-V') as string) || '1';
    const versionParam = versionRaw === '2' ? '2' : '1';

    if (!mongoose.Types.ObjectId.isValid(summaryNoteId)) {
        return res.status(400).json({ message: '유효하지 않은 노트 ID 형식입니다.' });
    }

    // SummaryNote 데이터 조회
    const summaryNoteData = await SummaryNote.findById(summaryNoteId).lean();

    if (!summaryNoteData) {
        return res.status(404).json({ message: '찾으시는 노트가 숨어있네요. 다른 곳에서 만나볼까요?' });
    }

    // 권한 검증: 요청한 사용자가 노트의 소유주인지 확인합니다.
    if (summaryNoteData.userId.toString() !== userId) {
      return res.status(403).json({ message: '이 노트에 접근할 수 없어요. 내 노트로 돌아갈까요?' });
    }

    // 관련 Note 데이터 조회
    const notes = await Note.find({
      _id: { $in: summaryNoteData.orderedNoteIds },
      userId: new mongoose.Types.ObjectId(userId)
    }).lean();

    // Book 데이터 조회 (필요한 경우)
    const bookIds = [...new Set(notes.map(note => note.bookId).filter(Boolean))];
    const books = bookIds.length > 0 ? await mongoose.model('Book').find({
      _id: { $in: bookIds }
    }).lean() : [];

    // 사용자 정보 조회
    const user = await mongoose.model('User').findById(userId).lean();

    // jsonLdBuilder에 전달할 데이터 구조 생성
    const summaryNoteForBuilder = {
      _id: summaryNoteData._id.toString(),
      title: summaryNoteData.title,
      description: summaryNoteData.description,
      userMarkdownContent: summaryNoteData.userMarkdownContent,
      createdAt: summaryNoteData.createdAt,
      user: {
        _id: (user as any)?._id?.toString() || userId,
        name: (user as any)?.name || '',
        email: (user as any)?.email || ''
      },
      notes: notes.map(note => ({
        ...note,
        _id: note._id.toString(),
        bookId: note.bookId?.toString(),
        userId: note.userId?.toString(),
        book: books.find(book => book._id.toString() === note.bookId?.toString()) || undefined
      })),
      readingPurpose: (summaryNoteData as any).readingPurpose,
      totalReadingTimeISO: (summaryNoteData as any).totalReadingTimeISO,
      allTags: summaryNoteData.tags,
      diagram: summaryNoteData.diagram
    };

    // 스냅샷 캐싱: v=2이고 최신 스냅샷이 존재하면 우선 반환
    const useV2 = versionParam === '2';
    let aiLinkData: any;
    if (useV2 && (summaryNoteData as any).aiDataSnapshotV2 && (summaryNoteData as any).aiDataSnapshotUpdatedAt) {
      const age = Date.now() - new Date((summaryNoteData as any).aiDataSnapshotUpdatedAt).getTime();
      if (age >= 0 && age <= SNAPSHOT_TTL_MS) {
        aiLinkData = (summaryNoteData as any).aiDataSnapshotV2;
      }
    }
    // 스냅샷이 없거나 만료되었으면 재계산
    if (!aiLinkData) {
      aiLinkData = await buildJsonLd(summaryNoteForBuilder as any);
      // v=2 요청인 경우, 스냅샷 저장(try/catch, 실패해도 무시)
      if (useV2) {
        try {
          await SummaryNote.updateOne(
            { _id: summaryNoteId, userId },
            { $set: { aiDataSnapshotV2: aiLinkData, aiDataSnapshotUpdatedAt: new Date() } }
          );
        } catch (e) {
          // 캐싱 실패는 치명적 아님
        }
      }
    }

    // AI 제공 데이터에 필요한 핵심 필드들만 추출하여 반환
    const responseData: any = {
      executiveSummary: (aiLinkData as any).executiveSummary,
      memoSummary: (aiLinkData as any).memoSummary,
      knowledgeGrowthTimeline: (aiLinkData as any).knowledgeGrowthTimeline,
      potentialAction: (aiLinkData as any).potentialAction || [],
      memoRelationships: (aiLinkData as any).memoRelationships,
      // 전체 데이터도 포함 (개발자용)
      fullData: aiLinkData
    };

    // v1 관계 그래프 compact 옵션: ?compact=1 또는 헤더 X-REL-GRAPH-OPT: compact (스냅샷 TTL 사용)
    const wantCompact = String(req.query.compact || '').trim() === '1' ||
      ((req.header('X-REL-GRAPH-OPT') || '').toLowerCase().includes('compact'));
    if (wantCompact && summaryNoteData?.diagram?.data && Array.isArray(summaryNoteData.diagram.data.nodes) && Array.isArray(summaryNoteData.diagram.data.connections)) {
      try {
        // 스냅샷 사용 시도
        const REL_SNAPSHOT_TTL_MS_COMPACT = REL_SNAPSHOT_TTL_MS;
        const relSnap = (summaryNoteData as any).aiRelGraphSnapshotV1;
        const relSnapAt = (summaryNoteData as any).aiRelGraphSnapshotUpdatedAt;
        if (relSnap?.compact && relSnapAt) {
          const age = Date.now() - new Date(relSnapAt).getTime();
          if (age >= 0 && age <= REL_SNAPSHOT_TTL_MS_COMPACT) {
            responseData.memoRelGraphCompact = relSnap.compact;
            // 이미 최신 스냅샷이므로 생성 스킵
            throw new Error('__SKIP_COMPACT_BUILD__');
          }
        }
        // 노트 맵: noteId -> note
        const noteMap = new Map<string, any>((notes || []).map((n: any) => [String(n._id), n]));
        // 태그 코드 사전 생성
        const tagCodeMap = new Map<string, number>();
        let tagCounter = 0;
        const encodeTags = (tags: any[]): number[] => {
          const out: number[] = [];
          (tags || []).forEach((t: any) => {
            if (typeof t !== 'string') return;
            if (!tagCodeMap.has(t)) tagCodeMap.set(t, tagCounter++);
            out.push(tagCodeMap.get(t)!);
          });
          return out;
        };
        // 관계 타입 코드 사전
        const relTypes = ['cause-effect','before-after','foundation-extension','contains','contrast'] as const;
        const relCodeMap = new Map<string, number>(relTypes.map((t, i) => [t, i]));

        // 타임스탬프 선택 헬퍼
        const toPreferredEpoch = (n: any): number | null => {
          const t = n?.clientCreatedAt || n?.createdAt;
          const d = t ? new Date(t) : null;
          return d && !isNaN(d.getTime()) ? d.getTime() : null;
        };

        // nodes: { id, ts, tags[] }
        const nodeIdsInDiagram: string[] = summaryNoteData.diagram.data.nodes.map((nd: any) => String(nd.noteId));
        const compactNodes = nodeIdsInDiagram
          .map((id: string) => {
            const n = noteMap.get(id);
            if (!n) return null;
            return {
              id,
              ts: toPreferredEpoch(n),
              tags: encodeTags(Array.isArray(n.tags) ? n.tags : [])
            };
          })
          .filter(Boolean) as Array<{ id: string; ts: number | null; tags: number[] }>;
        compactNodes.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

        // edges: { s, t, r, w }
        const compactEdges = (summaryNoteData.diagram.data.connections || [])
          .map((conn: any) => {
            const rCode = relCodeMap.has(conn.relationshipType) ? relCodeMap.get(conn.relationshipType)! : -1;
            return {
              s: String(conn.sourceNoteId),
              t: String(conn.targetNoteId),
              r: rCode,
              w: 1
            };
          })
          .filter((e: any) => e.r !== -1);
        compactEdges.sort((a: any, b: any) => (a.s === b.s ? (a.t < b.t ? -1 : a.t > b.t ? 1 : 0) : (a.s < b.s ? -1 : 1)));

        // dicts
        const tagCodes: Record<string, number> = {};
        tagCodeMap.forEach((code, tag) => { tagCodes[tag] = code; });
        const relCodes: Record<string, number> = {};
        relCodeMap.forEach((code, rel) => { relCodes[rel] = code; });

        const compactPayload = {
          nodes: compactNodes,
          edges: compactEdges,
          dicts: { tagCodes, relCodes }
        };
        responseData.memoRelGraphCompact = compactPayload;

        // v1 관계 그래프 스냅샷 캐시 저장 (TTL 관리용 타임스탬프 포함)
        try {
          await SummaryNote.updateOne(
            { _id: summaryNoteId, userId },
            { $set: { aiRelGraphSnapshotV1: { compact: compactPayload }, aiRelGraphSnapshotUpdatedAt: new Date() } }
          );
        } catch {}
      } catch (e: any) {
        // compact 생성 실패는 치명적 아님
        if (e && String(e.message) === '__SKIP_COMPACT_BUILD__') {
          // 스냅샷 사용한 경우는 정상 흐름
        }
      }
    }

    // v1 관계 그래프 LLM 프로파일: ?llm=1 또는 헤더 X-REL-GRAPH-OPT: llm
    const wantLLM = String(req.query.llm || '').trim() === '1' ||
      ((req.header('X-REL-GRAPH-OPT') || '').toLowerCase().includes('llm'));
    if (wantLLM && summaryNoteData?.diagram?.data && Array.isArray(summaryNoteData.diagram.data.nodes) && Array.isArray(summaryNoteData.diagram.data.connections)) {
      try {
        // 스냅샷 사용 시도
        const REL_SNAPSHOT_TTL_MS_LLM = REL_SNAPSHOT_TTL_MS;
        const relSnap = (summaryNoteData as any).aiRelGraphSnapshotV1;
        const relSnapAt = (summaryNoteData as any).aiRelGraphSnapshotUpdatedAt;
        if (relSnap?.llm && relSnapAt) {
          const age = Date.now() - new Date(relSnapAt).getTime();
          if (age >= 0 && age <= REL_SNAPSHOT_TTL_MS_LLM) {
            responseData.memoRelGraphLLM = relSnap.llm;
            throw new Error('__SKIP_LLM_BUILD__');
          }
        }
        const nodes = summaryNoteData.diagram.data.nodes || [];
        const conns = summaryNoteData.diagram.data.connections || [];
        const nodeIdSet = new Set(nodes.map((n: any) => String(n.noteId)));
        // adjacency (유향: source→target)
        const adjMap = new Map<string, Array<{ id: string; rel: string }>>();
        const degreeMap = new Map<string, number>(); // 무방향 근사: 노드별 연결 수 합산
        const incDegree = (id: string) => degreeMap.set(id, (degreeMap.get(id) || 0) + 1);
        conns.forEach((c: any) => {
          const s = String(c.sourceNoteId);
          const t = String(c.targetNoteId);
          const rel = String(c.relationshipType || 'rel');
          if (!nodeIdSet.has(s) || !nodeIdSet.has(t)) return;
          if (!adjMap.has(s)) adjMap.set(s, []);
          adjMap.get(s)!.push({ id: t, rel });
          // 무방향 근사 degree: 양쪽 증가
          incDegree(s); incDegree(t);
        });

        // topN 노드 선택(기본 10)
        // llmN 범위 제한 (1~50)
        const parsedN = parseInt(String(req.query.llmN || '10'), 10);
        const topN = Math.max(1, Math.min(50, isNaN(parsedN) ? 10 : parsedN));
        const degreeEntries = Array.from(degreeMap.entries()).sort((a, b) => b[1] - a[1]);
        const topNodes = degreeEntries.slice(0, topN).map(([id, deg]) => {
          const node = nodes.find((n: any) => String(n.noteId) === id);
          const text = typeof node?.content === 'string' ? node.content : '';
          const snippet = text ? `${text.substring(0, 160)}${text.length > 160 ? '…' : ''}` : '';
          return { id, degree: deg, textSnippet: snippet };
        });

        // adjacency 배열 변환
        const adjacency = Array.from(adjMap.entries()).map(([id, neighbors]) => ({ id, neighbors }));

        const llmPayload = {
          adjacency,
          metrics: {
            nodeCount: nodes.length,
            edgeCount: conns.length,
            degree: Object.fromEntries(degreeEntries)
          },
          topNodes,
          guidance: '관계 그래프는 사용자가 정의한 메모 간 연결입니다. adjacency를 따라 중심 노드와 연결 패턴을 우선 분석하세요.'
        };
        responseData.memoRelGraphLLM = llmPayload;

        // v1 관계 그래프 스냅샷 캐시 저장(병합): 기존 compact과 공존 가능
        try {
          const existing = (summaryNoteData as any).aiRelGraphSnapshotV1 || {};
          await SummaryNote.updateOne(
            { _id: summaryNoteId, userId },
            { $set: { aiRelGraphSnapshotV1: { ...existing, llm: llmPayload }, aiRelGraphSnapshotUpdatedAt: new Date() } }
          );
        } catch {}
      } catch (e: any) {
        // LLM 프로파일 생성 실패는 치명적 아님
        if (e && String(e.message) === '__SKIP_LLM_BUILD__') {
          // 스냅샷 사용한 경우는 정상 흐름
        }
      }
    }

    // v=2: 시간 정규화/Δt/리듬/세션 라벨의 최소 가산 필드 제공 (하위호환)
    if (versionParam === '2') {
      // 선호 타임스탬프 선택: clientCreatedAt 우선, 없으면 createdAt
      const toPreferredDate = (n: any): Date | null => {
        const t = n?.clientCreatedAt || n?.createdAt;
        if (!t) return null;
        const d = new Date(t);
        return isNaN(d.getTime()) ? null : d;
      };

      // 시간순 정렬
      const enrichedNotes = (notes || [])
        .map((n: any) => ({
          note: n,
          timestamp: toPreferredDate(n),
          timestampSource: n?.clientCreatedAt ? 'clientCreatedAt' : 'createdAt',
        }))
        .filter((x: any) => !!x.timestamp)
        .sort((a: any, b: any) => (a.timestamp as Date).getTime() - (b.timestamp as Date).getTime());

      // 헬퍼: ms → 간단 휴먼 포맷
      const humanize = (ms: number): string => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        const ss = s % 60;
        const mm = m % 60;
        if (h > 0) return `${h}h ${mm}m`;
        if (m > 0) return `${m}m ${ss}s`;
        return `${s}s`;
      };

      // 리듬 라벨 임계치(기본값): ≤2분 burst, ≤30분 normal, 그 외 gap
      const BURST_MS = 2 * 60 * 1000;
      const NORMAL_MS = 30 * 60 * 1000;
      const rhythmOf = (deltaMs: number | null): 'start' | 'burst' | 'normal' | 'gap' => {
        if (deltaMs === null) return 'start';
        if (deltaMs <= BURST_MS) return 'burst';
        if (deltaMs <= NORMAL_MS) return 'normal';
        return 'gap';
      };

      // 세션 라벨링: originSession 기준 그룹핑 인덱스 및 순서
      const sessionIdOrder: string[] = [];
      const withinSessionCounters = new Map<string, number>();
      const getSessionIndex = (sid: string | null): number | null => {
        if (!sid) return null;
        const idx = sessionIdOrder.indexOf(sid);
        if (idx >= 0) return idx + 1;
        sessionIdOrder.push(sid);
        return sessionIdOrder.length; // 1-based
      };

      const timelineV2 = enrichedNotes.map((item: any, idx: number) => {
        const prev = idx > 0 ? enrichedNotes[idx - 1] : null;
        const deltaMs = prev ? ((item.timestamp as Date).getTime() - (prev.timestamp as Date).getTime()) : null;
        const date = item.timestamp as Date;
        const hourOfDay = date.getHours();
        const dayOfWeek = date.getDay(); // 0(Sun)-6(Sat)
        const sessionId = item.note?.originSession ? String(item.note.originSession) : null;
        const sessionIndex = getSessionIndex(sessionId);
        let withinSessionOrder: number | null = null;
        if (sessionId) {
          const current = (withinSessionCounters.get(sessionId) || 0) + 1;
          withinSessionCounters.set(sessionId, current);
          withinSessionOrder = current;
        }
        return {
          noteId: String(item.note?._id || ''),
          timestampISO: date.toISOString(),
          timestampSource: item.timestampSource as 'clientCreatedAt' | 'createdAt',
          deltaMs,
          deltaHuman: deltaMs === null ? null : humanize(deltaMs),
          rhythmLabel: rhythmOf(deltaMs),
          hourOfDay,
          dayOfWeek,
          sessionId,
          sessionIndex,
          withinSessionOrder,
        };
      });

      // 개인화 임계치(p25/p75) 기반 리듬 라벨 추가
      const deltas = timelineV2.map(ev => ev.deltaMs).filter((v): v is number => typeof v === 'number' && v > 0).sort((a,b)=>a-b);
      const pct = (arr: number[], p: number): number | null => {
        if (!arr.length) return null;
        const idx = (arr.length - 1) * p;
        const lo = Math.floor(idx), hi = Math.ceil(idx);
        if (lo === hi) return arr[lo];
        return arr[lo] + (arr[hi]-arr[lo])*(idx-lo);
      };
      const p25 = pct(deltas, 0.25);
      const p75 = pct(deltas, 0.75);
      const BURST_MS_PERSONAL = p25 && p25 > 30 * 1000 ? p25 : BURST_MS; // 최소 30s 가드
      const NORMAL_MS_PERSONAL = p75 && p75 > BURST_MS_PERSONAL ? p75 : NORMAL_MS;
      const rhythmOfPersonal = (deltaMs: number | null): 'start' | 'burst' | 'normal' | 'gap' => {
        if (deltaMs === null) return 'start';
        if (deltaMs <= BURST_MS_PERSONAL) return 'burst';
        if (deltaMs <= NORMAL_MS_PERSONAL) return 'normal';
        return 'gap';
      };
      timelineV2.forEach(ev => {
        (ev as any).rhythmPersonal = rhythmOfPersonal(ev.deltaMs);
      });

      // 간단 Chain 묶음(초안): 짧은 Δt(<=NORMAL_MS)이며 동일 세션이면 같은 체인으로 연속 묶기
      const chains: Array<{ chainId: string; startISO: string; endISO: string; noteIds: string[]; sessionId: string | null; strength?: { length: number; durationMs: number; avgDeltaMs: number }; dominantTags?: string[] }>
        = [];
      let current: any = null;
      const genId = () => `chain_${Math.random().toString(36).slice(2, 10)}`;
      const noteMap = new Map<string, any>((notes || []).map((n:any)=>[String(n._id), n]));
      const tagSet = (noteId: string): Set<string> => new Set((noteMap.get(noteId)?.tags || []).filter((t: any)=>typeof t === 'string'));
      for (let i = 0; i < timelineV2.length; i++) {
        const ev = timelineV2[i];
        const prev = i>0 ? timelineV2[i-1] : null;
        const tagOverlap = prev ? [...tagSet(prev.noteId)].some(t => tagSet(ev.noteId).has(t)) : false;
        const isStart = i === 0 || ev.deltaMs === null || ev.deltaMs > NORMAL_MS_PERSONAL || (current && current.sessionId !== ev.sessionId && !tagOverlap);
        if (isStart) {
          // flush prev
          if (current) {
            current.endISO = timelineV2[i - 1].timestampISO;
            // strength/dominantTags 계산
            const chainNoteIds: string[] = current.noteIds;
            const ts = chainNoteIds.map(id => new Date(timelineV2.find(x=>x.noteId===id)!.timestampISO).getTime()).sort((a,b)=>a-b);
            const durationMs = ts.length ? (ts[ts.length-1]-ts[0]) : 0;
            const deltasIn = chainNoteIds.map((id, idx2) => idx2===0 ? null : (new Date(timelineV2.find(x=>x.noteId===id)!.timestampISO).getTime() - new Date(timelineV2.find(x=>x.noteId===chainNoteIds[idx2-1])!.timestampISO).getTime())).filter((v): v is number => typeof v === 'number');
            const avgDeltaMs = deltasIn.length ? Math.round(deltasIn.reduce((a,b)=>a+b,0)/deltasIn.length) : 0;
            const tagsAll = chainNoteIds.flatMap(id => Array.from(tagSet(id)));
            const freq: Record<string, number> = {};
            tagsAll.forEach(t=>{ freq[t]=(freq[t]||0)+1; });
            const dominantTags = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t])=>t);
            chains.push({ ...current, strength: { length: chainNoteIds.length, durationMs, avgDeltaMs }, dominantTags });
          }
          current = { chainId: genId(), startISO: ev.timestampISO, endISO: ev.timestampISO, noteIds: [ev.noteId], sessionId: ev.sessionId };
        } else {
          current.noteIds.push(ev.noteId);
          current.endISO = ev.timestampISO;
        }
      }
      if (current) {
        const chainNoteIds: string[] = current.noteIds;
        const ts = chainNoteIds.map(id => new Date(timelineV2.find(x=>x.noteId===id)!.timestampISO).getTime()).sort((a,b)=>a-b);
        const durationMs = ts.length ? (ts[ts.length-1]-ts[0]) : 0;
        const deltasIn = chainNoteIds.map((id, idx2) => idx2===0 ? null : (new Date(timelineV2.find(x=>x.noteId===id)!.timestampISO).getTime() - new Date(timelineV2.find(x=>x.noteId===chainNoteIds[idx2-1])!.timestampISO).getTime())).filter((v): v is number => typeof v === 'number');
        const avgDeltaMs = deltasIn.length ? Math.round(deltasIn.reduce((a,b)=>a+b,0)/deltasIn.length) : 0;
        const tagsAll = chainNoteIds.flatMap(id => Array.from(tagSet(id)));
        const freq: Record<string, number> = {};
        tagsAll.forEach(t=>{ freq[t]=(freq[t]||0)+1; });
        const dominantTags = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([t])=>t);
        chains.push({ ...current, strength: { length: chainNoteIds.length, durationMs, avgDeltaMs }, dominantTags });
      }

      // 간단 SRS 오버레이(초안): memoId로 연결된 플래시카드의 nextReview/lastResult를 이벤트화
      let srsOverlay: Array<{ memoId: string; nextReviewISO?: string; lastResult?: string }>|undefined = undefined;
      try {
        const noteIds = (notes || []).map((n: any) => String(n._id));
        const cards = await Flashcard.find({ userId: new mongoose.Types.ObjectId(userId), memoId: { $in: noteIds } }).lean();
        srsOverlay = cards.map((c: any) => ({
          memoId: String(c.memoId),
          nextReviewISO: c?.srsState?.nextReview ? new Date(c.srsState.nextReview).toISOString() : undefined,
          lastResult: c?.srsState?.lastResult || undefined,
        }));
      } catch (e) {
        // 오버레이는 선택 제공이므로 오류는 무시
      }

      // InlineThread 미세 타임라인(초안): 각 노트의 인라인 이벤트를 parentNoteId로 조회하여 시간순 정렬
      let microTimeline: Array<{ noteId: string; inlineThreadId: string; timestampISO: string; timestampSource: 'clientCreatedAt'|'createdAt'; textSnippet: string; depth?: number }> | undefined = undefined;
      try {
        const noteIds = (notes || []).map((n: any) => new mongoose.Types.ObjectId(String(n._id)));
        if (noteIds.length > 0) {
          const threads = await InlineThread.find({ parentNoteId: { $in: noteIds } }).lean();
          microTimeline = threads
            .map((t: any) => {
              const ts = t.clientCreatedAt || t.createdAt;
              const d = new Date(ts);
              if (isNaN(d.getTime())) return null;
              const snippet = String(t.content || '').slice(0, 120);
              return {
                noteId: String(t.parentNoteId),
                inlineThreadId: String(t._id),
                timestampISO: d.toISOString(),
                timestampSource: t.clientCreatedAt ? 'clientCreatedAt' : 'createdAt',
                textSnippet: snippet,
                depth: typeof t.depth === 'number' ? t.depth : undefined,
              };
            })
            .filter(Boolean) as any[];
          microTimeline.sort((a, b) => new Date(a.timestampISO).getTime() - new Date(b.timestampISO).getTime());
        }
      } catch (e) {
        // 선택 제공 기능이므로 오류 무시
      }

      (responseData as any).analysisV2 = {
        version: '2',
        timelineV2,
        chains,
        srsOverlay,
        microTimeline,
        thresholds: { burstMs: BURST_MS, normalMs: NORMAL_MS },
        personalization: {
          burstMsPersonal: BURST_MS_PERSONAL,
          normalMsPersonal: NORMAL_MS_PERSONAL,
        }
      };
    }
    
    res.status(200).json(responseData);
    
  } catch (error: any) {
    console.error('[GetSummaryNoteData Error]', error);
    res.status(500).json({ message: '데이터를 가져오는 중 문제가 있어요. 다시 시도해 주실래요?', error: error.message });
  }
};

// (Placeholder for batch get notes - this might belong in noteController.ts)
// GET /api/notes/batch - This is part of the plan but will be handled separately
// to ensure it's in the correct controller (likely noteController.ts). 
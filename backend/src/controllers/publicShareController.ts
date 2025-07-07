import { Request, Response } from 'express';
import PublicShareService from '../services/PublicShareService';

class PublicShareController {
  /**
   * @description Handles the request to get public share data.
   */
  public static async getPublicShareData(req: Request, res: Response): Promise<void> {
    try {
      const { shareId } = req.params;
      const data = await PublicShareService.getShareData(shareId);

      if (!data) {
        res.status(404).json({ message: '공유 링크를 찾을 수 없거나 유효하지 않습니다.' });
        return;
      }

      res.status(200).json(data);
    } catch (error) {
      console.error('Error fetching public share data:', error);
      res.status(500).json({ message: '데이터를 불러오는 중 서버에서 오류가 발생했습니다.' });
    }
  }

  public static async getInlineThreads(req: Request, res: Response): Promise<void> {
    try {
      const { shareId, noteId } = req.params;

      // 1) 해당 공유 링크가 존재하고 noteId가 포함돼 있는지 확인
      //    summaryNote.orderedNoteIds 를 평면 조회하여 검증 (가벼운 쿼리)
      const share = await (await import('../models/PublicShare')).default.findById(shareId).lean();
      if (!share) {
        res.status(404).json({ message: '공유 링크를 찾을 수 없습니다.' });
        return;
      }

      const SummaryNote = (await import('../models/SummaryNote')).default as any;
      const summaryNote = await SummaryNote.findById(share.summaryNoteId, 'orderedNoteIds').lean();

      // ObjectId vs string 형태 차이로 비교가 실패하지 않도록 모두 문자열로 변환해서 검사
      const orderedIds: string[] = (summaryNote?.orderedNoteIds || []).map((id: any) => id.toString());

      if (!summaryNote || !orderedIds.includes(noteId)) {
        res.status(404).json({ message: '해당 노트가 공유 문서에 포함되어 있지 않습니다.' });
        return;
      }

      // 2) 노트의 inlineThreads 로드
      const Note = (await import('../models/Note')).default as any;
      const InlineThread = (await import('../models/InlineThread')).default as any;

      const note = await Note.findById(noteId, 'inlineThreads').lean();
      if (!note) {
        res.status(404).json({ message: '노트를 찾을 수 없습니다.' });
        return;
      }

      const threads = await InlineThread.find({ _id: { $in: note.inlineThreads } })
        .sort({ createdAt: 1 })
        .select('content authorName createdAt depth')
        .lean();

      res.status(200).json({ threads });
      return;
    } catch (error) {
      console.error('Error fetching inline threads:', error);
      res.status(500).json({ message: '쓰레드 데이터를 불러오는 중 오류가 발생했습니다.' });
    }
  }
}

export default PublicShareController; 
import { Request, Response } from 'express';
import Flashcard from '../models/Flashcard';
import SummaryNote from '../models/SummaryNote';
import mongoose from 'mongoose';
import Note from '../models/Note';

// POST /api/flashcards
export const createFlashcard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: '인증 필요' });
    const { bookId, tsSessionId, memoId, sourceText, question, answer, pageStart, pageEnd, tags } = req.body;
    if (!bookId || !sourceText || !question || !answer) {
      return res.status(400).json({ message: '필수값 누락' });
    }
    const flashcard = await Flashcard.create({
      userId,
      bookId,
      tsSessionId,
      memoId,
      sourceText,
      question,
      answer,
      pageStart,
      pageEnd,
      tags
    });
    // 스냅샷 무효화: 해당 메모를 포함하는 SummaryNote들 (v2, v1 관계 그래프)
    try {
      if (memoId) {
        await SummaryNote.updateMany(
          { userId, orderedNoteIds: { $in: [memoId] } },
          { $set: { 
            aiDataSnapshotV2: null, 
            aiDataSnapshotUpdatedAt: null,
            aiRelGraphSnapshotV1: null,
            aiRelGraphSnapshotUpdatedAt: null
          } }
        );
      }
    } catch {}

    res.status(201).json(flashcard);
  } catch (error) {
    console.error('플래시카드 생성 오류:', error);
    res.status(500).json({ message: '서버 오류', error });
  }
};

// GET /api/flashcards?bookId=...
export const getFlashcards = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: '인증 필요' });
    const { bookId } = req.query;
    const filter: any = { userId };
    if (bookId) filter.bookId = bookId;
    const flashcards = await Flashcard.find(filter).sort({ createdAt: -1 });
    res.status(200).json(flashcards);
  } catch (error) {
    console.error('플래시카드 조회 오류:', error);
    res.status(500).json({ message: '서버 오류', error });
  }
};

// POST /api/flashcards/:id/review
export const reviewFlashcard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: '인증 필요' });
    const { id } = req.params;
    const { result } = req.body; // 'easy'|'hard'|'fail'
    if (!['easy','hard','fail'].includes(result)) {
      return res.status(400).json({ message: '잘못된 평가값' });
    }
    const card = await Flashcard.findOne({ _id: id, userId });
    if (!card) return res.status(404).json({ message: '카드 없음' });
    // SRS 갱신 로직(임시)
    let { interval, ease, repetitions } = card.srsState;
    if (result === 'fail') {
      repetitions = 0;
      interval = 1;
      ease = Math.max(1.3, ease - 0.2);
    } else {
      repetitions += 1;
      if (result === 'easy') {
        ease += 0.15;
        interval = Math.round(interval * ease);
      } else if (result === 'hard') {
        ease = Math.max(1.3, ease - 0.15);
        interval = Math.max(1, Math.round(interval * 1.2));
      }
    }
    const nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
    card.srsState = { interval, ease, repetitions, nextReview, lastResult: result };
    await card.save();

    // 스냅샷 무효화: 카드가 연결된 메모를 포함하는 SummaryNote들 (v2, v1 관계 그래프)
    try {
      const memoId = card.memoId ? String(card.memoId) : null;
      if (memoId) {
        await SummaryNote.updateMany(
          { userId, orderedNoteIds: { $in: [memoId] } },
          { $set: { 
            aiDataSnapshotV2: null, 
            aiDataSnapshotUpdatedAt: null,
            aiRelGraphSnapshotV1: null,
            aiRelGraphSnapshotUpdatedAt: null
          } }
        );
      }
    } catch {}

    res.status(200).json(card);
  } catch (error) {
    console.error('플래시카드 복습(SRS) 오류:', error);
    res.status(500).json({ message: '서버 오류', error });
  }
};

// POST /api/flashcards/from-memo
export const fromMemo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: '인증 필요' });
    const { memoId, question, answer } = req.body;
    if (!memoId || !question || !answer) return res.status(400).json({ message: '필수값 누락' });

    // Note 모델에서 메모 정보 조회
    const note = await Note.findById(memoId);
    if (!note) return res.status(404).json({ message: '메모 없음' });

    // Flashcard 생성
    const flashcard = await Flashcard.create({
      userId,
      bookId: note.bookId,
      memoId,
      sourceText: note.content,
      question,
      answer,
      tags: note.tags,
      // pageStart, pageEnd 등 필요시 note에서 추출 가능
    });

    res.status(201).json(flashcard);
  } catch (error) {
    console.error('메모→플래시카드 변환 오류:', error);
    res.status(500).json({ message: '서버 오류', error });
  }
};

// PUT /api/flashcards/:id
export const updateFlashcard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: '인증 필요' });
    const { id } = req.params;
    const update = req.body;
    const card = await Flashcard.findOneAndUpdate({ _id: id, userId }, update, { new: true });
    if (!card) return res.status(404).json({ message: '카드 없음' });
    // v2 스냅샷 무효화: 연결 메모 기반으로 무효화 시도
    try {
      const memoId = card?.memoId ? String(card.memoId) : null;
      if (memoId) {
        await SummaryNote.updateMany(
          { userId, orderedNoteIds: { $in: [memoId] } },
          { $set: { aiDataSnapshotV2: null, aiDataSnapshotUpdatedAt: null } }
        );
      }
    } catch {}

    res.status(200).json(card);
  } catch (error) {
    console.error('플래시카드 수정 오류:', error);
    res.status(500).json({ message: '서버 오류', error });
  }
};

// DELETE /api/flashcards/:id
export const deleteFlashcard = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: '인증 필요' });
    const { id } = req.params;
    const card = await Flashcard.findOne({ _id: id, userId });
    if (!card) return res.status(404).json({ message: '카드 없음' });
    const memoIdBeforeDelete = card.memoId ? String(card.memoId) : null;
    await Flashcard.deleteOne({ _id: id, userId });
    // 스냅샷 무효화 (v2, v1 관계 그래프)
    try {
      if (memoIdBeforeDelete) {
        await SummaryNote.updateMany(
          { userId, orderedNoteIds: { $in: [memoIdBeforeDelete] } },
          { $set: { 
            aiDataSnapshotV2: null, 
            aiDataSnapshotUpdatedAt: null,
            aiRelGraphSnapshotV1: null,
            aiRelGraphSnapshotUpdatedAt: null
          } }
        );
      }
    } catch {}

    res.status(200).json({ message: '삭제 완료' });
  } catch (error) {
    console.error('플래시카드 삭제 오류:', error);
    res.status(500).json({ message: '서버 오류', error });
  }
}; 
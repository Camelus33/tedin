import { Request, Response } from 'express';
import Session from '../models/Session';
import Book from '../models/Book';
import Note from '../models/Note';
import { routineService } from '../services/routineService';
import UserStats from '../models/UserStats';
import { 
  processClientTime, 
  getFinalTimeForNote, 
  logTimeProcessing,
  CompressedClientTime 
} from '../utils/timeProcessor';

// Helper function to calculate and update estimated reading time
const updateEstimatedTime = async (bookId: string, userId: string) => {
  try {
    // 해당 책의 완료된 모든 TS 세션 조회
    const sessions = await Session.find({ 
      bookId, 
      userId, 
      mode: 'TS', 
      status: 'completed', 
      ppm: { $ne: null, $gt: 0 } // 유효한 ppm 값만
    }).select('ppm');

    if (sessions.length === 0) {
      // 세션 기록이 없으면 예상 시간 계산 불가
      await Book.findByIdAndUpdate(bookId, { $set: { estimatedRemainingMinutes: null, avgPpm: null } });
      return;
    }

    // 평균 PPM 계산
    const totalPpm = sessions.reduce((sum, s) => sum + (s.ppm || 0), 0);
    const avgPpm = totalPpm / sessions.length;

    // 책 정보 조회 (현재 페이지, 총 페이지)
    const book = await Book.findById(bookId).select('currentPage totalPages');
    if (!book || book.totalPages <= book.currentPage) {
      // 책 정보가 없거나 이미 완독한 경우
      await Book.findByIdAndUpdate(bookId, { $set: { estimatedRemainingMinutes: 0, avgPpm: avgPpm } });
      return;
    }

    // 예상 남은 시간 계산 (분 단위)
    const remainingPages = book.totalPages - book.currentPage;
    const estimatedRemainingMinutes = Math.round(remainingPages / avgPpm);

    // 계산된 값으로 Book 업데이트
    await Book.findByIdAndUpdate(bookId, { 
      $set: { 
        estimatedRemainingMinutes, 
        avgPpm 
      } 
    });

  } catch (error) {
    console.error(`[updateEstimatedTime] Error updating book ${bookId}:`, error);
    // 에러 발생 시 필드를 null로 업데이트하여 잘못된 정보 방지 (선택적)
    // await Book.findByIdAndUpdate(bookId, { $set: { estimatedRemainingMinutes: null, avgPpm: null } });
  }
};

// 사용자의 모든 세션 조회
export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json(sessions);
  } catch (error) {
    console.error('세션 목록 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 세션 상세 조회
export const getSessionById = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const session = await Session.findOne({ _id: sessionId, userId })
      .populate('bookId')
      .select('-__v');

    if (!session) {
      return res.status(404).json({ message: '해당 세션을 찾을 수 없습니다.' });
    }

    res.status(200).json(session);
  } catch (error) {
    console.error('세션 상세 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 새 세션 시작
export const createSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const { bookId, mode, startPage, endPage, durationSec, warmup } = req.body;

    // 책이 존재하는지 확인
    const book = await Book.findOne({ _id: bookId, userId });
    if (!book) {
      return res.status(404).json({ message: '해당 책을 찾을 수 없습니다.' });
    }

    // durationSec 보정 로직
    let durationSecRaw = durationSec || 0;
    let durationSecFinal = durationSecRaw;
    if (durationSecRaw > 0 && durationSecRaw <= 100) {
      durationSecFinal = durationSecRaw * 60;
    }

    // warmup 플래그에 따라 초기 상태 결정
    const initialStatus = warmup ? 'pending' : 'active';

    const newSession = new Session({
      userId,
      bookId,
      mode,
      startPage,
      endPage,
      durationSec: durationSecFinal,
      status: initialStatus,
    });

    const savedSession = await newSession.save();
    // 실제 DB에 저장된 세션을 다시 조회
    const confirmedSession = await Session.findById(savedSession._id);
    if (!confirmedSession) {
      return res.status(500).json({ message: '세션 생성 후 DB 조회 실패' });
    }
    // 사용자의 책 현재 페이지 업데이트
    await Book.findByIdAndUpdate(
      bookId,
      { $set: { 
          currentPage: Math.max(book.currentPage, startPage),
          status: 'in_progress'
        }
      }
    );

    res.status(201).json(confirmedSession);
  } catch (error) {
    console.error('세션 생성 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 세션 완료
export const completeSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = req.user?.id;
  const { 
    actualEndPage, 
    durationSec, 
    ppm, 
    memo, 
    summary10words, 
    selfRating, 
    memoType,
    // 🆕 Shadow Mode: 클라이언트 시간 정보 수신 (기존 로직에 영향 없음)
    _shadowClientTime,
    _shadowTimeValid,
    _shadowTimeError
  } = req.body;

  if (!userId) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  try {
    // 🆕 클라이언트 시간 정보 처리 (실제 사용)
    const timeProcessResult = processClientTime(
      _shadowClientTime as CompressedClientTime,
      _shadowTimeValid,
      _shadowTimeError
    );
    
    // 개발 환경에서 시간 처리 결과 로깅
    logTimeProcessing(timeProcessResult, `세션 완료 - ${sessionId}`);

    const session = await Session.findOne({ _id: sessionId, userId });

    if (!session) {
      return res.status(404).json({ message: '해당 세션을 찾을 수 없습니다.' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ message: '이미 완료되었거나 취소된 세션입니다.' });
    }

    // 1. 세션 완료 처리
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      { 
        $set: { 
          status: 'completed',
          actualEndPage: actualEndPage || session.endPage,
          durationSec,
          ppm,
          memo,
          summary10words,
          selfRating
        } 
      },
      { new: true }
    )
    .populate('bookId')
    .select('-__v');

    // Check if session was successfully updated
    if (!updatedSession) {
        // This case might be redundant if findOne check passed, but good for safety
        return res.status(404).json({ message: '세션 업데이트 중 오류 발생.' });
    }

    // 2. 책 진행 상태 업데이트
    const book = await Book.findById(session.bookId);
    let finalCurrentPage = book ? book.currentPage : 0;
    if (book) {
      const newCurrentPage = Math.max(book.currentPage, actualEndPage || session.endPage);
      finalCurrentPage = newCurrentPage; // 예상 시간 계산 위해 저장
      
      await Book.findByIdAndUpdate(
        session.bookId,
        { 
          $set: { 
            currentPage: newCurrentPage,
            completionPercentage: Math.min(
              Math.round((newCurrentPage / book.totalPages) * 100),
              100
            ),
            status: newCurrentPage >= book.totalPages ? 'completed' : 'in_progress'
          } 
        }
      );
    }

    // 3. 예상 완독 시간 업데이트
    // Make sure userId is in the correct format if needed by updateEstimatedTime
    await updateEstimatedTime(session.bookId.toString(), userId.toString()); 

    // 4. TS 모드 반추 메모를 Note로 자동 생성
    if (memo && memo.trim()) {
      // 🆕 클라이언트 시간 기반 Note 생성
      const finalTimes = getFinalTimeForNote(timeProcessResult);
      
      const noteData = {
        userId: userId,
        bookId: session.bookId,
        originSession: session._id,
        type: memoType || 'thought',
        content: memo,
        tags: (summary10words || '').trim().split(/\s+/).filter(Boolean),
        createdAt: finalTimes.createdAt, // 서버 시간 (기존 로직 유지)
        ...(finalTimes.clientCreatedAt && { clientCreatedAt: finalTimes.clientCreatedAt }) // 클라이언트 시간 (유효할 때만 추가)
      };
      
      await Note.create(noteData);
      
      // 개발 환경에서 메모 생성 결과 로깅
      if (process.env.NODE_ENV === 'development') {
        console.log('[Note 생성] 사용된 시간:', {
          useClientTime: timeProcessResult.useClientTime,
          serverTime: finalTimes.createdAt.toISOString(),
          clientTime: finalTimes.clientCreatedAt?.toISOString() || null,
          memoContent: memo.substring(0, 50) + (memo.length > 50 ? '...' : '')
        });
      }
    }

    // 5. Update routine status (fire and forget, log errors)
    if (updatedSession.mode === 'TS') { // Only update for TS sessions
      try {
        await routineService.updateTodaysActivity(userId, 'ts');
      } catch (routineError) {
        console.error(`[completeSession] Failed to update TS routine status for user ${userId}:`, routineError);
        // Do not throw error here, as the main session completion was successful
      }
    }

    // 6. Update UserStats with total TS duration (Added)
    if (updatedSession.mode === 'TS' && updatedSession.durationSec > 0) {
      try {
        await UserStats.findOneAndUpdate(
          { userId }, // find by userId
          { $inc: { totalTsDurationSec: updatedSession.durationSec } }, // increment the duration
          { upsert: true, new: true, setDefaultsOnInsert: true } // options: create if not exists
        );
      } catch (statsError) {
        // Log error but don't block the main response
        console.error(`[completeSession] UserStats 업데이트 실패 (userId: ${userId}):`, statsError);
      }
    }

    res.status(200).json(updatedSession);
  } catch (error) {
    console.error('세션 완료 처리 중 오류 발생:', error);
    // Send a generic error message, or potentially more specific based on error type
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 세션 취소
export const cancelSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const session = await Session.findOne({ _id: sessionId, userId });

    if (!session) {
      return res.status(404).json({ message: '해당 세션을 찾을 수 없습니다.' });
    }

    if (session.status !== 'active' && session.status !== 'pending') {
      return res.status(400).json({ message: '이미 완료되었거나 취소된 세션입니다.' });
    }

    // 세션 취소 처리
    await Session.findByIdAndUpdate(
      sessionId,
      { $set: { status: 'cancelled' } }
    );

    res.status(200).json({ message: '세션이 취소되었습니다.' });
  } catch (error) {
    console.error('세션 취소 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Activate a pending session (warmup -> active)
export const activateSession = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  try {
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ message: '해당 세션을 찾을 수 없습니다.' });
    }
    if (session.status !== 'pending') {
      return res.status(400).json({ message: '이미 활성화되었거나 완료된 세션입니다.' });
    }

    const updated = await Session.findByIdAndUpdate(
      sessionId,
      { status: 'active' },
      { new: true }
    )
    .populate('bookId')
    .select('-__v');

    res.status(200).json(updated);
  } catch (error) {
    console.error('세션 활성화 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 책별 세션 조회
export const getSessionsByBook = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const sessions = await Session.find({ userId, bookId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json(sessions);
  } catch (error) {
    console.error('책별 세션 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}; 
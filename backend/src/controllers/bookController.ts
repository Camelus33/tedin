import { Request, Response } from 'express';
import Book from '../models/Book';
import User from '../models/User';
import Session from '../models/Session';
import mongoose from 'mongoose';

// Helper function to calculate and update estimated reading time (중복 방지 위해 다른 파일로 분리 가능)
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
      await Book.findByIdAndUpdate(bookId, { $set: { estimatedRemainingMinutes: null, avgPpm: null } });
      return;
    }

    const totalPpm = sessions.reduce((sum, s) => sum + (s.ppm || 0), 0);
    const avgPpm = totalPpm / sessions.length;

    const book = await Book.findById(bookId).select('currentPage totalPages');
    if (!book || book.totalPages <= book.currentPage) {
      await Book.findByIdAndUpdate(bookId, { $set: { estimatedRemainingMinutes: 0, avgPpm: avgPpm } });
      return;
    }

    const remainingPages = book.totalPages - book.currentPage;
    const estimatedRemainingMinutes = Math.round(remainingPages / avgPpm);

    await Book.findByIdAndUpdate(bookId, {
      $set: {
        estimatedRemainingMinutes,
        avgPpm
      }
    });

  } catch (error) {
    console.error(`[updateEstimatedTime] Error updating book ${bookId}:`, error);
  }
};

// 사용자의 책 목록 조회
export const getUserBooks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const books = await Book.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json(books);
  } catch (error) {
    console.error('책 목록 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 책 상세 정보 조회
export const getBookById = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const book = await Book.findOne({ _id: bookId, userId })
      .select('-__v');

    if (!book) {
      return res.status(404).json({ message: '해당 책을 찾을 수 없습니다.' });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error('책 상세 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 새 책 추가
export const addBook = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // Text fields from FormData (req.body will contain them)
    const { title, author, totalPages, currentPage, isbn, category, readingPurpose } = req.body;
    
    // 업로드된 파일 정보는 req.file 에서 가져옴
    const coverImageFile = req.file as Express.Multer.File;

    const newBookData: any = {
      userId,
      title,
      author,
      totalPages: parseInt(totalPages, 10), // FormData는 문자열로 전달하므로 숫자로 변환
      currentPage: currentPage ? parseInt(currentPage, 10) : 0, // FormData는 문자열로 전달하므로 숫자로 변환
      isbn,
      category,
      status: 'not_started', // 기본값: 시작 전
      completionPercentage: 0,
      readingPurpose,
    };

    if (coverImageFile) {
      // 실제 저장된 파일 경로 또는 URL을 저장. Express.static 등으로 접근 가능하게 해야 함.
      // 예: 'uploads/coverImage-1678886400000-123456789.jpg'
      // 클라우드 스토리지 사용 시, 업로드 후 받은 URL을 저장.
      newBookData.coverImage = coverImageFile.path; 
    } else {
      // 이미지가 없는 경우 기본값 또는 null 처리 (현재 스키마는 string, 빈 문자열 가능)
      newBookData.coverImage = ''; // 또는 기본 이미지 경로
    }

    const newBook = new Book(newBookData);
    const savedBook = await newBook.save();
    
    // 사용자의 책 컬렉션에 추가
    await User.findByIdAndUpdate(
      userId,
      { $push: { books: savedBook._id } }
    );

    res.status(201).json(savedBook);
  } catch (error) {
    console.error('책 추가 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 책 현재 페이지 또는 상태 업데이트
export const updateBookProgress = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?.id;
    const { currentPage, status } = req.body;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const book = await Book.findOne({ _id: bookId, userId });

    if (!book) {
      return res.status(404).json({ message: '해당 책을 찾을 수 없습니다.' });
    }

    // 업데이트할 필드 설정
    const updateData: any = {};
    let shouldRecalculateTime = false; // 시간 재계산 여부 플래그
    
    if (currentPage !== undefined && currentPage !== book.currentPage) { // 현재 페이지가 변경되었을 때만
      updateData.currentPage = currentPage;
      shouldRecalculateTime = true; // 현재 페이지 변경 시 시간 재계산
      
      // 완료 퍼센티지 계산
      if (book.totalPages > 0) {
        updateData.completionPercentage = Math.min(
          Math.round((currentPage / book.totalPages) * 100),
          100
        );
      }
      
      // 완료 상태 자동 업데이트
      if (currentPage >= book.totalPages) {
        updateData.status = 'completed';
        updateData.estimatedRemainingMinutes = 0; // 완독 시 예상 시간 0으로 설정
        shouldRecalculateTime = false; // 완독 시에는 재계산 불필요
      } else if (currentPage > 0 && book.status === 'not_started') {
        updateData.status = 'in_progress';
      }
    }
    
    if (status !== undefined && status !== book.status) { // 상태가 변경되었을 때
      updateData.status = status;
      if(status === 'completed') {
        updateData.estimatedRemainingMinutes = 0; // 완독 상태 변경 시 예상 시간 0
        shouldRecalculateTime = false;
      } else if (status === 'in_progress' || status === 'not_started') {
        // 읽는 중 또는 시작 전 상태로 변경 시 시간 재계산 필요
        shouldRecalculateTime = true;
      }
    }

    // 변경사항이 있을 경우에만 업데이트 실행
    let updatedBook = book; // 초기값은 기존 book 객체
    if (Object.keys(updateData).length > 0) {
        updatedBook = await Book.findByIdAndUpdate(
            bookId,
            { $set: updateData },
            { new: true } // 업데이트된 문서를 반환받음
        ).select('-__v');

        if (!updatedBook) { // 업데이트 후 책 정보를 다시 확인 (오류 방지)
          return res.status(500).json({ message: '책 정보 업데이트 중 오류 발생' });
        }
    }

    // 예상 완독 시간 업데이트 (필요한 경우)
    if (shouldRecalculateTime && updatedBook.status !== 'completed') { // 상태가 completed가 아닐 때만 재계산
        await updateEstimatedTime(bookId, userId);
        // 재계산 후 최신 book 정보를 다시 로드 (선택적이지만, 응답에 최신 예상 시간을 포함시키려면 필요)
        updatedBook = await Book.findById(bookId).select('-__v');
        if (!updatedBook) { // 다시 로드 실패 시 처리
           return res.status(500).json({ message: '업데이트 후 책 정보 로드 실패' });
        }
    }

    res.status(200).json(updatedBook); // 최종 업데이트된 책 정보 반환
  } catch (error) {
    console.error('책 진행 상태 업데이트 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 책 삭제
export const removeBook = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const book = await Book.findOne({ _id: bookId, userId });

    if (!book) {
      return res.status(404).json({ message: '해당 책을 찾을 수 없습니다.' });
    }

    // 책 삭제
    await Book.deleteOne({ _id: bookId });
    
    // 사용자 컬렉션에서도 제거
    await User.findByIdAndUpdate(
      userId,
      { $pull: { books: bookId } }
    );

    res.status(200).json({ message: '책이 삭제되었습니다.' });
  } catch (error) {
    console.error('책 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 여러 ID로 책 일괄 조회
export const getBooksByIds = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { bookIds } = req.body; // 요청 본문에서 bookIds 배열을 가져옵니다.

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // bookIds 유효성 검사: 배열 형태인지, 비어있지 않은지 확인합니다.
    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({ message: 'bookIds must be a non-empty array.' });
    }

    // 각 bookId가 유효한 MongoDB ObjectId 형식인지 확인합니다. (선택적이지만 권장)
    // import mongoose from 'mongoose'; // Ensure mongoose is imported at the top
    for (const id of bookIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: `Invalid book ID format: ${id}` });
      }
    }

    // MongoDB에서 $in 연산자를 사용하여 여러 ID에 해당하는 책을 조회합니다.
    // 동시에 userId 조건을 추가하여 요청한 사용자의 책만 가져오도록 보안을 강화합니다.
    // 필요한 필드만 선택하여 반환합니다 (예: _id, title).
    const books = await Book.find({
      _id: { $in: bookIds.map(id => new mongoose.Types.ObjectId(id)) },
      userId: new mongoose.Types.ObjectId(userId),
    }).select('_id title author coverImage'); // 필요한 필드만 선택

    // 조회된 책들을 요청된 bookIds 순서대로 정렬할 수도 있으나,
    // 클라이언트에서 ID를 이미 가지고 있으므로, 반환된 배열을 매핑하여 사용하면 됩니다.
    // 여기서는 MongoDB가 반환하는 순서대로 줍니다.
    // 필요하다면, 다음과 같이 순서를 맞출 수 있습니다:
    // const orderedBooks = bookIds.map(id => books.find(book => book._id.toString() === id)).filter(Boolean);

    res.status(200).json(books);
  } catch (error) {
    console.error('배치 책 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}; 
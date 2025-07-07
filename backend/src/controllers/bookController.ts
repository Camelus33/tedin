import { Request, Response } from 'express';
import Book from '../models/Book';
import User from '../models/User';
import Session from '../models/Session';
import mongoose from 'mongoose';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

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
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // Optional bookType filter from query params
    const { bookType } = req.query;
    const filter: any = { userId };
    
    if (bookType && ['BOOK', 'NOTEBOOK'].includes(bookType as string)) {
      filter.bookType = bookType;
    }

    const books = await Book.find(filter)
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
    const userId = req.user?._id;

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
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const { title, author, totalPages, currentPage, isbn, category, readingPurpose, coverImage, purchaseLink, bookType } = req.body;
    const coverImageFile = req.file as Express.Multer.File;

    // Validate bookType
    const validBookTypes = ['BOOK', 'NOTEBOOK'];
    const finalBookType = bookType && validBookTypes.includes(bookType) ? bookType : 'BOOK';

    const newBookData: any = {
      userId,
      title,
      author,
      bookType: finalBookType,
      isbn,
      category,
      status: 'not_started',
      completionPercentage: 0,
      readingPurpose,
      purchaseLink: purchaseLink || '',
    };

    // For BOOK type, totalPages is required and currentPage is relevant
    if (finalBookType === 'BOOK') {
      newBookData.totalPages = parseInt(totalPages, 10);
      newBookData.currentPage = currentPage ? parseInt(currentPage, 10) : 0;
    } else {
      // For NOTEBOOK type, set default values that won't interfere with logic
      newBookData.totalPages = 1;
      newBookData.currentPage = 0;
    }

    if (coverImageFile && coverImageFile.filename) {
      const backendUrl = process.env.BACKEND_URL || 'https://habitus33-api.onrender.com';
      newBookData.coverImage = `/uploads/${coverImageFile.filename}`;
    } else {
      newBookData.coverImage = ''; // 또는 기본 이미지 URL
    }

    const newBook = new Book(newBookData);
    const savedBook = await newBook.save();
    
    await User.findByIdAndUpdate(
      userId,
      { $push: { books: savedBook._id } }
    );

    res.status(201).json(savedBook);
  } catch (error) {
    console.error('책 추가 중 오류 발생:', error);
    if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: `파일 업로드 오류: ${error.message}` });
    }
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 책 정보 업데이트 (제목, 저자, 이미지 등)
export const updateBookInfo = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?._id;
    const { title, author, totalPages, currentPage, category, readingPurpose, readingSpeed, removeCoverImage, purchaseLink } = req.body;
    const coverImageFile = req.file as Express.Multer.File;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const book = await Book.findOne({ _id: bookId, userId });
    if (!book) {
      return res.status(404).json({ message: '해당 책을 찾을 수 없습니다.' });
    }

    const updateData: any = {};

    // 텍스트 필드 업데이트
    if (title !== undefined) updateData.title = title.trim();
    if (author !== undefined) updateData.author = author.trim();
    if (totalPages !== undefined) updateData.totalPages = parseInt(totalPages, 10);
    if (category !== undefined) updateData.category = category.trim();
    if (readingPurpose !== undefined) updateData.readingPurpose = readingPurpose;
    if (purchaseLink !== undefined) updateData.purchaseLink = purchaseLink;
    // currentPage 및 status는 updateBookProgress에서 관리하므로 여기서는 제외하거나, 
    // 프론트엔드에서 모든 정보를 한 번에 보낸다면 여기서도 처리 가능.
    // 여기서는 프론트엔드가 보낸 값을 그대로 반영한다고 가정.
    if (currentPage !== undefined) {
      updateData.currentPage = parseInt(currentPage, 10);
      if (book.totalPages > 0) {
        updateData.completionPercentage = Math.min(Math.round((parseInt(currentPage, 10) / book.totalPages) * 100), 100);
      }
      if (parseInt(currentPage, 10) >= book.totalPages) {
        updateData.status = 'completed';
      } else if (parseInt(currentPage, 10) > 0 && book.status === 'not_started') {
        updateData.status = 'in_progress';
      }
    }
    if (readingSpeed !== undefined) updateData.readingSpeed = parseInt(readingSpeed, 10);

    // 이미지 처리
    if (coverImageFile && coverImageFile.filename) {
      // 새 이미지가 업로드된 경우
      if (book.coverImage) {
        // 기존 이미지가 있으면 삭제
        // book.coverImage가 /uploads/filename.ext 형태라고 가정
        const oldImageFileName = path.basename(book.coverImage);
        const oldImagePath = path.join(__dirname, '../../uploads', oldImageFileName);
        if (fs.existsSync(oldImagePath)) {
          try {
            await fs.promises.unlink(oldImagePath);
            console.log('기존 이미지 삭제 성공:', oldImagePath);
          } catch (unlinkError) {
            console.error('기존 이미지 삭제 실패:', unlinkError);
            // 여기서 오류를 반환할 수도 있지만, 일단 진행하도록 함
          }
        }
      }
      // `addBook`과 동일하게 상대 경로 저장 또는 전체 URL 저장
      // const backendUrl = process.env.BACKEND_URL || 'https://habitus33-api.onrender.com';
      updateData.coverImage = `/uploads/${coverImageFile.filename}`; 
    } else if (removeCoverImage === 'true' && book.coverImage) {
      // 이미지 삭제 요청이 있고 기존 이미지가 있는 경우 (프론트에서 removeCoverImage='true' 파라미터 전송 시)
      const oldImageFileName = path.basename(book.coverImage);
      const oldImagePath = path.join(__dirname, '../../uploads', oldImageFileName);
      if (fs.existsSync(oldImagePath)) {
        try {
          await fs.promises.unlink(oldImagePath);
          console.log('요청에 의한 이미지 삭제 성공:', oldImagePath);
          updateData.coverImage = ''; // DB에서 이미지 경로 제거
        } catch (unlinkError) {
          console.error('요청에 의한 이미지 삭제 실패:', unlinkError);
        }
      } else {
        updateData.coverImage = ''; // 파일이 없어도 DB에서는 제거
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ message: '변경할 내용이 없습니다.', book });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { $set: updateData },
      { new: true }
    ).select('-__v');

    if (!updatedBook) {
      return res.status(500).json({ message: '책 정보 업데이트 중 오류가 발생했습니다.' });
    }

    res.status(200).json(updatedBook);

  } catch (error) {
    console.error('책 정보 업데이트 중 오류 발생:', error);
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ message: `파일 업로드 오류: ${error.message}` });
    }
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 책 현재 페이지 또는 상태 업데이트 (이 함수는 주로 진행상황만 업데이트)
export const updateBookProgress = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?._id;
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
    const userId = req.user?._id;

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

    // Delete associated cover image if it exists
    if (book.coverImage) {
      const oldImageFileName = path.basename(book.coverImage);
      const oldImagePath = path.join(__dirname, '../../uploads', oldImageFileName);
      if (fs.existsSync(oldImagePath)) {
        try {
          await fs.promises.unlink(oldImagePath);
          console.log('책 삭제 시 연관 이미지 삭제 성공:', oldImagePath);
        } catch (unlinkError) {
          console.error('책 삭제 시 연관 이미지 삭제 실패:', unlinkError);
        }
      }
    }

    res.status(200).json({ message: '책이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('책 삭제 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 여러 ID로 책 일괄 조회
export const getBooksByIds = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { bookIds } = req.body; // 요청 본문에서 bookIds 배열을 가져옵니다.

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // bookIds 유효성 검사: 배열 형태인지, 비어있지 않은지 확인합니다.
    if (!bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({ message: '유효한 책 ID 목록을 제공해주세요.' });
    }

    // Ensure all book IDs are valid MongoDB ObjectIds
    const validBookIds = bookIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validBookIds.length !== bookIds.length) {
        return res.status(400).json({ message: '제공된 ID 중 일부가 유효하지 않습니다.' });
    }

    // MongoDB에서 $in 연산자를 사용하여 여러 ID에 해당하는 책을 조회합니다.
    // 동시에 userId 조건을 추가하여 요청한 사용자의 책만 가져오도록 보안을 강화합니다.
    // 필요한 필드만 선택하여 반환합니다 (예: _id, title).
    const books = await Book.find({
      _id: { $in: validBookIds.map(id => new mongoose.Types.ObjectId(id)) },
      userId: new mongoose.Types.ObjectId(userId),
    }).select('_id title author coverImage'); // 필요한 필드만 선택

    // 조회된 책들을 요청된 bookIds 순서대로 정렬할 수도 있으나,
    // 클라이언트에서 ID를 이미 가지고 있으므로, 반환된 배열을 매핑하여 사용하면 됩니다.
    // 여기서는 MongoDB가 반환하는 순서대로 줍니다.
    // 필요하다면, 다음과 같이 순서를 맞출 수 있습니다:
    // const orderedBooks = bookIds.map(id => books.find(book => book._id.toString() === id)).filter(Boolean);

    res.status(200).json(books);
  } catch (error) {
    console.error('여러 책 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 책 정보 수정 함수 (updateBook 또는 유사한 이름)가 있다면, 
// 해당 함수에서도 coverImage 처리 로직을 동일하게 수정해야 합니다.
// 예를 들어, 아래와 같이 updateBook 함수가 있다고 가정하고 수정합니다.

export const updateBook = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?._id;
    const { title, author, totalPages, currentPage, isbn, category, readingPurpose, status, purchaseLink } = req.body;
    const coverImageFile = req.file as Express.Multer.File;

    const book = await Book.findOne({ _id: bookId, userId });

    if (!book) {
      return res.status(404).json({ message: '책을 찾을 수 없거나 권한이 없습니다.' });
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (totalPages) book.totalPages = parseInt(totalPages, 10);
    if (isbn) book.isbn = isbn;
    if (category) book.category = category;
    if (readingPurpose) book.readingPurpose = readingPurpose;
    if (status) book.status = status;
    if (purchaseLink) book.purchaseLink = purchaseLink;

    if (coverImageFile && coverImageFile.filename) {
      const backendUrl = process.env.BACKEND_URL || 'https://habitus33-api.onrender.com';
      book.coverImage = `/uploads/${coverImageFile.filename}`;
    } else if (req.body.coverImage === '' || req.body.removeCoverImage === 'true') {
      book.coverImage = '';
    }

    if (currentPage !== undefined && totalPages) {
      const numCurrentPage = parseInt(currentPage, 10);
      const numTotalPages = parseInt(totalPages, 10);
      if (numCurrentPage >= 0 && numTotalPages > 0) {
        book.currentPage = numCurrentPage;
        book.completionPercentage = Math.round((numCurrentPage / numTotalPages) * 100);
        if (numCurrentPage === numTotalPages) {
          book.status = 'completed';
        }
      }
    }    

    const updatedBook = await book.save();
    res.status(200).json(updatedBook);
  } catch (error) {
    console.error('책 정보 수정 중 오류 발생:', error);
    if (error instanceof multer.MulterError) {
        return res.status(400).json({ message: `파일 업로드 오류: ${error.message}` });
    }
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// PDF 파일 업로드
export const uploadPdf = async (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;
    const userId = req.user?._id;
    const pdfFile = req.file as Express.Multer.File;

    console.log(`[uploadPdf] Starting PDF upload for book ${bookId}`);
    console.log(`[uploadPdf] User ID: ${userId}`);
    console.log(`[uploadPdf] File info:`, pdfFile ? {
      originalname: pdfFile.originalname,
      filename: pdfFile.filename,
      size: pdfFile.size,
      mimetype: pdfFile.mimetype
    } : 'No file');

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    if (!pdfFile) {
      return res.status(400).json({ message: 'PDF 파일을 선택해주세요.' });
    }

    // 책이 존재하고 사용자 소유인지 확인
    const book = await Book.findOne({ _id: bookId, userId });
    if (!book) {
      // 업로드된 파일 삭제 (권한이 없는 경우)
      try {
        await fs.promises.unlink(pdfFile.path);
        console.log(`[uploadPdf] Unauthorized file deleted: ${pdfFile.path}`);
      } catch (unlinkError) {
        console.error(`[uploadPdf] Failed to delete unauthorized file:`, unlinkError);
      }
      return res.status(404).json({ message: '해당 책을 찾을 수 없거나 권한이 없습니다.' });
    }

    // 기존 PDF 파일이 있다면 삭제
    if (book.pdfUrl) {
      const oldPdfFileName = path.basename(book.pdfUrl);
      const oldPdfPath = path.join(__dirname, '../../uploads/pdfs', oldPdfFileName);
      if (fs.existsSync(oldPdfPath)) {
        try {
          await fs.promises.unlink(oldPdfPath);
          console.log(`[uploadPdf] Old PDF file deleted: ${oldPdfPath}`);
        } catch (unlinkError) {
          console.error(`[uploadPdf] Failed to delete old PDF file:`, unlinkError);
        }
      }
    }

    // PDF URL 생성 (상대 경로)
    const pdfUrl = `/uploads/pdfs/${pdfFile.filename}`;
    const pdfFileSize = pdfFile.size;

    console.log(`[uploadPdf] Updating book with PDF info - URL: ${pdfUrl}, Size: ${pdfFileSize}`);

    // Book 모델 업데이트
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      { 
        $set: { 
          pdfUrl: pdfUrl,
          pdfFileSize: pdfFileSize
        } 
      },
      { new: true }
    ).select('-__v');

    if (!updatedBook) {
      // 업로드된 파일 삭제 (업데이트 실패 시)
      try {
        await fs.promises.unlink(pdfFile.path);
        console.log(`[uploadPdf] File deleted due to update failure: ${pdfFile.path}`);
      } catch (unlinkError) {
        console.error(`[uploadPdf] Failed to delete file after update failure:`, unlinkError);
      }
      return res.status(500).json({ message: '책 정보 업데이트 중 오류가 발생했습니다.' });
    }

    console.log(`[uploadPdf] PDF upload successful for book ${bookId}`);

    res.status(200).json({
      message: 'PDF 파일이 성공적으로 업로드되었습니다.',
      book: updatedBook,
      pdfInfo: {
        originalName: pdfFile.originalname,
        url: pdfUrl,
        size: pdfFileSize
      }
    });

  } catch (error) {
    console.error('[uploadPdf] PDF 업로드 중 오류 발생:', error);
    
    // 에러 발생 시 업로드된 파일 삭제
    const pdfFile = req.file as Express.Multer.File;
    if (pdfFile && pdfFile.path) {
      try {
        await fs.promises.unlink(pdfFile.path);
        console.log(`[uploadPdf] File deleted due to error: ${pdfFile.path}`);
      } catch (unlinkError) {
        console.error(`[uploadPdf] Failed to delete file after error:`, unlinkError);
      }
    }

    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'PDF 파일 크기는 20MB를 초과할 수 없습니다.' });
      }
      return res.status(400).json({ message: `파일 업로드 오류: ${error.message}` });
    }
    
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}; 
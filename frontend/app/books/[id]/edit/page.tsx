'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';
import Button from '@/components/common/Button';
import { books as booksApi } from '@/lib/api';

// API base URL - this should match what's used elsewhere in the app
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// 장르 옵션
const genres = [
  { id: "fiction", name: "소설" },
  { id: "non-fiction", name: "비소설" },
  { id: "self-development", name: "자기계발" },
  { id: "business", name: "경영/경제" },
  { id: "science", name: "과학" },
  { id: "history", name: "역사" },
  { id: "philosophy", name: "철학" },
  { id: "psychology", name: "심리학" },
  { id: "art", name: "예술" },
  { id: "technology", name: "기술" },
  { id: "biography", name: "전기/회고록" },
  { id: "essay", name: "에세이" }
];

// 독서 목적 옵션
const readingPurposes = [
  { id: "exam_prep", name: "시험/인증 대비", description: "시험 합격, 자격 취득, 평가 대비" },
  { id: "practical_knowledge", name: "실무지식/기술 습득", description: "업무, 프로젝트, 실전 적용" },
  { id: "humanities_self_reflection", name: "인문 소양/자기 성찰", description: "사고력, 가치관, 내적 성장" },
  { id: "reading_pleasure", name: "읽는 재미", description: "감동, 즐거움, 스트레스 해소" }
];

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 폼 상태
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    totalPages: "",
    readingPurpose: "",
    currentPage: "0",
    readingSpeed: ""
  });
  
  // 이미지 프리뷰
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // 폼 제출 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 책 정보 불러오기
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchBookData = async () => {
      if (!bookId) return;
      
      try {
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        // Set a timeout to abort the fetch if it takes too long
        const timeoutId = setTimeout(() => {
          controller.abort();
          console.error('API request timed out');
          if (isMounted) {
            setError('서버 응답이 너무 오래 걸립니다. 네트워크 연결을 확인하세요.');
            setIsLoading(false);
          }
        }, 20000); // Increased to 20 seconds timeout

        // Try using the booksApi first with proper error handling
        try {
          const book = await booksApi.getById(bookId);
          
          if (isMounted) {
            // 폼 데이터 설정
            setFormData({
              title: book.title || "",
              author: book.author || "",
              genre: book.category || book.genre || "",
              totalPages: book.totalPages?.toString() || "",
              readingPurpose: book.readingPurpose || book.readingGoal || "",
              currentPage: book.currentPage?.toString() || "0",
              readingSpeed: book.readingSpeed?.toString() || ""
            });
            
            // 커버 이미지 설정
            if (book.coverImage) {
              setCoverImage(book.coverImage);
            }
            
            setIsLoading(false);
          }
          
          clearTimeout(timeoutId);
          return;
        } catch (apiError) {
          console.error('Error fetching with booksApi:', apiError);
          // Continue to fallback method if booksApi fails
        }

        // Fallback to direct fetch if booksApi fails
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`책 정보를 불러오는 데 실패했습니다. Status: ${response.status}`);
        }

        let bookData;
        try {
          bookData = await response.json();
        } catch (jsonErr) {
          console.error('Book JSON 파싱 오류:', jsonErr);
          throw new Error('서버 응답을 처리하는 데 실패했습니다.');
        }
        
        // 백엔드에서 반환하는 데이터 구조에 맞게 처리
        const book = bookData && bookData._id ? bookData : (bookData && bookData.book ? bookData.book : null);
        
        if (!book) {
          throw new Error('책 데이터 형식이 올바르지 않습니다.');
        }
        
        // 폼 데이터 설정
        if (isMounted) {
          setFormData({
            title: book.title || "",
            author: book.author || "",
            genre: book.category || book.genre || "",
            totalPages: book.totalPages?.toString() || "",
            readingPurpose: book.readingPurpose || book.readingGoal || "",
            currentPage: book.currentPage?.toString() || "0",
            readingSpeed: book.readingSpeed?.toString() || ""
          });
          
          // 커버 이미지 설정
          if (book.coverImage) {
            setCoverImage(book.coverImage);
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          console.error('책 데이터 로딩 오류:', err);
          if (isMounted) {
            setError(err.message);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBookData();
    
    // Cleanup function
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [bookId, router]);
  
  // 핸들러 함수들
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // 숫자만 허용
    if (value === "" || /^\d+$/.test(value)) {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    
    // 파일 크기 확인 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      setError("이미지 크기는 5MB 이하여야 합니다");
      setIsUploading(false);
      return;
    }
    
    // 이미지 타입 확인
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다");
      setIsUploading(false);
      return;
    }
    
    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setCoverImage(e.target?.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };
  
  const clearCoverImage = () => {
    setCoverImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.author) {
      setError('Title and author are required');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Get authentication token - use the same token key as in the api.ts file
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setIsSubmitting(false);
        return;
      }
      
      console.log('Updating book with ID:', bookId);
      console.log('Update data:', formData);
      
      // Store additional book metadata in localStorage since backend doesn't support updating these fields
      try {
        // Get existing book metadata or initialize empty object
        const bookMetadataStr = localStorage.getItem('book-metadata') || '{}';
        const bookMetadata = JSON.parse(bookMetadataStr);
        
        // Update metadata for this specific book
        bookMetadata[bookId] = {
          ...bookMetadata[bookId],
          readingPurpose: formData.readingPurpose,
          genre: formData.genre,
          readingSpeed: formData.readingSpeed,
          // Store last updated timestamp
          updatedAt: new Date().toISOString()
        };
        
        // Save back to localStorage
        localStorage.setItem('book-metadata', JSON.stringify(bookMetadata));
        console.log('Saved additional book metadata to localStorage');
      } catch (metadataError) {
        console.error('Error saving book metadata to localStorage:', metadataError);
        // Continue with the API call - this is just enhancement data
      }
      
      // Format the data for the progress endpoint
      const progressData = {
        currentPage: parseInt(formData.currentPage) || 0,
        // Determine status based on currentPage
        status: parseInt(formData.currentPage) >= parseInt(formData.totalPages) 
          ? 'completed' 
          : (parseInt(formData.currentPage) > 0 ? 'in_progress' : 'not_started')
      };
      
      // Try using the booksApi first
      try {
        const response = await booksApi.update(bookId, progressData);
        console.log('Book updated successfully:', response);
        router.push(`/books/${bookId}`);
        return;
      } catch (apiError) {
        console.error('Error updating book with booksApi:', apiError);
        // Continue to fallback if booksApi fails
      }
      
      // Fallback to direct fetch if booksApi fails
      const response = await fetch(`${API_BASE_URL}/books/${bookId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(progressData)
      });
      
      if (!response.ok) {
        console.error('Fetch error status:', response.status);
        console.error('Response text:', await response.text());
        throw new Error(`Error updating book: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Book updated successfully via fetch:', data);
      router.push(`/books/${bookId}`);
    } catch (error) {
      console.error('Error updating book:', error);
      setError(`Failed to update book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p>책 정보 로딩 중...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href={`/books/${bookId}`} 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            <span>책 상세 페이지로 돌아가기</span>
          </Link>
        </div>
        
        {/* 메인 카드 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">책 정보 수정</h1>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 왼쪽 컬럼: 텍스트 필드 */}
              <div className="space-y-6">
                {/* 제목 */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="책 제목을 입력하세요"
                  />
                </div>
                
                {/* 저자 */}
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                    저자 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="저자 이름을 입력하세요"
                  />
                </div>
                
                {/* 장르/카테고리 */}
                <div>
                  <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                    장르
                  </label>
                  <select
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">장르 선택 (선택사항)</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* 독서 목적 */}
                <div>
                  <label htmlFor="readingPurpose" className="block text-sm font-medium text-gray-700 mb-1">
                    독서 목적
                  </label>
                  <select
                    id="readingPurpose"
                    name="readingPurpose"
                    value={formData.readingPurpose}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="">독서 목적 선택 (선택사항)</option>
                    {readingPurposes.map((purpose) => (
                      <option key={purpose.id} value={purpose.id}>
                        {purpose.name} - {purpose.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* 오른쪽 컬럼: 페이지 수 및 이미지 */}
              <div className="space-y-6">
                {/* 총 페이지 수 */}
                <div>
                  <label htmlFor="totalPages" className="block text-sm font-medium text-gray-700 mb-1">
                    총 페이지 수 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="totalPages"
                    name="totalPages"
                    value={formData.totalPages}
                    onChange={handleNumberInput}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="책의 총 페이지 수를 입력하세요"
                  />
                </div>
                
                {/* 현재 페이지 */}
                <div>
                  <label htmlFor="currentPage" className="block text-sm font-medium text-gray-700 mb-1">
                    현재 페이지 (이미 읽은 부분)
                  </label>
                  <input
                    type="text"
                    id="currentPage"
                    name="currentPage"
                    value={formData.currentPage}
                    onChange={handleNumberInput}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="현재까지 읽은 페이지를 입력하세요"
                  />
                </div>
                
                {/* 읽기 속도 - TS모드일 때만 표시 */}
                {formData.readingPurpose === 'ts_mode' && (
                  <div>
                    <label htmlFor="readingSpeed" className="block text-sm font-medium text-gray-700 mb-1">
                      읽기 속도 (페이지/시간) <span className="text-blue-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      id="readingSpeed"
                      name="readingSpeed"
                      value={formData.readingSpeed}
                      onChange={handleNumberInput}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="시간당 읽는 페이지 수"
                    />
                    <p className="mt-1 text-sm text-blue-600">
                      TS모드의 핵심 가치는 읽기 속도를 추적하여 독서 효율성을 높이는 것입니다.
                    </p>
                  </div>
                )}
                
                {/* 표지 이미지 업로드 (미구현) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    책 표지 이미지 (미구현)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                    <div className="space-y-1 text-center">
                      {coverImage ? (
                        <div className="relative mx-auto">
                          <img
                            src={coverImage}
                            alt="Book cover preview"
                            className="max-h-40 mx-auto mb-4 rounded"
                          />
                          <button
                            type="button"
                            onClick={clearCoverImage}
                            className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                          >
                            <FiX size={18} className="text-gray-700" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="text-xs text-gray-500">
                            표지 이미지 업로드 기능은 아직 구현되지 않았습니다
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 버튼 영역 */}
            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                variant="default"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? '저장 중...' : '변경사항 저장하기'}
              </Button>
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => router.push(`/books/${bookId}`)}
              >
                취소
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
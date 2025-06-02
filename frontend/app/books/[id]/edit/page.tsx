'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';
import Button from '@/components/common/Button';
// import { books as booksApi } from '@/lib/api'; // 직접 fetch를 사용하므로 주석 처리 또는 삭제 가능

// API base URL - 파일 최상단으로 이동하여 정의
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
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    totalPages: "",
    readingPurpose: "",
    currentPage: "0",
    readingSpeed: ""
  });
  
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const signal = controller.signal;
    
    const fetchBookData = async () => {
      if (!bookId) {
        setIsLoading(false);
        setError("책 ID가 유효하지 않습니다.");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/auth/login');
          return;
        }

        const timeoutId = setTimeout(() => {
          if (isMounted) { // Check isMounted before calling controller.abort
            controller.abort();
            setError('서버 응답이 너무 오래 걸립니다. 네트워크 연결을 확인하세요.');
            setIsLoading(false);
          }
        }, 20000);

        const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`책 정보를 불러오는 데 실패했습니다. Status: ${response.status} - ${errorText}`);
        }

        const bookData = await response.json();
        const book = bookData && bookData._id ? bookData : (bookData && bookData.book ? bookData.book : null);
        
        if (!book) {
          throw new Error('책 데이터 형식이 올바르지 않습니다.');
        }
        
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
          
          if (book.coverImage) {
            // 이미지가 절대 경로(http로 시작)가 아니면 API_BASE_URL (또는 NEXT_PUBLIC_API_URL)을 앞에 붙여 완전한 URL로 만듭니다.
            // 백엔드가 /uploads/image.jpg 처럼 상대 경로만 반환한다고 가정.
            // 만약 백엔드가 완전한 URL을 반환한다면 이 로직은 필요 없을 수 있습니다.
            // process.env.NEXT_PUBLIC_API_URL이 /api로 끝난다면, 이미지 경로는 그 이전이어야 합니다.
            // 예: API_URL = http://localhost:8000, coverImage = /uploads/image.jpg -> http://localhost:8000/uploads/image.jpg
            const baseUrlForImage = process.env.NEXT_PUBLIC_API_URL?.replace('/api', ''); // /api 접미사 제거
            setCoverImage(book.coverImage.startsWith('http') ? book.coverImage : `${baseUrlForImage || ''}${book.coverImage}`);
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted by timeout or unmount');
        } else if (isMounted) {
          setError(err.message || "책 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBookData();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [bookId, router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === "" || /^\d+$/.test(value)) {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setError(null);
    setIsUploading(true);
    
    if (file.size > 5 * 1024 * 1024) {
      setError("이미지 크기는 5MB 이하여야 합니다");
      setIsUploading(false);
      setCoverImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다");
      setIsUploading(false);
      setCoverImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
      setCoverImageFile(file);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setError("이미지를 읽는 중 오류가 발생했습니다.");
      setIsUploading(false);
      setCoverImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };
  
  const clearCoverImage = () => {
    setCoverImage(null); // 현재 표시되는 이미지 (기존 또는 새 미리보기) 제거
    setCoverImageFile(null); // 새로 업로드하려던 파일 제거
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.totalPages) {
      setError('제목, 저자, 총 페이지 수는 필수 항목입니다.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        setIsSubmitting(false); // 추가
        return;
      }
      
      const apiFormData = new FormData();
      apiFormData.append('title', formData.title.trim());
      apiFormData.append('author', formData.author.trim());
      apiFormData.append('totalPages', formData.totalPages);
      apiFormData.append('currentPage', formData.currentPage || '0');
      apiFormData.append('category', formData.genre || '');
      
      if (formData.readingPurpose) {
        apiFormData.append('readingPurpose', formData.readingPurpose);
      }
      if (formData.readingSpeed) {
        apiFormData.append('readingSpeed', formData.readingSpeed);
      }

      if (coverImageFile) { // 새 이미지 파일이 선택되었을 경우
        apiFormData.append('coverImage', coverImageFile);
      } else if (coverImage === null && !coverImageFile) { 
        // 사용자가 'X' 버튼을 눌러 기존 이미지를 포함하여 모든 이미지를 제거하려는 경우
        // 백엔드에 이 의도를 전달하는 방법이 필요. 예: `coverImage` 필드에 빈 문자열 또는 특정 플래그 전송
        // apiFormData.append('coverImage', ''); // 또는 apiFormData.append('removeCoverImage', 'true');
        // 이 부분은 백엔드 API 명세에 따라 조정 필요. 여기서는 기존 이미지를 유지하도록 아무것도 보내지 않음.
        // 명시적으로 삭제하려면 아래 주석 해제하고 백엔드에서 처리.
        // apiFormData.append('coverImageAction', 'remove'); // 예시
      }
      // coverImageFile이 없고 coverImage가 null도 아니면 (즉, 기존 이미지가 있고 변경 안함) coverImage 필드는 보내지 않음.

      const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: apiFormData,
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          errorData = { message: responseText || `책 정보 업데이트에 실패했습니다. (Status: ${response.status})` };
        }
        throw new Error(errorData.message || errorData.error || `책 정보 업데이트에 실패했습니다.`);
      }
      
      // 성공 시, 필요하다면 응답에서 업데이트된 책 정보를 받아 상태를 업데이트할 수 있음.
      // const updatedBook = JSON.parse(responseText);
      // setCoverImage(updatedBook.coverImage); // 예시: 백엔드가 새 이미지 URL 반환 시

      router.push(`/books/${bookId}`);

    } catch (err: any) {
      setError(err.message || '책 정보 업데이트 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">책 정보 로딩 중...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href={`/books/${bookId}`} 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            <span>책 상세 페이지로 돌아가기</span>
          </Link>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">책 정보 수정</h1>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Text Fields (No change from previous structure) */}
              <div className="space-y-6">
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
              
              {/* Right Column: Page numbers and Image */}
              <div className="space-y-6">
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
                
                {/* Reading speed - only visible in TS mode (existing logic) */}
                {/*
                {formData.readingPurpose === 'ts_mode' && ( 
                  ...
                )}
                */}
                
                {/* Cover Image Upload UI (Updated) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    책 표지 이미지
                  </label>
                  <div className="mt-1">
                    {coverImage ? (
                      <div className="relative w-40 h-56 mx-auto border-2 border-gray-300 rounded-md bg-gray-100 shadow-sm">
                        <img
                          src={coverImage} // This will be existing URL or new DataURL
                          alt="Book cover preview"
                          className="object-contain w-full h-full rounded-md" // object-contain to prevent cropping
                        />
                        <button
                          type="button"
                          onClick={clearCoverImage}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-500 transition-colors"
                          aria-label="이미지 삭제"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-40 h-56 mx-auto border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <FiUpload size={32} className="text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">클릭하여 업로드</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (최대 5MB)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*" // client-side type filtering
                    />
                    {isUploading && (
                      <p className="text-sm text-indigo-600 mt-2 text-center">이미지 처리 중...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                variant="default"
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting || isUploading} // Disable if uploading image
              >
                {isSubmitting ? '저장 중...' : '변경사항 저장하기'}
              </Button>
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => router.push(`/books/${bookId}`)}
                disabled={isSubmitting || isUploading}
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
"use client";

import { useState, useRef, ChangeEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiUpload, FiX, FiFileText } from "react-icons/fi";
import { PdfUploadComponent } from "@/components/books";
import { PdfMetadata } from "@/lib/pdfUtils";

// 장르 옵션
const genres = [
  { id: "study_exam_prep", name: "학습/수험서" },
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
  { 
    id: "exam_prep", 
    name: "시험/인증 대비", 
    mobileName: "시험 대비",
    description: "정해진 목표를 달성하기 위한 지식 습득",
    mobileDescription: "시험 준비"
  },
  { 
    id: "practical_knowledge", 
    name: "실무지식/기술 습득", 
    mobileName: "실무 기술",
    description: "업무나 생활에 바로 적용할 수 있는 기술 습득",
    mobileDescription: "실무 적용"
  },
  { 
    id: "humanities_self_reflection", 
    name: "인문 소양/자기 성찰", 
    mobileName: "인문 성찰",
    description: "생각의 깊이를 더하고, 스스로를 돌아보기 위한 여정",
    mobileDescription: "성찰과 사고"
  },
  { 
    id: "reading_pleasure", 
    name: "읽는 재미", 
    mobileName: "읽는 재미",
    description: "독서 자체의 즐거움을 느끼고 마음의 휴식을 얻기 위함",
    mobileDescription: "독서의 즐거움"
  }
];

// Suspense로 감싸진 컴포넌트
function NewBookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // URL 파라미터에서 타입 확인
  const [bookType, setBookType] = useState<'book' | 'notebook'>('book');
  
  // 폼 상태
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    totalPages: "",
    readingPurpose: "",
    currentPage: "0",
    isbn: "",
    category: "자기계발",
    coverImage: "",
    purchaseLink: ""
  });
  
  // URL 파라미터 확인
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'notebook') {
      setBookType('notebook');
      // 노트북의 경우 기본값 설정
      setFormData(prev => ({
        ...prev,
        author: "나", // 노트북은 작성자가 본인
        totalPages: "1", // 기본값
        genre: "notebook",
        category: "노트북"
      }));
    } else {
      setBookType('book');
    }
  }, [searchParams]);
  
  // 이미지 프리뷰
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // PDF 업로드 상태
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfMetadata, setPdfMetadata] = useState<PdfMetadata | null>(null);
  const [inputMethod, setInputMethod] = useState<'manual' | 'pdf'>('manual'); // 입력 방식
  
  // 폼 제출 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
      setCoverImageFile(file);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };
  
  const clearCoverImage = () => {
    setCoverImage(null);
    setCoverImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  // PDF 업로드 핸들러
  const handlePdfSelected = (file: File, metadata: PdfMetadata) => {
    setPdfFile(file);
    setPdfMetadata(metadata);
    setInputMethod('pdf');
    
    // 폼 데이터 자동 채우기
    setFormData(prev => ({
      ...prev,
      title: metadata.title || file.name.replace(/\.pdf$/i, ''),
      author: metadata.author || '',
      totalPages: metadata.totalPages > 0 ? metadata.totalPages.toString() : ''
    }));
    
    setError(null);
  };
  
  const handlePdfError = (error: string) => {
    setError(error);
  };
  
  const clearPdfFile = () => {
    setPdfFile(null);
    setPdfMetadata(null);
    setInputMethod('manual');
    
    // 폼 초기화 (PDF에서 자동 입력된 내용만)
    if (inputMethod === 'pdf') {
      setFormData(prev => ({
        ...prev,
        title: '',
        author: '',
        totalPages: ''
      }));
    }
  };
  
  const switchToManualInput = () => {
    setInputMethod('manual');
    // PDF 파일은 유지하되 수동 입력 모드로 변경
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Log the purchaseLink value for debugging
    console.log("[DEBUG] purchaseLink to be submitted:", `'${formData.purchaseLink}'`);

    // 필수 필드 검증
    if (!formData.title || !formData.author) {
      setError("제목과 저자를 입력해주세요.");
      return;
    }
    
    if (bookType === 'book' && !formData.totalPages) {
      setError("책의 경우 총 페이지 수를 입력해주세요.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/auth/login");
        return;
      }
      
      // FormData 생성
      const apiFormData = new FormData();
      apiFormData.append('title', formData.title.trim());
      apiFormData.append('author', formData.author.trim());
      apiFormData.append('bookType', bookType.toUpperCase()); // BOOK 또는 NOTEBOOK
      
      if (bookType === 'book') {
        apiFormData.append('totalPages', formData.totalPages); // 백엔드에서 parseInt 필요
        apiFormData.append('currentPage', formData.currentPage || '0');
      } else {
        // 노트북의 경우 기본값
        apiFormData.append('totalPages', '1');
        apiFormData.append('currentPage', '0');
      }
      
      apiFormData.append('category', formData.genre || ''); // genre 필드를 category로 매핑. 빈 문자열로 전송
      
      if (formData.readingPurpose) {
        apiFormData.append('readingPurpose', formData.readingPurpose);
      }

      // 이미지 파일이 있으면 FormData에 추가 - 책 모드에서만
      if (bookType === 'book' && coverImageFile) {
        apiFormData.append('coverImage', coverImageFile); // 'coverImage'는 백엔드에서 받을 필드명
      }

      apiFormData.append('isbn', formData.isbn);
      
      // 구매링크는 책 모드에서만 추가
      if (bookType === 'book') {
        apiFormData.append('purchaseLink', formData.purchaseLink);
      }

      console.log("전송할 FormData:", apiFormData); // FormData 내용을 직접 로깅하기는 어려움
      console.log("전송 토큰:", token.substring(0, 10) + "...");
      
      // 먼저 책 등록
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: apiFormData // FormData 객체 전달
      });
      
      console.log("API 응답 상태:", response.status);
      
      const responseText = await response.text();
      console.log("API 응답 텍스트:", responseText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: responseText || "성장의 기록을 추가하는 데 잠시 문제가 생겼어요. 잠시 후 다시 시도해 주세요." };
        }
        
        console.error("API 오류:", errorData);
        throw new Error(errorData.message || errorData.error || "등록에 실패했습니다. 다시 시도해주세요.");
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("등록 성공:", data);
      } catch (e) {
        console.error("응답 파싱 오류:", e);
        throw new Error("서버 응답을 처리하는 데 잠시 어려움이 있어요.");
      }
      
      // 책 등록 성공 후 PDF 업로드 (있는 경우)
      const bookId = data._id || (data.book && data.book._id);
      
      if (!bookId) {
        console.error("책 ID를 찾을 수 없습니다:", data);
        throw new Error("성장의 기록은 잘 만들어졌는데, 잠시 길을 잃은 것 같아요. 다시 확인해 주세요.");
      }
      
      // PDF 파일이 있으면 업로드
      if (pdfFile && bookType === 'book') {
        try {
          const pdfFormData = new FormData();
          pdfFormData.append('pdfFile', pdfFile);
          
          const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books/${bookId}/upload-pdf`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`
            },
            body: pdfFormData
          });
          
          if (!pdfResponse.ok) {
            console.error("PDF 업로드 실패:", await pdfResponse.text());
            // PDF 업로드 실패는 전체 등록을 실패시키지 않음
            setError("책은 등록되었지만 PDF 업로드에 실패했습니다. 나중에 다시 시도해주세요.");
          } else {
            console.log("PDF 업로드 성공");
          }
        } catch (pdfError) {
          console.error("PDF 업로드 오류:", pdfError);
          setError("책은 등록되었지만 PDF 업로드에 실패했습니다. 나중에 다시 시도해주세요.");
        }
      }


      
      // 약간의 딜레이 후 이동 (UX 개선)
      setTimeout(() => {
        router.push(`/books/${bookId}`);
      }, 500);
      
    } catch (err: any) {
      console.error("책 등록 오류:", err);
      setError(err.message || "등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-6 px-2 sm:px-4 text-gray-200 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            href="/books" 
            className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors text-xs font-mono"
          >
            <FiArrowLeft className="mr-1" />
            {/* 모바일용 단축 텍스트 */}
            <span className="block sm:hidden">돌아가기</span>
            {/* PC용 기존 텍스트 */}
            <span className="hidden sm:block">나의 도서관으로 돌아가기</span>
          </Link>
        </div>
        
        {/* 메인 카드 */}
        <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-cyan-500/10 border border-cyan-500/40 p-4">
          <h1 className="text-xl font-bold text-cyan-300 mb-3 font-orbitron tracking-wide">
            {bookType === 'notebook' ? 'NEW NOTEBOOK' : 'NEW BOOK'}
          </h1>
          {bookType === 'notebook' && (
            <p className="text-purple-400 text-sm mb-3">
              자유로운 메모와 생각을 담을 개인 노트북을 만들어보세요
            </p>
          )}
          
          {error && (
            <div className="bg-red-900/30 border-l-4 border-red-500 p-2 rounded-md mb-3">
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 왼쪽 컬럼: 텍스트 필드 */}
              <div className="space-y-3">
                {/* 제목 */}
                <div>
                  <label htmlFor="title" className="block text-xs font-semibold text-cyan-300 mb-0.5 font-barlow">
                    제목 <span className="text-red-400">*</span>
                  </label>
                  {/* 모바일용 입력 필드 */}
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-cyan-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-sm font-mono text-gray-100 placeholder-gray-400 transition-all block sm:hidden"
                    placeholder="책 제목"
                  />
                  {/* PC용 입력 필드 */}
                  <input
                    type="text"
                    id="title-desktop"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-cyan-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-sm font-mono text-gray-100 placeholder-gray-400 transition-all hidden sm:block"
                    placeholder="이번엔 어떤 내용을 추가할 예정인가요?"
                  />
                </div>
                
                {/* 저자 */}
                <div>
                  <label htmlFor="author" className="block text-xs font-semibold text-cyan-300 mb-0.5 font-barlow">
                    {bookType === 'notebook' ? '작성자' : '글쓴이'} <span className="text-red-400">*</span>
                  </label>
                  {/* 모바일용 입력 필드 */}
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    disabled={bookType === 'notebook'}
                    className={`w-full px-3 py-2 border border-cyan-500/40 rounded-lg ${
                      bookType === 'notebook' ? 'bg-gray-600/40 cursor-not-allowed' : 'bg-gray-700/60'
                    } focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-sm font-mono text-gray-100 placeholder-gray-400 transition-all block sm:hidden`}
                    placeholder={bookType === 'notebook' ? '나' : '저자명'}
                  />
                  {/* PC용 입력 필드 */}
                  <input
                    type="text"
                    id="author-desktop"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    disabled={bookType === 'notebook'}
                    className={`w-full px-3 py-2 border border-cyan-500/40 rounded-lg ${
                      bookType === 'notebook' ? 'bg-gray-600/40 cursor-not-allowed' : 'bg-gray-700/60'
                    } focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-sm font-mono text-gray-100 placeholder-gray-400 transition-all hidden sm:block`}
                    placeholder={bookType === 'notebook' ? '나' : '누구의 지혜와 함께할 예정인가요?'}
                  />
                </div>
                
                {/* 장르 */}
                <div>
                  <label htmlFor="genre" className="block text-xs font-semibold text-purple-300 mb-0.5 font-barlow">
                    장르 <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-purple-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-purple-400/60 focus:border-purple-400 text-sm font-mono text-gray-100 placeholder-gray-400 transition-all appearance-none"
                  >
                    <option value="">어떤 분야인가요?</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* 총 페이지 수 - 책 모드에서만 표시 */}
                {bookType === 'book' && (
                  <div>
                    <label htmlFor="totalPages" className="block text-xs font-semibold text-cyan-300 mb-0.5 font-barlow">
                      총 페이지 수 <span className="text-red-400">*</span>
                    </label>
                    {/* 모바일용 입력 필드 */}
                    <input
                      type="text"
                      id="totalPages"
                      name="totalPages"
                      value={formData.totalPages}
                      onChange={handleNumberInput}
                      required
                      className="w-full px-3 py-2 border border-cyan-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-sm font-mono text-gray-100 placeholder-gray-400 transition-all block sm:hidden"
                      placeholder="총 페이지"
                    />
                    {/* PC용 입력 필드 */}
                    <input
                      type="text"
                      id="totalPages-desktop"
                      name="totalPages"
                      value={formData.totalPages}
                      onChange={handleNumberInput}
                      required
                      className="w-full px-3 py-2 border border-cyan-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-sm font-mono text-gray-100 placeholder-gray-400 transition-all hidden sm:block"
                      placeholder="총 몇 페이지의 성장 여정인가요?"
                    />
                  </div>
                )}
                
                {/* 읽는 목적 */}
                <div>
                  <label htmlFor="readingPurpose" className="block text-xs font-semibold text-emerald-300 mb-0.5 font-barlow">
                    목표
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {readingPurposes.map((purpose) => (
                      <div key={purpose.id} className="relative group">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, readingPurpose: purpose.id })}
                          className={`
                            w-full p-2 rounded border text-xs font-mono transition-all
                            ${formData.readingPurpose === purpose.id 
                              ? "border-emerald-400 bg-emerald-700/30 text-emerald-200 ring-1 ring-emerald-300"
                              : "border-gray-600 hover:border-emerald-500 bg-gray-700/60 text-gray-300 hover:text-emerald-300"
                            }
                          `}
                          aria-pressed={formData.readingPurpose === purpose.id}
                        >
                          {/* 모바일용 단축 텍스트 */}
                          <span className="truncate block sm:hidden">{purpose.mobileName}</span>
                          {/* PC용 기존 텍스트 */}
                          <span className="truncate hidden sm:block">{purpose.name}</span>
                        </button>
                        {/* 툴팁: group-hover 시 보이도록 설정 */}
                        <div 
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs p-2 
                                     bg-gray-900 text-gray-200 text-[10px] rounded-md shadow-lg 
                                     opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out z-10 
                                     pointer-events-none group-hover:pointer-events-auto"
                        >
                          {/* 모바일용 단축 설명 */}
                          <span className="block sm:hidden">{purpose.mobileDescription}</span>
                          {/* PC용 기존 설명 */}
                          <span className="hidden sm:block">{purpose.description}</span>
                           {/* 툴팁 꼬리 */}
                          <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 
                                        border-x-4 border-x-transparent border-t-4 border-t-gray-900">
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 현재 읽은 페이지 - 책 모드에서만 표시 */}
                {bookType === 'book' && (
                  <div>
                    <label htmlFor="currentPage" className="block text-xs font-semibold text-cyan-300 mb-0.5 font-barlow">
                      이미 읽은 페이지
                    </label>
                    {/* 모바일용 입력 필드 */}
                    <input
                      type="text"
                      id="currentPage"
                      name="currentPage"
                      value={formData.currentPage}
                      onChange={handleNumberInput}
                      className="w-full px-3 py-2 border border-cyan-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-sm font-mono text-gray-100 placeholder-gray-400 transition-all block sm:hidden"
                      placeholder="현재 페이지"
                    />
                    {/* PC용 입력 필드 */}
                    <input
                      type="text"
                      id="currentPage-desktop"
                      name="currentPage"
                      value={formData.currentPage}
                      onChange={handleNumberInput}
                      className="w-full px-3 py-2 border border-cyan-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-sm font-mono text-gray-100 placeholder-gray-400 transition-all hidden sm:block"
                      placeholder="어디까지 성장했는지 기록해둘까요?"
                    />
                  </div>
                )}
              </div>
              
              {/* 오른쪽 컬럼: PDF 업로드 및 이미지 업로드 */}
              <div className="flex flex-col items-center justify-start space-y-4">
                {/* PDF 업로드 - 책 모드에서만 표시 */}
                {bookType === 'book' && (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-purple-300 font-barlow">
                        <FiFileText className="inline mr-1" size={14} />
                        PDF 파일 업로드
                      </label>
                      {inputMethod === 'pdf' && (
                        <button
                          type="button"
                          onClick={switchToManualInput}
                          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          수동 입력
                        </button>
                      )}
                    </div>
                    
                    <PdfUploadComponent
                      onPdfSelected={handlePdfSelected}
                      onError={handlePdfError}
                      disabled={isSubmitting}
                      className="mb-2"
                    />
                    
                    {pdfFile && (
                      <div className="bg-purple-900/30 rounded-lg p-2 w-full text-xs border border-purple-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300">
                            📄 PDF에서 자동 추출된 정보가 폼에 입력되었습니다
                          </span>
                          <button
                            type="button"
                            onClick={clearPdfFile}
                            className="text-red-400 hover:text-red-300 transition-colors ml-2"
                            title="PDF 제거"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                        {inputMethod === 'pdf' && (
                          <p className="text-purple-400 mt-1">
                            필요시 아래에서 정보를 수정하실 수 있습니다.
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="bg-purple-900/20 rounded-md p-2 w-full text-[11px] text-purple-300 border border-purple-500/20">
                      <p>💡 PDF 업로드 시 제목, 저자, 페이지 수가 자동으로 입력됩니다.</p>
                    </div>
                  </div>
                )}
                
                {/* 표지 업로드 - 책 모드에서만 표시 */}
                {bookType === 'book' && (
                  <div className="w-full text-center">
                    <label className="block text-xs font-semibold text-cyan-300 mb-2 font-barlow">
                      표지
                    </label>
                    
                    {coverImage ? (
                      <div className="relative w-32 h-44 mx-auto border-2 border-cyan-500/40 rounded-md bg-gray-900/60 shadow-cyan-500/10">
                        <Image
                          src={coverImage}
                          alt="Book cover preview"
                          fill
                          className="object-cover rounded-md shadow-md"
                        />
                        <button
                          type="button"
                          onClick={clearCoverImage}
                          className="absolute -top-2 -right-2 bg-red-700 text-white rounded-full p-1 shadow-md hover:bg-red-500 transition-colors border border-red-400"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-44 mx-auto border-2 border-dashed border-cyan-500/40 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 bg-gray-900/60 transition-colors"
                      >
                        <FiUpload size={24} className="text-cyan-400 mb-1" />
                        <p className="text-xs text-cyan-300">클릭하여 표지 등록</p>
                        <p className="text-[10px] text-cyan-500 mt-0.5">JPG, PNG, WebP</p>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                    
                    {isUploading && (
                      <p className="text-xs text-cyan-400 mt-1">업로드 중...</p>
                    )}
                  </div>
                )}
                
                {/* 표지 안내 메시지 - 책 모드에서만 표시 */}
                {bookType === 'book' && (
                  <div className="bg-cyan-900/30 rounded-md p-2 w-full text-[11px] text-cyan-300 border border-cyan-500/20">
                    <p>💡 표지 등록은 선택이에요.</p>
                  </div>
                )}

                {/* 인터넷 서점 링크 - 책 모드에서만 표시 */}
                {bookType === 'book' && (
                  <div>
                    {/* 모바일용 단축 라벨 */}
                    <label htmlFor="purchaseLink" className="block text-xs font-semibold text-cyan-300 mb-0.5 font-barlow sm:hidden">
                      구매 링크 (선택)
                    </label>
                    {/* PC용 기존 라벨 */}
                    <label htmlFor="purchaseLink-desktop" className="hidden sm:block text-xs font-semibold text-cyan-300 mb-0.5 font-barlow">
                      인터넷 서점 구매 링크 (선택)
                    </label>
                    
                    {/* 모바일용 입력 필드 */}
                    <input
                      type="url"
                      id="purchaseLink"
                      name="purchaseLink"
                      value={formData.purchaseLink}
                      onChange={handleInputChange}
                      placeholder="구매 링크"
                      className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-xs placeholder-gray-500 caret-cyan-400 block sm:hidden"
                    />
                    {/* PC용 입력 필드 */}
                    <input
                      type="url"
                      id="purchaseLink-desktop"
                      name="purchaseLink"
                      value={formData.purchaseLink}
                      onChange={handleInputChange}
                      placeholder="이 책을 다시 찾아볼 수 있는 곳이 있나요?"
                      className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-xs placeholder-gray-500 caret-cyan-400 hidden sm:block"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* 버튼 영역 */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-cyan-500/20">
              <button
                type="button"
                onClick={() => router.push("/books")}
                className="px-4 py-2 border border-cyan-500/40 rounded-lg font-medium text-cyan-300 hover:bg-cyan-900/30 text-xs transition-colors font-mono"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-400 hover:from-cyan-400 hover:to-purple-400 text-white font-bold rounded-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 text-xs transition-all disabled:opacity-70 font-orbitron tracking-wide"
              >
                {isSubmitting 
                  ? "등록 중..." 
                  : bookType === 'notebook' 
                    ? "노트북 만들기" 
                    : "책 등록하기"
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Suspense로 감싸진 기본 export 컴포넌트
export default function NewBookPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-cyan-400">로딩 중...</div>
      </div>
    }>
      <NewBookContent />
    </Suspense>
  );
} 
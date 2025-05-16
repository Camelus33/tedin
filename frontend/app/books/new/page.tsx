"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiUpload, FiX } from "react-icons/fi";

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
  { id: "exam_prep", name: "시험/인증 대비", description: "시험 합격, 자격 취득, 평가 대비 (예: 학습/시험대비, 기술 서적)" },
  { id: "practical_knowledge", name: "실무지식/기술 습득", description: "업무, 프로젝트, 실전 적용 (예: 기술, 과학, 경영/경제, 전문 비소설)" },
  { id: "humanities_self_reflection", name: "인문 소양/자기 성찰", description: "사고력, 가치관, 내적 성장 (예: 철학, 역사, 심리학, 자기계발, 에세이)" },
  { id: "reading_pleasure", name: "읽는 재미", description: "감동, 즐거움, 스트레스 해소 (예: 소설, 에세이, 전기/회고록, 예술)" }
];

export default function NewBookPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 폼 상태
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    totalPages: "",
    readingPurpose: "",
    currentPage: "0"
  });
  
  // 이미지 프리뷰
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!formData.title || !formData.author || !formData.totalPages) {
      setError("제목, 저자, 총 페이지 수는 필수 입력 항목입니다");
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
      apiFormData.append('totalPages', formData.totalPages); // 백엔드에서 parseInt 필요
      apiFormData.append('currentPage', formData.currentPage || '0');
      apiFormData.append('category', formData.genre || ''); // genre 필드를 category로 매핑. 빈 문자열로 전송
      
      if (formData.readingPurpose) {
        apiFormData.append('readingPurpose', formData.readingPurpose);
      }

      // 이미지 파일이 있으면 FormData에 추가
      if (coverImageFile) {
        apiFormData.append('coverImage', coverImageFile); // 'coverImage'는 백엔드에서 받을 필드명
      }

      console.log("전송할 FormData:", apiFormData); // FormData 내용을 직접 로깅하기는 어려움
      console.log("전송 토큰:", token.substring(0, 10) + "...");
      
      // API 요청 - 백엔드 포트(8000)로 전송
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/books`, {
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
          errorData = { message: responseText || "책 등록에 실패했습니다" };
        }
        
        console.error("API 오류:", errorData);
        throw new Error(errorData.message || errorData.error || "책 등록에 실패했습니다");
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("등록 성공:", data);
      } catch (e) {
        console.error("응답 파싱 오류:", e);
        throw new Error("서버 응답을 처리할 수 없습니다");
      }
      
      // 성공 메시지 표시 후 책 상세 페이지로 이동
      // 백엔드 응답 구조에 따라 data._id 또는 data.book._id 사용
      const bookId = data._id || (data.book && data.book._id);
      
      if (!bookId) {
        console.error("책 ID를 찾을 수 없습니다:", data);
        throw new Error("책이 생성되었지만 ID를 찾을 수 없습니다");
      }
      
      // 약간의 딜레이 후 이동 (UX 개선)
      setTimeout(() => {
        router.push(`/books/${bookId}`);
      }, 500);
      
    } catch (err: any) {
      console.error("책 등록 오류:", err);
      setError(err.message || "책 등록에 실패했습니다. 다시 시도해주세요.");
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
            <span>도서 목록으로 돌아가기</span>
          </Link>
        </div>
        
        {/* 메인 카드 */}
        <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-cyan-500/10 border border-cyan-500/40 p-4">
          <h1 className="text-xl font-bold text-cyan-300 mb-3 font-orbitron tracking-wide">새 책 등록</h1>
          
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
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-cyan-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-sm font-mono text-gray-100 placeholder-gray-400 transition-all"
                    placeholder="책 제목을 입력하세요"
                  />
                </div>
                
                {/* 저자 */}
                <div>
                  <label htmlFor="author" className="block text-xs font-semibold text-cyan-300 mb-0.5 font-barlow">
                    저자 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-cyan-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-sm font-mono text-gray-100 placeholder-gray-400 transition-all"
                    placeholder="저자 이름을 입력하세요"
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
                    <option value="">장르 선택</option>
                    {genres.map((genre) => (
                      <option key={genre.id} value={genre.id}>
                        {genre.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* 총 페이지 수 */}
                <div>
                  <label htmlFor="totalPages" className="block text-xs font-semibold text-cyan-300 mb-0.5 font-barlow">
                    총 페이지 수 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    id="totalPages"
                    name="totalPages"
                    value={formData.totalPages}
                    onChange={handleNumberInput}
                    required
                    className="w-full px-3 py-2 border border-cyan-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-sm font-mono text-gray-100 placeholder-gray-400 transition-all"
                    placeholder="책의 총 페이지 수"
                  />
                </div>
                
                {/* 읽는 목적 */}
                <div>
                  <label htmlFor="readingPurpose" className="block text-xs font-semibold text-emerald-300 mb-0.5 font-barlow">
                    읽는 목적
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
                          <span className="truncate block">{purpose.name}</span>
                        </button>
                        {/* 툴팁: group-hover 시 보이도록 설정 */}
                        <div 
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-xs p-2 
                                     bg-gray-900 text-gray-200 text-[10px] rounded-md shadow-lg 
                                     opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out z-10 
                                     pointer-events-none group-hover:pointer-events-auto"
                        >
                          {purpose.description}
                           {/* 툴팁 꼬리 */}
                          <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 
                                        border-x-4 border-x-transparent border-t-4 border-t-gray-900">
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 현재 읽은 페이지 */}
                <div>
                  <label htmlFor="currentPage" className="block text-xs font-semibold text-cyan-300 mb-0.5 font-barlow">
                    현재 페이지
                  </label>
                  <input
                    type="text"
                    id="currentPage"
                    name="currentPage"
                    value={formData.currentPage}
                    onChange={handleNumberInput}
                    className="w-full px-3 py-2 border border-cyan-500/40 rounded-lg bg-gray-700/60 focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400 text-sm font-mono text-gray-100 placeholder-gray-400 transition-all"
                    placeholder="이미 읽은 페이지가 있다면 입력하세요"
                  />
                </div>
              </div>
              
              {/* 오른쪽 컬럼: 이미지 업로드 */}
              <div className="flex flex-col items-center justify-start space-y-2">
                <div className="w-full text-center">
                  <label className="block text-xs font-semibold text-cyan-300 mb-2 font-barlow">
                    표지 이미지
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
                      <p className="text-xs text-cyan-300">클릭하여 업로드</p>
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
                
                <div className="bg-cyan-900/30 rounded-md p-2 w-full text-[11px] text-cyan-300 border border-cyan-500/20">
                  <p>💡 표지 이미지는 선택사항입니다. 업로드하지 않으면 제목과 저자 정보로 표지가 생성됩니다.</p>
                </div>
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
                {isSubmitting ? "등록 중..." : "책 등록하기"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiUpload, FiX } from "react-icons/fi";

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
  { id: "intensive", name: "정독", description: "깊이 있는 이해와 분석을 위한 꼼꼼한 독서" },
  { id: "extensive", name: "다독", description: "넓은 지식 습득을 위한 빠른 독서" },
  { id: "scanning", name: "발췌독", description: "필요한 정보만 선별적으로 읽기" },
  { id: "review", name: "복습", description: "이미 읽은 책의 주요 내용 복습" }
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
      
      console.log("폼 데이터:", formData);
      
      // JSON 형식으로 데이터 전송
      const bookData: any = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        totalPages: parseInt(formData.totalPages), // 문자열에서 숫자로 변환
        currentPage: parseInt(formData.currentPage) || 0,
        category: formData.genre || null, // genre 필드를 category로 매핑
      };
      
      // 선택적 필드는 있을 때만 추가
      if (formData.readingPurpose) {
        bookData.readingPurpose = formData.readingPurpose;
      }
      
      console.log("전송할 데이터:", bookData);
      console.log("전송 토큰:", token.substring(0, 10) + "...");
      
      // API 요청 - 백엔드 포트(8000)로 전송
      const response = await fetch("http://localhost:8000/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/books" 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            <span>도서 목록으로 돌아가기</span>
          </Link>
        </div>
        
        {/* 메인 카드 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">새 책 등록</h1>
          
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
                
                {/* 장르 */}
                <div>
                  <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                    장르 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="genre"
                    name="genre"
                    value={formData.genre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
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
                    placeholder="책의 총 페이지 수"
                  />
                </div>
                
                {/* 읽는 목적 */}
                <div>
                  <label htmlFor="readingPurpose" className="block text-sm font-medium text-gray-700 mb-1">
                    읽는 목적
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {readingPurposes.map((purpose) => (
                      <div
                        key={purpose.id}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-all
                          ${formData.readingPurpose === purpose.id 
                            ? "border-indigo-500 bg-indigo-50" 
                            : "border-gray-200 hover:border-indigo-200"
                          }
                        `}
                        onClick={() => setFormData({ ...formData, readingPurpose: purpose.id })}
                      >
                        <h4 className="font-medium text-sm">{purpose.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{purpose.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 현재 읽은 페이지 */}
                <div>
                  <label htmlFor="currentPage" className="block text-sm font-medium text-gray-700 mb-1">
                    현재 페이지
                  </label>
                  <input
                    type="text"
                    id="currentPage"
                    name="currentPage"
                    value={formData.currentPage}
                    onChange={handleNumberInput}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white/50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="이미 읽은 페이지가 있다면 입력하세요"
                  />
                </div>
              </div>
              
              {/* 오른쪽 컬럼: 이미지 업로드 */}
              <div className="flex flex-col items-center justify-start space-y-4">
                <div className="w-full text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    표지 이미지
                  </label>
                  
                  {coverImage ? (
                    <div className="relative w-48 h-64 mx-auto">
                      <Image
                        src={coverImage}
                        alt="Book cover preview"
                        fill
                        className="object-cover rounded-md shadow-md"
                      />
                      <button
                        type="button"
                        onClick={clearCoverImage}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-48 h-64 mx-auto border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
                    >
                      <FiUpload size={32} className="text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">클릭하여 업로드</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP</p>
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
                    <p className="text-sm text-indigo-600 mt-2">업로드 중...</p>
                  )}
                </div>
                
                <div className="bg-indigo-50 rounded-lg p-4 w-full text-sm text-indigo-700">
                  <p>💡 표지 이미지는 선택사항입니다. 업로드하지 않으면 제목과 저자 정보로 표지가 생성됩니다.</p>
                </div>
              </div>
            </div>
            
            {/* 버튼 영역 */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push("/books")}
                className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70"
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
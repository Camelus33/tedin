"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiBook, FiEdit3 } from "react-icons/fi";

export default function NewSelectPage() {
  const router = useRouter();

  const handleMaterialRegistration = () => {
    router.push("/books/new?type=book");
  };

  const handleNotebookCreation = () => {
    router.push("/books/new?type=notebook");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-6 px-2 sm:px-4 text-gray-200 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href="/books" 
            className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors text-xs font-mono"
          >
            <FiArrowLeft className="mr-1" />
            <span className="block sm:hidden">돌아가기</span>
            <span className="hidden sm:block">나의 도서관으로 돌아가기</span>
          </Link>
        </div>

        {/* 메인 카드 */}
        <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-cyan-500/10 border border-cyan-500/40 p-6">
          <h1 className="text-2xl font-bold text-cyan-300 mb-2 font-orbitron tracking-wide">NEW</h1>
          <p className="text-gray-400 mb-8 text-sm">
            무엇을 만들어 볼까요? 아래 두 가지 옵션 중 하나를 선택해 주세요.
          </p>
          
          {/* 선택 옵션들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 자료 등록 옵션 */}
            <div 
              onClick={handleMaterialRegistration}
              className="group cursor-pointer bg-gray-700/60 hover:bg-cyan-900/40 border border-cyan-500/30 hover:border-cyan-400/60 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-cyan-500/20 group-hover:bg-cyan-500/30 rounded-full p-4 transition-colors">
                  <FiBook className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-cyan-300 mb-2">자료 등록</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    책, 논문, 보고서 등<br />
                    실제 존재하는 자료를<br />
                    등록하여 관리하세요
                  </p>
                </div>
                <div className="text-xs text-cyan-500 opacity-70">
                  기존 방식과 동일
                </div>
              </div>
            </div>

            {/* 노트북 생성 옵션 */}
            <div 
              onClick={handleNotebookCreation}
              className="group cursor-pointer bg-gray-700/60 hover:bg-purple-900/40 border border-purple-500/30 hover:border-purple-400/60 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-purple-500/20 group-hover:bg-purple-500/30 rounded-full p-4 transition-colors">
                  <FiEdit3 className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-purple-300 mb-2">노트북 생성</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    자유로운 메모와 생각을<br />
                    담을 수 있는 개인<br />
                    노트북을 만드세요
                  </p>
                </div>
                <div className="text-xs text-purple-500 opacity-70">
                  새로운 기능
                </div>
              </div>
            </div>
          </div>

          {/* 하단 안내 */}
          <div className="mt-8 p-4 bg-gray-900/40 rounded-lg border border-gray-600/30">
            <p className="text-xs text-gray-400 text-center">
              💡 <strong>자료 등록</strong>은 특정 책이나 문서를 기반으로 메모를 작성하며, 
              <strong>노트북 생성</strong>은 자유로운 형태의 메모 작성이 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
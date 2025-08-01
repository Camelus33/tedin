import { AiOutlineHighlight, AiOutlineBook } from "react-icons/ai";
import { FiBook } from "react-icons/fi";

// Cyber Theme Definition (Subset for skeleton)
const cyberTheme = {
  primary: 'text-cyan-400',
  bgPrimary: 'bg-gray-900',
  bgSecondary: 'bg-gray-800',
  cardBg: 'bg-gray-800/60',
  textMuted: 'text-gray-400',
  textLight: 'text-gray-300',
  inputBg: 'bg-gray-700/50',
  inputBorder: 'border-gray-600',
  gradient: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
  tabInactiveBg: 'bg-gray-700',
  // 개선된 스켈레톤 요소들
  cardHover: 'hover:scale-105 hover:shadow-2xl hover:border-cyan-400/50',
  cardTransition: 'transition-all duration-300 ease-out',
};

export default function BooksPageSkeleton() {
  return (
    <div className={`min-h-screen ${cyberTheme.gradient} p-4 md:p-6 ${cyberTheme.textLight}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header Skeleton - 실제 제목 크기에 맞춤 */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="h-8 sm:h-10 bg-gray-700 rounded w-40 sm:w-48 mb-4 sm:mb-0 animate-pulse"></div>
            <div className="h-12 bg-gray-700 rounded w-full sm:w-24 animate-pulse"></div>
          </div>
          <div className="h-5 bg-gray-700 rounded w-full sm:w-3/4 animate-pulse"></div>
        </div>

        {/* Search/Filter Skeleton - 실제 레이아웃에 맞춤 */}
        <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 p-6 ${cyberTheme.bgSecondary} rounded-xl shadow-lg border ${cyberTheme.inputBorder}/30`}>
          <div className="h-12 bg-gray-700 rounded-xl w-full sm:w-1/2 animate-pulse"></div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="h-12 bg-gray-700 rounded-xl w-24 sm:w-36 animate-pulse"></div>
          </div>
        </div>

        {/* Tabs Skeleton - 실제 탭 크기에 맞춤 */}
        <div className="mb-8 flex border-b border-gray-700/50">
          <div className={`px-4 sm:px-8 py-3 rounded-t-xl font-semibold ${cyberTheme.tabInactiveBg} text-transparent animate-pulse w-28 sm:w-32 h-12 mr-2 flex items-center`}>
            <FiBook className={`inline mr-2 mb-0.5 ${cyberTheme.textMuted}`} /> 
            <span className="text-base sm:text-lg opacity-0">등록한 자료</span>
          </div>
          <div className={`px-4 sm:px-8 py-3 rounded-t-xl font-semibold ${cyberTheme.tabInactiveBg} text-transparent animate-pulse w-32 sm:w-40 h-12 flex items-center`}>
            <AiOutlineHighlight className={`inline mr-2 mb-0.5 ${cyberTheme.textMuted}`} /> 
            <span className="text-base sm:text-lg opacity-0">단권화 노트</span>
          </div>
        </div>

        {/* Content Area Skeleton - 실제 카드 크기에 맞춤 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`relative ${cyberTheme.cardBg} rounded-xl shadow-lg overflow-hidden border ${cyberTheme.inputBorder} animate-pulse ${cyberTheme.cardTransition}`}>
              <div className={`w-full h-36 md:h-44 ${cyberTheme.inputBg}`}></div>
              <div className="p-5">
                {/* 책 제목 스켈레톤 */}
                <div className="h-6 sm:h-7 bg-gray-700 rounded w-3/4 mb-2"></div>
                {/* 저자 스켈레톤 */}
                <div className="h-4 sm:h-5 bg-gray-700 rounded w-1/2 mb-4"></div>
                {/* 진행률 바 스켈레톤 */}
                <div className="mb-3">
                  <div className="h-2 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
                {/* 최근 읽기 스켈레톤 */}
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
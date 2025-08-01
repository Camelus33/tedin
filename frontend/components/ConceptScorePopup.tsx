import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConceptUnderstandingScore {
  totalScore: number;
  breakdown: {
    thoughtExpansion: number;
    memoEvolution: number;
    knowledgeConnection: number;
    flashcardCreation: number;
    tagUtilization: number;
    userRating: number;
  };
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  recommendations: string[];
}

interface ConceptScorePopupProps {
  score: ConceptUnderstandingScore;
  isOpen: boolean;
  onClose: () => void;
}

const breakdownItems = [
  { key: 'thoughtExpansion', label: '생각추가', maxScore: 20 },
  { key: 'memoEvolution', label: '메모진화', maxScore: 20 },
  { key: 'knowledgeConnection', label: '지식연결', maxScore: 20 },
  { key: 'flashcardCreation', label: '복습 카드', maxScore: 20 },
  { key: 'tagUtilization', label: '태그활용', maxScore: 10 },
  { key: 'userRating', label: '평점', maxScore: 10 },
];

const cyberGradients = [
  'from-cyan-400 via-blue-500 to-purple-600',
  'from-pink-500 via-fuchsia-500 to-cyan-400',
  'from-green-400 via-cyan-500 to-blue-600',
  'from-yellow-400 via-orange-500 to-pink-500',
  'from-purple-400 via-blue-500 to-cyan-400',
  'from-fuchsia-400 via-pink-500 to-purple-600',
];

const ConceptScorePopup: React.FC<ConceptScorePopupProps> = ({
  score,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border border-cyan-500/30 shadow-2xl rounded-2xl max-w-xs w-full p-4 sm:p-6 flex flex-col items-center min-h-[220px]">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-gray-800/70 hover:bg-cyan-600/80 transition-colors"
        >
          <X size={16} className="text-cyan-200" />
        </button>

        {/* 전체 점수 */}
        <div className="mb-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-extrabold text-white drop-shadow-glow-cyan">{score.totalScore}</span>
          </div>
        </div>

        {/* 세부 점수 바 차트 */}
        <div className="w-full flex flex-col gap-2">
          {breakdownItems.map((item, idx) => {
            const itemScore = score.breakdown[item.key as keyof typeof score.breakdown];
            const percentage = (itemScore / item.maxScore) * 100;
            return (
              <div key={item.key} className="flex items-center gap-2">
                <span className="w-14 text-xs text-cyan-200 font-semibold tracking-tight text-shadow-cyber text-right">
                  {item.label}
                </span>
                <div className="flex-1 h-3 rounded-full bg-gray-800/80 overflow-hidden relative">
                  <div
                    className={cn(
                      'absolute left-0 top-0 h-full rounded-full transition-all duration-500',
                      `bg-gradient-to-r ${cyberGradients[idx % cyberGradients.length]}`
                    )}
                    style={{ width: `${percentage}%`, boxShadow: '0 0 8px 2px rgba(0,255,255,0.25)' }}
                  />
                </div>
                <span className="w-7 text-xs text-cyan-100 font-bold text-shadow-cyber text-right">
                  {itemScore}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConceptScorePopup;

/* tailwind.config.js에 아래와 같은 커스텀 드롭섀도우 추가 권장
module.exports = {
  theme: {
    extend: {
      dropShadow: {
        'glow-cyan': '0 0 8px #22d3ee, 0 0 16px #818cf8',
      },
      textShadow: {
        'cyber': '0 0 4px #22d3ee, 0 0 8px #818cf8',
      }
    }
  }
}
*/ 
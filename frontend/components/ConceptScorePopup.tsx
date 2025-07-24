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
  onActionClick: (action: string) => void;
}

const ConceptScorePopup: React.FC<ConceptScorePopupProps> = ({
  score,
  isOpen,
  onClose,
  onActionClick
}) => {
  if (!isOpen) return null;

  const breakdownItems = [
    {
      key: 'thoughtExpansion',
      label: '생각추가',
      maxScore: 20,
      description: '4단계 생각 추가 완성도',
      action: 'add_thought'
    },
    {
      key: 'memoEvolution',
      label: '메모진화',
      maxScore: 20,
      description: '메모 발전 단계 완성도',
      action: 'evolve_memo'
    },
    {
      key: 'knowledgeConnection',
      label: '지식연결',
      maxScore: 20,
      description: '다른 지식과의 연결',
      action: 'add_connection'
    },
    {
      key: 'flashcardCreation',
      label: '플래시카드',
      maxScore: 20,
      description: '플래시카드 생성 및 활용',
      action: 'create_flashcard'
    },
    {
      key: 'tagUtilization',
      label: '태그활용',
      maxScore: 10,
      description: '태그 활용도',
      action: 'add_tag'
    },
    {
      key: 'userRating',
      label: '사용자평점',
      maxScore: 10,
      description: '자신의 이해도 평가',
      action: 'update_rating'
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-blue-600 bg-blue-100';
      case 'advanced': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-orange-600 bg-orange-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'expert': return '전문가';
      case 'advanced': return '고급';
      case 'intermediate': return '중급';
      default: return '초급';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">개념이해도 분석</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 전체 점수 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">전체 점수</span>
            <span className={cn(
              'px-2 py-1 rounded-full text-xs font-medium',
              getLevelColor(score.level)
            )}>
              {getLevelText(score.level)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">{score.totalScore}</span>
            <span className="text-gray-500">/ 100점</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${score.totalScore}%` }}
            />
          </div>
        </div>

        {/* 세부 점수 */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">세부 점수</h4>
          {breakdownItems.map((item) => {
            const itemScore = score.breakdown[item.key as keyof typeof score.breakdown];
            const percentage = (itemScore / item.maxScore) * 100;
            
            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm text-gray-600">{itemScore}/{item.maxScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      percentage >= 80 ? 'bg-green-500' :
                      percentage >= 60 ? 'bg-blue-500' :
                      percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{item.description}</p>
                {itemScore < item.maxScore * 0.8 && (
                  <button
                    onClick={() => onActionClick(item.action)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    개선하기
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* 개선 제안 */}
        {score.recommendations.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">개선 제안</h4>
            <ul className="space-y-2">
              {score.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="text-sm text-gray-600">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 퀵 액션 버튼들 */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onActionClick('add_thought')}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            생각 추가
          </button>
          <button
            onClick={() => onActionClick('evolve_memo')}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          >
            메모 발전
          </button>
          <button
            onClick={() => onActionClick('add_connection')}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
          >
            지식 연결
          </button>
          <button
            onClick={() => onActionClick('create_flashcard')}
            className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
          >
            플래시카드
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConceptScorePopup; 
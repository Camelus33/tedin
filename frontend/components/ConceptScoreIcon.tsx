import React from 'react';
import { cn } from '@/lib/utils';

interface ConceptScoreIconProps {
  score: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  onClick: () => void;
  className?: string;
}

const ConceptScoreIcon: React.FC<ConceptScoreIconProps> = ({
  score,
  level,
  onClick,
  className
}) => {
  // 점수에 따른 아이콘과 색상 결정
  const getIconAndColor = (score: number, level: string) => {
    if (score >= 80) {
      return { icon: '⭐', color: 'text-blue-300', bgColor: 'bg-blue-900/30' };
    } else if (score >= 60) {
      return { icon: '🎯', color: 'text-green-300', bgColor: 'bg-green-900/30' };
    } else if (score >= 40) {
      return { icon: '🧠', color: 'text-orange-300', bgColor: 'bg-orange-900/30' };
    } else {
      return { icon: '💡', color: 'text-red-300', bgColor: 'bg-red-900/30' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor(score, level);

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full cursor-pointer transition-all duration-200 hover:scale-105',
        bgColor,
        color,
        className
      )}
      onClick={onClick}
      title={`개념이해도: ${score}점 (${level})`}
    >
      <span className={`text-xs sm:text-sm ${color} !important`}>{icon}</span>
      <span className={`text-xs font-medium ${color} !important`}>{score}</span>
      
      {/* 미니 진행바 */}
      <div className="w-6 sm:w-8 h-0.5 sm:h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-current rounded-full transition-all duration-300"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default ConceptScoreIcon; 
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
      return { icon: '⭐', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    } else if (score >= 60) {
      return { icon: '🎯', color: 'text-green-600', bgColor: 'bg-green-100' };
    } else if (score >= 40) {
      return { icon: '🧠', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    } else {
      return { icon: '💡', color: 'text-red-600', bgColor: 'bg-red-100' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor(score, level);

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-full cursor-pointer transition-all duration-200 hover:scale-105',
        bgColor,
        color,
        className
      )}
      onClick={onClick}
      title={`개념이해도: ${score}점 (${level})`}
    >
      <span className="text-sm">{icon}</span>
      <span className="text-xs font-medium">{score}</span>
      
      {/* 미니 진행바 */}
      <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-current rounded-full transition-all duration-300"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default ConceptScoreIcon; 
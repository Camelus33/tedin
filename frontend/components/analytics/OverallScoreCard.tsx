'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface OverallScoreCardProps {
  score: number;
  percentile?: number;
  previousScore?: number;
  changeDelta?: number;
}

// 인지 여정 스테이지 정의
const cognitiveStages = [
  { 
    name: '씨앗', 
    threshold: 0,
    description: "새로운 성장의 가능성이 발견된 '씨앗' 단계입니다. 꾸준한 활동으로 자신만의 성장 리듬을 찾아가는 시기입니다.",
    tipTitle: '성장의 시작점을 위한 조언',
    tips: [
      '결과보다 과정 자체에 집중해보세요',
      '다양한 유형의 훈련을 탐색하며 즐거움을 찾아보세요',
      '작은 성공 하나하나를 기록하고 축하해주세요'
    ],
    icon: '🌱'
  },
  { 
    name: '새싹', 
    threshold: 20,
    description: "성장의 '새싹'이 돋아난 단계입니다. 익숙해진 훈련을 기반으로 안정적인 성장 리듬을 만들어가고 있습니다.",
    tipTitle: '안정적인 성장을 위한 조언',
    tips: [
      '자신에게 맞는 훈련 패턴을 찾아보세요',
      '조금 더 도전적인 난이도를 시도해보는 것도 좋습니다',
      '자신의 성장을 시각적으로 확인하며 동기를 부여하세요'
    ],
    icon: '🌿'
  },
  { 
    name: '성장', 
    threshold: 40,
    description: "꾸준한 훈련으로 자신만의 리듬이 생긴 '성장' 단계입니다. 인지 능력이 안정적으로 발전하며 자신감이 붙습니다.",
    tipTitle: '성장 가속을 위한 조언',
    tips: [
      '자신의 강점을 활용해 약점을 보완해보세요',
      '정기적으로 어려운 과제에 도전하며 한계를 넓혀보세요',
      '자신의 성장 과정을 다른 사람과 공유하며 영감을 얻으세요'
    ],
    icon: '🌳'
  },
  { 
    name: '꽃', 
    threshold: 60,
    description: "성장의 '꽃'이 피어난 단계입니다. 숙련된 인지 능력을 바탕으로 복잡한 문제도 해결할 수 있습니다.",
    tipTitle: '능력 활용을 위한 조언',
    tips: [
      '자신만의 인지 전략을 만들어 활용해보세요',
      '다양한 분야의 지식을 연결하여 새로운 통찰을 얻어보세요',
      '자신의 능력을 활용해 다른 사람을 돕는 경험도 좋습니다'
    ],
    icon: '🌸'
  },
  { 
    name: '열매', 
    threshold: 80,
    description: "성장의 '열매'를 맺은 단계입니다. 높은 수준의 인지 능력을 안정적으로 발휘하고 있습니다.",
    tipTitle: '지속적인 발전을 위한 조언',
    tips: [
      '자신의 지식과 경험을 체계적으로 정리해보세요',
      '완전히 새로운 분야에 도전하며 뇌를 자극해보세요',
      '자신의 전문성을 더욱 깊이 있게 발전시키세요'
    ],
    icon: '🍎'
  }
];

const getCurrentStage = (score: number) => {
  // 스코어에 해당하는 스테이지 찾기
  for (let i = cognitiveStages.length - 1; i >= 0; i--) {
    if (score >= cognitiveStages[i].threshold) {
      return {
        ...cognitiveStages[i],
        index: i,
        nextStage: i < cognitiveStages.length - 1 ? cognitiveStages[i + 1] : null,
        progressToNext: i < cognitiveStages.length - 1 
          ? ((score - cognitiveStages[i].threshold) / 
             (cognitiveStages[i + 1].threshold - cognitiveStages[i].threshold)) * 100
          : 100
      };
    }
  }
  // 기본값으로 첫 번째 단계 반환
  return {
    ...cognitiveStages[0],
    index: 0,
    nextStage: cognitiveStages[1],
    progressToNext: (score / cognitiveStages[1].threshold) * 100
  };
};

const OverallScoreCard: React.FC<OverallScoreCardProps> = ({ 
  score, 
  percentile, 
  previousScore, 
  changeDelta 
}) => {
  const [appear, setAppear] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [expandedTips, setExpandedTips] = useState(false);

  // 현재 인지 능력 단계 계산
  const currentStage = getCurrentStage(score);
  
  useEffect(() => {
    // 부드러운 등장 효과
    const appearTimer = setTimeout(() => setAppear(true), 300);
    
    // 점수 애니메이션 효과
    const duration = 1500; // 애니메이션 지속 시간 (ms)
    const frameRate = 30; // 초당 프레임 수
    const increment = score / (duration / 1000 * frameRate); // 각 프레임당 증가량
    
    let currentScore = 0;
    const scoreTimer = setInterval(() => {
      currentScore += increment;
      if (currentScore >= score) {
        currentScore = score;
        clearInterval(scoreTimer);
      }
      setAnimatedScore(Math.round(currentScore));
    }, 1000 / frameRate);
    
    return () => {
      clearTimeout(appearTimer);
      clearInterval(scoreTimer);
    };
  }, [score]);
  
  // 지난 기록과 비교한 변화 메시지
  const getChangeMessage = (change: number) => {
    if (change === 0) return null;
    const direction = change > 0 ? '상승' : '변화';
    return `지난 측정 대비 ${Math.abs(change)} 포인트 ${direction}했습니다. 당신의 노력이 만들어낸 의미 있는 변화입니다.`;
  };

  // 점수에 따른 색상 그라데이션 생성
  const getScoreColor = () => {
    if (score >= 80) return 'rgb(var(--secondary-green))';
    if (score >= 60) return 'rgb(var(--primary-turquoise))';
    if (score >= 40) return 'rgb(var(--primary-indigo))';
    if (score >= 20) return 'rgb(var(--secondary-beige))';
    return 'rgb(var(--accent-orange))';
  };

  return (
    <Card className={`habitus-transition quiet-victory ${appear ? 'appear' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl">나의 성장 리듬</CardTitle>
        <CardDescription className="text-sm sm:text-md">
          당신의 인지적 성장을 리듬에 따라 확인하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col items-center">
          {/* 현재 단계 아이콘 */}
          <div 
            className="text-5xl md:text-6xl mb-4 transition-all duration-700 ease-in-out"
            style={{ 
              transform: appear ? 'scale(1.2)' : 'scale(0.8)',
              opacity: appear ? 1 : 0.5
            }}
          >
            {currentStage.icon}
          </div>
          
          {/* 점수와 백분위 표시 */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <h3 
              className="text-4xl font-bold habitus-transition"
              style={{ color: getScoreColor() }}
            >
              {animatedScore}
            </h3>
            {percentile && (
              <div className="bg-gray-100 rounded-full px-3 py-1 text-sm">
                상위 {percentile}%
              </div>
            )}
          </div>
          
          {/* 현재 단계 이름 */}
          <h4 
            className="text-lg font-medium mb-2 habitus-transition"
            style={{ color: 'rgb(var(--primary-indigo))' }}
          >
            {currentStage.name}
          </h4>
          
          {/* 단계 설명 */}
          <p className="text-sm text-center text-gray-600 mb-4">
            {currentStage.description}
          </p>
          
          {/* 다음 단계까지 진행 상황 */}
          {currentStage.nextStage && (
            <div className="w-full mt-2 mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{currentStage.name}</span>
                <span>{currentStage.nextStage.name}</span>
              </div>
              <div className="w-full relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(var(--secondary-beige), 0.3)' }}>
                <div 
                  className="absolute top-0 left-0 h-full transition-all duration-1000 ease-in-out"
                  style={{ 
                    width: `${currentStage.progressToNext}%`, 
                    backgroundColor: getScoreColor()
                  }}
                />
              </div>
            </div>
          )}
          
          {/* 팁 섹션 */}
          <div className="mt-6 w-full">
            <Button 
              onClick={() => setExpandedTips(!expandedTips)}
              variant="outline"
              className="w-full justify-between habitus-transition"
              style={{ 
                borderColor: 'rgba(var(--secondary-green), 0.3)',
                color: 'rgb(var(--secondary-green))'
              }}
            >
              <span>{currentStage.tipTitle}</span>
              <span>{expandedTips ? '▲' : '▼'}</span>
            </Button>
            
            {expandedTips && (
              <div 
                className="mt-3 p-3 rounded-lg habitus-transition"
                style={{ backgroundColor: 'rgba(var(--secondary-green), 0.05)' }}
              >
                <ul className="space-y-2">
                  {currentStage.tips.map((tip, index) => (
                    <li 
                      key={index} 
                      className="flex items-start"
                    >
                      <span 
                        className="mr-2 text-sm"
                        style={{ color: 'rgb(var(--secondary-green))' }}
                      >
                        •
                      </span>
                      <span className="text-sm text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* 자기 성찰 프롬프트 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 italic">
              "당신은 지금 {currentStage.name}에 있습니다. 
              이 단계에서 가장 중요한 것은 무엇이라고 생각하나요?"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverallScoreCard; 
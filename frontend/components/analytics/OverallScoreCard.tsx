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
    name: '씨앗 단계', 
    threshold: 0,
    description: '인지 능력의 첫 번째 씨앗이 발아하는 단계입니다. 당신의 인지 능력 씨앗이 막 발아를 시작했습니다.',
    tipTitle: '씨앗 단계의 팁',
    tips: [
      '꾸준한 훈련으로 씨앗에 물을 주세요',
      '다양한 인지 활동을 시도해보세요',
      '결과보다 과정에 집중하세요'
    ],
    icon: '🌱'
  },
  { 
    name: '새싹 단계', 
    threshold: 20,
    description: '씨앗이 자라 작은 새싹이 된 단계입니다. 당신의 인지 능력이 점점 성장하고 있습니다.',
    tipTitle: '새싹 단계의 팁',
    tips: [
      '지식의 폭을 넓혀 보세요',
      '새로운 도전을 두려워하지 마세요',
      '훈련의 강도를 조금씩 높여보세요'
    ],
    icon: '🌿'
  },
  { 
    name: '성장 단계', 
    threshold: 40,
    description: '새싹이 자라 튼튼한 줄기를 형성한 단계입니다. 당신의 인지 능력이 안정적으로 발전하고 있습니다.',
    tipTitle: '성장 단계의 팁',
    tips: [
      '다양한 분야의 지식을 연결해보세요',
      '도전적인 과제에 정기적으로 도전하세요',
      '실패를 두려워하지 말고 경험으로 받아들이세요'
    ],
    icon: '🌳'
  },
  { 
    name: '꽃피움 단계', 
    threshold: 60,
    description: '줄기에서 아름다운 꽃이 피어나는 단계입니다. 당신의 인지 능력이 높은 수준으로 발전했습니다.',
    tipTitle: '꽃피움 단계의 팁',
    tips: [
      '자신만의 인지 스타일을 발견하세요',
      '복잡한 문제에 도전하세요',
      '다른 사람과 지식을 나누세요'
    ],
    icon: '🌸'
  },
  { 
    name: '열매 단계', 
    threshold: 80,
    description: '꽃이 열매를 맺는 단계입니다. 당신의 인지 능력이 높은 수준에 도달했습니다.',
    tipTitle: '열매 단계의 팁',
    tips: [
      '자신의 지식을 다른 사람에게 가르쳐보세요',
      '새로운 분야에 도전하세요',
      '전문성을 더욱 깊이 있게 발전시키세요'
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
  const getChangeMessage = () => {
    if (!previousScore || !changeDelta) return null;
    
    if (changeDelta > 5) {
      return "놀라운 성장을 이루었습니다!";
    } else if (changeDelta > 0) {
      return "꾸준히 성장하고 있습니다.";
    } else if (changeDelta === 0) {
      return "안정적인 수준을 유지하고 있습니다.";
    } else if (changeDelta > -5) {
      return "작은 변동이 있습니다. 지속적인 연습이 도움이 됩니다.";
    } else {
      return "새로운 도전이 필요합니다.";
    }
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
        <CardTitle className="text-xl sm:text-2xl">인지 여정 단계</CardTitle>
        <CardDescription className="text-sm sm:text-md">
          당신만의 인지적 여정을 단계별로 확인하세요
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
              <div className="mt-2 text-xs text-gray-500 text-center">
                다음 단계까지 {Math.round(currentStage.nextStage.threshold - score)} 포인트 남았습니다
              </div>
            </div>
          )}
          
          {/* 성장 메시지 */}
          {getChangeMessage() && (
            <div 
              className="mt-4 py-2 px-4 rounded-lg text-sm text-center habitus-transition"
              style={{ 
                backgroundColor: 'rgba(var(--primary-indigo), 0.1)',
                color: 'rgb(var(--primary-indigo))'
              }}
            >
              {getChangeMessage()}
              {changeDelta && changeDelta !== 0 && (
                <span className="ml-1 font-medium">
                  ({changeDelta > 0 ? '+' : ''}{changeDelta})
                </span>
              )}
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
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// 사용자 목표 유형
type GoalType = 'workingMemory' | 'attention' | 'processingSpeed' | 'cognitiveFlexibility' | 'overall';

// 제안 항목 인터페이스
interface Suggestion {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'exercise' | 'habit' | 'practice' | 'lifestyle';
  goalTypes: GoalType[];
  isCompleted: boolean;
  lastCompleted?: string;
}

interface PersonalizedSuggestionsProps {
  currentGoals?: GoalType[];
  metricScores?: Record<string, number>;
}

// 모든 제안 항목 데이터베이스
const ALL_SUGGESTIONS: Suggestion[] = [
  {
    id: '1',
    title: '듀얼 N-백 게임',
    description: '듀얼 N-백 게임은 작업 기억력을 향상시키는 데 효과적인 인지 훈련입니다. 시각과 청각 자극을 동시에 기억하며 일정 시간 전의 자극과 비교합니다.',
    duration: '15-20분',
    difficulty: 'medium',
    category: 'exercise',
    goalTypes: ['workingMemory', 'attention', 'overall'],
    isCompleted: false
  },
  {
    id: '2',
    title: '명상 연습',
    description: '매일 10분간의 집중 명상은 주의 집중력과 전반적인 인지 기능을 향상시킵니다. 호흡에 집중하거나 안내된 명상 앱을 사용해보세요.',
    duration: '10-15분',
    difficulty: 'easy',
    category: 'habit',
    goalTypes: ['attention', 'overall'],
    isCompleted: false
  },
  {
    id: '3',
    title: '속독 연습',
    description: '매일 속독 연습을 통해 처리 속도와 시각적 인지 능력을 향상시킬 수 있습니다. 점진적으로 속도를 높이면서 이해력을 유지하는 것이 중요합니다.',
    duration: '15분',
    difficulty: 'medium',
    category: 'practice',
    goalTypes: ['processingSpeed', 'overall'],
    isCompleted: false
  },
  {
    id: '4',
    title: '다중 작업 전환 게임',
    description: '두 가지 이상의 작업을 번갈아가며 수행하는 게임이나 연습은 인지적 유연성을 크게 향상시킵니다. 예를 들어, 숫자와 글자를 번갈아 정렬하는 연습을 해보세요.',
    duration: '10분',
    difficulty: 'hard',
    category: 'exercise',
    goalTypes: ['cognitiveFlexibility', 'attention', 'overall'],
    isCompleted: false
  },
  {
    id: '5',
    title: '새로운 경로 탐색',
    description: '일상적인 경로 대신 새로운 길로 이동해보세요. 이는 공간 인지 능력과 신경 가소성을 촉진합니다. 가능하면 지도 없이 탐색해보세요.',
    duration: '변동적',
    difficulty: 'easy',
    category: 'lifestyle',
    goalTypes: ['cognitiveFlexibility', 'overall'],
    isCompleted: false
  },
  {
    id: '6',
    title: '숫자 암산하기',
    description: '암산 연습은 작업 기억력과 수학적 사고 능력을 향상시킵니다. 일상 생활에서 계산기 대신 암산을 하거나, 전용 앱을 통해 연습해보세요.',
    duration: '5-10분',
    difficulty: 'medium',
    category: 'practice',
    goalTypes: ['workingMemory', 'processingSpeed', 'overall'],
    isCompleted: false
  },
  {
    id: '7',
    title: '충분한 수면 취하기',
    description: '7-8시간의 양질의 수면은 인지 기능 향상에 필수적입니다. 수면 루틴을 만들고 수면 환경을 최적화하세요.',
    duration: '매일 밤',
    difficulty: 'medium',
    category: 'lifestyle',
    goalTypes: ['overall'],
    isCompleted: false
  },
  {
    id: '8',
    title: '체스 또는 전략 게임',
    description: '체스나 다른 전략 게임은 전방위적인 인지 훈련을 제공합니다. 특히 작업 기억력, 계획 능력, 패턴 인식에 도움이 됩니다.',
    duration: '30분+',
    difficulty: 'hard',
    category: 'exercise',
    goalTypes: ['workingMemory', 'cognitiveFlexibility', 'overall'],
    isCompleted: false
  },
  {
    id: '9',
    title: '스트레칭과 가벼운 운동',
    description: '신체 활동은 뇌 건강과 인지 기능에 직접적인 영향을 미칩니다. 매일 가벼운 스트레칭이나 10분 걷기만으로도 효과를 볼 수 있습니다.',
    duration: '10-20분',
    difficulty: 'easy',
    category: 'habit',
    goalTypes: ['overall', 'processingSpeed'],
    isCompleted: false
  },
  {
    id: '10',
    title: '새로운 기술 배우기',
    description: '새로운 언어, 악기, 또는 기술을 배우는 것은 인지적 유연성과 신경 연결을 강화합니다. 매일 조금씩 지속적으로 연습하세요.',
    duration: '20-30분',
    difficulty: 'hard',
    category: 'practice',
    goalTypes: ['cognitiveFlexibility', 'workingMemory', 'overall'],
    isCompleted: false
  },
  {
    id: '11',
    title: '소셜 상호작용 늘리기',
    description: '다른 사람들과의 의미 있는 대화와 상호작용은 인지 기능을 자극하고 유지하는 데 중요합니다. 가능하면 매일 깊은 대화를 나누세요.',
    duration: '변동적',
    difficulty: 'easy',
    category: 'lifestyle',
    goalTypes: ['overall', 'cognitiveFlexibility'],
    isCompleted: false
  },
  {
    id: '12',
    title: '적절한 수분 섭취',
    description: '적절한 수분 공급은 인지 기능 유지에 중요합니다. 하루에 약 2리터의 물을 마시는 것을 목표로 하세요.',
    duration: '하루 종일',
    difficulty: 'easy',
    category: 'habit',
    goalTypes: ['overall', 'processingSpeed'],
    isCompleted: false
  },
];

const PersonalizedSuggestions: React.FC<PersonalizedSuggestionsProps> = ({ 
  currentGoals = ['overall'], 
  metricScores 
}) => {
  const [selectedGoal, setSelectedGoal] = useState<GoalType>('overall');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(4);
  const storageKey = 'personalized-suggestions-state';

  // 저장된 상태 불러오기
  useEffect(() => {
    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setSuggestions(parsedState.suggestions || ALL_SUGGESTIONS);
      } catch (error) {
        console.error('제안 데이터 파싱 오류:', error);
        setSuggestions(ALL_SUGGESTIONS);
      }
    } else {
      setSuggestions(ALL_SUGGESTIONS);
    }
  }, []);

  // 상태 저장
  const saveState = (updatedSuggestions: Suggestion[]) => {
    localStorage.setItem(storageKey, JSON.stringify({
      suggestions: updatedSuggestions
    }));
  };

  // 제안 완료 상태 토글
  const toggleSuggestionCompletion = (id: string) => {
    const updatedSuggestions = suggestions.map(suggestion => {
      if (suggestion.id === id) {
        return {
          ...suggestion,
          isCompleted: !suggestion.isCompleted,
          lastCompleted: !suggestion.isCompleted ? new Date().toISOString() : undefined
        };
      }
      return suggestion;
    });
    
    setSuggestions(updatedSuggestions);
    saveState(updatedSuggestions);
  };

  // 선택된 목표에 맞는 제안 필터링
  const filteredSuggestions = suggestions.filter(
    suggestion => suggestion.goalTypes.includes(selectedGoal)
  );

  // 사용자 메트릭 기반 제안 정렬
  const sortedSuggestions = React.useMemo(() => {
    if (!metricScores) return filteredSuggestions;
    
    // 사용자 점수가 낮은 영역에 관련된 제안을 우선 순위로 지정
    return [...filteredSuggestions].sort((a, b) => {
      // 이미 완료된 제안은 뒤로
      if (a.isCompleted && !b.isCompleted) return 1;
      if (!a.isCompleted && b.isCompleted) return -1;
      
      // 가중치 계산: 각 제안이 타겟팅하는 영역의 점수 평균 (낮을수록 우선순위 높음)
      const getScore = (suggestion: Suggestion) => {
        if (!metricScores) return 50; // 기본값
        
        let totalScore = 0;
        let count = 0;
        
        if (suggestion.goalTypes.includes('workingMemory') && metricScores.workingMemoryCapacity) {
          totalScore += metricScores.workingMemoryCapacity;
          count++;
        }
        
        if (suggestion.goalTypes.includes('attention') && metricScores.sustainedAttention) {
          totalScore += metricScores.sustainedAttention;
          count++;
        }
        
        if (suggestion.goalTypes.includes('processingSpeed') && metricScores.processingSpeed) {
          totalScore += metricScores.processingSpeed;
          count++;
        }
        
        if (suggestion.goalTypes.includes('cognitiveFlexibility') && metricScores.cognitiveFlexibility) {
          totalScore += metricScores.cognitiveFlexibility;
          count++;
        }
        
        return count > 0 ? totalScore / count : 50;
      };
      
      return getScore(a) - getScore(b);
    });
  }, [filteredSuggestions, metricScores, selectedGoal]);

  const visibleSuggestions = sortedSuggestions.slice(0, visibleCount);

  // 난이도 뱃지 스타일
  const getDifficultyBadgeStyle = (difficulty: Suggestion['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return { 
          bg: 'rgba(var(--secondary-green), 0.1)', 
          color: 'rgb(var(--secondary-green))' 
        };
      case 'medium':
        return { 
          bg: 'rgba(var(--primary-turquoise), 0.1)', 
          color: 'rgb(var(--primary-turquoise))' 
        };
      case 'hard':
        return { 
          bg: 'rgba(var(--primary-indigo), 0.1)', 
          color: 'rgb(var(--primary-indigo))' 
        };
    }
  };

  // 난이도 한글 변환
  const getDifficultyLabel = (difficulty: Suggestion['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
    }
  };

  // 카테고리 한글 변환
  const getCategoryLabel = (category: Suggestion['category']) => {
    switch (category) {
      case 'exercise': return '두뇌 훈련';
      case 'habit': return '성장 습관';
      case 'practice': return '연습';
      case 'lifestyle': return '생활';
    }
  };

  // 목표 유형 한글 변환
  const getGoalTypeLabel = (goalType: GoalType) => {
    switch (goalType) {
      case 'workingMemory': return '기억력';
      case 'attention': return '주의집중';
      case 'processingSpeed': return '처리속도';
      case 'cognitiveFlexibility': return '유연성';
      case 'overall': return '전반적 성장';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl">성장을 위한 다음 걸음</CardTitle>
        <CardDescription className="text-sm sm:text-md">
          현재 당신의 데이터에 기반하여, 성장을 가속화할 수 있는 활동들을 탐색해보세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {/* 목표 필터 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">개선하고 싶은 영역 선택</h3>
          <div className="flex flex-wrap gap-2">
            {(['overall', 'workingMemory', 'attention', 'processingSpeed', 'cognitiveFlexibility'] as const).map(goal => (
              <Button
                key={goal}
                variant={selectedGoal === goal ? 'default' : 'outline'}
                className="text-xs py-1 h-auto"
                style={
                  selectedGoal === goal 
                    ? { backgroundColor: 'rgb(var(--primary-indigo))' } 
                    : {}
                }
                onClick={() => setSelectedGoal(goal)}
              >
                {getGoalTypeLabel(goal)}
              </Button>
            ))}
          </div>
        </div>
        
        {/* 제안 목록 */}
        <div className="space-y-4">
          <h3 className="text-md font-medium">
            {getGoalTypeLabel(selectedGoal)} 향상을 위한 추천 ({sortedSuggestions.length})
          </h3>
          
          {visibleSuggestions.length === 0 ? (
            <p className="text-center text-sm text-gray-500 py-4">
              이 목표에 대한 추천이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {visibleSuggestions.map(suggestion => (
                <div 
                  key={suggestion.id}
                  className={`p-4 rounded-lg transition-all duration-300 ease-in-out ${
                    suggestion.isCompleted ? 'bg-gray-50' : 'bg-white'
                  }`}
                  style={{
                    borderLeft: `4px solid ${
                      suggestion.isCompleted
                        ? 'rgb(var(--secondary-beige))'
                        : 'rgb(var(--primary-turquoise))'
                    }`,
                  }}
                >
                  <div
                    className="flex justify-between items-start cursor-pointer"
                    onClick={() => setExpandedSuggestion(
                      expandedSuggestion === suggestion.id ? null : suggestion.id
                    )}
                  >
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        suggestion.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'
                      }`}>
                        {suggestion.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1 text-xs">
                        <span
                          className="px-2 py-0.5 rounded-full"
                          style={getDifficultyBadgeStyle(suggestion.difficulty)}
                        >
                          {getDifficultyLabel(suggestion.difficulty)}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                        >
                          {getCategoryLabel(suggestion.category)}
                        </span>
                        <span className="text-gray-500">{suggestion.duration}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSuggestionCompletion(suggestion.id);
                      }}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          suggestion.isCompleted
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-400'
                        }`}
                      >
                        {suggestion.isCompleted && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    </Button>
                  </div>

                  {expandedSuggestion === suggestion.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {sortedSuggestions.length > visibleCount && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              className="habitus-transition"
              onClick={() => setVisibleCount(sortedSuggestions.length)}
            >
              더 보기 ({sortedSuggestions.length - visibleCount}개)
            </Button>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            💡 이 추천 활동들은 <strong>{getGoalTypeLabel(selectedGoal)}</strong> 개선에 도움이 됩니다. 
            일주일에 2-3가지 활동을 선택하여 꾸준히 실천해보세요.
          </p>
          <p className="text-xs text-gray-500">
            정기적인 실천이 일시적인 집중보다 더 효과적입니다. 
            당신의 일상에 맞게 활동을 조정하고 점진적으로 도전 수준을 높여가세요.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalizedSuggestions; 
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// page.tsx에 정의된 CognitiveMetrics와 동일한 구조를 가정합니다.
interface CognitiveMetricsForPercentile {
  workingMemoryCapacity: number;
  visuospatialPrecision: number;
  processingSpeed: number;
  sustainedAttention: number;
  patternRecognition: number;
  cognitiveFlexibility: number;
  hippocampusActivation: number;
  executiveFunction: number;
}

interface PercentileRankCardProps {
  percentileRanksData: Partial<Record<keyof CognitiveMetricsForPercentile, number>> | undefined | null;
  metricDisplayNames: Record<keyof CognitiveMetricsForPercentile, string>;
}

// 각 인지 역량에 대한 상세 설명 및 추천 활동
const metricDetails: Record<keyof CognitiveMetricsForPercentile, {
  description: string;
  improvementTips: string[];
  relatedActivities: string[];
  relatedAreas: string[];
}> = {
  workingMemoryCapacity: {
    description: "작업 기억 용량은 짧은 시간 동안 정보를 저장하고 조작하는 능력을 의미합니다. 일상 생활에서 전화번호를 잠시 기억하거나, 복잡한 지시사항을 따르거나, 글을 읽으면서 이전 내용을 기억하는 데 필수적입니다.",
    improvementTips: [
      "순차적인 숫자 또는 단어 외우기",
      "듀얼 N-백 게임 연습하기",
      "체스나 카드게임과 같은 전략 게임하기"
    ],
    relatedActivities: [
      "젠고의 기억력 게임",
      "언어 학습",
      "악기 연주"
    ],
    relatedAreas: [
      "학습 능력",
      "문제 해결 능력",
      "주의력"
    ]
  },
  visuospatialPrecision: {
    description: "시공간 정확도는 공간적 관계를 이해하고 시각적 정보를 처리하는 능력입니다. 방향 찾기, 물체 조작, 시각적 패턴 인식 등의 활동에 중요합니다.",
    improvementTips: [
      "퍼즐이나 테트리스 같은 공간 게임하기",
      "새로운 경로로 여행하기",
      "그림 그리기나 스케치 연습하기"
    ],
    relatedActivities: [
      "젠고의 패턴 매칭 게임",
      "지도 읽기",
      "3D 모델링"
    ],
    relatedAreas: [
      "시각적 기억",
      "방향 감각",
      "디자인 사고"
    ]
  },
  processingSpeed: {
    description: "처리 속도는 정보를 빠르고 효율적으로 분석하고 반응하는 능력입니다. 빠른 결정, 복잡한 상황에서의 적응, 효율적인 학습에 필수적입니다.",
    improvementTips: [
      "빠른 반응을 요구하는 게임하기",
      "속독 연습하기",
      "새로운 기술을 시간 제한 내에 익히기"
    ],
    relatedActivities: [
      "젠고의 속도 게임",
      "타이핑 연습",
      "스포츠 활동"
    ],
    relatedAreas: [
      "반응 시간",
      "학습 효율성",
      "주의 분배"
    ]
  },
  sustainedAttention: {
    description: "주의 지속성은 장시간 동안 집중력을 유지하는 능력입니다. 복잡한 작업 완료, 학습, 정밀한 활동에 중요합니다.",
    improvementTips: [
      "명상과 마음챙김 연습하기",
      "점진적으로 집중 시간 늘리기",
      "주의를 분산시키는 요소 제거하기"
    ],
    relatedActivities: [
      "젠고의 집중력 게임",
      "독서",
      "단일 작업에 집중하기"
    ],
    relatedAreas: [
      "학습 능력",
      "작업 완성도",
      "오류 감소"
    ]
  },
  patternRecognition: {
    description: "패턴 인식은 데이터나 정보에서 규칙과 패턴을 식별하는 능력입니다. 문제 해결, 학습, 예측에 핵심적인 역할을 합니다.",
    improvementTips: [
      "수학 퍼즐이나 논리 게임하기",
      "패턴 기반 게임 연습하기",
      "음악 듣기와 분석하기"
    ],
    relatedActivities: [
      "젠고의 패턴 인식 게임",
      "코딩 학습",
      "음악 구조 분석"
    ],
    relatedAreas: [
      "분석적 사고",
      "예측 능력",
      "창의적 연결"
    ]
  },
  cognitiveFlexibility: {
    description: "인지적 유연성은 상황에 따라 사고 방식을 바꾸고 적응하는 능력입니다. 문제 해결, 창의성, 변화 대응에 중요합니다.",
    improvementTips: [
      "역할 바꾸기 게임하기",
      "다양한 관점에서 문제 보기",
      "규칙이 바뀌는 게임 연습하기"
    ],
    relatedActivities: [
      "젠고의 규칙 전환 게임",
      "새로운 취미 탐색",
      "다양한 문화 경험하기"
    ],
    relatedAreas: [
      "창의적 사고",
      "적응성",
      "문제 해결 다양성"
    ]
  },
  hippocampusActivation: {
    description: "해마 활성화는 새로운 기억을 형성하고 저장하는 능력과 관련이 있습니다. 학습, 장기 기억 형성, 공간 탐색에 중요합니다.",
    improvementTips: [
      "새로운 경로 탐색하기",
      "에피소드 회상 연습하기",
      "복잡한 이야기 외우기"
    ],
    relatedActivities: [
      "젠고의 기억력 게임",
      "외국어 학습",
      "장소 기반 기억법"
    ],
    relatedAreas: [
      "장기 기억",
      "공간 인지",
      "연관 학습"
    ]
  },
  executiveFunction: {
    description: "실행 기능은 계획, 의사 결정, 충동 제어, 감정 조절과 같은 고차원적 인지 과정을 관리하는 능력입니다. 목표 달성과 일상 생활 관리에 필수적입니다.",
    improvementTips: [
      "단계별 계획 세우기",
      "시간 관리 기술 개발하기",
      "복잡한 전략 게임하기"
    ],
    relatedActivities: [
      "젠고의 계획 게임",
      "프로젝트 관리",
      "우선순위 설정 연습"
    ],
    relatedAreas: [
      "자기 조절",
      "계획 능력",
      "의사 결정"
    ]
  }
};

// 역량 수준에 따른 설명 제공
const getCapacityDescription = (value: number): string => {
  if (value >= 80) return "이 영역은 당신의 큰 강점입니다.";
  if (value >= 60) return "이 영역은 꾸준히 성장하고 있습니다.";
  if (value >= 40) return "이 영역은 안정적인 수준입니다.";
  if (value >= 20) return "이 영역은 더 많은 관심이 필요합니다.";
  return "이 영역은 집중적인 발전이 필요한 부분입니다.";
};

const PercentileRankCard: React.FC<PercentileRankCardProps> = ({ percentileRanksData, metricDisplayNames }) => {
  const [appear, setAppear] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const [selectedMetric, setSelectedMetric] = useState<keyof CognitiveMetricsForPercentile | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    // 고요한 승리를 위한 부드러운 등장 효과
    const timer = setTimeout(() => setAppear(true), 900);
    
    // 애니메이션 효과를 위한 초기 설정
    if (percentileRanksData) {
      // 처음에는 모든 값을 0으로 설정
      const initialValues: Record<string, number> = {};
      Object.keys(percentileRanksData).forEach(key => {
        initialValues[key] = 0;
      });
      setAnimatedValues(initialValues);
      
      // 약간의 지연 후 실제 값으로 애니메이션
      setTimeout(() => {
        setAnimatedValues(percentileRanksData as Record<string, number>);
      }, 1000);
    }
    
    return () => clearTimeout(timer);
  }, [percentileRanksData]);

  // 브랜드 컬러 시스템에 맞는 그라데이션 생성
  const getProgressColor = (key: string, index: number): string => {
    // 각 역량별로 다른 색상 조합을 사용하되, 브랜드 컬러 시스템 내에서 제한
    const colors = [
      'linear-gradient(90deg, rgb(var(--primary-indigo)), rgb(var(--primary-turquoise)))',
      'linear-gradient(90deg, rgb(var(--primary-turquoise)), rgb(var(--secondary-green)))',
      'linear-gradient(90deg, rgb(var(--primary-indigo)), rgb(var(--secondary-green)))',
      'linear-gradient(90deg, rgb(var(--secondary-green)), rgb(var(--secondary-beige)))',
      'linear-gradient(90deg, rgb(var(--primary-turquoise)), rgb(var(--secondary-beige)))',
      'linear-gradient(90deg, rgb(var(--primary-indigo)), rgb(var(--secondary-beige)))',
      'linear-gradient(90deg, rgb(var(--secondary-green)), rgb(var(--primary-turquoise)))',
      'linear-gradient(90deg, rgb(var(--secondary-beige)), rgb(var(--primary-indigo)))'
    ];
    
    return colors[index % colors.length];
  };

  // 역량 클릭 핸들러
  const handleMetricClick = (key: keyof CognitiveMetricsForPercentile) => {
    setSelectedMetric(key);
    setDetailOpen(true);
  };

  // 상세 정보 모달 닫기
  const handleCloseDetail = () => {
    setDetailOpen(false);
    setTimeout(() => setSelectedMetric(null), 300);
  };

  if (!percentileRanksData || Object.keys(percentileRanksData).length === 0) {
    return (
      <Card className="habitus-transition">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl">나의 역량 수준</CardTitle>
          <CardDescription className="text-sm sm:text-md">아직 당신의 역량을 측정할 충분한 데이터가 없습니다.</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center py-4">역량 측정을 위해서는 더 많은 활동이 필요합니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={`quiet-victory ${appear ? 'appear' : ''}`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl">나의 역량 수준</CardTitle>
          <CardDescription className="text-sm sm:text-md">
            당신만의 인지적 역량을 영역별로 확인하세요. 각 역량은 당신의 과거 데이터와 비교됩니다.
            <span className="block mt-1 text-xs text-gray-500">각 역량을 클릭하면 상세 정보를 볼 수 있습니다.</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-6">
            {Object.entries(percentileRanksData).map(([key, value], index) => {
              const metricKey = key as keyof CognitiveMetricsForPercentile;
              const metricName = metricDisplayNames[metricKey] || metricKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              const currentValue = animatedValues[key] || 0;
              
              return (
                <div 
                  key={metricKey} 
                  className="space-y-2 cursor-pointer habitus-transition hover:opacity-90"
                  onClick={() => handleMetricClick(metricKey)}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{metricName}</span>
                    <span className="text-sm font-bold" style={{ color: 'rgb(var(--primary-indigo))' }}>
                      {Math.round(currentValue)}%
                    </span>
                  </div>
                  <div className="relative h-8 w-full overflow-hidden rounded-full bg-gray-100">
                    <div 
                      className="h-full transition-all duration-1000 ease-in-out rounded-full"
                      style={{ 
                        width: `${currentValue}%`,
                        background: getProgressColor(key, index)
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getCapacityDescription(currentValue)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center text-sm text-gray-600 mt-6">
            <p>"모든 식물은 자신만의 해와 비를 필요로 합니다."</p>
            <p className="text-xs mt-1">당신의 고유한 역량 패턴은 당신만의 특별한 성장 여정을 만듭니다.</p>
          </div>
        </CardContent>
      </Card>

      {/* 역량 상세 정보 표시 */}
      {selectedMetric && detailOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCloseDetail}>
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-auto m-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold" style={{ color: 'rgb(var(--primary-indigo))' }}>
                {metricDisplayNames[selectedMetric]}
              </h3>
              <button 
                onClick={handleCloseDetail}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              현재 수준: <span className="font-semibold">{Math.round(animatedValues[selectedMetric] || 0)}%</span>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2" style={{ color: 'rgb(var(--secondary-green))' }}>무엇인가요?</h4>
              <p className="text-sm text-gray-700">{metricDetails[selectedMetric].description}</p>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2" style={{ color: 'rgb(var(--secondary-green))' }}>발전 방법</h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                {metricDetails[selectedMetric].improvementTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2" style={{ color: 'rgb(var(--secondary-green))' }}>관련 활동</h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                {metricDetails[selectedMetric].relatedActivities.map((activity, i) => (
                  <li key={i}>{activity}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <h4 className="text-xs font-medium mr-2 text-gray-500">관련 영역:</h4>
              {metricDetails[selectedMetric].relatedAreas.map((area, i) => (
                <span 
                  key={i} 
                  className="text-xs py-1 px-2 rounded-full"
                  style={{ 
                    backgroundColor: 'rgba(var(--primary-indigo), 0.1)',
                    color: 'rgb(var(--primary-indigo))'
                  }}
                >
                  {area}
                </span>
              ))}
            </div>
            
            <button
              className="mt-6 w-full py-2 rounded-lg text-white transition-all"
              style={{ backgroundColor: 'rgb(var(--primary-indigo))' }}
              onClick={handleCloseDetail}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PercentileRankCard; 
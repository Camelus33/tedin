'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

// page.tsx에 정의된 CognitiveMetrics와 동일한 구조를 가정합니다.
// 실제 애플리케이션에서는 공유 타입 파일을 통해 import하는 것이 좋습니다.
interface CognitiveMetricsStubForSW {
  workingMemoryCapacity: number;
  visuospatialPrecision: number;
  processingSpeed: number;
  sustainedAttention: number;
  patternRecognition: number;
  cognitiveFlexibility: number;
  hippocampusActivation: number;
  executiveFunction: number;
}

interface Strength {
  metric: string;
  score: number;
  description: string;
  recommendedActivities?: string[];
}

interface Weakness {
  metric: string;
  score: number;
  description: string;
  improvementSuggestions?: string[];
}

interface StrengthsWeaknessesDisplayProps {
  strengths: Strength[];
  weaknesses: Weakness[];
}

// 각 인지 역량에 대한 설명
const metricDescriptions: Partial<Record<keyof CognitiveMetricsStubForSW, string>> = {
  workingMemoryCapacity: "여러 정보를 동시에 머릿속에 유지하고 처리하는 능력",
  visuospatialPrecision: "공간 관계와 시각적 정보를 정확하게 처리하는 능력",
  processingSpeed: "정보를 빠르고 효율적으로 처리하는 능력",
  sustainedAttention: "장시간 집중력을 유지하는 능력",
  patternRecognition: "패턴과 규칙을 파악하는 능력",
  cognitiveFlexibility: "상황에 따라 사고방식을 전환하는 능력",
  hippocampusActivation: "새로운 기억을 형성하고 저장하는 능력",
  executiveFunction: "계획을 수립하고 실행하는 능력"
};

const StrengthsWeaknessesDisplay: React.FC<StrengthsWeaknessesDisplayProps> = ({ strengths, weaknesses }) => {
  const [appear, setAppear] = useState(false);
  const [activeTab, setActiveTab] = useState<'strengths' | 'weaknesses'>('strengths');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // 부드러운 등장 효과
    const timer = setTimeout(() => setAppear(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // 브랜드 컬러 시스템에 따른 메트릭 카드 스타일
  const getMetricCardStyle = (score: number, isStrength: boolean) => {
    if (isStrength) {
      return {
        borderLeft: `4px solid rgb(var(--secondary-green))`,
        backgroundColor: `rgba(var(--secondary-green), 0.05)`,
      };
    } else {
      return {
        borderLeft: `4px solid rgb(var(--primary-turquoise))`,
        backgroundColor: `rgba(var(--primary-turquoise), 0.05)`,
      };
    }
  };

  // 점수에 따른 배지 스타일
  const getScoreBadgeStyle = (score: number, isStrength: boolean) => {
    if (isStrength) {
      return {
        backgroundColor: `rgba(var(--secondary-green), 0.2)`,
        color: `rgb(var(--secondary-green))`,
      };
    } else {
      return {
        backgroundColor: `rgba(var(--primary-turquoise), 0.2)`,
        color: `rgb(var(--primary-turquoise))`,
      };
    }
  };

  if ((!strengths || strengths.length === 0) && (!weaknesses || weaknesses.length === 0)) {
    return (
      <Card className="habitus-transition">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl">강점과 약점</CardTitle>
          <CardDescription className="text-sm sm:text-md">
            아직 당신의 강점과 약점을 분석할 충분한 데이터가 없습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-center text-sm text-muted-foreground py-8">
            더 많은 활동을 통해 당신만의 인지적 프로필을 발견하세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`habitus-transition quiet-victory ${appear ? 'appear' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl">강점과 발전 영역</CardTitle>
        <CardDescription className="text-sm sm:text-md">
          당신만의 고유한 인지적 특성을 살펴보세요
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => setActiveTab(value as 'strengths' | 'weaknesses')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-6 habitus-transition">
            <TabsTrigger 
              value="strengths"
              className="relative overflow-hidden"
              style={{ 
                color: activeTab === 'strengths' ? 'rgb(var(--secondary-green))' : '',
                borderColor: activeTab === 'strengths' ? 'rgb(var(--secondary-green))' : ''
              }}
            >
              강점 영역
              {activeTab === 'strengths' && (
                <span 
                  className="absolute bottom-0 left-0 w-full h-0.5 habitus-transition"
                  style={{ backgroundColor: 'rgb(var(--secondary-green))' }}
                ></span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="weaknesses"
              className="relative overflow-hidden"
              style={{ 
                color: activeTab === 'weaknesses' ? 'rgb(var(--primary-turquoise))' : '',
                borderColor: activeTab === 'weaknesses' ? 'rgb(var(--primary-turquoise))' : ''
              }}
            >
              발전 영역
              {activeTab === 'weaknesses' && (
                <span 
                  className="absolute bottom-0 left-0 w-full h-0.5 habitus-transition"
                  style={{ backgroundColor: 'rgb(var(--primary-turquoise))' }}
                ></span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="strengths" className="pt-2">
            <div className="space-y-4">
              {strengths.length > 0 ? (
                strengths.map((strength, index) => (
                  <div 
                    key={`strength-${index}`}
                    className="p-4 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
                    style={getMetricCardStyle(strength.score, true)}
                    onClick={() => toggleExpand(`strength-${index}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium" style={{ color: 'rgb(var(--secondary-green))' }}>
                          {strength.metric}
                        </h4>
                        <p className="text-sm text-gray-600">{strength.description}</p>
                      </div>
                      <div 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={getScoreBadgeStyle(strength.score, true)}
                      >
                        {strength.score}
                      </div>
                    </div>
                    
                    {expandedItems[`strength-${index}`] && strength.recommendedActivities && (
                      <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                        <h5 
                          className="text-xs font-medium mb-2"
                          style={{ color: 'rgb(var(--secondary-green))' }}
                        >
                          이 강점을 더 발전시키는 활동
                        </h5>
                        <ul className="space-y-1">
                          {strength.recommendedActivities.map((activity, actIndex) => (
                            <li key={actIndex} className="text-xs flex items-start">
                              <span className="mr-2" style={{ color: 'rgb(var(--secondary-green))' }}>•</span>
                              <span>{activity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-center mt-2">
                      <span className="text-xs text-gray-400">
                        {expandedItems[`strength-${index}`] ? '접기 ▲' : '더 보기 ▼'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">
                  아직 분석된 강점이 없습니다. 더 많은 활동을 통해 당신의 강점을 발견하세요.
                </p>
              )}
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-gray-50 text-center">
              <p className="text-sm text-gray-600 italic">
                "강점은 당신의 인지적 정원에서 가장 잘 자라는 식물과 같습니다. 그들을 꾸준히 가꾸고 발전시키세요."
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="weaknesses" className="pt-2">
            <div className="space-y-4">
              {weaknesses.length > 0 ? (
                weaknesses.map((weakness, index) => (
                  <div 
                    key={`weakness-${index}`}
                    className="p-4 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
                    style={getMetricCardStyle(weakness.score, false)}
                    onClick={() => toggleExpand(`weakness-${index}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium" style={{ color: 'rgb(var(--primary-turquoise))' }}>
                          {weakness.metric}
                        </h4>
                        <p className="text-sm text-gray-600">{weakness.description}</p>
                      </div>
                      <div 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={getScoreBadgeStyle(weakness.score, false)}
                      >
                        {weakness.score}
                      </div>
                    </div>
                    
                    {expandedItems[`weakness-${index}`] && weakness.improvementSuggestions && (
                      <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                        <h5 
                          className="text-xs font-medium mb-2"
                          style={{ color: 'rgb(var(--primary-turquoise))' }}
                        >
                          발전을 위한 제안
                        </h5>
                        <ul className="space-y-1">
                          {weakness.improvementSuggestions.map((suggestion, sugIndex) => (
                            <li key={sugIndex} className="text-xs flex items-start">
                              <span className="mr-2" style={{ color: 'rgb(var(--primary-turquoise))' }}>•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-center mt-2">
                      <span className="text-xs text-gray-400">
                        {expandedItems[`weakness-${index}`] ? '접기 ▲' : '더 보기 ▼'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 py-4">
                  아직 분석된 발전 영역이 없습니다. 더 많은 활동을 통해 당신의 발전 가능성을 발견하세요.
                </p>
              )}
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-gray-50 text-center">
              <p className="text-sm text-gray-600 italic">
                "발전 영역은 성장의 잠재적 기회입니다. 부족함이 아닌, 더 나은 자신이 될 수 있는 기회로 바라보세요."
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-6">
          <Button 
            variant="outline"
            className="text-sm px-4 py-2 rounded-full habitus-transition"
            style={{ 
              borderColor: 'rgb(var(--primary-indigo))',
              color: 'rgb(var(--primary-indigo))'
            }}
            onClick={() => window.open('/zengo', '_blank')}
          >
            더 많은 훈련으로 내 프로필 발전시키기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrengthsWeaknessesDisplay; 
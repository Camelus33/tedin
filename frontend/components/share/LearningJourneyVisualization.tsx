'use client';

import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, PenTool, Lightbulb, Share2, TrendingUp } from 'lucide-react';
import ClientTimeDisplay from './ClientTimeDisplay';

interface LearningStep {
  position: number;
  name: string;
  description: string;
  startTime: string;
  duration?: string;
  action?: {
    type: string;
    result?: any;
  };
}

interface LearningJourneyData {
  totalTime: string;
  totalSteps?: number;
  timeSpan?: {
    startDate: string;
    endDate: string;
  };
  step: LearningStep[];
}

interface Props {
  learningJourney: LearningJourneyData;
  className?: string;
}

const LearningJourneyVisualization: React.FC<Props> = ({ learningJourney, className = '' }) => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // 단계별 아이콘 매핑 (HABITUS33 AMFA 프레임워크 기반)
  const getStepIcon = (stepName: string, position: number) => {
    if (stepName.includes('아토믹 리딩') || stepName.includes('atomic_reading')) {
      return <BookOpen className="w-5 h-5" />;
    }
    if (stepName.includes('메모 작성') || stepName.includes('memo_creation')) {
      return <PenTool className="w-5 h-5" />;
    }
    if (stepName.includes('단권화') || stepName.includes('summary_note')) {
      return <Lightbulb className="w-5 h-5" />;
    }
    if (stepName.includes('AI 링크') || stepName.includes('ai_link')) {
      return <Share2 className="w-5 h-5" />;
    }
    return <TrendingUp className="w-5 h-5" />;
  };

  // 파도 색상 그라데이션 (브랜드 가이드라인 기반)
  const getStepColor = (position: number, total: number) => {
    const colors = [
      'from-cyan-400 to-cyan-500',    // wave-surface
      'from-cyan-500 to-cyan-600',    // wave-shallow  
      'from-cyan-600 to-cyan-700',    // wave-medium
      'from-cyan-700 to-cyan-800',    // wave-deep
      'from-cyan-800 to-cyan-900',    // wave-abyss
      'from-purple-500 to-purple-600' // connection-spark
    ];
    return colors[Math.min(position - 1, colors.length - 1)];
  };

  // ISO 8601 기간을 사람이 읽기 쉬운 형식으로 변환
  const formatISODuration = (duration: string) => {
    if (!duration || !duration.startsWith('PT')) return duration;

    const timeString = duration.substring(2);
    let minutes = 0;
    let seconds = 0;

    const minuteMatch = timeString.match(/(\d+)M/);
    if (minuteMatch) {
      minutes = parseInt(minuteMatch[1], 10);
    }

    const secondMatch = timeString.match(/(\d+)S/);
    if (secondMatch) {
      seconds = parseInt(secondMatch[1], 10);
    }
    
    if (minutes > 0 && seconds > 0) {
        return `${minutes}분 ${seconds}초`;
    }
    if (minutes > 0) {
        return `${minutes}분`;
    }
    if (seconds > 0) {
        return `${seconds}초`;
    }
    return '시간 정보 없음';
  };

  // 시간 포맷팅 - 클라이언트 사이드에서만 렌더링
  const TimeDisplay = ({ isoString, className = "" }: { isoString: string; className?: string }) => (
    <ClientTimeDisplay 
      createdAt={isoString}
      className={className}
      fallbackText="시간 정보 없음"
    />
  );

  // 지속 시간 계산
  const calculateDuration = (start: string, end?: string) => {
    if (!end) return null;
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMinutes = Math.round((endTime - startTime) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}분`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}시간 ${minutes}분`;
  };

  return (
    <div className={`bg-gradient-to-br from-cyan-50 to-purple-50 rounded-2xl p-6 ${className}`}>
      {/* 헤더 섹션 - NotebookLM 스타일 */}
      <div className="mb-8">
        <div 
          className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-white/30 rounded-lg p-2 -m-2 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">My Journey</h2>
            <p className="text-sm text-gray-600">Atomic Memo to Summary Note</p>
          </div>
          <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* 요약 메트릭 - Linear 스타일 */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 text-cyan-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">총 소요시간</span>
              </div>
              <div className="text-xl font-bold text-gray-800">{formatISODuration(learningJourney.totalTime)}</div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">학습 단계</span>
              </div>
              <div className="text-xl font-bold text-gray-800">{learningJourney.totalSteps || learningJourney.step.length}단계</div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">학습 기간</span>
              </div>
              <div className="text-xl font-bold text-gray-800">
                {learningJourney.timeSpan ? 
                  calculateDuration(learningJourney.timeSpan.startDate, learningJourney.timeSpan.endDate) || '진행중' :
                  formatISODuration(learningJourney.totalTime) || '진행중'
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 타임라인 시각화 - Obsidian + 파도 테마 */}
      {isExpanded && (
        <div>
          <div className="relative">
            {/* 파도 배경선 */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-200 via-cyan-400 to-purple-400 opacity-30"></div>
            
            <div className="space-y-6">
              {learningJourney.step.map((step, index) => {
                const isSelected = selectedStep === step.position;
                const nextStep = learningJourney.step[index + 1];
                const duration = nextStep ? calculateDuration(step.startTime, nextStep.startTime) : null;
                
                return (
                  <div
                    key={step.position}
                    className={`relative transition-all duration-300 cursor-pointer ${
                      isSelected ? 'scale-105' : 'hover:scale-102'
                    }`}
                    onClick={() => setSelectedStep(isSelected ? null : step.position)}
                  >
                    {/* 단계 노드 */}
                    <div className="flex items-start gap-4">
                      <div className={`relative z-10 w-16 h-16 bg-gradient-to-r ${getStepColor(step.position, learningJourney.totalSteps || learningJourney.step.length)} rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ${
                        isSelected ? 'ring-4 ring-cyan-200 shadow-xl' : ''
                      }`}>
                        {getStepIcon(step.name, step.position)}
                      </div>
                      
                      {/* 단계 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 ${
                          isSelected ? 'border-cyan-300 shadow-lg' : 'border-white/30 hover:border-cyan-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-800 truncate">{step.name}</h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {step.position}단계
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <TimeDisplay isoString={step.startTime} />
                            </div>
                            {duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {duration}
                              </div>
                            )}
                          </div>
                          
                          {/* 확장된 상세 정보 */}
                          {isSelected && step.action && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="text-sm">
                                <div className="font-medium text-gray-700 mb-2">상세 정보:</div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="text-xs text-gray-600">
                                    <strong>액션 타입:</strong> {step.action.type}
                                  </div>
                                  {step.action.result && (
                                    <div className="mt-2 text-xs text-gray-600">
                                      <strong>결과:</strong> 
                                      {typeof step.action.result === 'object' ? (
                                        Array.isArray(step.action.result)
                                          ? step.action.result.slice(0, 3).join(', ') + (step.action.result.length > 3 ? '...' : '')
                                          : Object.entries(step.action.result)
                                              .map(([key, value]) => `${key}: ${String(value)}`)
                                              .join(', ')
                                      ) : (
                                        step.action.result
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 파도 연결선 */}
                    {index < learningJourney.step.length - 1 && (
                      <div className="absolute left-8 top-16 w-0.5 h-6 bg-gradient-to-b from-cyan-300 to-cyan-400 opacity-60"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* 하단 인사이트 - NotebookLM 스타일 */}
          <div className="mt-8 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
            <div className="text-sm text-gray-600">
              <strong className="text-gray-800">AI 분석 포인트:</strong> 이 학습 여정은 HABITUS33의 "Prompt Free, AI - Link" 철학을 보여줍니다. 
              {learningJourney.totalSteps || learningJourney.step.length}단계에 걸쳐 작은 시작이 깊은 학습으로 확산되는 파도 효과를 확인할 수 있습니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningJourneyVisualization; 
import React from 'react';
import ClientTimeDisplay from './ClientTimeDisplay';

interface LearningJourneyData {
  totalTime: string;
  totalSteps?: number;
  timeSpan?: {
    startDate: string;
    endDate: string;
  };
  step: Array<{
    position: number;
    name: string;
    description: string;
    startTime: string;
    action?: {
      type: string;
      result?: any;
    };
  }>;
}

interface Props {
  learningJourney: LearningJourneyData;
  title: string;
}

const AIAccessibleData: React.FC<Props> = ({ learningJourney, title }) => {
  // AI가 읽기 쉬운 형태로 학습 여정 데이터를 구조화
  const formatLearningJourneyForAI = () => {
    const steps = learningJourney.step.map((step, index) => {
      const nextStep = learningJourney.step[index + 1];
      const duration = nextStep ? 
        Math.round((new Date(nextStep.startTime).getTime() - new Date(step.startTime).getTime()) / (1000 * 60)) : 
        null;
      
      return `
단계 ${step.position}: ${step.name}
- 설명: ${step.description}
- 시작 시간: ${step.startTime} (UTC)
- 소요 시간: ${duration ? `${duration}분` : '진행중'}
- 액션 타입: ${step.action?.type || '정보 없음'}
${step.action?.result ? `- 결과: ${typeof step.action.result === 'object' ? JSON.stringify(step.action.result, null, 2) : step.action.result}` : ''}
      `.trim();
    }).join('\n\n');

    // timeSpan이 없는 경우 첫 번째와 마지막 단계의 시간을 사용
    const startDate = learningJourney.timeSpan?.startDate || learningJourney.step[0]?.startTime;
    const endDate = learningJourney.timeSpan?.endDate || learningJourney.step[learningJourney.step.length - 1]?.startTime;

    return `
=== HABITUS33 생각진화 과정 분석 데이터 ===

제목: ${title}
총 소요 시간: ${learningJourney.totalTime}
총 학습 단계: ${learningJourney.totalSteps || learningJourney.step.length}단계
학습 기간: ${startDate || '정보 없음'} ~ ${endDate || '정보 없음'} (UTC)

=== 단계별 상세 정보 ===

${steps}

=== 학습 패턴 분석 포인트 ===

1. AMFA 프레임워크 적용: Atomic Memo → Memo Evolve → Furnace Knowledge → AI Link
2. 파도 효과: 3분 읽기에서 시작하여 깊은 학습으로 확산
3. 시간 흐름: 각 단계별 소요 시간과 학습 깊이의 상관관계
4. 개인화된 학습: 사용자의 읽기 속도, 메모 스타일, 지식 연결 패턴
5. 지속 가능성: 부담 없는 시작에서 의미 있는 결과로의 자연스러운 진행

        이 데이터는 HABITUS33의 "Prompt Free, AI - Link" 철학을 구현한 실제 학습 사례입니다.
AI 에이전트는 이 정보를 바탕으로 학습자의 패턴을 분석하고 개선점을 제안할 수 있습니다.

주의: 시간 정보는 UTC 기준으로 표시되며, 실제 사용자 화면에서는 현지 시간대로 변환되어 표시됩니다.
    `.trim();
  };

  return (
    <div className="sr-only" aria-hidden="true">
      {/* 스크린 리더와 AI 크롤러를 위한 구조화된 데이터 */}
      <div id="ai-accessible-learning-journey" data-ai-content="learning-journey-analysis">
        <h2>생각진화 과정 상세 분석 (AI 분석용)</h2>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          {formatLearningJourneyForAI()}
        </pre>
      </div>
      
      {/* 테이블 형태로도 제공 */}
      <table id="learning-journey-data-table" data-ai-content="structured-data">
        <caption>HABITUS33 생각진화 과정 구조화 데이터</caption>
        <thead>
          <tr>
            <th>단계</th>
            <th>이름</th>
            <th>설명</th>
            <th>시작시간</th>
            <th>액션타입</th>
          </tr>
        </thead>
        <tbody>
          {learningJourney.step.map((step) => (
            <tr key={step.position}>
              <td>{step.position}</td>
              <td>{step.name}</td>
              <td>{step.description}</td>
              <td>{new Date(step.startTime).toISOString()}</td>
              <td>{step.action?.type || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AIAccessibleData; 
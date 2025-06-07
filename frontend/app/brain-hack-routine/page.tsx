"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// Heroicons 임포트 (outline 스타일 사용)
import {
  LightBulbIcon,
  UserGroupIcon,
  AcademicCapIcon, 
  BriefcaseIcon,
  CubeIcon,
  BoltIcon,
  LinkIcon as LinkIconSolid, // Link와 이름 충돌 방지
  ChartBarIcon,
  ArrowDownCircleIcon,
  // 피드백 루프 다이어그램용 아이콘 추가
  AdjustmentsHorizontalIcon as Target, // Target 대신 조정 아이콘 사용
  ArrowLongRightIcon, // 긴 화살표 사용
  BeakerIcon as Activity, // Activity 대신 비커 아이콘 사용 (실험/실행 의미)
  CpuChipIcon, // Brain 대신 CPU 칩 아이콘 사용 (처리 의미)
  AdjustmentsHorizontalIcon, // <-- ensure this is imported
  // Micro-Reading 도식화 및 설명용 아이콘 추가
  BookOpenIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  SparklesIcon, // 기대 효과에 사용 (긍정적 변화)
  InformationCircleIcon, // 툴팁 아이콘으로 활용
} from '@heroicons/react/24/outline';

import Section from '../../components/common/Section';
import PageContainer from '../../components/common/PageContainer';
import PageTitle from '../../components/common/PageTitle';
import QuickNavCard from '../../components/common/QuickNavCard';
// RoutineSection 사용 안함

// 테마 색상 정의 (유지)
const cyberTheme = {
  primary: 'text-cyan-400',
  secondary: 'text-purple-400',
  bgPrimary: 'bg-gray-900',
  bgSecondary: 'bg-gray-800', // 섹션 배경으로 사용
  cardBg: 'bg-gray-800/60', // 카드 배경 (약간 투명도 추가)
  borderPrimary: 'border-cyan-500',
  borderSecondary: 'border-purple-500',
  gradient: 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900',
  textMuted: 'text-gray-400',
  textLight: 'text-gray-300',
  hrBorder: 'border-gray-700', 
};

// --- Archetype Specific Themes ---
const learningTheme = {
  primary: 'text-cyan-300',
  secondary: 'text-cyan-200',
  border: 'border-cyan-600',
  bgAccent: 'bg-cyan-900/50',
  hoverBgAccent: 'hover:bg-cyan-800/70',
  ring: 'focus:ring-cyan-600/50',
  skillButtonBg: 'bg-gray-900',
  skillButtonHover: 'hover:bg-cyan-800',
  skillButtonBorder: 'border-cyan-700',
  skillPopupBorder: 'border-cyan-600',
  skillPopupTitle: 'text-cyan-200',
  skillConnector: 'text-cyan-600',
};

const productivityTheme = {
  primary: 'text-green-300',
  secondary: 'text-green-200',
  border: 'border-green-600',
  bgAccent: 'bg-green-900/50',
  hoverBgAccent: 'hover:bg-green-800/70',
  ring: 'focus:ring-green-500/50',
  skillButtonBg: 'bg-gray-900',
  skillButtonHover: 'hover:bg-green-800',
  skillButtonBorder: 'border-green-700',
  skillPopupBorder: 'border-green-600',
  skillPopupTitle: 'text-green-200',
  skillConnector: 'text-green-600',
};

const capacityTheme = {
  primary: 'text-orange-300',
  secondary: 'text-orange-200',
  border: 'border-orange-600',
  bgAccent: 'bg-orange-900/50',
  hoverBgAccent: 'hover:bg-orange-800/70',
  ring: 'focus:ring-orange-500/50',
  skillButtonBg: 'bg-gray-900',
  skillButtonHover: 'hover:bg-orange-800',
  skillButtonBorder: 'border-orange-700',
  skillPopupBorder: 'border-orange-600',
  skillPopupTitle: 'text-orange-200',
  skillConnector: 'text-orange-600',
};

const speedTheme = {
  primary: 'text-purple-300',
  secondary: 'text-purple-200',
  border: 'border-purple-600',
  bgAccent: 'bg-purple-900/50',
  hoverBgAccent: 'hover:bg-purple-800/70',
  ring: 'focus:ring-purple-500/50',
  skillButtonBg: 'bg-gray-900',
  skillButtonHover: 'hover:bg-purple-800',
  skillButtonBorder: 'border-purple-700',
  skillPopupBorder: 'border-purple-600',
  skillPopupTitle: 'text-purple-200',
  skillConnector: 'text-purple-600',
};

// Add Blue Theme for Productivity Planning Branch
const blueTheme = {
  primary: 'text-blue-300',
  secondary: 'text-blue-200',
  border: 'border-blue-600',
  bgAccent: 'bg-blue-900/50',
  hoverBgAccent: 'hover:bg-blue-800/70',
  ring: 'focus:ring-blue-500/50',
  skillButtonBg: 'bg-gray-900',
  skillButtonHover: 'hover:bg-blue-800',
  skillButtonBorder: 'border-blue-700',
  skillPopupBorder: 'border-blue-600',
  skillPopupTitle: 'text-blue-200',
  skillConnector: 'text-blue-600',
};

// Add Indigo Theme for Capacity Management Branch
const indigoTheme = {
  primary: 'text-indigo-300',
  secondary: 'text-indigo-200',
  border: 'border-indigo-600',
  bgAccent: 'bg-indigo-900/50',
  hoverBgAccent: 'hover:bg-indigo-800/70',
  ring: 'focus:ring-indigo-500/50',
  skillButtonBg: 'bg-gray-900',
  skillButtonHover: 'hover:bg-indigo-800',
  skillButtonBorder: 'border-indigo-700',
  skillPopupBorder: 'border-indigo-600',
  skillPopupTitle: 'text-indigo-200',
  skillConnector: 'text-indigo-600',
};

// Add Teal Theme for Speed Shifting Branch
const tealTheme = {
  primary: 'text-teal-300',
  secondary: 'text-teal-200',
  border: 'border-teal-600',
  bgAccent: 'bg-teal-900/50',
  hoverBgAccent: 'hover:bg-teal-800/70',
  ring: 'focus:ring-teal-500/50',
  skillButtonBg: 'bg-gray-900',
  skillButtonHover: 'hover:bg-teal-800',
  skillButtonBorder: 'border-teal-700',
  skillPopupBorder: 'border-teal-600',
  skillPopupTitle: 'text-teal-200',
  skillConnector: 'text-teal-600',
};

// Add Red Theme for Speed Responding Branch
const redTheme = {
  primary: 'text-red-300',
  secondary: 'text-red-200',
  border: 'border-red-600',
  bgAccent: 'bg-red-900/50',
  hoverBgAccent: 'hover:bg-red-800/70',
  ring: 'focus:ring-red-500/50',
  skillButtonBg: 'bg-gray-900',
  skillButtonHover: 'hover:bg-red-800',
  skillButtonBorder: 'border-red-700',
  skillPopupBorder: 'border-red-600',
  skillPopupTitle: 'text-red-200',
  skillConnector: 'text-red-600',
};

// --- 새 섹션 컴포넌트 정의 ---
const SectionWrapper = ({
  id,
  className = "",
  innerClassName = "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
  children,
}: {
  id?: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) => (
  <section id={id} className={`py-12 md:py-16 ${className}`}>
    <div className={innerClassName}>
      {children}
    </div>
  </section>
);

// SectionTitle: icon prop 다시 추가 (Heroicons 타입으로)
const SectionTitle = ({ icon: Icon, title, color }: { 
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; // Heroicons 타입
  title: string; 
  color: string; 
}) => (
  <h2 className={`text-3xl font-bold mb-8 flex items-center ${color}`}>
    {Icon && <Icon className="mr-3 h-7 w-7 flex-shrink-0" />} {/* 아이콘 크기 약간 증가 */}
    <span className="flex-1">{title}</span> {/* 제목 영역 확보 */}
  </h2>
);

const SectionParagraph = ({ children }: { children: React.ReactNode }) => (
  <p className={`${cyberTheme.textLight} mb-4 leading-loose text-base font-normal`}>{children}</p>
);

const Highlight = ({ children, color }: { children: React.ReactNode, color: string }) => (
  <strong className={`font-bold ${color}`}>{children}</strong> 
);
// --- /새 섹션 컴포넌트 정의 ---

// --- Universal Feedback Loops Section ---
function UniversalFeedbackLoopsSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  // 시나리오별 테마 컬러
  const scenarioThemes = [
    'from-cyan-700 to-blue-700', // 건망증
    'from-purple-700 to-pink-700', // 문해력
    'from-emerald-700 to-green-700', // 실행력
  ];
  // 단계별 아이콘 매핑
  const stepIcons = {
    '상황': LightBulbIcon,
    '목표': Target,
    '실행': Activity,
    '피드백': ChartBarIcon,
    '조절': Target,
    '결과': ArrowDownCircleIcon,
  } as const;
  // 사례별 대표 아이콘과 공감 대사
  const scenarioIcons = [
    { icon: LightBulbIcon, label: '건망증' },
    { icon: AcademicCapIcon, label: '문해력' },
    { icon: BoltIcon, label: '실행력' },
  ] as const;
  const scenarios = [
    {
      mission: '건망증: 중요한 약속/할 일을 자꾸 잊어버린다',
      steps: [
        { label: '상황', text: '친구와의 약속, 업무 미팅, 장 볼 품목 등 일상적인 일을 자주 깜빡한다.' },
        { label: '목표', text: '중요한 일정을 놓치지 않고, 필요한 정보를 제때 기억해낸다.' },
        { label: '실행', text: 'TS 모드로 오늘 할 일/일정을 빠르고 읽고, 메모/플래시카드로 입력.' },
        { label: '피드백', text: '플래시카드로 스스로 점검. 놓친 항목은 ZenGo Myverse로 암기 게임화.' },
        { label: '조절', text: '자주 잊는 유형(예: 시간, 장소, 준비물 등)을 분석해 미리 입력.' },
        { label: '결과', text: '실제 약속/업무에서 실수 감소, 기억력에 대한 자신감 회복.' },
      ],
      explanation: '건망증은 정보 입력-저장-인출의 피드백 루프가 약할 때 자주 발생합니다. Habitus33의 TS 모드와 플래시카드, ZenGo Myverse를 활용하면, 반복적이고 체계적인 점검과 훈련을 통해 기억의 고리를 강화할 수 있습니다.'
    },
    {
      mission: '문해력: 긴 글을 읽어도 내용이 머리에 남지 않는다',
      steps: [
        { label: '상황', text: '기사, 리포트, 책을 읽었지만 핵심이 뭔지 모르겠고, 금방 잊어버린다.' },
        { label: '목표', text: '읽은 내용을 정확히 이해하고, 내 언어로 요약할 수 있다.' },
        { label: '실행', text: 'TS 모드로 빠르게 전체 구조 파악 → 각 단락별 핵심을 메모/플래시카드로 정리.' },
        { label: '피드백', text: '플래시카드로 스스로 질문/답변하며 이해도 점검. 막히는 부분은 ZenGo Myverse로 집중 훈련.' },
        { label: '조절', text: '이해가 안 되는 부분은 다시 읽고, 질문을 바꿔보거나, 플래시카드/메모 구조를 수정.' },
        { label: '결과', text: '글의 핵심을 빠르게 파악하고, 오래 기억하며, 필요할 때 쉽게 인출.' },
      ],
      explanation: '문해력 문제는 읽기-정리-점검-보완의 피드백 루프가 약할 때 발생합니다. Habitus33의 TS 모드, 플래시카드, ZenGo Myverse를 활용하면, 읽은 내용을 반복적으로 점검하고, 부족한 부분을 집중적으로 보완할 수 있습니다.'
    },
    {
      mission: '실행력: 계획만 세우고 실제로는 행동하지 못한다',
      steps: [
        { label: '상황', text: '할 일 목록은 길지만, 막상 시작을 미루거나 중간에 포기한다.' },
        { label: '목표', text: '작은 일부터 바로 실행에 옮기고, 꾸준히 실천한다.' },
        { label: '실행', text: 'TS 모드로 오늘 할 일/목표를 빠르게 읽고, 플래시카드로 "할일-이유" 미션 생성.' },
        { label: '피드백', text: '실행 후, 플래시카드로 완료 체크 및 미실행 원인 분석.' },
        { label: '조절', text: '실행이 안 된 원인을 분석해, 목표를 더 작게 쪼개거나, ZenGo Myverse로 암기 게임화.' },
        { label: '결과', text: '작은 성공 경험이 쌓이며, 점점 더 큰 목표도 실행할 수 있게 됨.' },
      ],
      explanation: '실행력 부족은 목표-실행-점검-보완의 피드백 루프가 약할 때 생깁니다. Habitus33의 TS 모드, 플래시카드, ZenGo Myverse를 활용하면, 실행 과정을 시각화하고, 반복 점검과 보완을 통해 행동 습관을 강화할 수 있습니다.'
    },
  ];

  // 육각형 꼭짓점 좌표 (60도 간격, 시계방향, 더 바깥쪽)
  const hexPos = [
    'top-[2%] left-1/2 -translate-x-1/2', // 12시
    'top-[16%] right-[2%]', // 2시
    'bottom-[16%] right-[2%]', // 4시
    'bottom-[2%] left-1/2 -translate-x-1/2', // 6시
    'bottom-[16%] left-[2%]', // 8시
    'top-[16%] left-[2%]', // 10시
  ];

  return (
    <Section
      id="feedback-loops"
      title="상황에 맞는 루프를 선택하세요"
      icon={LightBulbIcon}
      width="normal"
    >
      {/* 안내문구 추가 */}
      <div className="text-center mb-6">
        <p className="text-base text-gray-300">내가 겪는 문제를 골라보세요. 각 상황에 맞는 뇌 최적화 루프를 안내합니다.</p>
      </div>
      {/* 탭 버튼 */}
      <div className="flex justify-center gap-4 mb-8">
        {scenarioIcons.map((tab, idx) => {
          const isActive = activeTab === idx;
          return (
            <button
              key={tab.label}
              className={`flex flex-col items-center justify-center px-6 py-4 rounded-2xl border-2 transition-all duration-200 focus:outline-none
                bg-gradient-to-br ${scenarioThemes[idx]} 
                ${isActive
                  ? 'scale-105 shadow-2xl border-transparent ring-2 ring-cyan-300/60'
                  : 'opacity-80 border-gray-600 hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-cyan-400/40'}
                hover:brightness-110 focus:brightness-110
              `}
              style={{ minWidth: 120 }}
              onClick={() => setActiveTab(idx)}
              type="button"
              tabIndex={0}
            >
              <tab.icon className={`h-10 w-10 mb-2 ${isActive ? 'text-white' : 'text-cyan-200'}`} />
              <span className={`text-lg font-bold ${isActive ? 'text-white' : 'text-cyan-100'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
      {/* 선택된 사례의 6단계 육각형 구조 */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-[520px] aspect-square mx-auto mb-12 hidden sm:block">
          {/* 중앙 루프 아이콘 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <ClockwiseLoopIcon />
          </div>
          {/* 6단계 육각형 배치 */}
          {scenarios[activeTab].steps.map((step, idx) => {
            const StepIcon = stepIcons[step.label as keyof typeof stepIcons] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
            const isHovered = hoveredStep === idx;
            return (
              <div
                key={idx}
                className={`absolute ${hexPos[idx]} flex flex-col items-center min-w-[140px] max-w-[200px] w-auto rounded-xl cursor-pointer transition-all duration-200
                  ${isHovered ? 'scale-110 z-10 bg-cyan-900/80 shadow-2xl p-4' : 'p-2'}
                `}
                onMouseEnter={() => setHoveredStep(idx)}
                onMouseLeave={() => setHoveredStep(null)}
                onFocus={() => setHoveredStep(idx)}
                onBlur={() => setHoveredStep(null)}
                tabIndex={0}
              >
                <StepIcon className={`h-9 w-9 mb-1 transition-colors duration-200 ${isHovered ? 'text-cyan-200' : 'text-cyan-300'}`} />
                <div className={`flex items-center mb-1 ${isHovered ? 'text-yellow-400' : ''}`}>
                  <span className="font-bold mr-2 text-yellow-300 text-xs">{idx + 1}</span>
                  <span className={`font-normal text-cyan-200 text-sm text-center`}>{step.label}</span>
                </div>
                <div className="text-gray-300 text-xs text-left whitespace-normal break-words overflow-visible max-w-[180px] leading-relaxed mb-1">{step.text}</div>
              </div>
            );
          })}
        </div>
        {/* 모바일: 세로 스택 */}
        <div className="sm:hidden mb-12 w-full">
          <div className="flex justify-center w-full mb-4"><ClockwiseLoopIcon /></div>
          {scenarios[activeTab].steps.map((step, idx) => {
            const StepIcon = stepIcons[step.label as keyof typeof stepIcons] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
            return (
              <div key={idx} className="flex flex-col items-start mb-10">
                <StepIcon className="h-9 w-9 text-cyan-300 mb-1" />
                <div className="flex items-center mb-1">
                  <span className="font-bold mr-2 text-yellow-300 text-xs">{idx + 1}</span>
                  <span className="font-normal text-cyan-200 text-sm">{step.label}</span>
                </div>
                <div className="text-gray-300 text-xs text-left whitespace-normal break-words overflow-visible max-w-[180px] leading-relaxed mb-1">{step.text}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-xs text-cyan-400 font-semibold text-center max-w-2xl mx-auto">
        {scenarios[activeTab].explanation}
      </div>
    </Section>
  );
}
// --- /Universal Feedback Loops Section ---

export default function CyberneticsFeedbackLoopPage() {
  const [hoveredDiagramStep, setHoveredDiagramStep] = useState<number | null>(null);
  const [hoveredUtility, setHoveredUtility] = useState<number | null>(null);
  const [hoveredEffect, setHoveredEffect] = useState<number | null>(null);

  const diagramSteps = [
    { title: "1. 목표 설정", description: "('3분 내 1페이지 이해' 등<br/>구체적이고 측정 가능하게)", icon: Target },
    { title: "2. 몰입 독서 ", description: "(<Highlight color={cyberTheme.primary}>TS 모드</Highlight> 활용,<br/>방해 요소 완벽 차단)", icon: BookOpenIcon },
    { title: "3. 정보 인출", description: "(주제어, 핵심 메모, 질문<br/>신속하게 기록)", icon: PencilSquareIcon },
    { title: "4. 자기 성찰", description: "(이해도, 집중도, 속도 분석<br/>TS 모드 데이터 기반)", icon: ChartBarIcon },
    { title: "5. 다음 설계", description: "(피드백 기반 전략 수정,<br/>목표 미세 조정)", icon: Cog6ToothIcon },
  ];

  const utilityItems = [
    {
      icon: AcademicCapIcon,
      title: "공부할 게 너무 많아요",
      description: "시험 범위가 방대하고 집중이 어렵나요? Micro-Reading은 <Highlight color={cyberTheme.secondary}>학습 효율을 극대화</Highlight>하는 당신의 도구입니다. 짧은 시간 초고도 집중으로 핵심 내용을 빠르게 흡수하고, 즉각적인 피드백으로 <Highlight color={cyberTheme.primary}>이해도를 점검</Highlight>하며 자신감을 키우세요. <Highlight color={cyberTheme.secondary}>전략적 학습</Highlight>으로 목표를 달성하고 지적으로 성장하세요.",
    },
    {
      icon: BriefcaseIcon,
      title: "읽어야 할 문서가 산더미에요",
      description: "매일 쏟아지는 보고서와 문서의 홍수 속에서 핵심 파악이 어렵나요? Micro-Reading은 정보 과부하 시대 직장인의 <Highlight color={cyberTheme.secondary}>필수 업무 능력</Highlight>입니다. 제한된 시간 내 필요한 내용만 신속하게 추출하고, 명확한 이해로 <Highlight color={cyberTheme.primary}>업무 통찰력</Highlight>을 길러 효율을 극대화하세요. 더 이상 야근 없는 저녁 있는 삶을 만드세요.",
    },
    {
      icon: BookOpenIcon,
      title: "읽고 싶은데 너무 두꺼워요",
      description: "마음속 고전 목록은 길지만, 방대한 분량에 도전이 망설여지시나요? Micro-Reading은 독서에 대한 <Highlight color={cyberTheme.secondary}>심리적 부담을 낮추고</Highlight>, 짧은 호흡으로 <Highlight color={cyberTheme.primary}>꾸준한 독서 습관</Highlight>을 만들어줍니다. 두꺼운 고전도 잘게 쪼개어 음미하며 <Highlight color={cyberTheme.secondary}>깊이 있는 사유와 지적 만족감</Highlight>을 통해 삶의 풍요로움을 경험하세요.",
    },
    {
      icon: Cog6ToothIcon,
      title: "읽어야 하는데 너무 어려워요",
      description: "생소한 용어와 복잡한 개념으로 가득 찬 전문서적 앞에서 좌절한 경험이 있나요? Micro-Reading은 <Highlight color={cyberTheme.secondary}>어떤 난해한 지식이라도 체계적으로 정복</Highlight>하도록 돕는 <Highlight color={cyberTheme.primary}>학습 내비게이션</Highlight>입니다. 복잡한 정보를 소단위로 나누어 집중 학습하고, 즉각적인 피드백으로 소화하며 <Highlight color={cyberTheme.secondary}>실무 적용 역량</Highlight>을 키워 전문가로 거듭나세요.",
    },
  ];

  const effectItems = [
    {
      icon: BoltIcon,
      title: "멍했던 뇌가 깨어납니다",
      description: "집중하려 해도 금방 딴생각에 빠지나요? Micro-Reading은 짧고 명확한 목표 달성이 주는 성취감으로 <Highlight color={cyberTheme.secondary}>뇌의 집중 스위치를 켭니다</Highlight>. 이전과 다른 <Highlight color={cyberTheme.primary}>깊은 몰입의 세계</Highlight>로 당신을 안내하여, 방해 요소를 차단하고 정보에 온전히 집중하는 놀라운 경험을 선사합니다. 더 이상 '책만 펴면 딴생각'은 없습니다.",
    },
    {
      icon: CpuChipIcon,
      title: "이해가 되기 시작합니다",
      description: "분명히 읽었는데, 돌아서면 내용이 기억나지 않아 답답하셨죠? Micro-Reading은 단순 암기를 넘어, 능동적 정보처리와 반복적 인출 연습으로 <Highlight color={cyberTheme.secondary}>지식을 당신의 것으로 만듭니다</Highlight>. TS 모드의 <Highlight color={cyberTheme.primary}>주제어 도출 및 메모 작성</Highlight>은 정보에 의미를 부여하여 <Highlight color={cyberTheme.secondary}>활용 가능한 지혜</Highlight>로 발전시키고, 장기기억으로 저장합니다.",
    },
    {
      icon: ChartBarIcon,
      title: "지적 성장이 느껴집니다",
      description: "같은 시간을 투자해도 결과가 다른 이유는 무엇일까요? 바로 <Highlight color={cyberTheme.secondary}>학습 과정을 통제하는 메타인지 능력</Highlight> 차이입니다. Habitus33의 TS 모드가 제공하는 데이터 피드백은 당신의 학습을 분석하여 <Highlight color={cyberTheme.primary}>강점과 약점을 객관적으로 파악</Highlight>하도록 돕습니다. 스스로 학습 전략을 조율하며 '공부머리'가 트이는 성장을 경험하세요.",
    },
    {
      icon: SparklesIcon,
      title: "읽는 속도가 빨라집니다",
      description: "혹시 새해 '독서' 목표가 매번 작심삼일로 끝나지는 않으셨나요? Micro-Reading은 매일의 작은 성공으로 <Highlight color={cyberTheme.secondary}>독서에 대한 긍정적 감정</Highlight>을 심어줍니다. 지루함 대신 <Highlight color={cyberTheme.primary}>즉각적인 피드백과 성취감</Highlight>을 통해 독서 자체의 즐거움을 찾고, 평생 학습의 가장 든든한 습관을 만들어갈 수 있습니다.",
    },
  ];

  return (
    <PageContainer className={`${cyberTheme.gradient} text-gray-200 min-h-screen py-16 px-4 md:px-6`}>
      <PageTitle className={`text-4xl md:text-5xl font-bold mb-12 text-center ${cyberTheme.primary}`}>
        작고 강한 몰입, Atomic Reading
        <span className={`block text-xl md:text-2xl font-normal ${cyberTheme.textMuted} mt-3`}>Habitus33의 바탕 원리</span>
      </PageTitle>

      <SectionWrapper className={`${cyberTheme.bgSecondary} rounded-xl shadow-2xl`} id="micro-reading-intro">
        <SectionTitle 
          title="TS : Atomic-Reading"
          icon={LightBulbIcon} 
          color={cyberTheme.primary} 
        />
        
        <SectionParagraph>
          
          Habitus33의 <Highlight color={cyberTheme.primary}>핵심</Highlight>을 관통하는 핵심 엔진, 바로 <Highlight color={cyberTheme.secondary}>Atomic-Reading</Highlight>입니다. 이는 단순히 책장을 빠르게 넘기는 속독과는 차원이 다른, <Highlight color={cyberTheme.primary}>인지과학 기반의 정교한 독서 전략</Highlight>입니다. 마치 최정상급 운동선수가 과학적인 인터벌 트레이닝(HIIT)으로 경기 능력을 극한까지 끌어올리듯, Atomic-Reading은 사용자의 두뇌가 정보를 가장 효율적으로 처리하고 깊이 있는 학습이 가능하도록 설계되었습니다. 핵심은 <Highlight color={cyberTheme.secondary}>짧은 단위의 명확한 목표 설정</Highlight>과 <Highlight color={cyberTheme.secondary}>초고도 몰입 독서</Highlight>, 그리고 세션 직후 이어지는 <Highlight color={cyberTheme.secondary}>즉각적인 독서 메모</Highlight>의 반복 사이클입니다.
        </SectionParagraph>

        <div className="my-12 p-6 md:p-8 bg-gray-900/60 rounded-2xl shadow-xl border border-cyan-600/40">
          <h3 className={`text-2xl md:text-3xl font-semibold mb-8 text-center ${cyberTheme.primary} flex items-center justify-center`}>
            <ArrowPathIcon className="h-8 w-8 md:h-9 md:w-9 mr-3 animate-spin-slow" />
            5단계 선순환 피드백 루프
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 md:gap-4 items-start">
            {diagramSteps.map((step, index) => {
              const IconComponent = step.icon; // 각 스텝의 아이콘 컴포넌트 할당
              return (
                <div 
                  key={index}
                  className="relative flex flex-col items-center text-center p-3 bg-gray-800/50 rounded-lg min-h-[120px] justify-center cursor-pointer" 
                  onMouseEnter={() => setHoveredDiagramStep(index)}
                  onMouseLeave={() => setHoveredDiagramStep(null)}
                >
                  <IconComponent className={`h-10 w-10 mb-2 ${cyberTheme.secondary}`} />
                  <p className="font-semibold text-md text-gray-100" dangerouslySetInnerHTML={{ __html: step.title }} />
                  {hoveredDiagramStep === index && (
                    <div className="absolute bottom-full mb-2 w-max max-w-xs p-3 bg-gray-700 text-gray-100 text-xs rounded-md shadow-lg z-20 leading-snug" dangerouslySetInnerHTML={{ __html: step.description }} />
                  )}
                </div>
              );
            })}
          </div>
          <p className={`${cyberTheme.textLight} text-sm text-center mt-8 leading-relaxed`}>
            Habitus33의 <Highlight color={cyberTheme.primary}>TS 모드</Highlight>는 이 5단계 루프를 유기적으로 지원하며, 반복적인 훈련을 통해 독서 능력 뿐 아니라 <Highlight color={cyberTheme.secondary}>메타인지</Highlight> 능력까지 극적으로 향상시킵니다.
          </p>
        </div>

        <SectionParagraph>
          <BoltIcon className="inline-block h-6 w-6 mr-2 text-purple-400 align-middle" />
          Atomic-Reading의 진정한 위력은 <Highlight color={cyberTheme.primary}>지속적이고 즉각적인 셀프 피드백</Highlight> 시스템에 있습니다. 매 TS 모드 세션 종료 시, Habitus33은 사용자의 이해도, 집중 시간, 독서 속도 등 핵심 성과 지표를 <Highlight color={cyberTheme.secondary}>객관적인 데이터로 명확히 제시</Highlight>합니다. 이 데이터 기반의 성찰 과정은 독서 시 흔히 발생하는 <Highlight color={cyberTheme.primary}>지루함과 정신적 방황을 효과적으로 차단</Highlight>하고, 매 순간 <Highlight color={cyberTheme.secondary}>학습의 주도권을 사용자에게 부여</Highlight>합니다. 이는 단순한 기능이 아닌, <Highlight color={cyberTheme.primary}>사이버네틱스 AI</Highlight>의 정교한 시스템적 구현이며, 사용자는 마치 노련한 항해사가 첨단 항법 장치를 사용하듯 자신의 학습 여정을 능동적으로 설계하고 최적의 성장 경로로 나아갈 수 있도록 지원합니다.
        </SectionParagraph>

        <div className="mt-12 grid md:grid-cols-2 gap-x-10 gap-y-8">
          <div>
            <h4 className={`text-2xl font-semibold mb-5 ${cyberTheme.primary} flex items-center`}>
              <BriefcaseIcon className="h-7 w-7 mr-3" />
              이럴 때 활용하세요
            </h4>
            <ul className={`list-none ${cyberTheme.textLight} space-y-1`}>
              {utilityItems.map((item, index) => {
                const IconComponent = item.icon; // 각 항목의 아이콘 컴포넌트 할당
                return (
                  <li 
                    key={index} 
                    className="relative flex items-start py-2 cursor-pointer" 
                    onMouseEnter={() => setHoveredUtility(index)}
                    onMouseLeave={() => setHoveredUtility(null)}
                  >
                    <IconComponent className="h-6 w-6 mr-3 mt-1 text-cyan-400 flex-shrink-0" />
                    <div className="flex-1">
                      <strong className="font-semibold" dangerouslySetInnerHTML={{ __html: item.title }} />
                      {hoveredUtility === index && (
                        <div className="absolute left-0 top-full mt-2 w-full max-w-md p-3 bg-gray-700 text-gray-100 text-sm rounded-md shadow-lg z-20 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.description }} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h4 className={`text-2xl font-semibold mb-5 ${cyberTheme.primary} flex items-center`}>
              <SparklesIcon className="h-7 w-7 mr-3" />
              이렇게 바뀝니다
            </h4>
            <ul className={`list-none ${cyberTheme.textLight} space-y-1`}>
              {effectItems.map((item, index) => {
                const IconComponent = item.icon; // IconComponent를 여기서 다시 명확히 선언합니다.
                if (!IconComponent) { // 혹시 모를 상황에 대비한 방어 코드 (실제 ReferenceError와는 무관할 수 있음)
                  console.error(`Error: IconComponent is undefined for effectItem at index ${index}:`, item);
                  return <li key={index} className="text-red-500">Error: Icon missing for {item.title}</li>;
                }
                return (
                  <li 
                    key={index} 
                    className="relative flex items-start py-2 cursor-pointer" 
                    onMouseEnter={() => setHoveredEffect(index)}
                    onMouseLeave={() => setHoveredEffect(null)}
                  >
                    <IconComponent className="h-6 w-6 mr-3 mt-1 text-purple-400 flex-shrink-0" />
                    <div className="flex-1">
                      <strong className="font-semibold" dangerouslySetInnerHTML={{ __html: item.title }} />
                      {hoveredEffect === index && (
                        <div className="absolute left-0 top-full mt-2 w-full max-w-md p-3 bg-gray-700 text-gray-100 text-sm rounded-md shadow-lg z-20 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.description }} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

      </SectionWrapper>

      {/* 기존 다른 섹션들 (UniversalFeedbackLoopsSection, UserTypeTabs 등) */}
      <UniversalFeedbackLoopsSection />
      <hr className={`my-16 border-t ${cyberTheme.hrBorder} max-w-4xl mx-auto`} />
      <Section
        id="user-types"
        title="목표에 맞는 루프를 선택하세요"
        icon={UserGroupIcon}
        width="wide"
      >
        <div className="text-center mb-6">
          <p className="text-base text-gray-300">내가 이루고 싶은 목표를 골라보세요. 목표별로 최적화된 루프와 실전 전략을 안내합니다.</p>
        </div>
        <UserTypeTabs />
      </Section>
      <hr className={`my-16 border-t ${cyberTheme.hrBorder} max-w-4xl mx-auto`} />
      <Section
        id="cybernetics"
        className={`${cyberTheme.bgSecondary} rounded-lg shadow-xl`}
        title="마음의 항해사, 사이버네틱스"
        icon={LightBulbIcon}
        variant="filled"
      >
        <SectionParagraph>
           <Highlight color={cyberTheme.primary}>사이버네틱스</Highlight>는 목표를 향해 스스로 조절하는 시스템의 원리입니다. 복잡한 세상을 항해하는 우리 뇌도 이 원리를 따르죠. Habitus33은 이 원리를 활용하여 당신의 <Highlight color={cyberTheme.secondary}>작업 기억 엔진</Highlight>을 최적화합니다.
        </SectionParagraph>
        <SectionParagraph>
          우리가 목표를 향해 나아갈 때, 우리 뇌는 마치 정교한 <Highlight color={cyberTheme.primary}>자동 항법 장치</Highlight>처럼 작동합니다. 
        </SectionParagraph>
        <SectionParagraph>
          <Highlight color={cyberTheme.secondary}>목표 설정</Highlight> (예: '이 내용을 빠르게 이해하겠다!') → <Highlight color={cyberTheme.secondary}>실행</Highlight> (TS 모드로 읽기 시작) → <Highlight color={cyberTheme.secondary}>결과 확인</Highlight> (나의 읽기 속도 데이터 피드백) → <Highlight color={cyberTheme.secondary}>계획 수정/조절</Highlight> (ZenGo로 작업 기억 훈련, 또는 다음 TS 목표 재설정) → 다시 목표 설정... 이 끊임없는 순환이 바로 <Highlight color={cyberTheme.primary}>피드백 루프</Highlight>입니다.
        </SectionParagraph>
        {/* TODO: 피드백 루프 다이어그램 추가 (아이콘으로 임시 대체) */}
        <div className="my-8 flex justify-center items-center space-x-4 text-gray-500">
          <Target className="h-8 w-8" />
          <ArrowLongRightIcon className="h-6 w-6" />
          <Activity className="h-8 w-8" />
          <ArrowLongRightIcon className="h-6 w-6" />
          <ChartBarIcon className="h-8 w-8" />
          <ArrowLongRightIcon className="h-6 w-6" />
          <CpuChipIcon className="h-8 w-8" />
          <ArrowDownCircleIcon className="h-8 w-8 ml-4 transform rotate-90" /> {/* 순환 표시 */} 
      </div>
        <SectionParagraph>
          Habitus33은 <Highlight color={cyberTheme.primary}>TS 모드</Highlight>의 즉각적인 처리 속도 피드백과 <Highlight color={cyberTheme.secondary}>ZenGo</Highlight>의 작업 기억 부하 조절 훈련을 통해, 당신의 <Highlight color={cyberTheme.primary}>전전두엽</Highlight>을 활성화하고 이 피드백 루프를 강화합니다. 결과적으로 <Highlight color={cyberTheme.secondary}>작업 기억의 속도와 용량/지속 시간</Highlight>이 눈에 띄게 향상됩니다.
        </SectionParagraph>
      </Section>
      <hr className={`my-16 border-t ${cyberTheme.hrBorder} max-w-4xl mx-auto`} /> 
      <Section
        id="dashboard-link"
        className="text-center"
        title="성장을 확인하고 루프를 완성하세요"
        icon={LinkIconSolid}
        variant="centered"
      >
         <SectionParagraph>
           대시보드에서 당신의 성장을 직접 확인하세요!
         </SectionParagraph>
        <Link href="/dashboard" className={`inline-flex items-center ${cyberTheme.primary} font-medium hover:underline text-lg`}>
          대시보드 이동
        </Link>
      </Section>

    </PageContainer>
  );
}

// 카드+상세+스킬맵 토글 컴포넌트 (학습 효율 극대화)
function LearningCard() {
  const [showSkillMap, setShowSkillMap] = useState(false);
  const theme = learningTheme; // Use the learning theme
  // 단계별 정보
  const steps = [
    {
      icon: AcademicCapIcon,
      label: '목표 설정',
      desc: '학습 목표와 시험 범위를 명확히 정한다.',
      next: '집중 학습',
      pos: 'top-[6%] left-[8%] md:top-[4%] md:left-[4%]',
    },
    {
      icon: LinkIconSolid,
      label: '집중 학습',
      desc: '핵심 개념과 출제 포인트를 집중적으로 학습한다.',
      next: '자기 점검',
      pos: 'top-[6%] right-[8%] md:top-[4%] md:right-[4%]',
    },
    {
      icon: BoltIcon,
      label: '자기 점검',
      desc: '문제풀이, 플래시카드, 요약 등으로 이해도를 점검한다.',
      next: '피드백/보완',
      pos: 'bottom-[8%] right-[8%] md:bottom-[4%] md:right-[4%]',
    },
    {
      icon: ChartBarIcon,
      label: '피드백/보완',
      desc: '오답·약점 분석 후 학습 전략을 보완한다.',
      next: '목표 설정',
      pos: 'bottom-[8%] left-[8%] md:bottom-[4%] md:left-[4%]',
    },
  ];
  return (
    <div className={`relative bg-gradient-to-br from-cyan-900 via-blue-900 to-purple-900 shadow-2xl rounded-2xl p-8 flex flex-col min-h-[420px] min-w-[320px] w-full max-w-2xl mx-auto`}>
      {!showSkillMap ? (
        <>
          <div className="flex items-center mb-4">
            <AcademicCapIcon className="h-9 w-9 text-cyan-300 mr-3" />
            <h3 className="text-xl font-bold text-cyan-100 flex-1">학습 및 시험</h3>
          </div>
          <button
            className="absolute top-4 right-4 z-10 px-3 py-1 text-xs font-bold rounded-full bg-cyan-700/90 text-white shadow hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            onClick={() => setShowSkillMap(true)}
          >
            스킬맵 보기
          </button>
          {/* 단계별 순환 흐름 시각화 (데스크탑) */}
          <div className="relative w-full max-w-[500px] md:max-w-[500px] aspect-square mx-auto mb-8 hidden sm:block">
            {/* 중앙 루프 아이콘 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <ClockwiseLoopIcon />
            </div>
            {/* 단계들 */}
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className={`absolute ${step.pos} flex flex-col items-center w-[120px]`}>
                  <Icon className="h-10 w-10 text-cyan-300 mb-1" />
                  <div className="flex items-center mb-1">
                    <span className="font-bold mr-2 text-yellow-300 text-xs">{idx + 1}</span>
                    <span className="font-normal text-cyan-200 text-sm text-center">{step.label}</span>
                  </div>
                  <div className="text-gray-300 text-sm text-left whitespace-normal max-w-xs leading-relaxed mb-1">{step.desc}</div>
                  <div className="text-sm text-purple-300 font-normal mt-1">→ 다음: {step.next}</div>
                </div>
              );
            })}
          </div>
          {/* 모바일: 세로 스택 */}
          <div className="sm:hidden mb-8">
            <div className="flex justify-center w-full mb-2"><ClockwiseLoopIcon /></div>
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-start mb-6">
                  <Icon className="h-10 w-10 text-cyan-300 mb-1" />
                  <div className="flex items-center mb-1">
                    <span className="font-bold mr-2 text-yellow-300 text-xs">{idx + 1}</span>
                    <span className="font-normal text-cyan-200 text-sm">{step.label}</span>
                  </div>
                  <div className="text-gray-300 text-sm text-left whitespace-normal max-w-xs leading-relaxed mb-1">{step.desc}</div>
                  <div className="text-sm text-purple-300 font-normal mt-1">→ 다음: {step.next}</div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col flex-1 justify-between h-full">
          <div>
            <h5 className="text-cyan-200 font-bold mb-3 flex items-center text-xl"><AcademicCapIcon className="h-6 w-6 mr-2" />스킬맵</h5>
            <p className="text-cyan-100/80 text-base mb-4">각 스킬을 클릭하면 추천 도서와 팁을 볼 수 있습니다.</p>
            <SkillTree theme={theme} /> {/* Pass theme to SkillTree */}
          </div>
          <button
            className="mt-auto self-end px-4 py-2 text-xs font-bold text-cyan-100 bg-cyan-700/80 rounded-full shadow hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
            onClick={() => setShowSkillMap(false)}
          >
            ← 뒤로가기
          </button>
        </div>
      )}
    </div>
  );
}

// 업무 생산성 향상 카드
function ProductivityCard() {
  const [showSkillMap, setShowSkillMap] = useState(false);
  const theme = productivityTheme;
  // 4단계 시계방향 루프 데이터
  const steps = [
    {
      icon: BriefcaseIcon,
      label: '업무 분석',
      desc: '주요 업무와 목표를 명확히 파악한다.',
      next: '실행 계획',
      pos: 'top-[6%] left-[8%] md:top-[4%] md:left-[4%]',
    },
    {
      icon: CubeIcon,
      label: '실행 계획',
      desc: '우선순위와 일정, 리소스 배분을 체계적으로 수립한다.',
      next: '몰입 실행',
      pos: 'top-[6%] right-[8%] md:top-[4%] md:right-[4%]',
    },
    {
      icon: BoltIcon,
      label: '몰입 실행',
      desc: '집중 세션으로 업무를 처리하고, 진행 상황을 기록한다.',
      next: '성과 피드백',
      pos: 'bottom-[8%] right-[8%] md:bottom-[4%] md:right-[4%]',
    },
    {
      icon: ChartBarIcon,
      label: '성과 피드백',
      desc: '성과를 리뷰하고, 개선점을 도출해 다음 루프에 반영한다.',
      next: '업무 분석',
      pos: 'bottom-[8%] left-[8%] md:bottom-[4%] md:left-[4%]',
    },
  ];
  return (
    <div className={`relative bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 shadow-2xl rounded-2xl p-8 flex flex-col min-h-[420px] min-w-[320px] w-full max-w-2xl mx-auto`}>
      {!showSkillMap ? (
        <>
          <div className="flex items-center mb-4">
            <BriefcaseIcon className="h-9 w-9 text-green-300 mr-3" />
            <h3 className="text-xl font-bold text-green-100 flex-1">업무 생산성</h3>
          </div>
          <button
            className="absolute top-4 right-4 z-10 px-3 py-1 text-xs font-bold rounded-full bg-green-700/90 text-white shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            onClick={() => setShowSkillMap(true)}
          >
            스킬맵 보기
          </button>
          {/* 단계별 순환 흐름 시각화 (데스크탑) */}
          <div className="relative w-full max-w-[500px] md:max-w-[500px] aspect-square mx-auto mb-8 hidden sm:block">
            {/* 중앙 루프 아이콘 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <ClockwiseLoopIcon />
            </div>
            {/* 단계들 */}
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className={`absolute ${step.pos} flex flex-col items-center w-[120px]`}>
                  <Icon className="h-10 w-10 text-green-300 mb-1" />
                  <div className="flex items-center mb-1">
                    <span className="font-bold mr-2 text-yellow-300 text-xs">{idx + 1}</span>
                    <span className="font-normal text-green-200 text-sm text-center">{step.label}</span>
                  </div>
                  <div className="text-gray-300 text-sm text-left whitespace-normal max-w-xs leading-relaxed mb-1">{step.desc}</div>
                  <div className="text-sm text-green-300 font-normal mt-1">→ 다음: {step.next}</div>
                </div>
              );
            })}
          </div>
          {/* 모바일: 세로 스택 */}
          <div className="sm:hidden mb-8">
            <div className="flex justify-center w-full mb-2"><ClockwiseLoopIcon /></div>
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-start mb-6">
                  <Icon className="h-10 w-10 text-green-300 mb-1" />
                  <div className="flex items-center mb-1">
                    <span className="font-bold mr-2 text-yellow-300 text-xs">{idx + 1}</span>
                    <span className="font-normal text-green-200 text-sm">{step.label}</span>
                  </div>
                  <div className="text-gray-300 text-sm text-left whitespace-normal max-w-xs leading-relaxed mb-1">{step.desc}</div>
                  <div className="text-sm text-green-300 font-normal mt-1">→ 다음: {step.next}</div>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-green-400 font-semibold mb-4">데이터 기반으로 업무 방식을 계속 개선하세요!</div>
        </>
      ) : (
        <div className="flex flex-col flex-1 justify-between h-full">
          <div>
            <h5 className={`${theme.secondary} font-bold mb-3 flex items-center text-xl`}><BriefcaseIcon className="h-6 w-6 mr-2" />스킬맵</h5>
            <p className={`${theme.primary}/80 text-base mb-4`}>아래 스킬트리의 각 스킬을 클릭하면 추천 도서와 숙련 팁을 확인할 수 있습니다.</p>
            <ProductivitySkillTree theme={theme} />
          </div>
          <button
            className="mt-auto self-end px-4 py-2 text-xs font-semibold ${theme.secondary} ${theme.bgAccent} border ${theme.border}/60 rounded-full ${theme.hoverBgAccent} focus:outline-none focus:ring-2 ${theme.ring} transition-colors duration-150"
            onClick={() => setShowSkillMap(false)}
          >
            ← 뒤로가기
          </button>
        </div>
      )}
    </div>
  );
}

// 작업 기억 용량 확장 카드
function CapacityCard() {
  const [showSkillMap, setShowSkillMap] = useState(false);
  const theme = capacityTheme;
  // 4단계 시계방향 루프 데이터
  const steps = [
    {
      icon: CubeIcon,
      label: '정보 선별',
      desc: '핵심 정보만 빠르게 선별해 작업 기억의 부하를 줄인다.',
      next: '구조화/청킹',
      pos: 'top-[6%] left-[8%] md:top-[4%] md:left-[4%]',
    },
    {
      icon: LinkIconSolid,
      label: '구조화/청킹',
      desc: '정보를 논리적 구조나 청크로 묶어 기억한다.',
      next: '유지/반복',
      pos: 'top-[6%] right-[8%] md:top-[4%] md:right-[4%]',
    },
    {
      icon: BoltIcon,
      label: '유지/반복',
      desc: '반복 복습과 실전 적용으로 기억을 강화한다.',
      next: '실전 적용',
      pos: 'bottom-[8%] right-[8%] md:bottom-[4%] md:right-[4%]',
    },
    {
      icon: ChartBarIcon,
      label: '실전 적용',
      desc: '실제 발표/컨설팅에서 기억력을 검증하고, 피드백을 반영한다.',
      next: '정보 선별',
      pos: 'bottom-[8%] left-[8%] md:bottom-[4%] md:left-[4%]',
    },
  ];
  // UnifiedSkillTree용 데이터
  const branches = [
    {
      name: 'Symbol',
      color: 'text-orange-300',
      skills: [
        {
          name: 'Filter',
          desc: '방대한 정보 중 핵심만 빠르게 추출하면 작업 기억의 부하를 줄일 수 있습니다.',
          books: ['SQ3R 읽기 전략 (프랜시스 로빈슨)', '에센셜리즘 (그렉 맥커운)'],
          tip: 'TS 모드로 목차/키워드만 빠르게 훑고, 메모진화에 핵심만 1줄로 기록하세요.'
        },
        {
          name: 'Chunk',
          desc: '복잡한 정보를 논리적 구조나 청크(덩어리)로 묶으면 기억 용량이 확장됩니다.',
          books: ['기억력 천재 게으른 뇌를 깨워라 (오카다 다카시)', '마인드맵 완전정복 (토니 부잔)'],
          tip: 'ZenGo Myverse로 청킹 게임을 만들고, 반복 연습하세요.'
        },
        {
          name: 'Visualize',
          desc: '핵심 정보를 시각적으로 구조화하면 작업 기억의 효율이 높아집니다.',
          books: ['비주얼씽킹 (댄 로암)', '생각 정리 스킬 (후쿠치 다로)'],
          tip: '메모진화로 마인드맵/도식화 메모를 작성하세요.'
        },
      ],
    },
    {
      name: 'Memory',
      color: 'text-cyan-300',
      skills: [
        {
          name: 'Repeat',
          desc: '주기적으로 반복 복습하면 정보를 장기 기억으로 전환할 수 있습니다.',
          books: ['Make It Stick (피터 C. 브라운)', '에빙하우스 망각곡선 극복법 (안토니오 그리포)'],
          tip: '플래시카드로 반복 복습 일정을 설정하세요.'
        },
        {
          name: 'Space',
          desc: '복습 간격을 늘려가면 기억의 지속성이 높아집니다.',
          books: ['Anki 완전정복', '기억력 수업 (도미니크 오브라이언)'],
          tip: 'TS 모드/플래시카드로 간격 반복 복습을 실천하세요.'
        },
        {
          name: 'Apply',
          desc: '실전 상황에서 기억을 적용해보면 기억이 강화됩니다.',
          books: ['실전 메타인지 (피터 C. 브라운)', '행동 학습법 (앨런 배들리)'],
          tip: 'ZenGo/TS 모드로 실전 테스트를 기록하고, 피드백을 메모진화에 남기세요.'
        },
      ],
    },
    {
      name: 'Optimize',
      color: 'text-green-300',
      skills: [
        {
          name: 'Dual',
          desc: '여러 정보를 동시에 다루는 멀티태스킹 훈련으로 작업 기억 용량을 확장할 수 있습니다.',
          books: ['멀티태스킹의 심리학 (데이비드 마이어)', '작업기억 (앨런 배들리)'],
          tip: 'ZenGo에서 2개 이상 정보를 동시에 기억/조작하는 게임을 반복하세요.'
        },
        {
          name: 'Switch',
          desc: '두 가지 이상의 정보를 동시에 혹은 순차적으로 처리하는 훈련으로 기억력의 한계를 극복할 수 있습니다.',
          books: ['뇌, 생각의 한계 (마이클 S. 가지니가)', 'N-back 훈련법'],
          tip: 'ZenGo Myverse에서 이중부하/순차처리 게임을 만들어 연습하세요.'
        },
        {
          name: 'Adapt',
          desc: '자신의 작업 기억 한계와 패턴을 분석, 맞춤형 훈련으로 최적화할 수 있습니다.',
          books: ['메타인지 학습법 (리사 손)', 'Peak (앤더스 에릭슨)'],
          tip: '대시보드에서 약점 패턴을 분석, 맞춤형 ZenGo 훈련을 설계하세요.'
        },
      ],
    },
  ];
  const branchDescriptions = {
    Symbol: '핵심 정보를 선별하고 구조화하는 단계',
    Memory: '기억을 유지하고 반복하는 단계',
    Optimize: '기억을 확장하고 최적화하는 단계',
  };
  return (
    <div className={`relative bg-gradient-to-br from-orange-900 via-yellow-900 to-lime-900 shadow-2xl rounded-2xl p-8 flex flex-col min-h-[420px] min-w-[320px] w-full max-w-2xl mx-auto`}>
      {!showSkillMap ? (
        <>
          <div className="flex items-center mb-4">
            <CubeIcon className="h-9 w-9 text-orange-300 mr-3" />
            <h3 className="text-xl font-bold text-orange-100 flex-1">작업 기억력</h3>
          </div>
          <button
            className="absolute top-4 right-4 z-10 px-3 py-1 text-xs font-bold rounded-full bg-orange-700/90 text-white shadow hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            onClick={() => setShowSkillMap(true)}
          >
            스킬맵 보기
          </button>
          {/* 단계별 순환 흐름 시각화 (데스크탑) */}
          <div className="relative w-full max-w-[500px] md:max-w-[500px] aspect-square mx-auto mb-8 hidden sm:block">
            {/* 중앙 루프 아이콘 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <ClockwiseLoopIcon />
            </div>
            {/* 단계들 */}
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className={`absolute ${step.pos} flex flex-col items-center w-[120px]`}>
                  <Icon className="h-10 w-10 text-orange-300 mb-1" />
                  <div className="flex items-center mb-1">
                    <span className="font-bold mr-2 text-yellow-300 text-xs">{idx + 1}</span>
                    <span className="font-normal text-orange-200 text-sm text-center">{step.label}</span>
                  </div>
                  <div className="text-gray-300 text-sm text-left whitespace-normal max-w-xs leading-relaxed mb-1">{step.desc}</div>
                  <div className="text-sm text-orange-300 font-normal mt-1">→ 다음: {step.next}</div>
                </div>
              );
            })}
          </div>
          {/* 모바일: 세로 스택 */}
          <div className="sm:hidden mb-8">
            <div className="flex justify-center w-full mb-2"><ClockwiseLoopIcon /></div>
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-start mb-6">
                  <Icon className="h-10 w-10 text-orange-300 mb-1" />
                  <div className="flex items-center mb-1">
                    <span className="font-bold mr-2 text-yellow-300 text-xs">{idx + 1}</span>
                    <span className="font-normal text-orange-200 text-sm">{step.label}</span>
                  </div>
                  <div className="text-gray-300 text-sm text-left whitespace-normal max-w-xs leading-relaxed mb-1">{step.desc}</div>
                  <div className="text-sm text-orange-300 font-normal mt-1">→ 다음: {step.next}</div>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-orange-400 font-semibold mb-4">훈련과 실전을 통해 처리 용량을 계속 늘려가세요!</div>
        </>
      ) : (
        <div className="flex flex-col flex-1 justify-between h-full">
          <div>
            <h5 className={`${theme.secondary} font-bold mb-3 flex items-center text-xl`}><CubeIcon className="h-6 w-6 mr-2" />스킬맵</h5>
            <p className={`${theme.primary}/80 text-base mb-4`}>아래 스킬트리의 각 스킬을 클릭하면 추천 도서와 숙련 팁을 확인할 수 있습니다.</p>
            <UnifiedSkillTree branches={branches} theme={theme} branchDescriptions={branchDescriptions} />
          </div>
          <button
            className="mt-auto self-end px-4 py-2 text-xs font-semibold ${theme.secondary} ${theme.bgAccent} border ${theme.border}/60 rounded-full ${theme.hoverBgAccent} focus:outline-none focus:ring-2 ${theme.ring} transition-colors duration-150"
            onClick={() => setShowSkillMap(false)}
          >
            ← 뒤로가기
          </button>
        </div>
      )}
    </div>
  );
}

// 작업 기억 속도 향상 카드
function SpeedCard() {
  const [showSkillMap, setShowSkillMap] = useState(false);
  const theme = speedTheme;
  // 4단계 시계방향 루프 데이터
  const steps = [
    {
      icon: BoltIcon,
      label: '상황 인지',
      desc: '현재 상황과 목표를 신속하게 파악한다.',
      next: '정보 스캔/판단',
      pos: 'top-[6%] left-[8%] md:top-[4%] md:left-[4%]',
    },
    {
      icon: CpuChipIcon,
      label: '정보 스캔/판단',
      desc: '핵심 신호와 위험요소를 빠르게 스캔하고 판단한다.',
      next: '즉각 실행',
      pos: 'top-[6%] right-[8%] md:top-[4%] md:right-[4%]',
    },
    {
      icon: ChartBarIcon,
      label: '즉각 실행',
      desc: '판단에 따라 신속하게 행동한다.',
      next: '결과 피드백',
      pos: 'bottom-[8%] right-[8%] md:bottom-[4%] md:right-[4%]',
    },
    {
      icon: AdjustmentsHorizontalIcon,
      label: '결과 피드백',
      desc: '결과를 즉시 피드백 받아 전략을 조정한다.',
      next: '상황 인지',
      pos: 'bottom-[8%] left-[8%] md:bottom-[4%] md:left-[4%]',
    },
  ];
  // UnifiedSkillTree용 데이터
  const branches = [
    {
      name: 'Sense',
      color: 'text-purple-300',
      skills: [
        {
          name: 'Scan',
          desc: '상황 발생 시, 핵심 정보와 신호를 빠르게 스캔한다.',
          books: ['블링크(말콤 글래드웰)', '주의력 혁명(앨런 웰리스)'],
          tip: 'TS모드로 1분간 핵심 키워드만 빠르게 읽고, ZenGo에서 정보 스캔 게임을 반복하세요.'
        },
        {
          name: 'Signal',
          desc: '중요한 신호와 위험요소를 빠르게 구분하고, 우선순위를 정한다.',
          books: ['집중의 힘(다니엘 골먼)', '정보 디자인(에드워드 터프티)'],
          tip: 'ZenGo Myverse에서 신호/위험요소 구분 게임을 만들어 연습하세요.'
        },
        {
          name: 'Judge',
          desc: '위험요소를 신속하게 판단하고, 즉각적인 대응 전략을 세운다.',
          books: ['결정, 흔들리지 않고 마음먹은 대로(애니 듀크)', '순간의 힘(칩 히스, 댄 히스)'],
          tip: 'TS에서 작성한 1줄메모로 플래시카드(퀴즈-정답 쌍)를 만들어 반복 숙달하세요.'
        },
      ],
    },
    {
      name: 'Act',
      color: 'text-teal-300',
      skills: [
        {
          name: 'Reflex',
          desc: '판단 후 즉시 행동으로 옮기는 반사적 실행력을 기른다.',
          books: ['아주 작은 습관의 힘(제임스 클리어)', '최고의 실행(야마구치 슈)'],
          tip: '플래시카드로 "즉시 실행" 미션을 만들어 매일 실천하세요.'
        },
        {
          name: 'Decide',
          desc: '여러 선택지 중에서 빠르게 판단하고, 최적의 결정을 내린다.',
          books: ['블링크(말콤 글래드웰)', '결정의 순간(치프 히스)'],
          tip: 'ZenGo 기본에서 제한 시간 내 빠른 선택 게임을 반복하세요.'
        },
        {
          name: 'Automate',
          desc: '반복되는 상황에 대한 대응을 자동화/루틴화하여 반응 속도를 극대화한다.',
          books: ['Getting Things Done(데이비드 알렌)', 'Atomic Habits(제임스 클리어)'],
          tip: '체크리스트, 자동화 도구, 습관 루틴을 만들어 반복하세요.'
        },
      ],
    },
    {
      name: 'Adapt',
      color: 'text-green-300',
      skills: [
        {
          name: 'Feedback',
          desc: '행동 결과를 즉시 피드백 받아, 다음 행동에 반영한다.',
          books: ['Peak(앤더스 에릭슨)', 'Make It Stick(피터 C. 브라운)'],
          tip: 'ZenGo/TS모드로 실전 결과를 기록, 대시보드에서 피드백을 분석하세요.'
        },
        {
          name: 'Modify',
          desc: '상황 변화에 따라 전략을 유연하게 수정하고, 적응한다.',
          books: ['오리지널스(애덤 그랜트)', '실전 메타인지(피터 C. 브라운)'],
          tip: '메모진화로 전략 수정안을 기록, ZenGo에서 새로운 전략을 실험하세요.'
        },
        {
          name: 'Monitor',
          desc: '자신의 반응 속도와 대처능력 변화를 지속적으로 모니터링하고 성장한다.',
          books: ['Brain Rules(존 메디나)', '작업기억(앨런 배들리)'],
          tip: '대시보드에서 성장 추이를 확인, 약점은 ZenGo로 집중 훈련하세요.'
        },
      ],
    },
  ];
  const branchDescriptions = {
    Sense: '상황을 감지하고 신호를 포착하는 단계',
    Act: '즉각 실행과 자동화로 반응 속도를 높이는 단계',
    Adapt: '피드백과 전략 수정, 모니터링을 통한 적응 단계',
  };
  return (
    <div className={`relative bg-gradient-to-br from-purple-900 via-pink-900 to-fuchsia-900 shadow-2xl rounded-2xl p-8 flex flex-col min-h-[420px] min-w-[320px] w-full max-w-2xl mx-auto`}>
      {!showSkillMap ? (
        <>
          <div className="flex items-center mb-4">
            <BoltIcon className="h-9 w-9 text-purple-300 mr-3" />
            <h3 className="text-xl font-bold text-purple-100 flex-1">순간 대처능력</h3>
          </div>
          <button
            className="absolute top-4 right-4 z-10 px-3 py-1 text-xs font-bold rounded-full bg-purple-700/90 text-white shadow hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            onClick={() => setShowSkillMap(true)}
          >
            스킬맵 보기
          </button>
          {/* 단계별 순환 흐름 시각화 (데스크탑) */}
          <div className="relative w-full max-w-[500px] md:max-w-[500px] aspect-square mx-auto mb-8 hidden sm:block">
            {/* 중앙 루프 아이콘 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <ClockwiseLoopIcon />
            </div>
            {/* 단계들 */}
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className={`absolute ${step.pos} flex flex-col items-center w-[120px]`}>
                  <Icon className="h-10 w-10 text-purple-300 mb-1" />
                  <div className="flex items-center mb-1">
                    <span className="font-bold mr-2 text-yellow-300 text-xs">{idx + 1}</span>
                    <span className="font-normal text-purple-200 text-sm text-center">{step.label}</span>
                  </div>
                  <div className="text-gray-300 text-sm text-left whitespace-normal max-w-xs leading-relaxed mb-1">{step.desc}</div>
                  <div className="text-sm text-purple-300 font-normal mt-1">→ 다음: {step.next}</div>
                </div>
              );
            })}
          </div>
          {/* 모바일: 세로 스택 */}
          <div className="sm:hidden mb-8">
            <div className="flex justify-center w-full mb-2"><ClockwiseLoopIcon /></div>
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-start mb-6">
                  <Icon className="h-10 w-10 text-purple-300 mb-1" />
                  <div className="flex items-center mb-1">
                    <span className="font-bold mr-2 text-yellow-300 text-xs">{idx + 1}</span>
                    <span className="font-normal text-purple-200 text-sm">{step.label}</span>
                  </div>
                  <div className="text-gray-300 text-sm text-left whitespace-normal max-w-xs leading-relaxed mb-1">{step.desc}</div>
                  <div className="text-sm text-purple-300 font-normal mt-1">→ 다음: {step.next}</div>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-purple-400 font-semibold mb-4">훈련과 실전 피드백으로 반응 속도를 계속 높이세요!</div>
        </>
      ) : (
        <div className="flex flex-col flex-1 justify-between h-full">
          <div>
            <h5 className={`${theme.secondary} font-bold mb-3 flex items-center text-xl`}><BoltIcon className="h-6 w-6 mr-2" />스킬맵</h5>
            <p className={`${theme.primary}/80 text-base mb-4`}>아래 스킬트리의 각 스킬을 클릭하면 추천 도서와 숙련 팁을 확인할 수 있습니다.</p>
            <UnifiedSkillTree branches={branches} theme={theme} branchDescriptions={branchDescriptions} />
          </div>
          <button
            className="mt-auto self-end px-4 py-2 text-xs font-semibold ${theme.secondary} ${theme.bgAccent} border ${theme.border}/60 rounded-full ${theme.hoverBgAccent} focus:outline-none focus:ring-2 ${theme.ring} transition-colors duration-150"
            onClick={() => setShowSkillMap(false)}
          >
            ← 뒤로가기
          </button>
        </div>
      )}
    </div>
  );
}

// --- SkillTree Components (Refactored to accept theme) ---

interface SkillTheme {
  primary: string;
  secondary: string;
  border: string;
  bgAccent: string;
  hoverBgAccent: string;
  ring: string;
  skillButtonBg: string;
  skillButtonHover: string;
  skillButtonBorder: string;
  skillPopupBorder: string;
  skillPopupTitle: string;
  skillConnector: string;
}

interface SkillTreeProps {
  theme: SkillTheme;
}

// SkillTree 컴포넌트 (학습 효율 극대화용, 루프 4단계×3스킬)
function SkillTree({ theme }: SkillTreeProps) {
  const [popup, setPopup] = React.useState<{bIdx: number, sIdx: number} | null>(null);
  const [tooltipIdx, setTooltipIdx] = React.useState<number|null>(null);
  // 브랜치명, 스킬명, 설명, 도서, 팁 모두 기획안에 맞게 교체
  const branches = [
    {
      name: 'Compass',
      color: 'text-cyan-300',
      bg: 'bg-cyan-900/40',
      skills: [
        {
          name: 'Goal',
          desc: '명확한 목표는 학습의 방향과 동기를 결정합니다. "왜 공부하는가?"를 정의하면 집중력과 지속력이 높아집니다.',
          books: ['원씽(The ONE Thing) (게리 켈러)', '스티브 잡스 (월터 아이작슨)'],
          tip: '읽을 책/논문/자료를 TS 모드에 등록하고, 읽기 종료 후 1줄 요약 메모를 남기세요.'
        },
        {
          name: 'Plan',
          desc: '구체적인 계획은 실행의 첫걸음입니다. 세부 일정과 단계를 나누면 부담이 줄고, 실천 가능성이 높아집니다.',
          books: ['공부머리 독서법 (최승필)', '나의 라임 오렌지나무 (주제 마우루 지 바스콘셀루스)'],
          tip: 'TS에서 작성한 1줄 요약을 메모진화로 4단계(장소, 감정, 연관지식, 중요 이유)로 확장해보세요.'
        },
        {
          name: 'Routine',
          desc: '반복되는 루틴은 습관을 만들고, 습관은 성과를 만듭니다. 꾸준함이 쌓이면 자연스럽게 성장합니다.',
          books: ['아주 작은 습관의 힘(Atomic Habits) (제임스 클리어)', '모모 (미하엘 엔데)'],
          tip: '매일 같은 시간에 TS 모드로 읽기 루틴을 실천하고, 1줄 요약 메모를 남기세요.'
        },
      ],
    },
    {
      name: 'Engine',
      color: 'text-blue-300',
      bg: 'bg-blue-900/40',
      skills: [
        {
          name: 'Focus',
          desc: '방해요소를 차단하고 몰입 환경을 만들면 집중력이 극대화됩니다.',
          books: ['딥 워크(Deep Work) (칼 뉴포트)', '셜록 홈즈 시리즈 (아서 코난 도일)'],
          tip: 'TS 모드로 10~20분간 집중해서 읽고, 읽기 종료 후 집중한 순간을 1줄 메모로 남기세요. 인지능력 모니터링(대시보드)에서 집중력 변화를 확인하세요.'
        },
        {
          name: 'Concept',
          desc: '핵심 개념을 내 언어로 요약하면 이해가 깊어집니다.',
          books: ['메타인지 학습법 (리사 손)', '데미안 (헤르만 헤세)'],
          tip: '메모진화로 오늘 읽은 내용의 핵심 개념을 4단계로 정리하고, 플래시카드로 주요 개념을 만들어 반복 복습하세요.'
        },
        {
          name: 'Recall',
          desc: '효과적인 암기법을 활용하면 장기 기억으로 전환됩니다.',
          books: ['기억력 천재 게으른 뇌를 깨워라 (오카다 다카시)', '파브르 곤충기 (장 앙리 파브르)'],
          tip: '플래시카드로 주요 용어/개념을 만들어 반복 복습하고, ZenGo Myverse로 암기 게임을 생성해 숙달하세요.'
        },
      ],
    },
    {
      name: 'Mirror',
      color: 'text-green-300',
      bg: 'bg-green-900/40',
      skills: [
        {
          name: 'Review',
          desc: '문제풀이와 자기 점검으로 실력을 확인하세요.',
          books: ['Make It Stick (피터 C. 브라운)', '노르웨이의 숲 (무라카미 하루키)'],
          tip: 'TS 모드로 문제풀이/퀴즈 자료를 읽고, 오답은 메모진화로 4단계로 기록하세요.'
        },
        {
          name: 'Analyze',
          desc: '오답과 약점을 분석하면 성장의 방향이 보입니다.',
          books: ['공부는 전략이다 (이윤규)', '프랭클린 자서전 (벤저민 프랭클린)'],
          tip: '인지능력 모니터링(대시보드)에서 약점 패턴을 분석하고, ZenGo 기본으로 약점 집중 훈련을 진행하세요.'
        },
        {
          name: 'Adapt',
          desc: '전략을 보완하고 최적화하면 한 단계 성장합니다.',
          books: ['실전 메타인지 (피터 C. 브라운)', '나의 문화유산답사기 (유홍준)'],
          tip: '메모진화로 전략 수정안을 기록하고, 플래시카드로 새로운 실천 항목을 반복 복습하세요.'
        },
      ],
    },
  ];
  const getSkillName = (branchName: string, skillIndex: number): string => {
    // 브랜치별 스킬명
    if (branchName === 'Compass') return ['Goal', 'Plan', 'Routine'][skillIndex];
    if (branchName === 'Engine') return ['Focus', 'Concept', 'Recall'][skillIndex];
    if (branchName === 'Mirror') return ['Review', 'Analyze', 'Adapt'][skillIndex];
    return '';
  };
  const branchDescriptions = {
    Compass: '방향을 잡고 목표를 세우는 단계',
    Engine: '집중과 이해, 암기의 동력을 제공하는 단계',
    Mirror: '점검, 분석, 보완을 통해 성장하는 단계',
  };
  return (
    <div className="w-full flex justify-center">
      {/* 데스크탑/태블릿: 정사각형 배치 */}
      <div className="relative w-[480px] h-[480px] bg-transparent rounded-2xl mx-auto hidden sm:flex flex-row overflow-visible">
        {branches.map((branch, bIdx) => (
          <div key={branch.name} className={`flex flex-col items-center w-1/3 h-full p-2`}>
            <div
              className={`font-bold mb-3 text-base ${branch.color} relative`}
              onMouseEnter={() => setTooltipIdx(bIdx)}
              onMouseLeave={() => setTooltipIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {branch.name}
              {tooltipIdx === bIdx && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-gray-100 text-xs rounded shadow-lg border border-cyan-500 z-30 whitespace-nowrap">
                  {branchDescriptions[branch.name as keyof typeof branchDescriptions]}
                </div>
              )}
            </div>
            <div className="flex flex-col h-full w-full items-center">
              <button
                className={`${theme.skillButtonBg} ${theme.skillButtonHover} text-gray-200 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow border ${theme.skillButtonBorder} transition-colors duration-150 max-w-full overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 ${theme.ring} text-sm`}
                style={{ fontSize: getSkillName(branch.name, 0).length > 7 ? '0.7rem' : '0.85rem' }}
                onClick={() => popup && popup.bIdx === bIdx && popup.sIdx === 0 ? setPopup(null) : setPopup({bIdx, sIdx: 0})}
              >
                {getSkillName(branch.name, 0)}
              </button>
              <div className="flex-1 flex flex-col justify-center items-center">
                <span className="text-cyan-400 text-xl leading-none">↓</span>
              </div>
              <button
                className={`${theme.skillButtonBg} ${theme.skillButtonHover} text-gray-200 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow border ${theme.skillButtonBorder} transition-colors duration-150 max-w-full overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 ${theme.ring} text-sm`}
                style={{ fontSize: getSkillName(branch.name, 1).length > 7 ? '0.7rem' : '0.85rem' }}
                onClick={() => popup && popup.bIdx === bIdx && popup.sIdx === 1 ? setPopup(null) : setPopup({bIdx, sIdx: 1})}
              >
                {getSkillName(branch.name, 1)}
              </button>
              <div className="flex-1 flex flex-col justify-center items-center">
                <span className="text-cyan-400 text-xl leading-none">↓</span>
              </div>
              <button
                className={`${theme.skillButtonBg} ${theme.skillButtonHover} text-gray-200 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow border ${theme.skillButtonBorder} transition-colors duration-150 max-w-full overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 ${theme.ring} text-sm`}
                style={{ fontSize: getSkillName(branch.name, 2).length > 7 ? '0.7rem' : '0.85rem' }}
                onClick={() => popup && popup.bIdx === bIdx && popup.sIdx === 2 ? setPopup(null) : setPopup({bIdx, sIdx: 2})}
              >
                {getSkillName(branch.name, 2)}
              </button>
              {/* 팝업은 기존 방식대로 각 버튼 위에 조건부 렌더링 */}
              {[0,1,2].map(sIdx => (
                popup && popup.bIdx === bIdx && popup.sIdx === sIdx && (
                  <div key={sIdx} className={`absolute left-1/2 z-20 -translate-x-1/2 top-20 bg-gray-900/95 border ${theme.skillPopupBorder} rounded-xl shadow-2xl p-6 w-72 text-left animate-fade-in`}>
                    <div className={`font-bold ${theme.skillPopupTitle} mb-2 text-lg`}>{getSkillName(branch.name, sIdx)}</div>
                    <div className="text-gray-200 text-sm mb-4 leading-relaxed whitespace-pre-line">{branch.skills[sIdx].desc}</div>
                    <div className={`${theme.secondary} text-xs mb-1`}><span className="font-semibold">추천도서1:</span> {branch.skills[sIdx].books[0]}</div>
                    <div className={`${theme.secondary} text-xs mb-2`}><span className="font-semibold">추천도서2:</span> {branch.skills[sIdx].books[1]}</div>
                    <div className="text-green-300 text-sm mb-3"><span className="font-semibold">실전팁:</span> {branch.skills[sIdx].tip}</div>
                    <button
                      className={`mt-2 px-3 py-1 text-xs ${theme.secondary} border ${theme.skillButtonBorder} rounded ${theme.hoverBgAccent}`}
                      onClick={() => setPopup(null)}
                    >닫기</button>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* 모바일: 세로 스택 */}
      <div className="sm:hidden flex flex-col gap-6 w-full mt-6">
        {branches.map((branch, bIdx) => (
          <div key={branch.name} className={`flex flex-col items-center w-full p-2`}>
            <div className={`font-bold mb-3 text-base ${branch.color}`}>{branch.name}</div>
            {branch.skills.map((skill, sIdx) => {
              const skillName = getSkillName(branch.name, sIdx);
              return (
                <div key={skillName} className="flex flex-col items-center relative mb-4">
                  <button
                    className={`${theme.skillButtonBg} ${theme.skillButtonHover} text-gray-200 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow border ${theme.skillButtonBorder} transition-colors duration-150 max-w-full overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 ${theme.ring} mb-2 text-sm`}
                    style={{ fontSize: skillName.length > 7 ? '0.7rem' : '0.85rem' }}
                    onClick={() => popup && popup.bIdx === bIdx && popup.sIdx === sIdx ? setPopup(null) : setPopup({bIdx, sIdx})}
                  >
                    {skillName}
                  </button>
                  {sIdx < branch.skills.length - 1 && (
                    <span className="my-auto text-cyan-400 text-xl" style={{ margin: '12px 0' }}>↓</span>
                  )}
                  {popup && popup.bIdx === bIdx && popup.sIdx === sIdx && (
                    <div className={`absolute left-1/2 z-20 -translate-x-1/2 top-20 bg-gray-900/95 border ${theme.skillPopupBorder} rounded-xl shadow-2xl p-6 w-72 text-left animate-fade-in`}>
                      <div className={`font-bold ${theme.skillPopupTitle} mb-2 text-lg`}>{skillName}</div>
                      <div className="text-gray-200 text-sm mb-4 leading-relaxed whitespace-pre-line">{skill.desc}</div>
                      <div className={`${theme.secondary} text-xs mb-1`}><span className="font-semibold">추천도서1:</span> {skill.books[0]}</div>
                      <div className={`${theme.secondary} text-xs mb-2`}><span className="font-semibold">추천도서2:</span> {skill.books[1]}</div>
                      <div className="text-green-300 text-sm mb-3"><span className="font-semibold">실전팁:</span> {skill.tip}</div>
                      <button
                        className={`mt-2 px-3 py-1 text-xs ${theme.secondary} border ${theme.skillButtonBorder} rounded ${theme.hoverBgAccent}`}
                        onClick={() => setPopup(null)}
                      >닫기</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// 작업 기억 속도 향상 카드
function SpeedSkillTree({ theme }: SkillTreeProps) {
  const branches = [
    {
      name: '상황 인지/판단',
      color: 'text-purple-300',
      bg: 'bg-purple-900/40',
      skills: [
        {
          name: '신속한 정보 스캔',
          desc: '상황 발생 시, 핵심 정보와 신호를 빠르게 스캔한다.',
          books: ['블링크(말콤 글래드웰)', '주의력 혁명(앨런 웰리스)'],
          tip: 'TS 모드로 읽기 속도를 측정하고, 주요 키워드를 1줄메모로 남기세요.'
        },
        {
          name: '핵심 신호 포착',
          desc: '중요한 신호와 위험요소를 빠르게 구분하고, 우선순위를 정한다.',
          books: ['집중의 힘(다니엘 골먼)', '정보 디자인(에드워드 터프티)'],
          tip: 'TS에서 작성한 1줄메모를 메모진화로 확장하여 맥락을 증강하세요.'
        },
        {
          name: '위험요소 판단',
          desc: '위험요소를 신속하게 판단하고, 즉각적인 대응 전략을 세운다.',
          books: ['결정, 흔들리지 않고 마음먹은 대로(애니 듀크)', '순간의 힘(칩 히스, 댄 히스)'],
          tip: 'TS에서 작성한 1줄메모로 플래시카드(퀴즈-정답 쌍)를 만들어 반복 숙달하세요.'
        },
      ],
    },
    {
      name: '즉각 실행/반응',
      color: 'text-teal-300',
      bg: 'bg-teal-900/40',
      skills: [
        {
          name: '반사적 실행 훈련',
          desc: '판단 후 즉시 행동으로 옮기는 반사적 실행력을 기른다.',
          books: ['아주 작은 습관의 힘(제임스 클리어)', '최고의 실행(야마구치 슈)'],
          tip: '젠고 기본으로 작업 기억력과 반응 속도를 측정하세요.'
        },
        {
          name: '선택/판단 속도',
          desc: '여러 선택지 중에서 빠르게 판단하고, 최적의 결정을 내린다.',
          books: ['블링크(말콤 글래드웰)', '결정의 순간(치프 히스)'],
          tip: '젠고 마이버스에서 직접 만든 암기 게임으로 선택/판단 훈련을 반복하세요.'
        },
        {
          name: '자동화/루틴화',
          desc: '반복되는 상황에 대한 대응을 자동화/루틴화하여 반응 속도를 극대화한다.',
          books: ['Getting Things Done(데이비드 알렌)', 'Atomic Habits(제임스 클리어)'],
          tip: '젠고 마이버스에서 반복 상황을 게임화하여 자동화 루틴을 훈련하세요.'
        },
      ],
    },
    {
      name: '피드백/전략 조정',
      color: 'text-green-300',
      bg: 'bg-green-900/40',
      skills: [
        {
          name: '실시간 피드백 수용',
          desc: '행동 결과를 즉시 피드백 받아, 다음 행동에 반영한다.',
          books: ['Peak(앤더스 에릭슨)', 'Make It Stick(피터 C. 브라운)'],
          tip: '인지능력 모니터링에서 실시간 상태를 확인하고, 결과를 분석하세요.'
        },
        {
          name: '전략 수정/적응',
          desc: '상황 변화에 따라 전략을 유연하게 수정하고, 적응한다.',
          books: ['오리지널스(애덤 그랜트)', '실전 메타인지(피터 C. 브라운)'],
          tip: '인지능력 모니터링 결과를 바탕으로 메모진화에 전략 수정안을 기록하세요.'
        },
        {
          name: '지속 모니터링/성장',
          desc: '자신의 반응 속도와 대처능력 변화를 지속적으로 모니터링하고 성장한다.',
          books: ['Brain Rules(존 메디나)', '작업기억(앨런 배들리)'],
          tip: '인지능력 모니터링에서 성장 추이를 확인하고, 약점은 젠고 기본으로 집중 측정하세요.'
        },
      ],
    },
  ];
  const [popup, setPopup] = React.useState<{bIdx: number, sIdx: number} | null>(null);
  const getSkillName = (branchName: string, skillIndex: number): string => {
    if (branchName === '상황 인지/판단') return ['신속한 정보 스캔', '핵심 신호 포착', '위험요소 판단'][skillIndex];
    if (branchName === '즉각 실행/반응') return ['반사적 실행 훈련', '선택/판단 속도', '자동화/루틴화'][skillIndex];
    if (branchName === '피드백/전략 조정') return ['실시간 피드백 수용', '전략 수정/적응', '지속 모니터링/성장'][skillIndex];
    return '';
  };
  return (
    <div className="flex flex-row justify-center items-start gap-6 mt-6">
      {branches.map((branch, bIdx) => (
        <div key={branch.name} className={`flex flex-col items-center min-w-[100px] p-4 rounded-xl shadow ${branch.bg} border border-gray-700`}>
          <div className={`font-bold mb-3 text-base ${branch.color}`}>{branch.name}</div>
          {branch.skills.map((skill, sIdx) => {
            const skillName = getSkillName(branch.name, sIdx);
            return (
              <div key={skillName} className="flex flex-col items-center relative">
                <button
                  className={`${theme.skillButtonBg} ${theme.skillButtonHover} text-gray-200 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow border ${theme.skillButtonBorder} transition-colors duration-150 text-base focus:outline-none focus:ring-2 ${theme.ring} mb-2`}
                  onClick={() => setPopup({bIdx, sIdx})}
                >
                  {skillName}
                </button>
                {sIdx < branch.skills.length - 1 && (
                  <span className={`${theme.skillConnector} text-base mb-2`}>↓</span>
                )}
                {popup && popup.bIdx === bIdx && popup.sIdx === sIdx && (
                  <div className={`absolute left-1/2 z-20 -translate-x-1/2 top-10 bg-gray-900/95 border ${theme.skillPopupBorder} rounded-xl shadow-2xl p-6 w-72 text-left animate-fade-in`}>
                    <div className={`font-bold ${theme.skillPopupTitle} mb-2 text-lg`}>{skillName}</div>
                    <div className="text-gray-200 text-sm mb-4 leading-relaxed whitespace-pre-line">{skill.desc}</div>
                    <div className={`${theme.secondary} text-xs mb-1`}><span className="font-semibold">추천도서1:</span> {skill.books[0]}</div>
                    <div className={`${theme.secondary} text-xs mb-2`}><span className="font-semibold">추천도서2:</span> {skill.books[1]}</div>
                    <div className="text-green-300 text-sm mb-3"><span className="font-semibold">실전팁:</span> {skill.tip}</div>
                    <button
                      className={`mt-2 px-3 py-1 text-xs ${theme.secondary} border ${theme.skillButtonBorder} rounded ${theme.hoverBgAccent}`}
                      onClick={() => setPopup(null)}
                    >닫기</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// --- Unified SkillTree Component ---
function UnifiedSkillTree({ branches, theme, branchDescriptions }: { branches: any[], theme: SkillTheme, branchDescriptions: Record<string, string> }) {
  const [popup, setPopup] = React.useState<{bIdx: number, sIdx: number} | null>(null);
  const [tooltipIdx, setTooltipIdx] = React.useState<number|null>(null);
  const getSkillName = (branchName: string, skillIndex: number) => branches.find(b => b.name === branchName)?.skills[skillIndex]?.name || '';
  return (
    <div className="w-full flex justify-center">
      <div className="relative w-[480px] h-[480px] bg-transparent rounded-2xl mx-auto hidden sm:flex flex-row overflow-visible">
        {branches.map((branch, bIdx) => (
          <div key={branch.name} className={`flex flex-col items-center w-1/3 h-full p-2`}>
            <div
              className={`font-bold mb-3 text-base ${branch.color} relative`}
              onMouseEnter={() => setTooltipIdx(bIdx)}
              onMouseLeave={() => setTooltipIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {branch.name}
              {tooltipIdx === bIdx && branchDescriptions && branchDescriptions[branch.name] && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-gray-100 text-xs rounded shadow-lg border border-cyan-500 z-30 whitespace-nowrap">
                  {branchDescriptions[branch.name]}
                </div>
              )}
            </div>
            <div className="flex flex-col h-full w-full items-center">
              {[0,1,2].map(sIdx => (
                <React.Fragment key={sIdx}>
                  <button
                    className={`${theme.skillButtonBg} ${theme.skillButtonHover} text-gray-200 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow border ${theme.skillButtonBorder} transition-colors duration-150 max-w-full overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 ${theme.ring} text-sm`}
                    style={{ fontSize: getSkillName(branch.name, sIdx).length > 7 ? '0.7rem' : '0.85rem' }}
                    onClick={() => popup && popup.bIdx === bIdx && popup.sIdx === sIdx ? setPopup(null) : setPopup({bIdx, sIdx})}
                  >
                    {getSkillName(branch.name, sIdx)}
                  </button>
                  {sIdx < 2 && (
                    <div className="flex-1 flex flex-col justify-center items-center">
                      <span className="text-cyan-400 text-xl leading-none">↓</span>
                    </div>
                  )}
                  {popup && popup.bIdx === bIdx && popup.sIdx === sIdx && (
                    <div className={`absolute left-1/2 z-20 -translate-x-1/2 top-20 bg-gray-900/95 border ${theme.skillPopupBorder} rounded-xl shadow-2xl p-6 w-72 text-left animate-fade-in`}>
                      <div className={`font-bold ${theme.skillPopupTitle} mb-2 text-lg`}>{getSkillName(branch.name, sIdx)}</div>
                      <div className="text-gray-200 text-sm mb-4 leading-relaxed whitespace-pre-line">{branch.skills[sIdx].desc}</div>
                      <div className={`${theme.secondary} text-xs mb-1`}><span className="font-semibold">추천도서1:</span> {branch.skills[sIdx].books[0]}</div>
                      <div className={`${theme.secondary} text-xs mb-2`}><span className="font-semibold">추천도서2:</span> {branch.skills[sIdx].books[1]}</div>
                      <div className="text-green-300 text-sm mb-3"><span className="font-semibold">실전팁:</span> {branch.skills[sIdx].tip}</div>
                      <button
                        className={`mt-2 px-3 py-1 text-xs ${theme.secondary} border ${theme.skillButtonBorder} rounded ${theme.hoverBgAccent}`}
                        onClick={() => setPopup(null)}
                      >닫기</button>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* 모바일: 세로 스택 */}
      <div className="sm:hidden flex flex-col gap-6 w-full mt-6">
        {branches.map((branch, bIdx) => (
          <div key={branch.name} className={`flex flex-col items-center w-full p-2`}>
            <div className={`font-bold mb-3 text-base ${branch.color}`}>{branch.name}</div>
            {branch.skills.map((skill: any, sIdx: number) => {
              const skillName = getSkillName(branch.name, sIdx);
              return (
                <div key={skillName} className="flex flex-col items-center relative mb-4">
                  <button
                    className={`${theme.skillButtonBg} ${theme.skillButtonHover} text-gray-200 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow border ${theme.skillButtonBorder} transition-colors duration-150 max-w-full overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 ${theme.ring} mb-2 text-sm`}
                    style={{ fontSize: skillName.length > 7 ? '0.7rem' : '0.85rem' }}
                    onClick={() => popup && popup.bIdx === bIdx && popup.sIdx === sIdx ? setPopup(null) : setPopup({bIdx, sIdx})}
                  >
                    {skillName}
                  </button>
                  {sIdx < branch.skills.length - 1 && (
                    <span className="my-auto text-cyan-400 text-xl" style={{ margin: '12px 0' }}>↓</span>
                  )}
                  {popup && popup.bIdx === bIdx && popup.sIdx === sIdx && (
                    <div className={`absolute left-1/2 z-20 -translate-x-1/2 top-20 bg-gray-900/95 border ${theme.skillPopupBorder} rounded-xl shadow-2xl p-6 w-72 text-left animate-fade-in`}>
                      <div className={`font-bold ${theme.skillPopupTitle} mb-2 text-lg`}>{skillName}</div>
                      <div className="text-gray-200 text-sm mb-4 leading-relaxed whitespace-pre-line">{skill.desc}</div>
                      <div className={`${theme.secondary} text-xs mb-1`}><span className="font-semibold">추천도서1:</span> {skill.books[0]}</div>
                      <div className={`${theme.secondary} text-xs mb-2`}><span className="font-semibold">추천도서2:</span> {skill.books[1]}</div>
                      <div className="text-green-300 text-sm mb-3"><span className="font-semibold">실전팁:</span> {skill.tip}</div>
                      <button
                        className={`mt-2 px-3 py-1 text-xs ${theme.secondary} border ${theme.skillButtonBorder} rounded ${theme.hoverBgAccent}`}
                        onClick={() => setPopup(null)}
                      >닫기</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// 사용자 유형별 카드+상세+스킬맵 탭 컴포넌트
function UserTypeTabs() {
  const userTabs = [
    {
      icon: AcademicCapIcon,
      label: '학습 및 시험',
      card: <LearningCard />,
      theme: 'from-cyan-700 to-blue-700',
      desc: '학생/수험생'
    },
    {
      icon: BriefcaseIcon,
      label: '업무 생산성',
      card: <ProductivityCard />,
      theme: 'from-green-700 to-emerald-700',
      desc: '직장인/경영인'
    },
    {
      icon: CubeIcon,
      label: '작업 기억력',
      card: <CapacityCard />,
      theme: 'from-orange-700 to-yellow-700',
      desc: '강연가/컨설턴트'
    },
    {
      icon: BoltIcon,
      label: '순간 대처능력',
      card: <SpeedCard />,
      theme: 'from-purple-700 to-pink-700',
      desc: '딜러/프로 스포츠'
    },
  ];
  const [active, setActive] = useState(0);
  return (
    <>
      <div className="flex justify-center gap-6 mb-10 flex-wrap">
        {userTabs.map((tab, idx) => {
          const isActive = active === idx;
          return (
            <button
              key={tab.label}
              className={`flex flex-col items-center justify-center px-7 py-5 rounded-2xl border-2 transition-all duration-200 focus:outline-none
                bg-gradient-to-br ${tab.theme}
                ${isActive
                  ? 'scale-105 shadow-2xl border-transparent ring-2 ring-cyan-300/60'
                  : 'opacity-80 border-gray-600 hover:scale-105 hover:shadow-xl hover:ring-2 hover:ring-cyan-400/40'}
                hover:brightness-110 focus:brightness-110
              `}
              style={{ minWidth: 130 }}
              onClick={() => setActive(idx)}
              type="button"
              tabIndex={0}
            >
              <tab.icon className={`h-11 w-11 mb-2 ${isActive ? 'text-white' : 'text-cyan-100'}`} />
              <span className={`text-lg font-bold ${isActive ? 'text-white' : 'text-cyan-100'}`}>{tab.label}</span>
              <span className="text-xs text-gray-200 mt-1">{tab.desc}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-center">
        <div className="w-full flex justify-center">
          {userTabs[active].card}
        </div>
      </div>
    </>
  );
}

// 중앙 루프 SVG 아이콘 컴포넌트
function ClockwiseLoopIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" stroke="#22d3ee" strokeWidth="3" fill="none" />
      <path d="M36 24a12 12 0 1 0-6.5 10.7" stroke="#a78bfa" strokeWidth="3" fill="none" strokeLinecap="round" />
      <polygon points="36,24 41,22 39,28" fill="#a78bfa" />
    </svg>
  );
}

// 업무 생산성 SkillTree (정중앙 화살표, 원형 바둑돌, 툴팁, 팝업 구조)
function ProductivitySkillTree({ theme }: SkillTreeProps) {
  const [popup, setPopup] = React.useState<{bIdx: number, sIdx: number} | null>(null);
  const [tooltipIdx, setTooltipIdx] = React.useState<number|null>(null);
  const branches = [
    {
      name: 'Radar',
      color: 'text-blue-300',
      desc: '업무의 방향과 우선순위를 탐지하는 레이더',
      skills: [
        {
          name: 'Select',
          desc: '핵심 업무를 선별하면 진짜 성과에 집중할 수 있습니다.',
          books: ['에센셜리즘 (그렉 맥커운)', '스티브 잡스 (월터 아이작슨)'],
          tip: '이번 주 읽을 업무 관련 문서/자료 3가지를 TS 모드에 등록하고, 읽기 종료 후 1줄 요약 메모를 남기세요. 핵심 개념/용어는 플래시카드로 만들어 반복 복습하세요. 실제 업무 실행 루틴은 ZenGo Myverse로 게임화하여 반복 훈련하세요.'
        },
        {
          name: 'Prioritize',
          desc: '우선순위를 정하면 중요한 일에 에너지를 집중할 수 있습니다.',
          books: ['The One Thing (게리 켈러)', '프랭클린 자서전 (벤저민 프랭클린)'],
          tip: '플래시카드로 오늘 읽은 문서/자료의 핵심 개념을 반복 복습하세요. 업무 우선순위/실행 루틴은 ZenGo Myverse로 게임화하여 훈련하세요.'
        },
        {
          name: 'Plan',
          desc: '구체적인 계획은 실행의 시작입니다.',
          books: ['일의 기술 (데이비드 알렌)', '나의 라임 오렌지나무 (주제 마우루 지 바스콘셀루스)'],
          tip: 'TS 모드로 업무 관련 자료를 읽고, 1줄 요약 메모를 남긴 뒤, 메모진화로 4단계로 확장하세요.'
        },
      ],
    },
    {
      name: 'Flow',
      color: 'text-purple-300',
      desc: '집중과 실행, 협업의 흐름을 만드는 단계',
      skills: [
        {
          name: 'Focus',
          desc: '몰입 세션을 운영하면 생산성이 극대화됩니다.',
          books: ['딥 워크 (칼 뉴포트)', '셜록 홈즈 시리즈 (아서 코난 도일)'],
          tip: 'TS 모드로 25분 몰입 세션을 기록하고, 인지능력 모니터링(대시보드)에서 집중력 지표를 확인하세요.'
        },
        {
          name: 'Collaborate',
          desc: '협업과 소통은 더 큰 성과를 만듭니다.',
          books: ['Radical Candor (킴 스콧)', '팀장 김유진 (김유진)'],
          tip: '메모진화로 협업 내용을 기록하고, 플래시카드로 협업 관련 개념을 복습하세요.'
        },
        {
          name: 'Track',
          desc: '실행 데이터를 기록하면 개선의 단서가 보입니다.',
          books: ['Measure What Matters (존 도어)', 'Peak (앤더스 에릭슨)'],
          tip: 'ZenGo 기본으로 작업 기억력/집중력 변화를 기록하고, 인지능력 모니터링(대시보드)에서 추이를 확인하세요.'
        },
      ],
    },
    {
      name: 'Growth',
      color: 'text-green-300',
      desc: '피드백과 개선, 성장을 실현하는 단계',
      skills: [
        {
          name: 'Review',
          desc: '성과를 리뷰하면 성장의 방향이 보입니다.',
          books: ['The Art of Learning (조쉬 웨이츠킨)', '노르웨이의 숲 (무라카미 하루키)'],
          tip: 'TS 모드로 주간 성과 관련 자료를 읽고, 1줄 요약 메모를 남긴 뒤, 메모진화로 4단계로 확장하세요.'
        },
        {
          name: 'Improve',
          desc: '개선 액션을 설계하면 다음 루프가 달라집니다.',
          books: ['Atomic Habits (제임스 클리어)', '나의 문화유산답사기 (유홍준)'],
          tip: '플래시카드로 개선 아이디어/핵심 개념을 만들어 반복 복습하세요.'
        },
        {
          name: 'Achieve',
          desc: '성장을 모니터링하면 동기와 자신감이 커집니다.',
          books: ['Peak (앤더스 에릭슨)', '브레인 룰스 (존 메디나)'],
          tip: 'ZenGo/인지능력 모니터링(대시보드)에서 주요 지표의 변화를 추적하세요.'
        },
      ],
    },
  ];
  const branchDescriptions = {
    Radar: '업무의 방향과 우선순위를 탐지하는 레이더',
    Flow: '집중과 실행, 협업의 흐름을 만드는 단계',
    Growth: '피드백과 개선, 성장을 실현하는 단계',
  };
  const getSkillName = (branchName: string, skillIndex: number): string => {
    if (branchName === 'Radar') return ['Select', 'Prioritize', 'Plan'][skillIndex];
    if (branchName === 'Flow') return ['Focus', 'Collaborate', 'Track'][skillIndex];
    if (branchName === 'Growth') return ['Review', 'Improve', 'Achieve'][skillIndex];
    return '';
  };
  return (
    <div className="w-full flex justify-center">
      <div className="relative w-[480px] h-[480px] bg-transparent rounded-2xl mx-auto hidden sm:flex flex-row overflow-visible">
        {branches.map((branch, bIdx) => (
          <div key={branch.name} className={`flex flex-col items-center w-1/3 h-full p-2`}>
            <div
              className={`font-bold mb-3 text-base ${branch.color} relative`}
              onMouseEnter={() => setTooltipIdx(bIdx)}
              onMouseLeave={() => setTooltipIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {branch.name}
              {tooltipIdx === bIdx && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-gray-100 text-xs rounded shadow-lg border border-cyan-500 z-30 whitespace-nowrap">
                  {branchDescriptions[branch.name as keyof typeof branchDescriptions]}
                </div>
              )}
            </div>
            <div className="flex flex-col h-full w-full items-center">
              <button
                className={`${theme.skillButtonBg} ${theme.skillButtonHover} text-gray-200 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow border ${theme.skillButtonBorder} transition-colors duration-150 max-w-full overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 ${theme.ring} text-sm`}
                style={{ fontSize: getSkillName(branch.name, 0).length > 7 ? '0.7rem' : '0.85rem' }}
                onClick={() => popup && popup.bIdx === bIdx && popup.sIdx === 0 ? setPopup(null) : setPopup({bIdx, sIdx: 0})}
              >
                {getSkillName(branch.name, 0)}
              </button>
              <div className="flex-1 flex flex-col justify-center items-center">
                <span className="text-cyan-400 text-xl leading-none">↓</span>
              </div>
              <button
                className={`${theme.skillButtonBg} ${theme.skillButtonHover} text-gray-200 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow border ${theme.skillButtonBorder} transition-colors duration-150 max-w-full overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 ${theme.ring} text-sm`}
                style={{ fontSize: getSkillName(branch.name, 1).length > 7 ? '0.7rem' : '0.85rem' }}
                onClick={() => popup && popup.bIdx === bIdx && popup.sIdx === 1 ? setPopup(null) : setPopup({bIdx, sIdx: 1})}
              >
                {getSkillName(branch.name, 1)}
              </button>
              <div className="flex-1 flex flex-col justify-center items-center">
                <span className="text-cyan-400 text-xl leading-none">↓</span>
              </div>
              <button
                className={`${theme.skillButtonBg} ${theme.skillButtonHover} text-gray-200 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow border ${theme.skillButtonBorder} transition-colors duration-150 max-w-full overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 ${theme.ring} text-sm`}
                style={{ fontSize: getSkillName(branch.name, 2).length > 7 ? '0.7rem' : '0.85rem' }}
                onClick={() => popup && popup.bIdx === bIdx && popup.sIdx === 2 ? setPopup(null) : setPopup({bIdx, sIdx: 2})}
              >
                {getSkillName(branch.name, 2)}
              </button>
              {[0,1,2].map(sIdx => (
                popup && popup.bIdx === bIdx && popup.sIdx === sIdx && (
                  <div key={sIdx} className={`absolute left-1/2 z-20 -translate-x-1/2 top-20 bg-gray-900/95 border ${theme.skillPopupBorder} rounded-xl shadow-2xl p-6 w-72 text-left animate-fade-in`}>
                    <div className={`font-bold ${theme.skillPopupTitle} mb-2 text-lg`}>{getSkillName(branch.name, sIdx)}</div>
                    <div className="text-gray-200 text-sm mb-4 leading-relaxed whitespace-pre-line">{branch.skills[sIdx].desc}</div>
                    <div className={`${theme.secondary} text-xs mb-1`}><span className="font-semibold">추천도서1:</span> {branch.skills[sIdx].books[0]}</div>
                    <div className={`${theme.secondary} text-xs mb-2`}><span className="font-semibold">추천도서2:</span> {branch.skills[sIdx].books[1]}</div>
                    <div className="text-green-300 text-sm mb-3"><span className="font-semibold">실전팁:</span> {branch.skills[sIdx].tip}</div>
                    <button
                      className={`mt-2 px-3 py-1 text-xs ${theme.secondary} border ${theme.skillButtonBorder} rounded ${theme.hoverBgAccent}`}
                      onClick={() => setPopup(null)}
                    >닫기</button>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* 모바일: 세로 스택은 기존 구조와 동일하게 구현 (생략) */}
    </div>
  );
}

// 작업 기억력 SkillTree (정중앙 화살표, 원형 바둑돌, 툴팁, 팝업 구조)
function MemorySkillTree({ theme }: SkillTreeProps) {
  const [popup, setPopup] = React.useState<{bIdx: number, sIdx: number} | null>(null);
  const [tooltipIdx, setTooltipIdx] = React.useState<number|null>(null);
  const branches = [
    {
      name: 'Symbol',
      color: 'text-orange-300',
      desc: '핵심 정보를 선별하고 구조화하는 단계',
      skills: [
        {
          name: 'Filter',
          desc: '방대한 정보 중 핵심만 빠르게 추출하면 작업 기억의 부하를 줄일 수 있습니다.',
          books: ['SQ3R 읽기 전략 (프랜시스 로빈슨)', '에센셜리즘 (그렉 맥커운)'],
          tip: 'TS 모드로 목차/키워드만 빠르게 훑고, 메모진화에 핵심만 1줄로 기록하세요.'
        },
        {
          name: 'Chunk',
          desc: '복잡한 정보를 논리적 구조나 청크(덩어리)로 묶으면 기억 용량이 확장됩니다.',
          books: ['기억력 천재 게으른 뇌를 깨워라 (오카다 다카시)', '마인드맵 완전정복 (토니 부잔)'],
          tip: 'ZenGo Myverse로 청킹 게임을 만들고, 반복 연습하세요.'
        },
        {
          name: 'Visualize',
          desc: '핵심 정보를 시각적으로 구조화하면 작업 기억의 효율이 높아집니다.',
          books: ['비주얼씽킹 (댄 로암)', '생각 정리 스킬 (후쿠치 다로)'],
          tip: '메모진화로 마인드맵/도식화 메모를 작성하세요.'
        },
      ],
    },
    {
      name: 'Memory',
      color: 'text-cyan-300',
      desc: '기억을 유지하고 반복하는 단계',
      skills: [
        {
          name: 'Repeat',
          desc: '주기적으로 반복 복습하면 정보를 장기 기억으로 전환할 수 있습니다.',
          books: ['Make It Stick (피터 C. 브라운)', '에빙하우스 망각곡선 극복법 (안토니오 그리포)'],
          tip: '플래시카드로 반복 복습 일정을 설정하세요.'
        },
        {
          name: 'Space',
          desc: '복습 간격을 늘려가면 기억의 지속성이 높아집니다.',
          books: ['Anki 완전정복', '기억력 수업 (도미니크 오브라이언)'],
          tip: 'TS 모드/플래시카드로 간격 반복 복습을 실천하세요.'
        },
        {
          name: 'Apply',
          desc: '실전 상황에서 기억을 적용해보면 기억이 강화됩니다.',
          books: ['실전 메타인지 (피터 C. 브라운)', '행동 학습법 (앨런 배들리)'],
          tip: 'ZenGo/TS 모드로 실전 테스트를 기록하고, 피드백을 메모진화에 남기세요.'
        },
      ],
    },
    {
      name: 'Optimize',
      color: 'text-green-300',
      desc: '기억을 확장하고 최적화하는 단계',
      skills: [
        {
          name: 'Dual',
          desc: '여러 정보를 동시에 다루는 멀티태스킹 훈련으로 작업 기억 용량을 확장할 수 있습니다.',
          books: ['멀티태스킹의 심리학 (데이비드 마이어)', '작업기억 (앨런 배들리)'],
          tip: 'ZenGo에서 2개 이상 정보를 동시에 기억/조작하는 게임을 반복하세요.'
        },
        {
          name: 'Switch',
          desc: '두 가지 이상의 정보를 동시에 혹은 순차적으로 처리하는 훈련으로 기억력의 한계를 극복할 수 있습니다.',
          books: ['뇌, 생각의 한계 (마이클 S. 가지니가)', 'N-back 훈련법'],
          tip: 'ZenGo Myverse에서 이중부하/순차처리 게임을 만들어 연습하세요.'
        },
        {
          name: 'Adapt',
          desc: '자신의 작업 기억 한계와 패턴을 분석, 맞춤형 훈련으로 최적화할 수 있습니다.',
          books: ['메타인지 학습법 (리사 손)', 'Peak(앤더스 에릭슨)'],
          tip: '대시보드에서 약점 패턴을 분석, 맞춤형 ZenGo 훈련을 설계하세요.'
        },
      ],
    },
  ];
  const branchDescriptions = {
    Symbol: '핵심 정보를 선별하고 구조화하는 단계',
    Memory: '기억을 유지하고 반복하는 단계',
    Optimize: '기억을 확장하고 최적화하는 단계',
  };
  const getSkillName = (branchName: string, skillIndex: number): string => {
    if (branchName === 'Symbol') return ['Filter', 'Chunk', 'Visualize'][skillIndex];
    if (branchName === 'Memory') return ['Repeat', 'Space', 'Apply'][skillIndex];
    if (branchName === 'Optimize') return ['Dual', 'Switch', 'Adapt'][skillIndex];
    return '';
  };
  return (
    <div className="w-full flex justify-center">
      <div className="relative w-[480px] h-[480px] bg-transparent rounded-2xl mx-auto hidden sm:flex flex-row overflow-visible">
        {branches.map((branch, bIdx) => (
          <div key={branch.name} className={`flex flex-col items-center w-1/3 h-full p-2`}>
            <div
              className={`font-bold mb-3 text-base ${branch.color} relative`}
              onMouseEnter={() => setTooltipIdx(bIdx)}
              onMouseLeave={() => setTooltipIdx(null)}
              style={{ cursor: 'pointer' }}
            >
              {branch.name}
              {tooltipIdx === bIdx && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-gray-100 text-xs rounded shadow-lg border border-cyan-500 z-30 whitespace-nowrap">
                  {branchDescriptions[branch.name as keyof typeof branchDescriptions]}
                </div>
              )}
            </div>
            <div className="flex flex-col h-full w-full items-center">
              <button
                className={`${theme.skillButtonBg} ${theme.skillButtonHover} text-gray-200 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow border ${theme.skillButtonBorder} transition-colors duration-150 max-w-full overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 ${theme.ring} text-sm`}
                style={{ fontSize: getSkillName(branch.name, 0).length > 7 ? '0.7rem' : '0.85rem' }}
                onClick={() => popup && popup.bIdx === bIdx && popup.sIdx === 0 ? setPopup(null) : setPopup({bIdx, sIdx: 0})}
              >
                {getSkillName(branch.name, 0)}
              </button>
              <div className="flex-1 flex flex-col justify-center items-center">
                <span className="text-cyan-400 text-xl leading-none">↓</span>
              </div>
              <button
                className={`${theme.skillButtonBg} ${theme.skillButtonHover} text-gray-200 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow border ${theme.skillButtonBorder} transition-colors duration-150 max-w-full overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 ${theme.ring} text-sm`}
                style={{ fontSize: getSkillName(branch.name, 1).length > 7 ? '0.7rem' : '0.85rem' }}
                onClick={() => popup && popup.bIdx === bIdx && popup.sIdx === 1 ? setPopup(null) : setPopup({bIdx, sIdx: 1})}
              >
                {getSkillName(branch.name, 1)}
              </button>
              <div className="flex-1 flex flex-col justify-center items-center">
                <span className="text-cyan-400 text-xl leading-none">↓</span>
              </div>
              <button
                className={`${theme.skillButtonBg} ${theme.skillButtonHover} text-gray-200 font-bold rounded-full w-16 h-16 flex items-center justify-center shadow border ${theme.skillButtonBorder} transition-colors duration-150 max-w-full overflow-hidden whitespace-nowrap focus:outline-none focus:ring-2 ${theme.ring} text-sm`}
                style={{ fontSize: getSkillName(branch.name, 2).length > 7 ? '0.7rem' : '0.85rem' }}
                onClick={() => popup && popup.bIdx === bIdx && popup.sIdx === 2 ? setPopup(null) : setPopup({bIdx, sIdx: 2})}
              >
                {getSkillName(branch.name, 2)}
              </button>
              {[0,1,2].map(sIdx => (
                popup && popup.bIdx === bIdx && popup.sIdx === sIdx && (
                  <div key={sIdx} className={`absolute left-1/2 z-20 -translate-x-1/2 top-20 bg-gray-900/95 border ${theme.skillPopupBorder} rounded-xl shadow-2xl p-6 w-72 text-left animate-fade-in`}>
                    <div className={`font-bold ${theme.skillPopupTitle} mb-2 text-lg`}>{getSkillName(branch.name, sIdx)}</div>
                    <div className="text-gray-200 text-sm mb-4 leading-relaxed whitespace-pre-line">{branch.skills[sIdx].desc}</div>
                    <div className={`${theme.secondary} text-xs mb-1`}><span className="font-semibold">추천도서1:</span> {branch.skills[sIdx].books[0]}</div>
                    <div className={`${theme.secondary} text-xs mb-2`}><span className="font-semibold">추천도서2:</span> {branch.skills[sIdx].books[1]}</div>
                    <div className="text-green-300 text-sm mb-3"><span className="font-semibold">실전팁:</span> {branch.skills[sIdx].tip}</div>
                    <button
                      className={`mt-2 px-3 py-1 text-xs ${theme.secondary} border ${theme.skillButtonBorder} rounded ${theme.hoverBgAccent}`}
                      onClick={() => setPopup(null)}
                    >닫기</button>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* 모바일: 세로 스택은 기존 구조와 동일하게 구현 (생략) */}
    </div>
  );
}
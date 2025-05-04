"use client";
import React from 'react';
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
  ArrowLongRightIcon as ArrowRight, // ArrowRight 대신 긴 화살표 사용
  BeakerIcon as Activity, // Activity 대신 비커 아이콘 사용 (실험/실행 의미)
  CpuChipIcon as Brain // Brain 대신 CPU 칩 아이콘 사용 (처리 의미)
} from '@heroicons/react/24/outline';

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

// --- 새 섹션 컴포넌트 정의 ---
const SectionWrapper = ({ id, className, children }: { id?: string, className?: string, children: React.ReactNode }) => (
  <section id={id} className={`py-12 md:py-16 ${className}`}>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
  // 제목과 본문 사이 여백 증가 (mb-8)
  <h2 className={`text-2xl md:text-3xl font-bold mb-8 flex items-center ${color}`}>
    {Icon && <Icon className="mr-3 h-7 w-7 flex-shrink-0" />} {/* 아이콘 크기 약간 증가 */}
    <span className="flex-1">{title}</span> {/* 제목 영역 확보 */}
  </h2>
);

const SectionParagraph = ({ children }: { children: React.ReactNode }) => (
  // 가독성 향상: 줄간격 증가 (leading-loose)
  <p className={`${cyberTheme.textLight} mb-4 leading-loose text-base`}>{children}</p>
);

const Highlight = ({ children, color }: { children: React.ReactNode, color: string }) => (
  // 가독성 향상: 폰트 굵기 증가 (font-bold)
  <strong className={`font-bold ${color}`}>{children}</strong> 
);
// --- /새 섹션 컴포넌트 정의 ---


export default function CyberneticsFeedbackLoopPage() {
  return (
    <PageContainer className={`${cyberTheme.gradient} text-gray-200 min-h-screen`}>
      <PageTitle className={`!text-white mb-10`}>사이버네틱스 피드백 루프: 작업 기억 향상</PageTitle>

      {/* 섹션 1: 개념 설명 (도입부 추가) */}
      <SectionWrapper className={`${cyberTheme.bgSecondary} rounded-lg shadow-xl`}> 
        <SectionTitle icon={LightBulbIcon} title="마음의 조종 시스템, 사이버네틱스 피드백 루프란?" color={cyberTheme.primary} />
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
          <ArrowRight className="h-6 w-6" />
          <Activity className="h-8 w-8" />
           <ArrowRight className="h-6 w-6" />
           <ChartBarIcon className="h-8 w-8" />
           <ArrowRight className="h-6 w-6" />
           <Brain className="h-8 w-8" />
           <ArrowDownCircleIcon className="h-8 w-8 ml-4 transform rotate-90" /> {/* 순환 표시 */} 
      </div>
        <SectionParagraph>
          Habitus33은 <Highlight color={cyberTheme.primary}>TS 모드</Highlight>의 즉각적인 처리 속도 피드백과 <Highlight color={cyberTheme.secondary}>ZenGo</Highlight>의 작업 기억 부하 조절 훈련을 통해, 당신의 <Highlight color={cyberTheme.primary}>전전두엽</Highlight>을 활성화하고 이 피드백 루프를 강화합니다. 결과적으로 <Highlight color={cyberTheme.secondary}>작업 기억의 속도와 용량/지속 시간</Highlight>이 눈에 띄게 향상됩니다.
        </SectionParagraph>
      </SectionWrapper>

      <hr className={`my-16 border-t ${cyberTheme.hrBorder} max-w-4xl mx-auto`} /> {/* 구분선 여백 증가 */} 

      {/* 섹션 2: 사용자 유형별 루프 찾기 */}
      <SectionWrapper>
        <SectionTitle icon={UserGroupIcon} title="당신의 작업 기억 향상 루프 찾기" color={"text-white"} /> 
        <SectionParagraph>
          어떤 목표를 가지고 계신가요? 당신의 상황에 맞는 피드백 루프를 선택하고 시작해보세요.
        </SectionParagraph>
        {/* 퀵 네비게이션 (디자인 개선 및 아이콘 추가) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16"> {/* 그리드 간격 및 하단 여백 조정 */} 
           <QuickNavCard 
             href="#learning" 
             label="학습 효율 극대화" 
             icon={AcademicCapIcon} // 아이콘 추가
             className={`${cyberTheme.cardBg} ${cyberTheme.borderPrimary} hover:border-cyan-400 hover:shadow-cyan-400/40`} 
             textClassName={cyberTheme.primary} 
           />
           <QuickNavCard 
             href="#productivity" 
             label="업무 생산성 향상" 
             icon={BriefcaseIcon} // 아이콘 추가
             className={`${cyberTheme.cardBg} ${cyberTheme.borderPrimary} hover:border-cyan-400 hover:shadow-cyan-400/40`} 
             textClassName={cyberTheme.primary} 
           />
           <QuickNavCard 
             href="#capacity" 
             label="작업 기억 용량 확장" 
             icon={CubeIcon} // 아이콘 추가
             className={`${cyberTheme.cardBg} ${cyberTheme.borderSecondary} hover:border-purple-400 hover:shadow-purple-400/40`} 
             textClassName={cyberTheme.secondary} 
           />
           <QuickNavCard 
             href="#speed" 
             label="작업 기억 속도 향상" 
             icon={BoltIcon} // 아이콘 추가
             className={`${cyberTheme.cardBg} ${cyberTheme.borderSecondary} hover:border-purple-400 hover:shadow-purple-400/40`} 
             textClassName={cyberTheme.secondary} 
           />
        </div>
      
        {/* 각 사용자 유형별 섹션 (배경색 추가 및 테두리 강조) */}
        {/* 학습 효율 */}
        <SectionWrapper id="learning" className={`${cyberTheme.bgSecondary} rounded-lg shadow-lg border-t-2 ${cyberTheme.borderPrimary} mb-12`}> {/* 상단 테두리 추가 */}
          <div className="flex items-center justify-between mb-6"> {/* 제목과 예시를 한 줄에 배치 */} 
            <SectionTitle title="학습 효율 극대화 루프" color={cyberTheme.primary} icon={AcademicCapIcon} /> 
            <span className={`${cyberTheme.textMuted} text-sm hidden sm:inline-block`}>(예: 학생, 수험생, 연구원)</span>
          </div>
          <p className={`${cyberTheme.textMuted} italic mb-6`}>"새로운 과목, 어려운 논문... 시간은 가는데 진도는 안 나가고 머리에 남는 게 없어요."</p>
           {/* 루프 설명 구체화 */}
           <h3 className={`font-semibold mb-3 ${cyberTheme.textLight}`}>이렇게 작동합니다 (피드백 루프 예시):</h3>
           <ul className="list-none space-y-4 mb-6 pl-4 text-gray-300 text-base leading-relaxed border-l-2 border-gray-700 py-2">
             <li className="relative pl-6 before:content-['1'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-cyan-600 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
               <Highlight color={cyberTheme.primary}>상황 & 목표:</Highlight> "오늘 전공서적 30페이지, 분당 2쪽(PPM) 속도로 이해하며 읽자!"
             </li>
             <li className="relative pl-6 before:content-['2'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-cyan-700 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
               <Highlight color={cyberTheme.primary}>실행 & 피드백 (TS):</Highlight> TS 모드로 집중해서 읽기 완료! <Highlight color={cyberTheme.primary}>결과: 2.5 PPM 달성, 이해도 85%.</Highlight> (데이터 즉시 확인)
             </li>
             <li className="relative pl-6 before:content-['3'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-purple-600 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
               <Highlight color={cyberTheme.secondary}>조절 & 강화 (ZenGo/다음 목표):</Highlight> "좋아, 내일은 3 PPM 목표!" + "어려웠던 부분은 ZenGo <Highlight color={cyberTheme.secondary}>(용량 확장)</Highlight>로 복습해야지."
             </li>
             <li className="relative pl-6 before:content-['✓'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-green-600 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
                <Highlight color="text-green-400">결과:</Highlight> 꾸준히 반복하며 읽기 속도와 기억력이 함께 향상! 어려운 내용도 <Highlight color="text-green-400">자신감</Highlight> 상승.
             </li>
           </ul>
        </SectionWrapper>

        {/* 업무 생산성 */}
        <SectionWrapper id="productivity" className={`${cyberTheme.bgSecondary} rounded-lg shadow-lg border-t-2 ${cyberTheme.borderPrimary} mb-12`}>
           <div className="flex items-center justify-between mb-6">
             <SectionTitle title="업무 생산성 향상 루프" color={cyberTheme.primary} icon={BriefcaseIcon} />
             <span className={`${cyberTheme.textMuted} text-sm hidden sm:inline-block`}>(예: 직장인, 개발자, 기획자)</span>
           </div>
           <p className={`${cyberTheme.textMuted} italic mb-6`}>"보고서 작성, 코드 리뷰... 집중해야 하는데 자꾸 메신저 확인하고, 속도가 안 나요."</p>
            <h3 className={`font-semibold mb-3 ${cyberTheme.textLight}`}>이렇게 작동합니다 (피드백 루프 예시):</h3>
           <ul className="list-none space-y-4 mb-6 pl-4 text-gray-300 text-base leading-relaxed border-l-2 border-gray-700 py-2">
             <li className="relative pl-6 before:content-['1'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-cyan-600 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
               <Highlight color={cyberTheme.primary}>상황 & 목표:</Highlight> "오후엔 이 기획서 초안, 1시간 안에 집중해서 끝내자!"
             </li>
             <li className="relative pl-6 before:content-['2'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-cyan-700 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
               <Highlight color={cyberTheme.primary}>실행 & 피드백 (TS):</Highlight> 관련 자료 TS 모드로 빠르게 읽고 <Highlight color={cyberTheme.primary}>정보 처리 컨디션</Highlight> 확인. (집중 준비 완료!)
             </li>
             <li className="relative pl-6 before:content-['3'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-purple-600 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
               <Highlight color={cyberTheme.secondary}>조절 & 활성화 (ZenGo):</Highlight> "중간에 집중력 떨어지네... 잠깐 ZenGo <Highlight color={cyberTheme.secondary}>(속도 향상)</Highlight>로 뇌 환기!" (다시 집중 모드)
             </li>
             <li className="relative pl-6 before:content-['✓'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-green-600 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
                <Highlight color="text-green-400">결과:</Highlight> 방해 요소를 이겨내고 목표 시간 내 업무 완료! <Highlight color="text-green-400">처리 속도와 정확도</Highlight> 향상.
             </li>
           </ul>
        </SectionWrapper>

        {/* 작업 기억 용량 */}
         <SectionWrapper id="capacity" className={`${cyberTheme.bgSecondary} rounded-lg shadow-lg border-t-2 ${cyberTheme.borderSecondary} mb-12`}>
           <div className="flex items-center justify-between mb-6">
             <SectionTitle title="작업 기억 용량 확장 루프" color={cyberTheme.secondary} icon={CubeIcon} />
             <span className={`${cyberTheme.textMuted} text-sm hidden sm:inline-block`}>(예: 관리자, 연구/분석가)</span>
           </div>
           <p className={`${cyberTheme.textMuted} italic mb-6`}>"여러 프로젝트 정보를 동시에 파악해야 하는데, 자꾸 중요한 걸 놓치고 머리가 복잡해요."</p>
            <h3 className={`font-semibold mb-3 ${cyberTheme.textLight}`}>이렇게 작동합니다 (피드백 루프 예시):</h3>
           <ul className="list-none space-y-4 mb-6 pl-4 text-gray-300 text-base leading-relaxed border-l-2 border-gray-700 py-2">
             <li className="relative pl-6 before:content-['1'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-cyan-600 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
               <Highlight color={cyberTheme.primary}>상황 & 목표:</Highlight> "이번 주 회의 자료들, 핵심만 빠르게 파악해서 정리하자."
             </li>
             <li className="relative pl-6 before:content-['2'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-cyan-700 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
               <Highlight color={cyberTheme.primary}>실행 & 피드백 (TS+메모):</Highlight> TS 모드로 자료 읽고, <Highlight color={cyberTheme.primary}>핵심 내용 요약</Highlight>. (원문과 비교하며 정보 조직화 연습)
             </li>
             <li className="relative pl-6 before:content-['3'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-purple-600 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
               <Highlight color={cyberTheme.secondary}>조절 & 확장 (ZenGo):</Highlight> "정보량이 많아지니 버겁네." ZenGo <Highlight color={cyberTheme.secondary}>(용량 확장 - 난이도 상승)</Highlight>로 한 번에 처리 가능한 정보량 늘리기 도전!
             </li>
              <li className="relative pl-6 before:content-['✓'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-green-600 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
                <Highlight color="text-green-400">결과:</Highlight> 여러 정보를 동시에 <Highlight color="text-green-400">종합하고 연결</Highlight>하는 능력이 향상! 복잡한 문제도 <Highlight color="text-green-400">체계적</Highlight>으로 접근 가능.
             </li>
           </ul>
         </SectionWrapper>

         {/* 작업 기억 속도 */}
         <SectionWrapper id="speed" className={`${cyberTheme.bgSecondary} rounded-lg shadow-lg border-t-2 ${cyberTheme.borderSecondary} mb-12`}>
           <div className="flex items-center justify-between mb-6">
             <SectionTitle title="작업 기억 속도 향상 루프" color={cyberTheme.secondary} icon={BoltIcon} />
             <span className={`${cyberTheme.textMuted} text-sm hidden sm:inline-block`}>(예: 개발자(디버깅), 트레이더, 게이머)</span>
           </div>
           <p className={`${cyberTheme.textMuted} italic mb-6`}>"순간적인 판단이 중요한데, 자꾸 머뭇거리고 반응이 늦어요."</p>
           <h3 className={`font-semibold mb-3 ${cyberTheme.textLight}`}>이렇게 작동합니다 (피드백 루프 예시):</h3>
           <ul className="list-none space-y-4 mb-6 pl-4 text-gray-300 text-base leading-relaxed border-l-2 border-gray-700 py-2">
             <li className="relative pl-6 before:content-['1'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-cyan-600 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
               <Highlight color={cyberTheme.primary}>상황 & 목표:</Highlight> "기술 문서, 5분 안에 핵심 정보만 빠르게 스캔하자!"
             </li>
             <li className="relative pl-6 before:content-['2'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-cyan-700 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
               <Highlight color={cyberTheme.primary}>실행 & 피드백 (TS):</Highlight> TS 모드(<Highlight color={cyberTheme.primary}>시간 제한</Highlight>)로 실행! <Highlight color={cyberTheme.primary}>결과: 4분 30초 만에 완료, PPM 3.5.</Highlight> (목표 시간 달성 및 속도 확인)
             </li>
             <li className="relative pl-6 before:content-['3'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-purple-600 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
               <Highlight color={cyberTheme.secondary}>조절 & 단련 (ZenGo):</Highlight> "더 빠르게 반응해야 해!" ZenGo <Highlight color={cyberTheme.secondary}>(속도 향상 - 다양한 패턴)</Highlight>로 정보 <Highlight color={cyberTheme.secondary}>인출/조작 속도</Highlight> 집중 훈련.
             </li>
             <li className="relative pl-6 before:content-['✓'] before:absolute before:left-[-0.5rem] before:top-1 before:w-5 before:h-5 before:bg-green-600 before:rounded-full before:text-xs before:text-white before:font-bold before:flex before:items-center before:justify-center">
                <Highlight color="text-green-400">결과:</Highlight> 정보 처리 속도가 빨라져 <Highlight color="text-green-400">순발력</Highlight>과 <Highlight color="text-green-400">판단력</Highlight> 향상! 변화에 <Highlight color="text-green-400">민첩하게 대응</Highlight>.
             </li>
           </ul>
         </SectionWrapper>
      </SectionWrapper>
      
      <hr className={`my-16 border-t ${cyberTheme.hrBorder} max-w-4xl mx-auto`} /> {/* 구분선 여백 증가 */} 

      {/* 섹션 3: 대시보드 링크 */}
      <SectionWrapper className="text-center">
         <SectionTitle icon={LinkIconSolid} title="성장을 확인하고 루프를 완성하세요" color={"text-white"} />
         <SectionParagraph>
           대시보드에서 당신의 작업 기억 향상 과정을 직접 확인하고, 다음 목표를 설정하며 피드백 루프를 완성하세요!
         </SectionParagraph>
        <Link href="/dashboard" className={`inline-flex items-center ${cyberTheme.primary} font-medium hover:underline text-lg`}>
          {/* Gauge 아이콘 임시 제거 (오류 방지) */}
          대시보드에서 성장 확인하기
        </Link>
      </SectionWrapper>

    </PageContainer>
  );
} 
"use client";
import React from 'react';
import Link from 'next/link';
import PageContainer from '../../components/common/PageContainer';
import PageTitle from '../../components/common/PageTitle';
import QuickNavCard from '../../components/common/QuickNavCard';
import RoutineSection from '../../components/common/RoutineSection';

export default function BrainHackRoutinePage() {
  return (
    <PageContainer>
      <PageTitle>뇌속임 루틴</PageTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12 px-2 md:px-0">
        <QuickNavCard href="#exam" label="청소년·수험생" />
        <QuickNavCard href="#selfdev" label="대학생·직장인" />
        <QuickNavCard href="#memory" label="기억 강화형" />
        <QuickNavCard href="#attention" label="집중력 개선형" />
      </div>

      <RoutineSection
        id="exam"
        title="청소년·수험생"
        quote={'"공부해야 하는 건 아는데 손이 안 가요."'}
        items={[
          '매일 아침 TS 모드 딱 1번 → 속도를 눈으로 확인',
          '화·목·토 Zengo 트레이닝 → 기억력 & 몰입력 훈련',
          "일요일엔 '내가 제일 빠르게 읽은 날'을 찾아 보상 회로 강화",
        ]}
      />
      <RoutineSection
        id="selfdev"
        title="대학생·직장인"
        quote={'"책상에 앉아도 무엇부터 해야 할지 막막해요."'}
        items={[
          '출근 전 7~15분 TS 모드 1회 → 집중 트리거 설정',
          '수·금 Zengo(3×3 영어) 1회 → 판단력 회복',
          '저녁 종이책 TS + 1줄 메모 → 회고 & 동기 강화',
          "주말엔 PPM 기록으로 '나를 넘어선 나' 확인",
        ]}
      />
      <RoutineSection
        id="memory"
        title="기억 강화형"
        quote={'"읽고 나면 기억이 잘 안 나요."'}
        items={[
          '아침 TS + 감정 단어 1줄 요약 + 키워드 10개 작성',
          'ZenGo (3×3 → 5×5) 퍼즐 반복 → 기록 유지',
          '밤 복습 TS → 시각 기억 & 수면 통합',
          "일요일엔 내가 만든 퍼즐 풀기 → 자기효능감",
        ]}
      />
      <RoutineSection
        id="attention"
        title="집중력 개선형"
        quote={'"앉으면 폰부터 만지게 돼요."'}
        items={[
          '오전·저녁 TS 1회 → 몰입 곡선 시각화',
          'ZenGo (3×3 → 5×5) 퍼즐 → 인지적 여유 제공',
          '주말엔 TS + ZenGo 집중 순간 재확인',
          '잡생각엔 ZenGo 1회 → 정서 안정 루프',
        ]}
      />

      <div className="text-center mt-6">
        <Link href="/dashboard" className="inline-block text-primary-500 font-medium hover:underline">
          ← 대시보드로 돌아가기
        </Link>
      </div>
    </PageContainer>
  );
} 
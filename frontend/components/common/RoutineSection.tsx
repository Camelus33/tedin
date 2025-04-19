"use client";
import * as React from 'react';
import Stepper, { StepItem } from './Stepper';

interface RoutineSectionProps {
  id: string;
  title: string;
  quote: string;
  items: string[];
}

export default function RoutineSection({ id, title, quote, items }: RoutineSectionProps) {
  // Stepper를 위한 단계 데이터 생성: 첫 단계 complete, 두 번째 active, 나머지 pending
  const steps: StepItem[] = items.map((label, idx) => ({
    id: `${id}-${idx}`,
    label,
    status: idx === 0 ? 'complete' : idx === 1 ? 'active' : 'pending',
  }));
  return (
    <section id={id} className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-10 max-w-3xl mx-auto leading-relaxed" role="region" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="text-heading-sm md:text-heading-md text-gray-900 mb-4">
        {title}
      </h2>
      <p className="text-gray-800 leading-relaxed mb-4"><strong>{quote}</strong></p>
      <p className="font-semibold text-gray-800 mb-2">루틴 예시:</p>
      {/* Stepper UI로 단계별 루틴 표시 */}
      <Stepper steps={steps} />
    </section>
  );
} 
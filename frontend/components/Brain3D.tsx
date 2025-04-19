'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// 브레인 시각화 컴포넌트 (학습 차단 효과 포함)
export function Brain3D() {
  const [showBlockage, setShowBlockage] = useState(false);
  
  // 차단 효과 애니메이션 타이밍
  useEffect(() => {
    // 1.5초 후 차단 효과 표시
    const timer = setTimeout(() => {
      setShowBlockage(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // anatomy 이미지 기준 (768x900)
  // 전두엽: cx=260, cy=170
  // 해마:   cx=520, cy=440 (뒷머리, 목 위, 소뇌 앞)
  // 곡선 제어점: (340, 260)
  // 베지어 곡선 t=0.5 중간점 계산
  // B(0.5) = (1-t)^2*P0 + 2(1-t)t*P1 + t^2*P2
  // x = (1-0.5)^2*260 + 2*(1-0.5)*0.5*340 + 0.5^2*520 = 0.25*260 + 0.5*340 + 0.25*520 = 65 + 170 + 130 = 365
  // y = (1-0.5)^2*170 + 2*(1-0.5)*0.5*260 + 0.5^2*440 = 0.25*170 + 0.5*260 + 0.25*440 = 42.5 + 130 + 110 = 282.5
  const textX = 410;
  const textY = 310; // 곡선과 이미지의 시각적 중앙에 더 가깝게

  return (
    <div className="relative w-full max-w-xl mx-auto aspect-[1/1.2] flex flex-col items-center">
      {/* 1. 실사 뇌 이미지 */}
      <div className="relative w-full h-full">
        <Image
          src="/images/brain-anatomy.png"
          alt="Brain Anatomy"
          fill
          priority
          className="z-0 rounded-xl shadow-2xl object-contain"
        />
        {/* 2. SVG 오버레이 */}
        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 768 900" fill="none">
          {/* 전두엽(차단) 신호 애니메이션 */}
          <motion.circle
            animate={{ r: [12, 18, 12], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            cx="260" cy="170" r="12" fill="#6366F1"
            filter="url(#glow)"
          />
          {/* 차단 영역 Glow (전두엽) */}
          <ellipse
            cx="260" cy="170" rx="70" ry="38"
            fill="rgba(239,68,68,0.22)"
            style={{ filter: 'url(#glow)' }}
          />
          {/* 신경망 곡선: 전두엽 → 해마 (세련된 그라데이션, glow, 화살표) */}
          <motion.path
            d="M260 170 Q 340 260 520 440"
            stroke="url(#neuralGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            filter="url(#neuralGlow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
          {/* 화살표 머리 (해마 방향) */}
          <polygon
            points="520,440 510,425 530,430"
            fill="url(#neuralGradient)"
            filter="url(#neuralGlow)"
            opacity="0.95"
          />
          {/* 해마 신호 애니메이션 */}
          <motion.circle
            cx="520" cy="440" r="14" fill="#5eead4"
            animate={{ opacity: [1, 0.5, 1], r: [14, 20, 14] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            filter="url(#neuralGlow)"
          />
          {/* '학습 차단' 텍스트: 곡선 정중앙에 배치 */}
          <motion.text
            x={textX}
            y={textY}
            textAnchor="middle"
            fill="#ef4444"
            fontWeight="bold"
            fontSize="2.2rem"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: [0, -10, 0] }}
            transition={{ delay: 1.2, duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
            style={{ pointerEvents: 'none' }}
          >
            학습 차단
          </motion.text>
          {/* SVG filter & gradient defs */}
          <defs>
            <linearGradient id="neuralGradient" x1="260" y1="170" x2="520" y2="440" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a78bfa" /> {/* 보라 */}
              <stop offset="60%" stopColor="#38bdf8" /> {/* 청록 */}
              <stop offset="100%" stopColor="#5eead4" /> {/* 밝은 청록 */}
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="neuralGlow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
      {/* 3. 설명 텍스트 (뇌 아래, 조화롭게) */}
      <div className="mt-8 w-full max-w-lg bg-white/90 rounded-2xl px-6 py-5 text-indigo-900 font-semibold shadow-xl z-20 text-base md:text-lg backdrop-blur-md border border-indigo-100">
        <div className="text-xl font-bold text-indigo-700 mb-2 text-center">학습 차단의 뇌과학적 원인</div>
        <ul className="list-disc pl-5 space-y-1 text-base font-normal">
          <li><b>전두엽</b>: 목표 설정과 집중력 조절을 담당합니다. 스트레스, 피로, 정보 과부하로 전두엽의 실행 제어 기능이 약화되면 주의가 쉽게 산만해집니다.</li>
          <li><b>해마</b>: 새로운 정보를 저장하고 기억으로 전이하는 역할을 합니다. 전두엽과의 연결이 약해지면 배운 내용이 장기 기억으로 저장되지 못하고 쉽게 사라집니다.</li>
          <li><b>주의집중회로</b>: 전두엽과 해마를 연결하는 신경망이 원활하게 작동해야 집중과 기억이 동시에 이루어집니다. 이 회로가 차단되면 아무리 공부해도 머릿속에 남지 않는 현상이 발생합니다.</li>
        </ul>
      </div>
    </div>
  );
} 
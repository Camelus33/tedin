'use client';

import React from 'react';
import { motion } from 'framer-motion';
import VirtuousCycleGraphic from '../animations/VirtuousCycleGraphic'; // Import the new graphic component
// Import icons for text later if needed

export default function SolutionSection() {
  return (
    // Use a slightly different background for visual separation
    <section id="solution-section" className="py-20 lg:py-28 bg-gradient-to-br from-indigo-50 via-white to-blue-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Reversed grid layout: Graphic Left, Text Right */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          {/* Static Graphic Area - Adjust height based on screen size */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            // Use responsive height, e.g., h-80 on mobile, h-96 on lg+, or let content decide with aspect ratio
            className="w-full h-80 lg:h-96 flex justify-center items-center mb-12 lg:mb-0"
          >
            <VirtuousCycleGraphic />
          </motion.div>

          {/* Text Content Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="text-center lg:text-left"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-brand-primary tracking-tight">
              나의 상태를 아는 것에서<br />
              모든 <span className="text-brand-primary">변화</span>는 시작됩니다.
            </h2>
            <p className="mt-6 text-lg md:text-xl text-gray-700">
              Habitus33은 당신의 현재 집중 상태를 조용히 비춰주는 <strong className="font-semibold text-gray-900">거울</strong>과 같습니다.
              내가 지금 어떤 리듬으로 정보를 받아들이는지 알게 되면, 가장 편안하고 깊게 몰입할 수 있는 
              <strong className="text-brand-primary">'나만의 보폭'</strong>을 찾을 수 있습니다.
            </p>
            <p className="mt-4 text-lg md:text-xl text-gray-700">
              <strong className="font-semibold text-gray-900">작은 성공</strong>이 모여 선순환의 리듬을 만들고, 
              그 리듬이 당신을 지치지 않고 더 <strong className="text-brand-primary">멀리</strong> 나아가게 합니다.
            </p>
          </motion.div>
        </div>
      </div>
      <p className="text-xs md:text-sm text-gray-500 mt-10 text-center max-w-2xl mx-auto">
        <strong>사이버네틱스(Cybernetics)</strong>는 노버트 위너(Norbert Wiener. MIT)<br/>
        시스템이 목표 달성을 위해 스스로를 제어하고,<br/>
        <strong>피드백</strong>을 통해 변화에 적응하는 원리를 연구합니다.<br/>
        이 원리는 인간의 두뇌, 인지, 습관 형성, 그리고 인공지능에 이르기까지<br/>
        다양한 분야에서 <strong>지속적 성장과 자기조절</strong>의 핵심 메커니즘으로 작동합니다.<br/>
        <span className="text-[10px] text-gray-400 italic">참고: N. Wiener, <i>Cybernetics: Control and Communication in the Animal and the Machine</i></span>
      </p>
    </section>
  );
} 
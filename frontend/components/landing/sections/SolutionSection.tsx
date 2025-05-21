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
            initial={{ opacity: 0, x: 50 }} // Animate from right
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="text-center lg:text-left" // Center on mobile, left align on larger screens
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              어떻게 벗어날 수 있을까요? <br />
              <span className="text-indigo-600">'측정' 후 '노력'</span>이면 가능합니다
            </h2>
            {/* Add md:text-xl for better readability on larger screens */}
            <p className="mt-6 text-lg md:text-xl text-gray-600">
              Habitus33은 Cybernetics AI의 <strong className="text-gray-800">실시간 '측정'</strong>을 통해 
              내비게이션이 현재 위치를 보여 주듯, <strong className="text-indigo-600">TS(정보 처리 속도)</strong>와 <strong className="text-indigo-600">ZenGo(기억 용량)</strong>이 당신을 데이터로 보여줍니다
            </p>
            {/* Add md:text-xl for better readability on larger screens */}
            <p className="mt-4 text-lg md:text-xl text-gray-600">
              자신의 상태를 <strong className="text-gray-800">'인지'</strong>하는 순간, 변화는 시작됩니다. 
              측정한 데이터는 나침반이 되어<strong className="text-indigo-600"> 목표</strong>로 당신을 이끌고, 
              작은 성공은 <strong className="text-indigo-600">다시 강력한 힘</strong>이 되어<strong className="text-indigo-600"> '선순환' </strong>을 이끕니다.
            </p>
             {/* Optional: Bullet points for key steps? */}
             {/* <ul className="mt-6 space-y-2 text-left"> ... </ul> */}
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
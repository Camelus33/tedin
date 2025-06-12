'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AMFAProcessGraphic from '../animations/AMFAProcessGraphic'; // Import the new AMFA graphic component

export default function SolutionSection() {
  return (
    // Use a dark background for AMFA section to match cyber minimalism
    <section id="solution-section" className="py-20 lg:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered layout for AMFA presentation */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                지식의 주변에서
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                지식의 중심으로
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              <span className="text-cyan-400 font-semibold">AMFA 프레임워크</span>로 불가능한 독서를 가능하게 만드세요.
              <br className="hidden sm:block" />
              4단계 학습 여정을 통해 <span className="text-purple-400 font-semibold">나만의 리듬</span>을 발견합니다.
            </p>
          </motion.div>
        </div>

        {/* AMFA Process Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="w-full flex justify-center items-center"
        >
          <AMFAProcessGraphic />
        </motion.div>

        {/* Bottom description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeInOut", delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-400 leading-relaxed mb-6">
              <span className="text-cyan-400 font-semibold">Atomic Reading</span>부터 
              <span className="text-purple-400 font-semibold"> AI Link</span>까지, 
              체계적인 4단계 프로세스로 학습의 질을 혁신적으로 향상시킵니다.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">개인화된 학습 리듬</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  3분 11페이지라는 과학적 단위로 시작하여, 데이터 기반으로 당신만의 최적 학습 패턴을 발견합니다.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">지속 가능한 성장</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  작은 성취의 누적을 통해 선순환 구조를 만들고, 장기적인 학습 동기를 유지합니다.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 
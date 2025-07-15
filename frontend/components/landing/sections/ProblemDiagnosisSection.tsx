'use client';

import React from 'react';
import { motion } from 'framer-motion';
import FadingContextAnimation from '@/components/landing/animations/FadingContextAnimation';
// ViciousCycleGraphic을 임시로 제거합니다.
// import ViciousCycleGraphic from '@/components/landing/animations/ViciousCycleGraphic';

export default function ProblemDiagnosisSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 grid md:grid-cols-1 gap-6 items-center max-w-4xl">
        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 tracking-tight text-center">
            복잡한 정보 속, 당신 결정의 <span className="text-indigo-600">맹점</span>은 어디일까요?
          </h2>
          <div className="mt-8 text-lg text-gray-600 space-y-8 max-w-3xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <p className="font-semibold text-gray-800">
                불확실한 시장, 방대한 자료, 혹은 쌓여가는 정보 속에서
                결정적인 <span className="font-semibold text-indigo-600">숨은 신호</span>나
                <span className="font-semibold text-indigo-600"> 간과한 연결고리</span>가 있지는 않으신가요?
              </p>
              <p className="mt-2">
                당신의 분석, 가설, 지식 체계에
                <span className="font-semibold text-indigo-600"> 사고의 비약</span>이나
                <span className="font-semibold text-indigo-600"> 논리적 허점</span>은 없는지,
                혹은 데이터 간 <span className="font-semibold text-indigo-600">숨겨진 연결성</span>을 놓치고 있지는 않은가요?
              </p>
              <p className="mt-4">
                이러한 맹점들은 투자, 연구, 학습 효율에 치명적인 영향을 미칠 수 있습니다.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Animation */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
        >
            <FadingContextAnimation />
        </motion.div>
      </div>
    </section>
  );
} 
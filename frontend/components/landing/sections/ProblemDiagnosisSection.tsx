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
            배운 지식이 흩어져서 <span className="text-indigo-600">학습이 느리신가요?</span>
          </h2>
          <div className="mt-8 text-lg text-gray-600 space-y-8 max-w-3xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <p className="font-semibold text-gray-800">새로운 개념을 배울 때마다 기존 지식을 잊어버리고 있진 않나요?</p>
              <blockquote className="mt-2 pl-4 border-l-4 border-gray-300 italic text-gray-500">
                "이 개념은 어디에 연결되는 거지? 왜 배운 지식이 실제 문제 해결에 도움이 안 될까?"
              </blockquote>
              <p className="mt-4">
                이처럼 학습자들은 <span className="font-semibold text-indigo-600">지식의 연결 부재</span>로 인해 학습 효율성이 떨어집니다. 새로운 지식을 배울 때마다 기존 지식을 잊어버리고, 암기한 지식이 1주일 후면 70% 사라지는 현실입니다.
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
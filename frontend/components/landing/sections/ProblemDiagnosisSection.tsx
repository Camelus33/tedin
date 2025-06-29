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
            그 AI, 혹시 <span className="text-indigo-600">'단기 기억상실증'</span>에 걸렸나요?
          </h2>
          <div className="mt-8 text-lg text-gray-600 space-y-8 max-w-3xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <p className="font-semibold text-gray-800">어제 했던 설명, 오늘 또 하고 있진 않나요?</p>
              <blockquote className="mt-2 pl-4 border-l-4 border-gray-300 italic text-gray-500">
                "나는 OOO을 연구하는 학생이고, 이 논문의 핵심은 OOO이야. 이걸 바탕으로..."
              </blockquote>
              <p className="mt-4">
                이처럼 AI는 당신과의 중요한 대화조차 <span className="font-semibold text-indigo-600">기억하지 못하는 '단기 기억상실증'</span>을 겪고 있습니다. 당신의 시간과 에너지가 매번 같은 설명에 낭비됩니다.
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
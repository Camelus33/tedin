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
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-brand-primary tracking-tight">
            같은 AI, 남다른 답변<br />
            <span className="text-2xl text-gray-600">그 차이는 어디서 올까요?</span>
          </h2>
          <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            A학생은 ChatGPT에 30분간 설명하고 C+ 받습니다.<br />
            B학생은 클릭 한 번으로 A+ 받습니다.<br /><br />
            <strong className="font-semibold text-brand-primary">차이는 '시간'이 아니라 '방법'에 있습니다.</strong>
          </p>
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
'use client';

import React from 'react';
import { motion } from 'framer-motion';
// ViciousCycleGraphic을 임시로 제거합니다.
// import ViciousCycleGraphic from '@/components/landing/animations/ViciousCycleGraphic';

export default function ProblemDiagnosisSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 grid md:grid-cols-1 gap-12 items-center max-w-4xl">
        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-brand-primary tracking-tight">
            이런 경험, 혹시 있으신가요?
          </h2>
          <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            ChatGPT에게 지난 대화 내용을 다시 설명하고, 일일이 출처를 대조하는 시간이 더 길었던 경험. 
            <br /><br />
            정작 중요한 질문은 시작도 못 했는데, AI를 '가르치는' 시간에 더 많은 에너지를 쏟고 있진 않나요?
            <strong className="font-semibold text-gray-900">당신의 생각과 지식을 온전히 전달받은 AI</strong>와 함께라면, 
            <strong className="font-semibold text-cyan-600">'표상적'이 아닌 '고품질 답변'</strong>을 유도할 수 있습니다.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 
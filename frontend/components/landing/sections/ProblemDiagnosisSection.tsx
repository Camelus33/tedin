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
            책을 읽어도 <strong className="font-semibold text-gray-900">며칠 뒤면 기억이 흐릿해지고</strong>, 
            열심히 메모해도 <strong className="font-semibold text-gray-900">나중에 찾아보지 않게 되는</strong> 경험. 
            <br /><br />
            분명 좋은 내용이었는데 <strong className="font-semibold text-gray-900">내 것이 된 느낌이 들지 않는</strong> 아쉬움. 
            이제 그 아쉬움을 <strong className="font-semibold text-cyan-600">깊은 만족감</strong>으로 바꿔보세요.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 
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
            깊은 바다에 다이브하고 싶은데,<br />
            수면에서만 맴돌고 있지 않나요?
          </h2>
          <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            많이 읽어도 얕게 흐르고, 열심히 공부해도 <strong className="font-semibold text-gray-900">깊이가 느껴지지 않는</strong> 경험. 
            이는 잘못이 아닙니다. 단지 <strong className="font-semibold text-gray-900">올바른 잠수법</strong>을 
            아직 발견하지 못했을 뿐입니다.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 
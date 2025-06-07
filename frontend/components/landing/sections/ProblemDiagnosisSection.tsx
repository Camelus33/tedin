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
            우리는 한 번에 하나에만<br />
            집중할 수 있습니다.
          </h2>
          <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            너무 많은 정보가 한꺼번에 밀려오면, 일부를 흘려보냅니다. 
            이는 잘못이 아닌, <strong className="font-semibold text-gray-900">자연스러운 반응</strong>입니다. 
            하지만 이런 경험이 반복되면, 들인 노력이 쌓이지 않아 
            <strong className="font-semibold text-gray-900">멍해지는 기분</strong>이 들 수 있습니다.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 
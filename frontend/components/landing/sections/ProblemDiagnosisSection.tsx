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
            우리의 뇌는 한 번에 하나의 강에만<br />
            집중할 수 있습니다.
          </h2>
          <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            너무 많은 정보가 한꺼번에 밀려오면, 뇌는 가장 중요한 것을 지키기 위해 일부를 흘려보냅니다. 
            이는 잘못이 아닌, <strong className="font-semibold text-gray-900">자연스러운 보호 반응</strong>입니다. 
            하지만 이 과정이 반복되면, 애써 들인 노력이 온전히 쌓이지 않아 
            <strong className="font-semibold text-gray-900">지치고 길을 잃은 듯한 기분</strong>이 들 수 있습니다.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 
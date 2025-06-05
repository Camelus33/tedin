'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ProblemDiagnosisSection() {
  return (
    <section id="problem-diagnosis" className="py-20 lg:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            그것은 <br />
            바로 눈에 보이지 않는<span className="text-red-600"> 속도</span>때문입니다.
          </h2>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            정보 처리 <strong className="text-gray-800">속도</strong>가 느려지면, 
            점점 할 일이 쌓이고,
          </p>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            마치 물을 <strong className="text-gray-800">작은 컵에 부으면 </strong> 넘치듯, 
            제때 처리 못한 <strong className="text-red-600">할 일</strong>이 계속 불어납니다.
            알 수 없는<strong className="text-red-600"> 불안감</strong>이 엄습하고
            급기야 <strong className="text-red-600">번아웃</strong>에 빠집니다. 당신은 어떠신가요?
          </p>
        </motion.div>
      </div>
    </section>
  );
} 
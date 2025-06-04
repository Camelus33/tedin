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
            바로<span className="text-red-600"> 악순환</span>때문입니다.
          </h2>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            받아 들이는 <strong className="text-gray-800">속도</strong>가 줄어들면, 
            '악순환'이 시작됩니다.
          </p>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            마치 물을 <strong className="text-gray-800">작은 컵에 부으면 </strong> 넘치듯, 
            정보를 제때 처리 못하면 <strong className="text-red-600">건망증</strong>를 유발하게 되죠
            점점<strong className="text-red-600"> 불안감</strong>에 휩싸이고, 
            급기야 <strong className="text-red-600">자포자기</strong>하게 만듭니다. 당신은 어떠신가요?
          </p>
        </motion.div>
      </div>
    </section>
  );
} 
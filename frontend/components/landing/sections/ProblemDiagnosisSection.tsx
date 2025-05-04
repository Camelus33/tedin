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
            노력이 부족해서 일까요? 아닙니다! 이유는 <br />
            당신을 둘러 싸고 있는<span className="text-red-600"> 악순환 루프</span>때문입니다.
          </h2>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            정보를 처리하는 모든 과정에는 '피드백 루프'가 작동합니다. 
            받아 들이는 <strong className="text-gray-800">속도가 느려지고 기억용량</strong>마저 줄어들면, 
            '악순환'에 빠지게 됩니다.
          </p>
          <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            마치 <strong className="text-gray-800">작은 컵에 물을 부으면 </strong> 넘쳐 흐르듯, 
            계속 들어오는 정보를 제때 처리하지 못해 <strong className="text-red-600">잦은 실수</strong>를 반복하게 됩니다.
            점점<strong className="text-red-600"> 불안감과 번아웃</strong>에 휩싸이고, 
            급기야 시도마저 주저하게 만들어 <strong className="text-red-600">자포자기</strong>하게 만듭니다. 혹시 당신은 어떠신가요?
          </p>
        </motion.div>
      </div>
    </section>
  );
} 
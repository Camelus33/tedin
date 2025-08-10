'use client';

import React from 'react';
import { motion } from 'framer-motion';
import InteractiveCanvas from '@/components/animations/InteractiveCanvas';
import AppLogo from '@/components/common/AppLogo';

const IntroSection = () => {
  const headlineParts = ["Thought Pattern Mapping.", "One Capsule."];
  
  const sentence = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.8,
        staggerChildren: 0.04,
      },
    },
  };

  const letter = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center bg-transparent text-white p-8 overflow-hidden">
      <InteractiveCanvas />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0, 0.71, 0.2, 1.01] }}
        className="mb-6"
      >
        <AppLogo className="w-20 h-20 text-white" />
      </motion.div>

      <motion.h1
        className="text-4xl md:text-5xl font-bold mb-6 max-w-4xl"
        variants={sentence}
        initial="hidden"
        animate="visible"
      >
        {headlineParts.map((part, index) => (
          <span className="block" key={index}>
            {part.split("").map((char, charIndex) => (
              <motion.span key={char + "-" + charIndex} variants={letter}>
                {char}
              </motion.span>
            ))}
          </span>
        ))}
      </motion.h1>

      <motion.p 
        className="text-lg md:text-xl text-gray-200 max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2.2 }}
      >
        단 한 번의 클릭으로 당신의 학업, 업무, 연구 맥락을 
        <br />
        하나의 캡슐로 압축하세요.
      </motion.p>
    </section>
  );
};

export default IntroSection; 
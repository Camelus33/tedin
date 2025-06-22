'use client';
import React from 'react';
import { motion } from 'framer-motion';

const IntroSection = () => {
  return (
    <section 
      id="intro" 
      className="relative h-screen min-h-[700px] flex items-center justify-center text-white overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-slate-950" />
        <motion.div
          animate={{
            transform: [
              'translateX(-15%) translateY(-10%) rotate(-5deg)',
              'translateX(15%) translateY(10%) rotate(5deg)',
              'translateX(-15%) translateY(-10%) rotate(-5deg)',
            ],
          }}
          transition={{
            duration: 30,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'mirror',
          }}
          className="absolute w-[800px] h-[800px] bg-gradient-to-tr from-indigo-900 via-purple-900 to-slate-900 rounded-full opacity-30 blur-3xl"
        />
        <motion.div
          animate={{
            transform: [
              'translateX(15%) translateY(20%) rotate(10deg)',
              'translateX(-15%) translateY(-20%) rotate(-10deg)',
              'translateX(15%) translateY(20%) rotate(10deg)',
            ],
          }}
          transition={{
            duration: 35,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'mirror',
            delay: 5,
          }}
          className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-bl from-cyan-900 to-transparent rounded-full opacity-20 blur-3xl"
        />
      </div>
      
      <div className="relative z-10 text-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute top-[-25vh] left-0 right-0 mx-auto"
        >
          <p className="text-sm font-semibold tracking-wider text-gray-400">
            Habitus33 - Read Short, Deep Dive
          </p>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, type: 'spring' }}
          className="text-6xl md:text-8xl font-black uppercase"
          style={{ textShadow: '0 4px 15px rgba(0,0,0,0.4)' }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            AI로 쓴 글
          </span>
          <br />
          <span className="text-gray-200">과연 읽는 이가 모를까요?</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-6 text-lg md:text-xl text-gray-300 font-medium"
        >
          이제 남들과 똑같은 AI 보고서, 논문은 그만!
        </motion.p>
      </div>
    </section>
  );
};

export default IntroSection; 
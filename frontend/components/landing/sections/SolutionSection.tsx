'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AMFAProcessGraphic from '../animations/AMFAProcessGraphic'; // Import the new AMFA graphic component

export default function SolutionSection() {
  return (
    // Use a dark background for AMFA section to match cyber minimalism
    <section id="solution-section" className="py-20 lg:py-28 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered layout for AMFA presentation */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                read short,
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                deep dive
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              <span className="text-cyan-400 font-semibold">3분의 작은 시작</span>이 만들어내는
              <span className="text-purple-400 font-semibold"> 깊은 학습의 파도</span>.
              <br className="hidden sm:block" />
              지혜로운 물개처럼, AMFA와 함께 지식의 바다를 맘껏 유영하세요.
            </p>
          </motion.div>
        </div>

        {/* AMFA Process Graphic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="w-full flex justify-center items-center"
        >
          <AMFAProcessGraphic />
        </motion.div>

        {/* Bottom description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeInOut", delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="max-w-4xl mx-auto">
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
              <strong className="font-semibold text-gray-100">read short, deep dive</strong><br />
              3분 읽고 1줄 메모라는 작은 시작이 지식의 여정을 열어줍니다.
              <br /><br />
              이 메모는 진화하고 융합되어 단권화 노트로 성장하고, 마침내 당신만의 AI-Link라는 지식 캡슐로 응축됩니다. 프롬프트 없이도 AI와 깊이 소통할 수 있는 열쇠가 완성되는 순간입니다.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">지식의 시작점</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  3분 읽고 1줄 메모, 이 작은 실천이 메모 진화의 첫 단계입니다. 당신의 생각이 구조화되기 시작합니다.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">지식의 융합</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  개별 메모가 서로 연결되고 융합되어 단권화 노트로 발전합니다. 이 과정에서 당신의 지식은 깊이와 넓이를 동시에 얻습니다.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 
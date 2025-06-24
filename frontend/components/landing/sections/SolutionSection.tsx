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
                평범한 메모가
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                천재의 통찰로
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              당신이 대충 끄적인 한 줄이 어떻게 세상을 감탄시키는가?
              <br className="hidden sm:block" />
              <strong className="font-semibold text-purple-300">도메인 컨텍스트 캡슐, AI-Link가 그 마법을 보여드립니다.</strong>
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
              <strong className="font-semibold text-gray-100">어떻게 평범한 메모가 천재의 통찰이 될까요?</strong><br />
              비밀은 당신의 모든 생각이 하나의 고맥락 지식으로 도출되는 순간에 있습니다.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">당신의 메모들이</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  서로 연결되고, 다른 지식과 융합되어, 남다른 통찰로 이끕니다.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">결과는 놀라움</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  당신의 새로운 관점이 모든 사람을 감탄시킵니다
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 
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
                당신의 메모,
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                AI-Link로 진화합니다.
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              생각은 메모가 되고, 메모는 연결되어 단권화 됩니다.
              <br className="hidden sm:block" />
              이 단권화를 다시 모아 지식캡슐, <strong className="font-semibold text-purple-300">AI-Link</strong>로 만듭니다.
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
              <strong className="font-semibold text-gray-100">‘AI-Link’는 살아있는 지식입니다.</strong><br />
              당신이 학습할수록 함께 성장하고 진화하며, 프롬프트 없이도 당신의 의도를 먼저 파악하는 강력한 지능으로 거듭납니다.
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">메모 (The Seed)</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  모든 위대한 진화는 하나의 작은 씨앗에서 시작됩니다. 당신의 메모가 바로 그 씨앗입니다.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">AI-Link (The Organism)</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  씨앗(메모)들이 모여 서로 연결되고 융합하며, 당신의 생각을 대변하는 고유한 지적 생명체로 태어납니다.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 
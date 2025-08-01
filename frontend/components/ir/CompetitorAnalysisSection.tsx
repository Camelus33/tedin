'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Hand, Zap } from 'lucide-react';
import AppLogo from '@/components/common/AppLogo';

const competitorGroups = [
  {
    icon: <FileText className="w-8 h-8 text-slate-400" />,
    name: 'The Passive Way: 수동적 학습 도구',
    examples: 'Anki, Quizlet',
    approach: '단순 반복만 가능. 새로운 학습 내용을 자동으로 포착하지 못함.',
    limitation: '학습자가 직접 카드 관리. 맥락 없이 단편적 기억만 형성.',
  },
  {
    icon: <Hand className="w-8 h-8 text-blue-400" />,
    name: 'The Manual Way: 수동 학습 관리',
    examples: 'Notion, Obsidian',
    approach: '모든 것을 직접 정리해야 함. 높은 학습 관리 능력 요구.',
    limitation: '복잡한 시스템에 지쳐 포기. 99%는 결국 실패.',
  },
  {
    icon: <Zap className="w-8 h-8 text-purple-400" />,
    name: 'The Isolated Way: 맥락 없는 AI 학습',
    examples: 'ChatGPT, Gemini',
    approach: '매번 독립적인 질문. 학습 이력과 맥락을 기억하지 못함.',
    limitation: '개인 학습 진화 과정 활용 불가. 시간진화형 지식캡슐 없음.',
  },
];

const positioningData = {
    axisLabels: {
        x: ['Manual', 'Automatic'],
        y: ['Isolated', 'Contextual'],
    },
    competitors: [
        { name: 'Anki, Quizlet', x: 20, y: 75, color: 'text-slate-300' },
        { name: 'Notion, Obsidian', x: 25, y: 25, color: 'text-blue-300' },
        { name: 'ChatGPT, Gemini', x: 80, y: 75, color: 'text-purple-300' },
    ],
    habitus: {
        x: 80,
        y: 15,
    },
};

const CompetitorAnalysisSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <section id="competitor-analysis" className="py-20 md:py-32 bg-slate-950 text-white relative">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight">
            Why We Win: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">A New Learning Paradigm</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-4xl mx-auto leading-relaxed">
            기존 도구들은 '단순 반복'의 한계에 갇혀 있습니다. 우리는 '학습 가속'이라는 새로운 패러다임을 창조합니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Positioning Map */}
          <motion.div
            className="w-full flex justify-center items-center"
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="relative w-full max-w-lg aspect-square bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 overflow-hidden">
              {/* Axes and Labels */}
              <div className="absolute top-1/2 left-4 right-4 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent" />
              
              <p className="absolute bottom-1 left-1/4 -translate-x-1/2 whitespace-nowrap text-sm font-medium text-gray-500">{positioningData.axisLabels.x[0]}</p>
              <p className="absolute bottom-1 right-1/4 translate-x-1/2 whitespace-nowrap text-sm font-medium text-gray-500">{positioningData.axisLabels.x[1]}</p>
              <p className="absolute top-1/4 -translate-y-1/2 left-1 text-sm font-medium text-gray-500 transform -rotate-90 whitespace-nowrap">{positioningData.axisLabels.y[1]}</p>
              <p className="absolute bottom-1/4 translate-y-1/2 left-1 text-sm font-medium text-gray-500 transform -rotate-90 whitespace-nowrap">{positioningData.axisLabels.y[0]}</p>

              {/* Central Glow */}
              <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />

              {/* Competitor Points */}
              {positioningData.competitors.map(c => (
                <motion.div
                  key={c.name}
                  className="absolute p-2 rounded-lg"
                  style={{ top: `${c.y}%`, left: `${c.x}%`, transform: 'translate(-50%, -50%)' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
                >
                  <p className={`text-sm font-semibold ${c.color}`}>{c.name}</p>
                </motion.div>
              ))}

              {/* Habitus33 Point */}
              <motion.div
                className="absolute"
                style={{ top: `${positioningData.habitus.y}%`, left: `${positioningData.habitus.x}%`, transform: 'translate(-50%, -50%)' }}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8, type: 'spring' }}
              >
                <div className="group relative">
                  <div className="p-3 bg-cyan-600/20 rounded-full flex flex-col items-center shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-500/50">
                    <AppLogo className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-sm text-cyan-400 mt-1">Habitus33</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Competitor Groups */}
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {competitorGroups.map((group) => (
              <motion.div
                key={group.name}
                className="bg-gray-800/40 backdrop-blur-sm p-5 rounded-xl border border-gray-700/50 hover:border-cyan-400/30 transition-colors"
                variants={itemVariants}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4 mt-1">{group.icon}</div>
                  <div>
                    <h4 className="font-bold text-lg text-white">{group.name} <span className="text-sm font-normal text-gray-400">({group.examples})</span></h4>
                    <p className="text-sm text-gray-300 mt-2"><span className="font-semibold text-gray-100">Approach:</span> {group.approach}</p>
                    <p className="text-sm mt-2 text-red-400/80">
                      <span className="font-semibold text-red-300">Fundamental Limitation:</span> {group.limitation}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CompetitorAnalysisSection; 
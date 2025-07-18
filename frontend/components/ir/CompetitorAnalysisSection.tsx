'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Hand, Zap } from 'lucide-react';
import AppLogo from '@/components/common/AppLogo';

const competitorGroups = [
  {
    icon: <FileText className="w-8 h-8 text-slate-400" />,
    name: 'The Fragmented Way: 투자 메모의 산재',
    examples: 'Excel, Notion, 메모장',
    approach: '투자 메모를 개별적으로 저장하지만, 투자 패턴과 편향을 연결 분석할 수 없습니다.',
    limitation: '반복되는 투자 실수를 인식하지 못하고, 개별 메모로는 전체 투자 철학을 파악할 수 없습니다.',
  },
  {
    icon: <Hand className="w-8 h-8 text-blue-400" />,
    name: 'The Manual Way: 전문 투자자의 도구',
    examples: 'Bloomberg Terminal, 전문 분석 도구',
    approach: '고가의 전문 도구로 시장 데이터는 분석하지만, 개인 투자 패턴과 편향은 분석하지 못합니다.',
    limitation: '일반 투자자에게는 접근이 어렵고, 개인 투자 철학의 일관성을 검증할 수 없습니다.',
  },
  {
    icon: <Zap className="w-8 h-8 text-purple-400" />,
    name: 'The Generic Way: 범용 AI의 한계',
    examples: 'ChatGPT, Gemini, Claude',
    approach: '투자 관련 질문에 답변하지만, 사용자의 투자 맥락과 철학을 이해하지 못합니다.',
    limitation: '개인 투자 패턴을 학습하지 못하고, 매번 새로운 대화로 시작해야 하는 한계가 있습니다.',
  },
];

const positioningData = {
    axisLabels: {
        x: ['Manual Analysis', 'AI-Powered Analysis'],
        y: ['Generic Tools', 'Personalized Investment AI'],
    },
    competitors: [
        { name: 'Excel, Notion', x: 20, y: 75, color: 'text-slate-300' },
        { name: 'Bloomberg Terminal', x: 25, y: 25, color: 'text-blue-300' },
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
            Why We Win: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Personalized Investment AI</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-4xl mx-auto leading-relaxed">
            기존 도구들은 '시장 분석'이나 '메모 저장'에만 집중합니다. 우리는 '개인 투자 패턴 학습'과 '편향 진단'이라는 새로운 영역을 개척하며, 투자자의 개인적 성장을 돕는 AI를 제공합니다.
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
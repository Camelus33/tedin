'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Hand, Zap } from 'lucide-react';
import AppLogo from '@/components/common/AppLogo';

const competitorGroups = [
  {
    icon: <FileText className="w-8 h-8 text-slate-400" />,
    name: '일반 노트앱',
    examples: 'Notion, Obsidian, Evernote',
    approach: '기록·정리 중심. 저장 시 자동 유사 비교 없음.',
    limitation: '수동 검색/링크 의존. 과거 맥락 결합 약함.',
    delta: 'Habitus33는 저장 이벤트에 즉시 유사 사례 3개 제시·점프/체크리스트 연계.',
  },
  {
    icon: <Hand className="w-8 h-8 text-blue-400" />,
    name: 'AI 보조 노트',
    examples: 'Notion AI, Mem',
    approach: '요약/생성·보조. 대화형.',
    limitation: '개인 기록과의 실시간 자동 대조 제한.',
    delta: '생성·요약이 아닌 “저장 즉시 유사 비교” + 시간패턴 반영·교정 액션으로 연결.',
  },
  {
    icon: <Zap className="w-8 h-8 text-purple-400" />,
    name: '지식그래프 노트',
    examples: 'Roam, Logseq',
    approach: '링크·그래프 중심. 수동 연결.',
    limitation: '초기·유지 비용 큼. 자동 유사 비교 부재.',
    delta: '임베딩+문자열 혼합 유사도와 진화필드·링크 이유까지 포함해 자동 대조.',
  },
];

const positioningData = {
    axisLabels: {
        x: ['수동', '자동'],
        y: ['단절', '맥락'],
    },
    competitors: [
        { name: 'Notion, Obsidian, Evernote', x: 28, y: 55, color: 'text-slate-300' },
        { name: 'Notion AI, Mem', x: 60, y: 50, color: 'text-blue-300' },
        { name: 'Roam, Logseq', x: 35, y: 30, color: 'text-purple-300' },
    ],
    habitus: {
        x: 75,
        y: 12,
    },
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const pointStyle = (x: number, y: number) => ({
  top: `${clamp(y, 8, 92)}%`,
  left: `${clamp(x, 8, 92)}%`,
  transform: 'translate(-50%, -50%)',
});

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
            차별점
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-4xl mx-auto leading-relaxed">
            우리는 저장 즉시 유사 사례를 자동 제시하고, 교정 행동으로 연결합니다.
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
            <div className="relative w-full max-w-xl md:max-w-2xl xl:max-w-3xl aspect-square bg-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 overflow-hidden">
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
                  style={pointStyle(c.x, c.y)}
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
                style={pointStyle(positioningData.habitus.x, positioningData.habitus.y)}
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
                    <p className="text-sm mt-2 text-cyan-300/90">
                      <span className="font-semibold text-cyan-300">Diff vs Habitus33:</span> {group.delta}
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
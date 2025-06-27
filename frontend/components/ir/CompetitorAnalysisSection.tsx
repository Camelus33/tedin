'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Database, BrainCircuit } from 'lucide-react';
import AppLogo from '@/components/common/AppLogo';

const competitorGroups = [
  {
    icon: <Layers className="w-8 h-8 text-purple-400" />,
    name: '거대 언어 모델 (LLM)',
    examples: 'ChatGPT, Gemini',
    approach: '세상의 모든 것을 아는 ‘척척박사’지만, ‘당신’을 채팅기록과 동일시합니다.',
    limitation: '채팅이 끝날 때마다 리셋됩니다. 아니면 채팅 기록을 다 넘겨줘야 합니다.',
  },
  {
    icon: <Database className="w-8 h-8 text-slate-400" />,
    name: '전통적 노트/생산성 앱',
    examples: 'Notion, Evernote',
    approach: '깔끔하게 정리된 ‘서랍’이지만, 서로 어떻게 연결되는지는 모릅니다.',
    limitation: '각자 따로 놀기 때문에, AI가 큰 그림을 보고 답변하기 힘듭니다.',
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-blue-400" />,
    name: 'AI 기반 노트/기록 앱',
    examples: 'Mem.ai, Rewind.ai',
    approach: '“무엇을” 했는지는 알지만, “왜” 했는지는 모릅니다.',
    limitation: '단편적인 사실들을 찾아줄 뿐, 당신만의 인사이트을 만들어주지는 못합니다.',
  },
];

const positioningData = {
    axisLabels: {
        x: ['단순 색인', '온톨로지'],
        y: ['기록 보관', '맥락 이해'],
    },
    competitors: [
        { name: 'Notion, Evernote', x: 20, y: 75, color: 'text-slate-300' },
        { name: 'ChatGPT, Gemini', x: 35, y: 65, color: 'text-purple-300' },
        { name: 'Mem.ai, Rewind.ai', x: 25, y: 40, color: 'text-blue-300' },
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
    <section id="competitor-analysis" className="py-20 md:py-32 bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-cyan-400/50"
            initial={{ 
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
              scale: 0,
            }}
            animate={{ scale: [0, Math.random() * 0.5 + 0.1, 0] }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight">
            경쟁 전략: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">온톨로지 적용</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-4xl mx-auto leading-relaxed">
            다른 서비스들이 원하는 '정보'를 생성할 때, 우리는 당신의 이력을 AI에 주입합니다.
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
              
              <p className="absolute bottom-1 left-1/4 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-gray-500">{positioningData.axisLabels.x[0]}</p>
              <p className="absolute bottom-1 right-1/4 translate-x-1/2 whitespace-nowrap text-xs font-medium text-gray-500">{positioningData.axisLabels.x[1]}</p>
              <p className="absolute top-1/4 -translate-y-1/2 left-1 text-xs font-medium text-gray-500 transform -rotate-90 whitespace-nowrap">{positioningData.axisLabels.y[1]}</p>
              <p className="absolute bottom-1/4 translate-y-1/2 left-1 text-xs font-medium text-gray-500 transform -rotate-90 whitespace-nowrap">{positioningData.axisLabels.y[0]}</p>

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
                  <p className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 text-center text-xs bg-slate-800 text-gray-300 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl">
                    이력반영
                  </p>
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
                    <p className="text-sm text-gray-300 mt-2"><span className="font-semibold text-gray-100">핵심 전략:</span> {group.approach}</p>
                    <p className={`text-sm mt-2 ${
                      group.name.includes('LLM') ? 'text-purple-400/80' : 
                      group.name.includes('전통적') ? 'text-slate-400/80' : 'text-blue-400/80'
                    }`}>
                      <span className={`font-semibold ${
                        group.name.includes('LLM') ? 'text-purple-300' : 
                        group.name.includes('전통적') ? 'text-slate-300' : 'text-blue-300'
                      }`}>본질적 한계:</span> {group.limitation}
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
'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Network, Globe, CheckCircle } from 'lucide-react';

const strategiesData = {
  beachhead: {
    id: 'beachhead',
    icon: <Target className="w-7 h-7" />,
    phase: "Phase 1: 개인 투자자 시장 진입",
    logic: "반복되는 투자 실수와 편향 인식의 어려움을 겪는 개인 투자자들을 집중 공략합니다. 78%의 투자자가 동일한 실수를 반복하고 85%가 자신의 편향을 인식하지 못하는 시장에서, '온톨로지 AI 기반 투자 패턴 분석'이라는 압도적인 가치를 제공하여 초기 사용자 기반을 확보합니다.",
    tactics: [
      "투자 커뮤니티(주식 갤러리, 투자 포럼) 대상 타겟 마케팅",
      "투자 유튜버 및 인플루언서와의 전략적 파트너십",
      "초기 사용자를 위한 '투자 패턴 분석가' 인증 프로그램",
    ],
    color: "text-sky-400",
    ringColor: "ring-sky-400/50",
    shadowColor: "shadow-sky-500/50",
  },
  networkEffects: {
    id: 'networkEffects',
    icon: <Network className="w-7 h-7" />,
    phase: "Phase 2: 투자 지식 생태계 구축",
    logic: "초기 사용자들이 구축한 고품질 '투자 온톨로지'를 공유하고 학습하게 합니다. 신규 투자자는 전문가의 투자 철학과 패턴을 즉시 활용하여 학습 곡선을 단축시키고, 이는 다시 새로운 투자 지식의 생성으로 이어지는 강력한 선순환을 만듭니다.",
    tactics: [
      "투자 온톨로지 마켓플레이스: 검증된 투자 지식을 거래하는 생태계",
      "투자 지식 크리에이터 보상: 기여도에 따른 수익 공유 및 인센티브",
      "투자 패턴 포크(Fork): 다른 투자자의 성공 패턴을 학습하고 발전시키는 기능",
    ],
    color: "text-lime-400",
    ringColor: "ring-lime-400/50",
    shadowColor: "shadow-lime-500/50",
  },
  marketDomination: {
    id: 'marketDomination',
    icon: <Globe className="w-7 h-7" />,
    phase: "Phase 3: 기관 투자자 시장 진입",
    logic: "개인 투자자를 넘어 기관 투자자와 펀드 매니저의 '집단 투자 지성'을 관리하는 핵심 인프라로 확장합니다. 궁극적으로 모든 투자 AI 에이전트가 Habitus33의 투자 온톨로지에 연결되어 작동하는, 투자 시대의 필수불가결한 '개인/기관 맞춤형 투자 컨텍스트 레이어'가 되는 것을 목표로 합니다.",
    tactics: [
      "기관 투자자 전용 플랜: 펀드와 기관을 위한 고급 분석 및 보안 기능",
      "기관 투자 온톨로지: 기관의 투자 철학과 전략을 시각화하고 공유",
      "투자 AI API: 써드파티 투자 서비스가 우리 온톨로지 위에 구축되도록 허용"
    ],
    color: "text-indigo-400",
    ringColor: "ring-indigo-400",
    shadowColor: "shadow-indigo-500/50",
  },
} as const;

type StrategyKey = keyof typeof strategiesData;

const GrowthStrategySection = () => {
  const [selected, setSelected] = useState<StrategyKey>('beachhead');

  const selectedStrategy = strategiesData[selected];

  const flywheelVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.2 } },
  };
  
  const contentVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  const FlywheelNode = ({ id, icon, color, ringColor, shadowColor }: { id: StrategyKey; icon: React.ReactNode; color: string; ringColor: string; shadowColor: string; }) => (
    <motion.div
      className={`absolute cursor-pointer flex items-center justify-center w-24 h-24 rounded-full bg-slate-800/80 backdrop-blur-sm border border-gray-700 hover:border-white/50 transition-all duration-300 shadow-md`}
      onClick={() => setSelected(id)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
       <div className={`absolute inset-0 rounded-full transition-all duration-300 ${selected === id ? `ring-2 ${ringColor} shadow-xl ${shadowColor}` : ''}`} />
      <div className={`${selected === id ? color : "text-gray-400"} transition-colors duration-300`}>{icon}</div>
    </motion.div>
  );

  return (
    <section id="growth-strategy" className="py-20 md:py-32 bg-slate-950 text-white overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight">
            Growth Strategy: <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">The Investment Ontology Flywheel</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            단순히 사용자를 늘리는 것이 아니라, 온톨로지 AI를 중심으로 투자 지식 생태계의 가치를 기하급수적으로 성장시키는 플라이휠을 만듭니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            variants={flywheelVariants} 
            initial="initial" 
            whileInView="animate" 
            viewport={{ once: true }} 
            className="relative w-full h-96 flex justify-center items-center"
          >
            <motion.div
              className="relative w-full h-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 50, ease: 'linear', repeat: Infinity }}
            >
              <div className="absolute w-full h-full">
                <svg width="100%" height="100%" viewBox="0 0 350 350" className="opacity-50 absolute inset-0">
                  <defs>
                    <marker id="arrow-beachhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse" className="fill-current text-sky-400">
                      <path d="M 0 0 L 10 5 L 0 10 z" />
                    </marker>
                    <marker id="arrow-networkEffects" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse" className="fill-current text-lime-400">
                      <path d="M 0 0 L 10 5 L 0 10 z" />
                    </marker>
                    <marker id="arrow-marketDomination" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse" className="fill-current text-indigo-400">
                      <path d="M 0 0 L 10 5 L 0 10 z" />
                    </marker>
                  </defs>

                  {/* Path from Beachhead to Network Effects */}
                  <motion.path
                    d="M 175 51 A 124 124 0 0 1 282.4 237"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
                    markerEnd="url(#arrow-beachhead)"
                    className="stroke-sky-400"
                  />
                  {/* Path from Network Effects to Market Domination */}
                  <motion.path
                    d="M 282.4 237 A 124 124 0 0 1 67.6 237"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 1, ease: 'easeInOut' }}
                    markerEnd="url(#arrow-networkEffects)"
                    className="stroke-lime-400"
                  />
                  {/* Path from Market Domination to Beachhead */}
                  <motion.path
                    d="M 67.6 237 A 124 124 0 0 1 175 51"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 1.5, ease: 'easeInOut' }}
                    markerEnd="url(#arrow-marketDomination)"
                    className="stroke-indigo-400"
                  />
                </svg>
              </div>

              <div className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%) rotate(0deg) translateY(-8.5rem)' }}>
                <FlywheelNode {...strategiesData.beachhead} />
              </div>
              <div className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%) rotate(120deg) translateY(-8.5rem)' }}>
                <FlywheelNode {...strategiesData.networkEffects} />
              </div>
              <div className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%) rotate(240deg) translateY(-8.5rem)' }}>
                <FlywheelNode {...strategiesData.marketDomination} />
              </div>
            </motion.div>
          </motion.div>

          <div className="relative p-8 bg-slate-800/50 backdrop-blur-sm border border-gray-700/80 rounded-2xl min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className={`flex items-center mb-4 ${selectedStrategy.color}`}>
                  {selectedStrategy.icon}
                  <h3 className="text-2xl font-bold ml-4 text-gray-100">{selectedStrategy.phase}</h3>
                </div>
                <p className="text-gray-400 mb-6 leading-relaxed">{selectedStrategy.logic}</p>
                <ul className="space-y-3">
                  {selectedStrategy.tactics.map(tactic => (
                    <li key={tactic} className="flex items-center">
                      <CheckCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${selectedStrategy.color}`} />
                      <span className="text-gray-300">{tactic}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrowthStrategySection; 
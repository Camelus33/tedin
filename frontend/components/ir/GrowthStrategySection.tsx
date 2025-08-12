'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Network, Globe, CheckCircle } from 'lucide-react';

const strategiesData = {
  beachhead: {
    id: 'beachhead',
    icon: <Target className="w-7 h-7" />,
    phase: "1단계: 반복 실수 파일럿 검증",
    logic: "수험·투자·팀에서 '저장 즉시 유사 사례' 적용 → 재발률↓·A2A(Alert→Action)↑ 지표 공개.",
    tactics: [
      "파일럿 3개 분야 동시 진행(수험/투자/팀)",
      "핵심 KPI: 재발률·A2A·리워크율",
      "사례 리포트/데모 공개",
    ],
    color: "text-sky-400",
    ringColor: "ring-sky-400/50",
    shadowColor: "shadow-sky-500/50",
  },
  networkEffects: {
    id: 'networkEffects',
    icon: <Network className="w-7 h-7" />,
    phase: "2단계: 템플릿/지식캡슐 플라이휠",
    logic: "템플릿·체크리스트·지식캡슐(AI‑Link) 유통으로 재사용/추천 확대.",
    tactics: [
      "프리미엄 마켓플레이스 운영(품질 심사)",
      "크리에이터 수익 공유·리퍼럴",
      "원클릭 적용/점프 연동",
    ],
    color: "text-lime-400",
    ringColor: "ring-lime-400/50",
    shadowColor: "shadow-lime-500/50",
  },
  marketDomination: {
    id: 'marketDomination',
    icon: <Globe className="w-7 h-7" />,
    phase: "3단계: 조직 표준·온프레미스",
    logic: "조직 단위 재발률·리워크율 모니터링 표준화, 보안 산업은 온프레미스/프라이빗 AI.",
    tactics: [
      "조직 대시보드·경보·리뷰 루프",
      "온프레미스/프라이빗 LLM 옵션",
      "API·SSO·감사로그"
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
            성장 전략
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            반복 실수 파일럿 → 지식캡슐 플라이휠 → 조직 표준/온프레미스로 확장합니다.
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
      <div className="container mx-auto px-4 mt-6">
        <p className="text-center text-xs text-gray-500">
          참고: 
          <a href="https://www.microsoft.com/en-us/worklab/work-trend-index" target="_blank" rel="noreferrer" className="underline hover:text-gray-300">Microsoft Work Trend Index</a>
        </p>
      </div>
    </section>
  );
};

export default GrowthStrategySection; 
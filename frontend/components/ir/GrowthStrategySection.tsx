'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Network, CheckCircle } from 'lucide-react';

const strategiesData = {
  acquisition: {
    id: 'acquisition',
    icon: <Users className="w-7 h-7" />,
    phase: "Phase 1: Attract",
    logic: "타겟 고객(대학생, 직장인, 연구원)에게 '압도적인 첫 경험'을 제공하는 것입니다. 이들이 AI-Link™를 통해 즉시 가치를 느끼고, 성공 사례를 접하며, 자신의 목소리가 제품에 반영되는 것을 보게 함으로써, 단순 사용자가 아닌 충성도 높은 초기 팬덤을 구축합니다.",
    tactics: [
      "초기 프로모션: 대학생/직장인/연구원 대상 선착순 1년 무료 체험 제공",
      "성공사례 공유: 'AI-Link로 팀플 A+ 받은 후기' 등 성공사례 전송",
      "즉각적인 반영: 상시 피드백 채널 운영 및 '주간 개선 노트'를 통한 소통",
    ],
    color: "text-sky-400",
    ringColor: "ring-sky-400/50",
    shadowColor: "shadow-sky-500/50",
  },
  monetization: {
    id: 'monetization',
    icon: <TrendingUp className="w-7 h-7" />,
    phase: "Phase 2: Engage",
    logic: "사용자가 제품을 '쓰는 것'을 넘어, 자신의 '지식 자산'을 '쌓고 있다'고 느끼게 하는 것입니다. 미래의 수익 창출 기회(지식 마켓)에 대한 기대를 심어줌으로써, 서비스 사용을 장기적인 가치 투자로 전환시킵니다.",
    tactics: [
      "'도메인 축적' 리포트: KPI(메모, 노트, AI-Link)을 시각화하여 도메인 축적을 독려",
      "파워 유저 보상: 상위 기여자에게 '지식 마켓' 수수료 영구 인하 혜택 약속",
      "'지식 마켓' 런칭 : '누가 판매 1위 될 것인가?' 등 기대감을 높이는 사전 이벤트 진행",
    ],
    color: "text-lime-400",
    ringColor: "ring-lime-400/50",
    shadowColor: "shadow-lime-500/50",
  },
  expansion: {
    id: 'expansion',
    icon: <Network className="w-7 h-7" />,
    phase: "Phase 3: Delight",
    logic: "'지식캡슐 오픈마켓'을 완성하는 것입니다. 높은 수준의 '지식 자산'을 축적한 사용자들이 더 큰 혜택을 받고, 이들이 손쉽게 수익화하는 과정에서 생성된 양질의 콘텐츠가 다시 새로운 사용자를 끌어들이는 강력한 성장 엔진이 됩니다.",
    tactics: [
      "파워 유저 보상: 높은 수준의 도메인 자산을 축적한 사용자에게 더 많은 무료 혜택(크레딧) 제공",
      "다양한 수익 모델: '구독형 AI-Link', '컨퍼런스 캐최' 등 지식 자산의 수익화 기능 확장",
      "신규 유저 케어: 방문자가 첫 '지식 자산'을 만들도록 유도하는 프로모션 진행"
    ],
    color: "text-indigo-400",
    ringColor: "ring-indigo-400",
    shadowColor: "shadow-indigo-500/50",
  },
} as const;

type StrategyKey = keyof typeof strategiesData;

const GrowthStrategySection = () => {
  const [selected, setSelected] = useState<StrategyKey>('acquisition');

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
            Habitus33 성장 엔진: <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">지식공유 플라이휠</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            사용자의 도메인 자산축적이 또 다른 사용자의 성공으로 이어지는 '선순환 구조'를 구축하여, 시간이 지날수록 더욱 강력한 성장 모멘텀을 만들어냅니다.
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
                    <marker id="arrow-acquisition" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse" className="fill-current text-sky-400">
                      <path d="M 0 0 L 10 5 L 0 10 z" />
                    </marker>
                    <marker id="arrow-monetization" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse" className="fill-current text-lime-400">
                      <path d="M 0 0 L 10 5 L 0 10 z" />
                    </marker>
                    <marker id="arrow-expansion" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse" className="fill-current text-indigo-400">
                      <path d="M 0 0 L 10 5 L 0 10 z" />
                    </marker>
                  </defs>

                  {/* Path from Acquisition to Monetization */}
                  <motion.path
                    d="M 175 51 A 124 124 0 0 1 282.4 237"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
                    markerEnd="url(#arrow-acquisition)"
                    className="stroke-sky-400"
                  />
                  {/* Path from Monetization to Expansion */}
                  <motion.path
                    d="M 282.4 237 A 124 124 0 0 1 67.6 237"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 1, ease: 'easeInOut' }}
                    markerEnd="url(#arrow-monetization)"
                    className="stroke-lime-400"
                  />
                  {/* Path from Expansion to Acquisition */}
                  <motion.path
                    d="M 67.6 237 A 124 124 0 0 1 175 51"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 1.5, ease: 'easeInOut' }}
                    markerEnd="url(#arrow-expansion)"
                    className="stroke-indigo-400"
                  />
                </svg>
              </div>

              <div className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%) rotate(0deg) translateY(-8.5rem)' }}>
                <FlywheelNode {...strategiesData.acquisition} />
              </div>
              <div className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%) rotate(120deg) translateY(-8.5rem)' }}>
                <FlywheelNode {...strategiesData.monetization} />
              </div>
              <div className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%) rotate(240deg) translateY(-8.5rem)' }}>
                <FlywheelNode {...strategiesData.expansion} />
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
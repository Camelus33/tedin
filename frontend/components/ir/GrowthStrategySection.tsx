'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Network, CheckCircle } from 'lucide-react';

const strategiesData = {
  acquisition: {
    id: 'acquisition',
    icon: <Users className="w-7 h-7" />,
    phase: "Phase 1: 문제 해결 입증",
    logic: "47%의 AI 환각 문제를 겪는 타겟 고객(학습자, 직장인, 연구자)에게 AI-Link 기술의 즉각적인 가치를 경험하게 합니다. 첫 사용에서부터 기존 AI와의 명확한 차이를 느끼게 하여, 프롬프트 없는 AI 상호작용의 혁신성을 체감하게 만듭니다.",
    tactics: [
      "무료 체험 : '프롬프트 없는 AI 경험' 무료 체험 + 성공 보장 프로그램",
      "비교 체험 : 기존 AI vs AI-Link 결과 비교 데모를 통한 차별화 입증",
      "성공 확산 : 대학생 A+ 논문, 직장인 보고서 품질 향상 등 구체적 성과 공유",
    ],
    color: "text-sky-400",
    ringColor: "ring-sky-400/50",
    shadowColor: "shadow-sky-500/50",
  },
  monetization: {
    id: 'monetization',
    icon: <TrendingUp className="w-7 h-7" />,
    phase: "Phase 2: 지식 자산 축적",
    logic: "사용자가 단순히 도구를 사용하는 것이 아니라, 자신만의 '지식 DNA'를 구축하고 있다는 가치를 인식하게 합니다. 개인화된 AI 어시스턴트를 만들어가는 과정 자체가 투자이며, 시간이 지날수록 더 정확하고 유용해지는 경험을 제공합니다.",
    tactics: [
      "지식 DNA 뷰: 사용자의 도메인 지식 축적 과정을 그래프로 시각화",
      "프리미엄 전환: 고급 AI-Link 기능, 무제한 지식 저장, 우선 지원 등",
      "커뮤니티 구축: 도메인별 전문가 그룹 형성 및 지식 교환 플랫폼 제공",
    ],
    color: "text-lime-400",
    ringColor: "ring-lime-400/50",
    shadowColor: "shadow-lime-500/50",
  },
  expansion: {
    id: 'expansion',
    icon: <Network className="w-7 h-7" />,
    phase: "Phase 3: 생태계 확장",
    logic: "축적된 지식 자산을 바탕으로 B2B 시장 진출과 파트너십을 통한 확장을 추진합니다. 개인 사용자의 성공 사례가 기업 고객 유치의 근거가 되고, 기업 데이터가 다시 개인 사용자 경험을 향상시키는 선순환 구조를 완성합니다.",
    tactics: [
      "B2B 진출: 기업형 보안 솔루션, 팀베이스 도메인 컨텍스트 구축 서비스 제공",
      "파트너십 확대: 교육기관, 연구소와의 전략적 제휴를 통한 시장 확장",
      "API 생태계: 써드파티 개발자들이 활용할 수 있는 플랫폼 구축"
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
            성장 전략: <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">지식 생태계</span> 구축
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            AI-Link 기술을 중심으로 한 지식 생태계를 구축하여, 사용자가 많아질수록 더 강력해지는 네트워크 효과를 창출합니다.
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
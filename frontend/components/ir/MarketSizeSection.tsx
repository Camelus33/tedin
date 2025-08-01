'use client';

import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { TrendingUp, Target, BarChart2 } from 'lucide-react';

type MarketType = 'TAM' | 'SAM' | 'SOM';

interface MarketCardProps {
  type: MarketType;
  title: string;
  value: number;
  suffix: string;
  cagr: number;
  description: string;
  source: string;
  delay: number;
}

const GrowthChart = ({ type }: { type: MarketType }) => {
  const paths = {
    TAM: 'M 0 80 Q 50 70, 100 55',
    SAM: 'M 0 80 Q 50 40, 100 20',
    SOM: 'M 0 80 Q 50 50, 100 30',
  };

  const colors: Record<MarketType, string> = {
    TAM: 'stroke-blue-400',
    SAM: 'stroke-green-400',
    SOM: 'stroke-purple-400',
  };

  return (
    <svg
      viewBox="0 0 120 80"
      className="absolute bottom-24 left-0 w-full h-24"
      preserveAspectRatio="none"
    >
      <motion.path
        d={paths[type]}
        fill="none"
        className={colors[type]}
        strokeWidth="2.5"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.7 }}
      />
    </svg>
  );
};

const MarketCard: React.FC<MarketCardProps> = ({
  type,
  title,
  value,
  suffix,
  cagr,
  description,
  source,
  delay,
}) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay },
    },
  };

  const typeStyles: Record<
    MarketType,
    { bg: string; border: string; text: string; icon: JSX.Element }
  > = {
    TAM: {
      bg: 'bg-blue-900/30',
      border: 'border-blue-500/30',
      text: 'text-blue-300',
      icon: <TrendingUp className="w-7 h-7 text-gray-400" />,
    },
    SAM: {
      bg: 'bg-green-900/30',
      border: 'border-green-500/30',
      text: 'text-green-300',
      icon: <Target className="w-7 h-7 text-gray-400" />,
    },
    SOM: {
      bg: 'bg-purple-900/30',
      border: 'border-purple-500/30',
      text: 'text-purple-300',
      icon: <BarChart2 className="w-7 h-7 text-gray-400" />,
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`${typeStyles[type].bg} rounded-xl border ${typeStyles[type].border} p-6 flex flex-col h-full shadow-lg hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden min-h-[380px]`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <span
            className="text-sm font-semibold uppercase tracking-wider text-gray-400"
          >
            {type}
          </span>
          <h3 className="text-2xl font-bold text-gray-100">{title}</h3>
        </div>
        {typeStyles[type].icon}
      </div>

      <div className="relative mt-12 mb-6 h-16">
        <GrowthChart type={type} />
        <div className="absolute inset-0 flex items-center justify-start">
          <span className="text-6xl font-bold text-white">
            <CountUp start={0} end={value} duration={2.5} separator="," />
          </span>
          <span className="text-4xl font-bold text-white ml-2 pt-2">{suffix}</span>
        </div>
      </div>
      
      <div className="mt-auto">
        <div className={`font-semibold ${typeStyles[type].text} mb-4`}>
          연평균 성장률 (CAGR):{' '}
          <CountUp start={0} end={cagr} duration={2.5} decimals={1} />%
        </div>
        <p className="text-gray-400 text-sm mb-4 flex-grow">
          {description}
        </p>
        <p className="text-xs text-gray-500 mt-4 italic">출처: {source}</p>
      </div>
    </motion.div>
  );
};

const MarketSizeSection = () => {
  const markets: MarketCardProps[] = [
    {
      type: 'TAM',
      title: 'Total Addressable Market',
      value: 400,
      suffix: '억 달러',
      cagr: 9.5,
      description:
        "전 세계 e-learning 시장의 총 규모입니다. 기술 변화와 평생학습 필요성 증가로 지속적으로 확대되고 있습니다.",
      source: 'Grand View Research (2024)',
      delay: 0.2,
    },
    {
      type: 'SAM',
      title: 'Serviceable Addressable Market',
      value: 80,
      suffix: '억 달러',
      cagr: 25.0,
      description:
        "학습 효율성 개선 솔루션을 적극적으로 도입할 의향이 있는 성인 학습자들이 형성하는 유효 시장입니다.",
      source: 'Market Research Future (2024)',
      delay: 0.4,
    },
    {
      type: 'SOM',
      title: 'Serviceable Obtainable Market',
      value: 8,
      suffix: '억 달러',
      cagr: 30.0,
      description:
        "AI 기반 지식캡슐 학습 시간 단축 솔루션으로 해결할 수 있는 시장입니다. Habitus33의 AI-Link 기술이 제공하는 독특한 가치로 초기에 장악할 수 있는 핵심 시장입니다.",
      source: 'Technavio (2024)',
      delay: 0.6,
    },
  ];

  return (
    <section id="market-size" className="py-20 md:py-32 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">$800M Market</span> We Can Win
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            우리는 거대 시장의 일부를 점유하는 것이 아닌, 가장 빠르게 성장하는 핵심 시장(SOM)을 정의하고 장악하는 전략을 추구합니다.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {markets.map((market) => (
            <MarketCard key={market.type} {...market} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MarketSizeSection; 
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
        {value > 0 ? (
          <div className="absolute inset-0 flex items-center justify-start">
            <span className="text-6xl font-bold text-white">
              <CountUp start={0} end={value} duration={2.5} separator="," />
            </span>
            <span className="text-4xl font-bold text-white ml-2 pt-2">{suffix}</span>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${typeStyles[type].text} bg-white/10 border ${typeStyles[type].border}`}>
              측정 진행 중
            </span>
          </div>
        )}
      </div>
        
      <div className="mt-auto">
        <div className={`font-semibold ${typeStyles[type].text} mb-4`}>
          연평균 성장률 (CAGR): {cagr > 0 ? (<><CountUp start={0} end={cagr} duration={2.5} decimals={1} />%</>) : '측정 진행 중'}
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
      title: '글로벌 생산성 도구 시장',
      value: 2000,
      suffix: '억 달러',
      cagr: 10.0,
      description:
        '세그먼트 합산(중복 차감) 기반 추정.',
      source: '웹협업 261억 등.2024',
      delay: 0.2,
    },
    {
      type: 'SAM',
      title: '글로벌 생성형 AI 시장',
      value: 1430,
      suffix: '억 달러',
      cagr: 73.3,
      description:
        'IDC 전망(전 세계 지출).',
      source: 'IDC 2027',
      delay: 0.4,
    },
    {
      type: 'SOM',
      title: '국내 생성형 AI 시장',
      value: 7,
      suffix: '억 달러',
      cagr: 60.0,
      description:
        '국내 AI 시장 × GenAI 비중(보수) 가정.',
      source: '국내 AI 시장 추정 + GenAI 20%',
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
            시장 규모와 진입 전략
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            AI 기반 생산성 향상
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
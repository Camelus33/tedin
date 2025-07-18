'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, ShoppingBag, Gift } from 'lucide-react';

const pricingTiers = [
  {
    icon: <Gift className="w-10 h-10 mb-4 text-gray-400" />,
    title: 'Free',
    audience: 'For individual investors starting out',
    price: '$0',
    frequency: '/ forever',
    description: '온톨로지 AI의 기본 기능을 무료로 경험하며 투자 패턴 분석을 시작하세요.',
    features: [
      '온톨로지 커맨드 사용 제한',
      '메모카드 월 30개 제공',
      'AI-Link 월 30개 생성',
      '기본 투자 편향 진단',
    ],
    cta: 'Start for Free',
    popular: false,
  },
  {
    icon: <Users className="w-10 h-10 mb-4 text-indigo-400" />,
    title: 'Plus',
    audience: 'For active individual investors',
    price: '$30',
    frequency: '/ month',
    description: '더 많은 투자 메모와 AI 분석으로 투자 성과를 향상시키세요.',
    features: [
      '온톨로지 커맨드 일 5회 제한',
      '메모카드 월 150개 제공',
      'AI-Link 월 150개 생성',
      '클랜 메모 공유 기능',
      '고급 투자 편향 진단',
    ],
    cta: 'Get Started with Plus',
    popular: true,
  },
  {
    icon: <ShoppingBag className="w-10 h-10 mb-4 text-cyan-400" />,
    title: 'Pro',
    audience: 'For professional investors & traders',
    price: '$300',
    frequency: '/ month',
    description: '무제한 AI 분석과 고급 기능으로 투자 전문성을 극대화하세요.',
    features: [
      '온톨로지 커맨드 무제한',
      '메모카드 무제한 제공',
      'AI-Link 무제한 생성',
      '전문 투자 편향 진단',
      '투자 패턴 학습 AI',
    ],
    cta: 'Get Started with Pro',
    popular: false,
  },
  {
    icon: <CheckCircle className="w-10 h-10 mb-4 text-yellow-400" />,
    title: 'Gold',
    audience: 'For institutional investors & fund managers',
    price: '$3,000',
    frequency: '/ month',
    description: '온톨로지 AI의 모든 기능과 종목 추천으로 투자 성과를 극대화하세요.',
    features: [
      'Pro 모든 기능 포함',
      '온톨로지 종목 추천',
      '전체 투자 히스토리 컨텍스트',
      '맞춤형 투자 전략 분석',
      '전담 투자 AI 어시스턴트',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const BusinessModelSection = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section id="business-model" className="py-20 md:py-32 bg-slate-950 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center tracking-tight">
            투자자 중심의 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">단계별 성장 모델</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            투자 경험과 필요에 따라 선택할 수 있는 4단계 요금제로, 온톨로지 AI의 강력한 기능을 단계적으로 활용하세요.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {pricingTiers.map(tier => (
            <motion.div
              key={tier.title}
              className={`
                relative flex flex-col bg-gray-900/50 border border-gray-700/60 rounded-2xl p-8 shadow-lg hover:border-cyan-500/50 transition-all duration-300 h-full
                ${tier.popular ? 'border-cyan-400/50 shadow-cyan-400/20' : ''}
              `}
              variants={itemVariants}
            >
              {tier.popular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="flex-grow flex flex-col">
                {tier.icon}
                <h3 className="text-2xl font-bold text-gray-100">{tier.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{tier.audience}</p>
                
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-gray-400 ml-1.5">{tier.frequency}</span>
                </div>

                <p className="text-gray-300 mb-6 flex-grow">{tier.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map(feature => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0 mt-1" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <button
                    className={`
                      w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-300
                      ${tier.popular
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/30'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                      }
                    `}
                  >
                    {tier.cta}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-gray-400">
            <span className="font-semibold text-white">연간 구독 혜택:</span> 
            Plus는 월 $21, Pro는 월 $210, Gold는 월 $2,100으로 연간 구독 시 30% 할인을 제공합니다.
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default BusinessModelSection; 
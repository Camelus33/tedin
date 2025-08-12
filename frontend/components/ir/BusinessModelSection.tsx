'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Users, ShoppingBag, Gift } from 'lucide-react';

const pricingTiers = [
  {
    icon: <Gift className="w-10 h-10 mb-4 text-gray-400" />,
    title: 'Free',
    audience: 'For individuals starting out',
    price: '$0',
    frequency: '/ forever',
    description: '기본 기능 체험(저장 즉시 유사 사례 안내 포함).',
    features: [
      '저장 즉시 유사 사례 3개 안내',
      '기본 템플릿',
      '커뮤니티 접근',
    ],
    cta: 'Start for Free',
    popular: false,
  },
  {
    icon: <Users className="w-10 h-10 mb-4 text-indigo-400" />,
    title: 'Pro',
    audience: 'For power users & professionals',
    price: '$20',
    frequency: '/ user / month',
    description: '임계값 튜닝, 도메인 템플릿, 분석 리포트 등 고급 기능.',
    features: [
      '임계값/임계치 튜닝',
      '도메인 템플릿',
      '분석 리포트',
    ],
    cta: 'Get Started with Pro',
    popular: true,
  },
  {
    icon: <ShoppingBag className="w-10 h-10 mb-4 text-cyan-400" />,
    title: 'Premium',
    audience: 'For teams & marketplace creators',
    price: '$49',
    frequency: '/ user / month',
    description: '팀 협업·보안·관리 + 마켓플레이스 거래 권한 포함.',
    features: [
      '권한/감사 로그',
      '팀 관리 기능',
      '마켓플레이스 거래 권한',
    ],
    cta: 'Upgrade to Premium',
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
            사용량에 맞춘 요금제, 결과에 집중하는 기업 플랜
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            Free/Pro/Premium. 마켓플레이스 거래는 Premium에서만 가능합니다.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
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
            마켓플레이스: 전문가가 50개 이상 메모카드로 만든 써머리노트를 지식캡슐(AI-Link)로 전환, 품질테스트 통과본만 거래. 구매·판매는 Premium 전용.
          </p>
        </motion.div>

      </div>
    </section>
  );
};

export default BusinessModelSection; 
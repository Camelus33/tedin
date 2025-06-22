'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Gift, ArrowUpCircle, ShoppingBag } from 'lucide-react';

const businessModels = [
  {
    icon: <Gift className="w-10 h-10 mb-4 text-indigo-400" />,
    title: 'Free',
    description:
      'Habitus33의 핵심 기능을 평생 무료로 제공하여, 사용자가 아무런 장벽 없이 지식 성장의 즐거움을 경험하게 합니다. 이는 강력한 사용자 기반을 확보하고 커뮤니티를 활성화하는 성장 엔진입니다.',
    tags: ['사용자 기반 확장', '커뮤니티 형성', '바이럴 루프'],
  },
  {
    icon: <ArrowUpCircle className="w-10 h-10 mb-4 text-teal-400" />,
    title: 'Pro & Enterprise',
    description:
      '전문가와 팀을 위한 Pro 플랜과 Enterprise 솔루션은 사용량에 기반한 합리적인 과금 모델을 제시합니다. 심층 분석, 강화된 협업 기능, 강력한 보안을 통해 개인과 조직의 지적 생산성을 극대화합니다.',
    tags: ['전문가용', '팀 협업', 'B2B/B2C', 'SaaS'],
  },
  {
    icon: <ShoppingBag className="w-10 h-10 mb-4 text-cyan-400" />,
    title: 'AI-Link Market',
    description:
      '사용자들의 도메인 인사이트가 담긴 고품질 지식 캡슐(AI-Link)을 사고파는 오픈마켓. 지식 근로자는 자신의 도메인 컨텍스트로 수익을 창출하고, 사용자는 사실기반 도메인 지식을 구매하며, Habitus33은 중개 수수료(30%)를 통해 생태계를 더욱 성장시킵니다.',
    tags: ['수익 공유', '생태계 확장', '네트워크 효과'],
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
            지속 가능 & 실현 가능
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-3xl mx-auto leading-relaxed">
            도메인 지식 축적 및 지식캡슐 생태계구축이라는 목표로 유기적으로 연결된 수익 모델
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {businessModels.map(model => {
            const isMarketplace = model.title === 'AI-Link Market';
            return (
              <motion.div
                key={model.title}
                className={`
                  ${isMarketplace
                    ? 'bg-gradient-to-br from-indigo-900/50 via-slate-900 to-slate-900 border-cyan-400/50 shadow-cyan-400/20'
                    : 'bg-gray-900/50 border-gray-700/60 hover:border-cyan-500/50'
                  }
                  backdrop-blur-sm border rounded-2xl p-8 flex flex-col shadow-lg hover:shadow-cyan-500/10 transition-all duration-300
                `}
                variants={itemVariants}
              >
                <div className="flex-grow">
                  {model.icon}
                  <h3 className="text-2xl font-bold mb-3 text-gray-100">{model.title}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {model.description}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-700/50">
                  <div className="flex flex-wrap gap-2">
                    {model.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-xs font-medium bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default BusinessModelSection; 
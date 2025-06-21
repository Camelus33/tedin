import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Database, Filter, Network, Archive, ArrowRight, Package } from 'lucide-react';

const features = [
  {
    icon: Database,
    title: "1. AI가 당신을 완전히 이해합니다",
    subtitle: "깊은 맥락 파악",
    description: "이제 AI에게 배경을 설명할 필요가 없습니다. 당신의 전문 분야, 경험, 목표를 완벽히 파악하고 그에 맞는 정확한 답변을 즉시 제공합니다.",
    color: "text-indigo-500",
    gradientFrom: "from-indigo-500/10",
  },
  {
    icon: Filter,
    title: "2. 오직 당신을 위한 답변",
    subtitle: "완전 맞춤형 솔루션",
    description: "천편일률적인 답변은 이제 그만. AI가 당신의 상황, 성격, 목표에 완벽히 맞춘 개인화된 조언과 아이디어를 제공합니다.",
    color: "text-purple-500",
    gradientFrom: "from-purple-500/10",
  },
  {
    icon: Network,
    title: "3. 전문가급 품질",
    subtitle: "차원이 다른 통찰",
    description: "피상적인 답변이 아닌, 당신의 지식 수준에 맞는 깊이 있고 전문적인 통찰을 받습니다. 마치 해당 분야 최고 전문가와 대화하는 것 같습니다.",
    color: "text-violet-500",
    gradientFrom: "from-violet-500/10",
  },
  {
    icon: Archive,
    title: "4. 남들이 놀라는 결과",
    subtitle: "확실한 차별화",
    description: "AI-Link로 만든 리포트, 기획서, 아이디어는 확실히 다릅니다. '어떻게 이런 걸 생각했지?'라는 반응을 받으며 주목받게 됩니다.",
    color: "text-fuchsia-500",
    gradientFrom: "from-fuchsia-500/10",
  }
];

export default function CoreFeaturesFreeSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-white">
      {/* Background Aurora */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-[800px] bg-gradient-to-tr from-indigo-100 via-purple-100 to-violet-100 opacity-30 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 text-center max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="mb-16 md:mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              AI-Link, 당신의 지식 캡슐
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            흩어진 생각이 하나로 모여, 캡슐로 재탄생하는 순간.
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 items-start gap-x-6 gap-y-12 mb-20"
        >
          {features.map((feature, index) => (
            <React.Fragment key={feature.title}>
              <motion.div
                variants={itemVariants}
                className="relative h-full text-left p-6 bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-300/20 transition-all duration-300 hover:shadow-slate-400/30 hover:border-slate-300"
              >
                <div className={`absolute top-0 left-0 w-full h-full rounded-2xl bg-gradient-to-br ${feature.gradientFrom} to-transparent opacity-30 -z-10`}></div>
                <div className="flex flex-col h-full">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200">
                       <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className={`text-xl font-bold ${feature.color}`}>
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mb-3">
                    {feature.subtitle}
                  </p>
                  <p className="text-slate-600 text-sm leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            </React.Fragment>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeInOut", delay: 0.3 }}
          className="mb-12"
        >
          <div className="p-8 bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200 max-w-3xl mx-auto shadow-xl shadow-slate-200/50">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
              <div className="flex-shrink-0">
                  <Package className="w-12 h-12 text-indigo-500 bg-indigo-100 p-2 rounded-xl border border-indigo-200" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-800 mb-1">
                  당신만의 AI-Link 캡슐, 지금 바로 경험하세요
                </p>
                <p className="text-slate-600">
                  프롬프트 작성 없이도 AI가 당신을 깊이 이해하는 새로운 경험, 지금 시작하세요.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeInOut", delay: 0.5 }}
        >
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:shadow-2xl hover:shadow-indigo-300/50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 group"
          >
            나만의 AI-Link 생성하기 (무료)
            <ArrowRight className="w-5 h-5 ml-2.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
} 
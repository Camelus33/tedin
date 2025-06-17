import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Edit3, Zap, Link as LinkIcon, Gift, ArrowRight, Sparkles, Lightbulb, Flame, Cpu, Database, Filter, Network, Archive } from 'lucide-react';

const features = [
  {
    icon: Database,
    title: "수집",
    subtitle: "Knowledge Collection",
    description: "당신의 메모, 문서, 하이라이트가 AI-Link의 원료가 됩니다. 학습 여정의 모든 흔적이 의미 있는 데이터로 수집됩니다.",
    highlight: "1단계",
    color: "text-indigo-400",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  },
  {
    icon: Filter,
    title: "정제",
    subtitle: "Data Refinement",
    description: "수집된 자료에서 핵심 개념과 연결점을 추출합니다. 중복은 제거되고, 중요한 인사이트는 강화됩니다.",
    highlight: "2단계",
    color: "text-purple-400",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    icon: Network,
    title: "구조화",
    subtitle: "Knowledge Structuring",
    description: "정제된 지식이 의미 있는 패턴으로 재배열됩니다. 개념 간의 관계가 지식 그래프로 구조화되어 깊은 맥락을 형성합니다.",
    highlight: "3단계",
    color: "text-violet-400",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200"
  },
  {
    icon: Archive,
    title: "응축",
    subtitle: "AI-Link Creation",
    description: "구조화된 지식이 하나의 AI-Link 캡슐로 응축됩니다. 이 보라색 캡슐은 당신의 학습 여정을 담은 열쇠로, AI가 당신을 프롬프트 없이도 깊이 이해하게 합니다.",
    highlight: "4단계",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-300"
  }
];

export default function CoreFeaturesFreeSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 text-center max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              AI-Link, 당신의 지식 캡슐
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            흩어진 생각이 하나로 모여, AI가 당신을 온전히 이해하는 순간
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={`
                relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer group
                ${feature.bgColor} ${feature.borderColor} hover:shadow-xl hover:scale-105
              `}
            >
              {/* Highlight Badge */}
              <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-bold rounded-full shadow-lg">
                {feature.highlight}
              </div>
              
              {/* Icon */}
              <div className={`
                inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-all duration-300
                bg-gradient-to-r from-indigo-500/20 to-violet-500/20 group-hover:from-indigo-500/30 group-hover:to-violet-500/30
              `}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              
              {/* Content */}
              <div className="text-center">
                <h3 className={`text-xl font-bold mb-2 ${feature.color}`}>
                  {feature.title}
                </h3>
                <p className="text-sm font-medium text-gray-600 mb-4">
                  {feature.subtitle}
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeInOut", delay: 0.3 }}
          className="mb-12"
        >
          <div className="p-6 bg-gradient-to-r from-indigo-50 via-purple-50 to-violet-50 rounded-2xl border border-violet-200 max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-indigo-600 mr-3" />
              <Sparkles className="w-6 h-6 text-violet-600" />
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              당신만의 AI-Link 캡슐, 지금 바로 경험하세요
            </p>
            <p className="text-gray-600">
              프롬프트 작성 없이도 AI가 당신을 깊이 이해하는 새로운 경험, 지금 시작하세요
            </p>
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
            className="inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-300 group"
          >
            나만의 AI-Link 생성하기 (무료)
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
} 
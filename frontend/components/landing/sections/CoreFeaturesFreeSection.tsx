import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Edit3, Zap, Link as LinkIcon, Gift, ArrowRight, Sparkles } from 'lucide-react';

const amfaFeatures = [
  {
    icon: BookOpen,
    title: "Atomic Reading",
    subtitle: "The Drop Moment",
    description: "3분, 11페이지. 작은 돌멩이가 잔잔한 물에 떨어지는 순간처럼 시작하세요.",
    highlight: "무료",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20"
  },
  {
    icon: Edit3,
    title: "Memo Evolve", 
    subtitle: "The First Ripple",
    description: "1줄 메모에서 시작되는 첫 번째 파문. 생각이 확산되기 시작합니다.",
    highlight: "무료",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    icon: Zap,
    title: "Furnace Knowledge",
    subtitle: "The Deep Current",
    description: "깊은 해류처럼 지식이 체계적으로 흐르며 내면에 새겨집니다.",
    highlight: "무료",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    icon: LinkIcon,
    title: "AI Link",
    subtitle: "The Infinite Wave",
    description: "AI와 함께 무한히 확산되는 파도. 예상치 못한 연결과 통찰을 발견합니다.",
    highlight: "무료",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/20"
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
    <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 text-center max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
              깊은 학습의 파급 효과
            </span>
            <br />
            <span className="text-gray-800">평생 무료로 시작하세요</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            <span className="text-cyan-600 font-semibold">작은 돌멩이 하나</span>가 만들어내는 
            <span className="text-purple-600 font-semibold"> 무한한 파도</span>를 경험하세요
          </p>
        </motion.div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {amfaFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className={`
                relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer group
                ${feature.bgColor} ${feature.borderColor} hover:shadow-xl hover:scale-105
              `}
            >
              {/* Highlight Badge */}
              <div className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-bold rounded-full shadow-lg">
                {feature.highlight}
              </div>
              
              {/* Icon */}
              <div className={`
                inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 transition-all duration-300
                bg-gradient-to-r from-cyan-500/20 to-purple-500/20 group-hover:from-cyan-500/30 group-hover:to-purple-500/30
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
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
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
          <div className="p-6 bg-gradient-to-r from-cyan-50 via-purple-50 to-violet-50 rounded-2xl border border-cyan-200 max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-cyan-600 mr-3" />
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-2">
              첫 파도부터 무한한 확산까지, 모든 AMFA 경험이 평생 무료
            </p>
            <p className="text-gray-600">
              3분의 시작부터 AI와의 깊은 연결까지, 모든 핵심 기능을 제한 없이 사용하세요
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
            className="inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl hover:from-cyan-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-300 group"
          >
            나만의 리듬 찾기 (무료)
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
} 
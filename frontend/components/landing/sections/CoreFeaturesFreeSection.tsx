import React from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { DollarSign, Clock, Award } from 'lucide-react';

const CountUp = ({ to }: { to: number }) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  React.useEffect(() => {
    if (isInView && ref.current) {
      const node = ref.current;
      const controls = animate(0, to, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (value) => {
          node.textContent = Math.round(value).toString();
        },
      });
      return () => controls.stop();
    }
  }, [isInView, to]);

  return <span ref={ref}>0</span>;
};


const ApiCostViz = () => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.6 });

    return (
        <div ref={ref} className="w-full h-48 flex flex-col items-center justify-end">
            <div className="w-32 h-40 relative">
                {/* Background full bar */}
                <div className="w-full h-full bg-gray-200 rounded-t-xl absolute bottom-0"></div>

                {/* Animated shrinking bar */}
                <motion.div
                    className="w-full bg-gradient-to-t from-green-400 to-emerald-500 rounded-t-xl absolute bottom-0"
                    initial={{ height: '100%' }}
                    animate={isInView ? { height: '33.3%' } : { height: '100%' }}
                    transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                >
                </motion.div>
                
                {/* Labels */}
                <motion.div 
                    className="absolute -right-12 top-0 text-left"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-xs text-gray-500">기존</p>
                    <p className="text-lg font-bold text-gray-500">3x</p>
                </motion.div>

                <motion.div 
                    className="absolute -right-12 bottom-0 text-left"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ delay: 1.5 }}
                >
                    <p className="text-xs text-green-600">AI-Link</p>
                    <p className="text-lg font-bold text-green-600">1x</p>
                </motion.div>
            </div>
        </div>
    );
};

const TimeSaveViz = () => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const circumference = 2 * Math.PI * 45; // 2 * pi * r

    return (
        <div ref={ref} className="h-48 relative flex flex-col items-center justify-center w-full">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" strokeWidth="10" className="stroke-gray-200" />
                <motion.circle
                    cx="50" cy="50" r="45"
                    fill="none"
                    strokeWidth="10"
                    className="stroke-blue-500"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: isInView ? circumference * (1 - 0.53) : circumference }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    strokeDasharray={circumference}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <p className="text-base font-medium text-gray-500">시간 단축</p>
                <div className="text-5xl font-bold text-blue-600">
                    <CountUp to={53} />%
                </div>
            </div>
        </div>
    );
};

const UniqueResultViz = () => {
    return (
        <div className="h-48 flex items-center justify-center w-full">
            <div className="relative w-48 h-36">
                <motion.div
                    initial={{ opacity: 1, rotate: -5, x: -10, y: 5 }}
                    whileInView={{ opacity: 0, scale: 0.8, y: 30 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="absolute w-full h-full bg-gray-300 rounded-lg shadow-md"
                />
                <motion.div
                    initial={{ opacity: 1, rotate: 5, x: 10, y: 0 }}
                    whileInView={{ opacity: 0, scale: 0.8, y: 30 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="absolute w-full h-full bg-gray-300 rounded-lg shadow-md"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0, x: 0, y: 0 }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 0.7, delay: 0.6, type: 'spring' }}
                    className="absolute w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-xl flex items-center justify-center p-2"
                >
                    <span className="font-bold text-white text-center text-lg leading-tight">독창적<br/> 결과물</span>
                     <motion.div
                        initial={{ opacity: 0, scale: 2.5, rotate: -45 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: -15 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 8, delay: 1.2 }}
                        className="absolute -bottom-5 -right-5 px-3 py-1 bg-red-600 text-white font-black text-3xl rounded-md border-4 border-white shadow-2xl font-['Do_Hyeon']"
                        style={{textShadow: '2px 2px 3px rgba(0,0,0,0.4)'}}
                    >
                        당선
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

const benefits = [
  {
    icon: DollarSign,
    title: "사고의 맹점 정밀 진단",
    description: "AI가 당신의 투자 분석, 연구 가설, 학습 체계에서 간과된 비약과 논리적 허점을 정밀하게 진단하여, 빈틈없는 의사결정 기반을 마련합니다.",
    color: "text-green-600",
    viz: ApiCostViz,
  },
  {
    icon: Clock,
    title: "미발견 연결고리 발굴",
    description: "방대한 데이터 속에서 겉으로는 무관해 보이는 정보들 간의 숨겨진 연결성을 찾아내, 투자 시장의 미묘한 신호나 연구의 새로운 방향, 학습 효율을 극대화할 기회를 포착하게 돕습니다.",
    color: "text-blue-600",
    viz: TimeSaveViz,
  },
  {
    icon: Award,
    title: "결정적 통찰력 확보",
    description: "AI가 당신의 고유한 맥락을 온톨로지 기반으로 이해하여, 단순히 정보를 넘어 투자 결정, 연구 방향, 학습 전략에서 압도적인 우위를 제공하는 차별화된 통찰력을 선사합니다.",
    color: "text-purple-600",
    viz: UniqueResultViz,
  }
];

export default function CoreFeaturesFreeSection() {
  return (
    <section className="py-24 sm:py-32 bg-gray-50">
      <div className="container mx-auto px-4 text-center max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="mb-16 md:mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-serif tracking-tight text-gray-900 mb-5">
            당신의 <span className="font-semibold text-indigo-600">'결정'</span>은 어떻게 달라질까요?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Habitus33의 <span className="font-semibold text-indigo-600">'맥락추론 AI'</span>가 당신의 돈과 시간을 아껴줍니다
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const VizComponent = benefit.viz;
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-8 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col"
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-indigo-100`}>
                     <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                  </div>
                  <h3 className={`text-2xl font-bold text-gray-800 mt-4`}>
                    {benefit.title}
                  </h3>
                </div>
                <div className="mt-4 flex-grow min-h-[192px] flex items-center justify-center">
                  { VizComponent ? <VizComponent /> : <div className="text-gray-400">시각화 로딩 오류</div>}
                </div>
                <p className="text-gray-600 leading-relaxed mt-6 text-center text-sm">
                  {benefit.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  );
} 
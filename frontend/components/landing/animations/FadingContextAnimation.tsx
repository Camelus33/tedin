'use client'

import { motion } from 'framer-motion'

const FadingBlock = ({
  y,
  delay,
  finalOpacity = 0.2,
}: {
  y: number
  delay: number
  finalOpacity?: number
}) => (
  <motion.div
    initial={{ opacity: 1, y: 0 }}
    animate={{ opacity: finalOpacity, y: y }}
    transition={{
      duration: 1.5,
      delay: delay,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    }}
    className="h-2 rounded-full"
    style={{
      background:
        'linear-gradient(90deg, rgba(99,102,241,0.7) 0%, rgba(56,189,248,0.5) 100%)',
    }}
  />
)

const ContextLine = ({
  text,
  delay,
  isFading,
}: {
  text: string
  delay: number
  isFading: boolean
}) => (
  <motion.div
    initial={{ opacity: 1 }}
    animate={{ opacity: isFading ? 0 : 1 }}
    transition={{
      duration: 1.5,
      delay: delay + 2, // Start fading after the blocks have moved
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    }}
    className="flex items-center space-x-2"
  >
    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
    <span className="text-sm text-gray-600">{text}</span>
  </motion.div>
)

export default function FadingContextAnimation() {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-full flex-shrink-0" />
        <div className="w-full space-y-3">
          <div className="h-2 bg-gray-900 rounded-full w-3/4" />
          <div className="h-2 bg-gray-900 rounded-full w-1/2" />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex-shrink-0" />
          <div className="w-full space-y-3 pt-1">
            <FadingBlock y={8} delay={0} />
            <FadingBlock y={4} delay={0.2} finalOpacity={0.3} />
            <FadingBlock y={0} delay={0.4} finalOpacity={0.5} />
          </div>
        </div>

        <div className="pl-14 pt-2 space-y-2">
          <ContextLine text="같은 시간대에 비슷한 생각을 반복..." delay={0} isFading={true} />
          <ContextLine text="연결 없이 흩어져 흐름을 놓침..." delay={0.2} isFading={true} />
          <ContextLine text="어디서 방향을 바꿔야 할지 모름..." delay={0.4} isFading={true} />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2 text-[11px]">
        <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">Speed</span>
        <span className="px-2 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">Curvature</span>
        <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Rhythm</span>
        <span className="px-2 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">Time</span>
      </div>
      <p className="text-center text-xs text-gray-500 mt-3">
        Habitus33는 방향·속도·리듬·시간대 패턴을 수치화해 반복을 줄입니다.
      </p>
    </div>
  )
} 

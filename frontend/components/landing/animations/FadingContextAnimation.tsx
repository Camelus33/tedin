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
    className="h-2 bg-indigo-200 rounded-full"
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
    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
    <span className="text-sm text-gray-500">{text}</span>
  </motion.div>
)

export default function FadingContextAnimation() {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-800 rounded-full flex-shrink-0" />
        <div className="w-full space-y-3">
          <div className="h-2 bg-gray-800 rounded-full w-3/4" />
          <div className="h-2 bg-gray-800 rounded-full w-1/2" />
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
          <ContextLine text="새로운 개념을 배우면..." delay={0} isFading={true} />
          <ContextLine text="메모가 체계적으로 발전되지 않음..." delay={0.2} isFading={true} />
          <ContextLine text="같은 내용을 반복 학습하게 됨..." delay={0.4} isFading={true} />
        </div>
      </div>
       <p className="text-center text-xs text-gray-400 mt-4">
        학습 과정의 부산물이 발전되지 않으면 학습 시간이 늘어납니다.
      </p>
    </div>
  )
} 
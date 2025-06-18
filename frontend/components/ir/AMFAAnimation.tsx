'use client';

import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface AMFAAnimationProps {
  scrollYProgress: MotionValue<number>;
}

const NUM_PARTICLES = 80;

const AMFAAnimation: React.FC<AMFAAnimationProps> = ({ scrollYProgress }) => {
  const particles = React.useMemo(() => {
    return Array.from({ length: NUM_PARTICLES }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      angle: Math.random() * 2 * Math.PI,
      distance: 0.3 + Math.random() * 0.2,
    }));
  }, []);

  const stage = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [1, 2, 3, 4, 4]);

  return (
    <svg width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.02" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: 'rgba(129, 140, 248, 0.8)', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'rgba(56, 189, 248, 0)', stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      
      <g style={{ filter: 'url(#goo)' }}>
        {particles.map((p, i) => {
          const x = useTransform(stage, [1, 2, 3, 4], [
            0.5 + Math.cos(p.angle) * p.distance,
            0.5 + Math.cos(p.angle) * p.distance * 0.5,
            0.5,
            0.5
          ]);
          const y = useTransform(stage, [1, 2, 3, 4], [
            0.5 + Math.sin(p.angle) * p.distance,
            0.5 + Math.sin(p.angle) * p.distance * 0.5,
            0.5,
            0.5
          ]);
          const r = useTransform(stage, [1, 2, 3, 4], [0.015, 0.03, 0.06, 0.01]);

          return <motion.circle key={i} cx={x} cy={y} r={r} fill="rgba(165, 180, 252, 0.7)" />;
        })}
      </g>
      
      {/* Stage 2: Lines connecting particles */}
      <g>
        {particles.map((p1, i) => {
           // Connect to next particle for simplicity
          const p2 = particles[(i + 1) % NUM_PARTICLES];
          const opacity = useTransform(stage, [1, 1.8, 2.2, 3], [0, 0.5, 0.5, 0]);
          return (
             <motion.line
               key={i}
               x1={0.5 + Math.cos(p1.angle) * p1.distance}
               y1={0.5 + Math.sin(p1.angle) * p1.distance}
               x2={0.5 + Math.cos(p2.angle) * p2.distance}
               y2={0.5 + Math.sin(p2.angle) * p2.distance}
               stroke="rgba(129, 140, 248, 0.3)"
               strokeWidth="0.002"
               style={{ opacity }}
             />
          )
        })}
      </g>
      
      {/* Stage 4: Capsule and glow */}
      <g>
        <motion.ellipse
          cx="0.5"
          cy="0.5"
          rx={useTransform(stage, [3, 3.5], [0, 0.1])}
          ry={useTransform(stage, [3, 3.5], [0, 0.15])}
          fill="none"
          stroke="rgba(56, 189, 248, 1)"
          strokeWidth={useTransform(stage, [3.5, 4], [0.01, 0.005])}
          opacity={useTransform(stage, [3, 3.5], [0, 1])}
        />
         <motion.circle
            cx="0.5"
            cy="0.5"
            r={useTransform(stage, [3.5, 4], [0.1, 1])}
            fill="url(#glow)"
            style={{ opacity: useTransform(stage, [3.8, 4], [0, 1]) }}
         />
      </g>
    </svg>
  );
};

export default AMFAAnimation; 
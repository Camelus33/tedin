'use client'; // Hero section might have animations

import React from 'react';
import Link from 'next/link';
// Use Heroicons instead of Lucide
import { SparklesIcon as SparklesIconOutline } from '@heroicons/react/24/outline'; 
// import { ArrowRightIcon } from '@heroicons/react/24/outline'; // For secondary CTA if uncommented
import { motion } from 'framer-motion';
import Image from 'next/image';

// Example of a high-quality image from public/images
// Replace with an actual relevant image path later
const heroImageUrl = '/images/hero-background.jpg'; // Placeholder

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-28 overflow-hidden">
      {/* Background Image / Gradient - Big Tech Style */}
      {/* Option 1: Image Background */}
      {/* <div className="absolute inset-0"> 
        <Image 
          src={heroImageUrl} 
          alt="Abstract background representing cognitive enhancement" 
          layout="fill"
          objectFit="cover"
          quality={90}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/80 to-white"></div>
      </div> */}
      
      {/* Option 2: Subtle Gradient Background (Clean) */}
      <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-br from-indigo-50 via-white to-blue-50"></div>
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
         <div className="h-[400px] w-[800px] rounded-full bg-gradient-radial from-indigo-100/80 via-purple-50/50 to-transparent blur-3xl opacity-60"></div>
      </div>

      {/* Flow-line semantic trajectory (subtle animated SVG) */}
      <motion.svg
        className="absolute inset-0 pointer-events-none select-none"
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="flowStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        {/* three thin trajectories with slight variation */}
        <motion.path
          d="M0,200 C300,250 600,120 900,180 C1140,225 1290,160 1440,190"
          fill="none"
          stroke="url(#flowStroke)"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeDasharray="6 10"
          initial={{ pathLength: 0, strokeDashoffset: 0 }}
          animate={{ pathLength: 1, strokeDashoffset: -16 }}
          transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
        />
        <motion.path
          d="M0,360 C280,320 640,420 920,360 C1200,300 1290,380 1440,340"
          fill="none"
          stroke="url(#flowStroke)"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeDasharray="5 9"
          initial={{ pathLength: 0, strokeDashoffset: 0 }}
          animate={{ pathLength: 1, strokeDashoffset: -14 }}
          transition={{ duration: 9.5, ease: 'linear', repeat: Infinity, delay: 0.6 }}
        />
        <motion.path
          d="M0,520 C240,560 540,500 840,560 C1080,610 1260,540 1440,580"
          fill="none"
          stroke="url(#flowStroke)"
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeDasharray="5 10"
          initial={{ pathLength: 0, strokeDashoffset: 0 }}
          animate={{ pathLength: 1, strokeDashoffset: -12 }}
          transition={{ duration: 10.5, ease: 'linear', repeat: Infinity, delay: 1.2 }}
        />
      </motion.svg>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="max-w-5xl mx-auto"
        >
          <div className="flex items-center justify-center gap-12">
            {/* Text Content */}
            <div className="max-w-xl text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif text-gray-900 tracking-tight leading-tight">
                생각의 패턴을 읽는<br />
                <span className="text-indigo-600">AI 메모</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                1줄 메모부터 연결·진화까지. 시간의 흐름 속에서 <span className="font-semibold">방향·속도·리듬</span>을 추적하고,
                반복되는 생각을 알려드립니다.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/analytics"
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out w-full sm:w-auto"
                >
                  내 생각 패턴 보기
                </Link>
              </div>
            </div>
            
            {/* Video Content */}
            <div className="w-1/4">
              <video
                className="rounded-lg shadow-2xl w-full aspect-[2/3] object-cover"
                src="/drop seal.mp4"
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 
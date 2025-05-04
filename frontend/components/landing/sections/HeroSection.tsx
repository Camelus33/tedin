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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Hook Question */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            매일 <span className="text-indigo-600">열심히 노력 </span>하는데<br />
            왜 항상 제자리에서 도는걸까요?
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto">
            당신의 노력이 성과로 이어지지 않는다면, <br className="hidden sm:block" />
            숨어있는 <strong className="text-gray-800">'이것'</strong>을 확인해야 합니다.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/auth/register" // Or link to a diagnostic/quiz later?
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 ease-in-out w-full sm:w-auto"
            >
              {/* Using Heroicon */}
              <SparklesIconOutline className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" /> 
              나의 정보 처리 능력 확인하기 (무료)
            </Link>
            {/* Optional secondary CTA (e.g., learn more) */}
            {/* <Link
              href="#epiphany" // Scroll link
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 transition duration-150 ease-in-out w-full sm:w-auto"
            >
              진짜 이유 알아보기
              <ArrowRightIcon className="w-5 h-5 ml-2" aria-hidden="true" />
            </Link> */}
          </div>
        </motion.div>
      </div>
    </section>
  );
} 
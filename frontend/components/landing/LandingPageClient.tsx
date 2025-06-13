'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
// Import necessary icons from lucide-react later as sections are built
// import { Brain, Zap, ArrowRight, ... } from 'lucide-react';
import AppLogo from '@/components/common/AppLogo';
// Import section components
import HeroSection from './sections/HeroSection';
import ProblemDiagnosisSection from './sections/ProblemDiagnosisSection';
import SolutionSection from './sections/SolutionSection';
// import MeasurementSection from './sections/MeasurementSection';
import CoreFeaturesFreeSection from './sections/CoreFeaturesFreeSection';
import TestimonialsSection from './sections/TestimonialsSection';
import FinalCtaSection from './sections/FinalCtaSection';
import FaqSection from './sections/FAQSection';
import FinalHookSection from './sections/FinalHookSection';

export default function LandingPageClient() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Simple check for token - enhance later if needed
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Redirect logged-in users
      router.push('/dashboard');
    }
  }, [router]);

  // Prevent rendering the landing page briefly if logged in
  if (isLoggedIn) {
    return null; // Or a loading indicator
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden"> {/* Ensure no horizontal overflow */}
      {/* Header - Simplified for now, can be enhanced */}
      <header className="fixed w-full top-0 left-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2" aria-label="Homepage">
              <AppLogo className="w-8 h-8" />
              <div>
                <div className="text-xl font-bold text-gray-800">habitus33</div>
                <p className="text-xs font-medium tracking-wider text-gray-500">Read Short. Deep Dive</p>
              </div>
            </Link>
            <div className="flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                나의 파도 만들기
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-16"> {/* Adjust pt if header height changes */}
        {/* Render Sections in order */}
        <HeroSection />
        <ProblemDiagnosisSection />
        <SolutionSection />
        {/* <MeasurementSection /> */}
        <CoreFeaturesFreeSection />
        <TestimonialsSection />
        <FinalCtaSection />
        <FaqSection />
        <FinalHookSection />
      </main>

      {/* Footer is rendered globally in layout.tsx */}
    </div>
  );
} 
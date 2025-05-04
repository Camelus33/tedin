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
import MeasurementSection from './sections/MeasurementSection';
import CoreFeaturesFreeSection from './sections/CoreFeaturesFreeSection';
import ZengoMyVerseTeaserSection from './sections/ZengoMyVerseTeaserSection';
import TestimonialsSection from './sections/TestimonialsSection';
import FinalCtaSection from './sections/FinalCtaSection';
import FaqSection from './sections/FAQSection';
import FinalHookSection from './sections/FinalHookSection';
// Removed other section imports

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
              <span className="text-xl font-bold text-gray-800">habitus33</span>
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
                무료 체험 시작
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
        <MeasurementSection />
        <CoreFeaturesFreeSection />
        <ZengoMyVerseTeaserSection />
        <TestimonialsSection />
        <FinalCtaSection />
        <FaqSection />
        <FinalHookSection />
        
        {/* Removing old/placeholder sections for now to focus on the new flow */}
        {/* <StoryStruggleSection /> */}
        {/* <StoryEpiphanySection /> */}
        {/* <OfferSection /> */}

        {/* Remove the remaining placeholder div */}
        {/* 
        <div className="py-16 bg-gray-50 text-center">
          <p className="text-xl text-gray-500">[Placeholder for Step 5: Offer - Features/Benefits]</p>
        </div>
        */}
        {/* ... other placeholders ... */}

      </main>

      {/* Footer is rendered globally in layout.tsx */}
    </div>
  );
} 
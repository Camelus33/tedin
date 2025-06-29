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
import HowItWorksSection from './sections/HowItWorksSection';
import CoreFeaturesFreeSection from './sections/CoreFeaturesFreeSection';
import TestimonialsSection from './sections/TestimonialsSection';
import FinalCtaSection from './sections/FinalCtaSection';
import Header from '@/components/common/Header';

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
      <Header />

      <main> {/* No longer needs top padding as it's handled globally */}
        {/* Render Sections in order */}
        <HeroSection />
        <ProblemDiagnosisSection />
        <HowItWorksSection />
        <CoreFeaturesFreeSection />
        <TestimonialsSection />
        <FinalCtaSection />
      </main>

      {/* Footer is rendered globally in layout.tsx */}
    </div>
  );
} 
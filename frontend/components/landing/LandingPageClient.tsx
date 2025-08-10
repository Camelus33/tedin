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
import FaqSection from './sections/FaqSection';
import TestimonialsSection from './sections/TestimonialsSection';
import FinalCtaSection from './sections/FinalCtaSection';
import { apiClient } from '@/lib/apiClient';
import Header from '@/components/common/Header';

export default function LandingPageClient() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [aggregate, setAggregate] = useState<any>(null);

  useEffect(() => {
    // Simple check for token - enhance later if needed
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      // Redirect logged-in users
      router.push('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    // 실시간 패턴 프리뷰용 집계 데이터(최근 30일)
    (async () => {
      try {
        const res = await apiClient.get('/analytics/aggregate?days=30');
        setAggregate(res);
      } catch (e) {
        setAggregate(null);
      }
    })();
  }, []);

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
        {/* 실시간 패턴 프리뷰 */}
        {aggregate && (
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4 max-w-5xl">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-6">실시간 패턴 프리뷰</h3>
              <p className="text-center text-gray-600 mb-8">최근 {aggregate.rangeDays}일 기준 가장 활발한 시간대/요일</p>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-sm">
                  Top Hour: {aggregate.timeOfDay.byHour.indexOf(Math.max(...aggregate.timeOfDay.byHour))}h
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100 text-sm">
                  Top Weekday: {['일','월','화','수','목','금','토'][aggregate.timeOfDay.byWeekday.indexOf(Math.max(...aggregate.timeOfDay.byWeekday))]}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-gray-700 font-medium mb-3">시간대 분포 (24h)</div>
                  <div className="space-y-2">
                    {aggregate.timeOfDay.byHour.map((v:number, i:number) => {
                      const max = Math.max(...aggregate.timeOfDay.byHour, 1);
                      const pct = Math.round((v / max) * 100);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-10 shrink-0 text-xs text-gray-500 tabular-nums">{i}h</div>
                          <div className="flex-1 h-2 rounded bg-gray-100 overflow-hidden">
                            <div className="h-2 rounded bg-indigo-500" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="w-8 shrink-0 text-[11px] text-gray-500 text-right tabular-nums">{v}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="p-4 rounded-lg border">
                  <div className="text-sm text-gray-700 font-medium mb-3">요일 분포</div>
                  <div className="space-y-2">
                    {aggregate.timeOfDay.byWeekday.map((v:number, i:number) => {
                      const max = Math.max(...aggregate.timeOfDay.byWeekday, 1);
                      const pct = Math.round((v / max) * 100);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-10 shrink-0 text-xs text-gray-500">{['일','월','화','수','목','금','토'][i]}</div>
                          <div className="flex-1 h-2 rounded bg-gray-100 overflow-hidden">
                            <div className="h-2 rounded bg-indigo-500" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="w-8 shrink-0 text-[11px] text-gray-500 text-right tabular-nums">{v}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        <FaqSection />
        <TestimonialsSection />
        <FinalCtaSection />
      </main>

      {/* Footer is rendered globally in layout.tsx */}
    </div>
  );
} 
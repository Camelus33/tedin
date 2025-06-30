'use client';

import React from 'react';
import { motion } from 'framer-motion';
import FadingContextAnimation from '@/components/landing/animations/FadingContextAnimation';
import { useTranslations } from 'next-intl';
// ViciousCycleGraphic을 임시로 제거합니다.
// import ViciousCycleGraphic from '@/components/landing/animations/ViciousCycleGraphic';

export default function ProblemDiagnosisSection() {
  const t = useTranslations('ProblemDiagnosisSection');

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 grid md:grid-cols-1 gap-6 items-center max-w-4xl">
        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-gray-900 tracking-tight text-center"
            dangerouslySetInnerHTML={{ __html: t.raw('title') }}
          />
          <div className="mt-8 text-lg text-gray-600 space-y-8 max-w-3xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <p className="font-semibold text-gray-800">{t('question')}</p>
              <blockquote className="mt-2 pl-4 border-l-4 border-gray-300 italic text-gray-500">
                {t('quote')}
              </blockquote>
              <p className="mt-4"
                dangerouslySetInnerHTML={{ __html: t.raw('explanation') }}
              />
            </div>
          </div>
        </motion.div>

        {/* Animation */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
        >
            <FadingContextAnimation />
        </motion.div>
      </div>
    </section>
  );
} 
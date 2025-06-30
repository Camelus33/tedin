import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface TestimonialQuotePart {
  text: string;
  highlighted: boolean;
}

interface Testimonial {
  name: string;
  title: string;
  quote: TestimonialQuotePart[];
}

export default function TestimonialsSection() {
  const t = useTranslations('TestimonialsSection');

  const testimonials: Testimonial[] = t.raw('testimonials');

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          {t('title')}
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          {t('subtitle')}
        </p>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {testimonials.map((testimonial: Testimonial) => (
            <div key={testimonial.name} className="bg-white p-8 rounded-xl shadow-lg flex flex-col border border-gray-100 relative">
              <div className="absolute top-0 left-0 -translate-x-3 -translate-y-3 text-7xl text-cyan-100 opacity-80 font-serif">
                "
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 z-10">{testimonial.title}</h3>
              <div className="flex-grow mb-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {testimonial.quote.map((part: TestimonialQuotePart, index: number) => (
                    <span key={index} className={part.highlighted ? "text-cyan-600 font-semibold" : ""}>
                      {part.text}
                    </span>
                  ))}
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-200">
                <div>
                  <p className="font-bold text-gray-800">{testimonial.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 브랜드 핵심 메시지 */}
        <div className="mt-20 text-center">
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-2xl md:text-3xl font-serif text-gray-700 italic leading-relaxed">
              {t('finalQuote.text')}
            </blockquote>
            <cite className="block mt-6 text-lg text-gray-500 not-italic">
              {t('finalQuote.author')}
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
} 
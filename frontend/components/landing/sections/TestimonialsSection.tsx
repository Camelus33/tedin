import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    name: '김OO, 컴퓨터공학 대학생',
    title: 'TS 세션으로 시험 준비 시간이 정말 단축되었어요.',
    quote: [
      { text: '짧은 집중 읽기로 핵심 개념을 빠르게 파악할 수 있었고, ', highlighted: false },
      { text: '1줄 메모 덕분에 기억하기 편하게 정리할 수 있었습니다.', highlighted: true },
      { text: ' 이제 암기보다는 이해에 집중할 수 있어요.', highlighted: false },
    ],
  },
  {
    name: '이OO, 의학전문대학원생',
    title: "메모 진화 기능으로 지식이 체계적으로 연결되었어요.",
    quote: [
      { text: "의학 용어들이 너무 많아서 암기하기 힘들었는데, 메모 진화로 관련 개념들을 연결시켜두니 ", highlighted: false },
      { text: "이해가 훨씬 쉬워졌어요.", highlighted: true },
      { text: " 실용적인 학습 아이디어도 더 많이 나오게 되었어요.", highlighted: false },
    ]
  },
  {
    name: '박OO, 디자인 대학원생',
    title: '플래시카드로 반복 학습이 크게 줄어들었어요.',
    quote: [
      { text: '플래시카드로 복습이 훨씬 효율적이 되었고, ', highlighted: false },
      { text: "오래 기억할 수 있게 되었어요.", highlighted: true },
      { text: ' 이제 같은 내용을 여러 번 기록하지 않게 되었어요.', highlighted: false },
    ]
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          학습 가속기로 앞서가는 상위 1%
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          같은 학습, 다른 결과. 그 비밀은 '짧고 굵게 여러번'에 있습니다.
        </p>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {testimonials.map((testimonial) => (
            <div key={testimonial.name} className="bg-white p-8 rounded-xl shadow-lg flex flex-col border border-gray-100 relative">
              <div className="absolute top-0 left-0 -translate-x-3 -translate-y-3 text-7xl text-cyan-100 opacity-80 font-serif">
                "
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 z-10">{testimonial.title}</h3>
              <div className="flex-grow mb-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {testimonial.quote.map((part, index) => (
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
              "단순한 암기가 아닌, 이해와 연결을 경험하세요."
            </blockquote>
            <cite className="block mt-6 text-lg text-gray-500 not-italic">
              — 암기에서 이해로, 이해에서 연결로 —
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
} 
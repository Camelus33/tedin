import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'J.H. Kim, 투자 분석가',
    title: '\'불확실한 시장 신호\' 속에서 늘 핵심을 놓치는 기분이었어요.',
    quote: [
      { text: '이젠 Habitus33이 방대한 데이터 속에서 ', highlighted: false },
      { text: '\'숨겨진 연결성\'을 찾아줘서, \'남들이 보지 못하는 투자 기회\'를 선점할 수 있었습니다.', highlighted: true },
    ],
  },
  {
    name: 'S.Y. Park, 대학원생',
    title: "복잡한 전공 지식, 제대로 이해하고 있는지 늘 불안했어요.",
    quote: [
      { text: "AI가 제 학습 과정의 ", highlighted: false },
      { text: "\'논리적 비약\'을 정확히 진단하고, \'개념 간의 미처 발견 못한 연결고리\'를 알려줘서, 이제는 깊이 있는 학습이 가능해졌습니다.", highlighted: true },
    ]
  },
  {
    name: 'Dr. Choi, 선임 연구원',
    title: '\'혁신적인 연구를 위한 \'새로운 관점\'이 늘 부족하다고 느꼈습니다.',
    quote: [
      { text: 'Habitus33이 기존 연구와 최신 동향을 통합하여 ', highlighted: false },
      { text: "\'가설의 맹점\'을 진단하고, \'예상치 못한 통찰\'을 제안해줘서 연구의 한계를 뛰어넘을 수 있었습니다.", highlighted: true },
    ]
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          '맹점'을 통찰로, '연결고리'를 기회로 바꾸는 사람들
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          Habitus33과 함께라면, 당신은 정보의 바다 속에서 남들이 보지 못하는 통찰을 발견하게 됩니다.
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
              "AI의 답변을 그대로 믿지 마세요. 당신의 생각으로 AI를 이끌어, 진짜 통찰을 얻으세요."
            </blockquote>
            <cite className="block mt-6 text-lg text-gray-500 not-italic">
              — AI 사용자에서, AI 통찰 설계자로 —
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
} 
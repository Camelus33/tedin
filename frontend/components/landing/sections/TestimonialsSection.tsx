import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    name: '김OO, 컴퓨터공학 대학생',
    title: '학습 가속기로 개념들이 서로 연결되어 이해가 훨씬 쉬워졌어요.',
    quote: [
      { text: '배운 개념들이 서로 어떻게 연결되는지 시각적으로 확인할 수 있어서, 복잡한 이론도 체계적으로 정리할 수 있었습니다. ', highlighted: false },
      { text: '학습 효율이 정말 3배 빨라졌어요.', highlighted: true },
      { text: ' 이제 암기보다는 이해에 집중할 수 있어요.', highlighted: false },
    ],
  },
  {
    name: '이OO, 의학전문대학원생',
    title: "AI-Link 지식캡슐 덕분에 복잡한 이론도 체계적으로 정리할 수 있었습니다.",
    quote: [
      { text: "의학 용어들이 너무 많아서 암기하기 힘들었는데, 온톨로지로 구조화하니 개념 간 관계가 명확해졌어요. ", highlighted: false },
      { text: "지식 연결력이 증진되어 창의적 아이디어가 더 많이 나오게 되었어요.", highlighted: true },
    ]
  },
  {
    name: '박OO, 디자인 대학원생',
    title: '지식 연결 강화로 창의적 아이디어가 더 많이 나오게 되었어요.',
    quote: [
      { text: '디자인 이론들을 온톨로지로 연결하니 새로운 아이디어가 자연스럽게 떠오르기 시작했어요. 기억력도 체계적으로 강화되어 ', highlighted: false },
      { text: "플래시카드 훈련으로 장기기억이 확실히 좋아졌습니다.", highlighted: true },
    ]
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          학습 가속기로 앞서가는 학습자들
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          같은 학습, 다른 결과. 그 비밀은 '지식 연결'에 있습니다.
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
              "단순한 암기가 아닌, 지식의 연결과 발전을 경험하세요."
            </blockquote>
            <cite className="block mt-6 text-lg text-gray-500 not-italic">
              — 암기에서 이해로, 이해에서 창조로 —
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
} 
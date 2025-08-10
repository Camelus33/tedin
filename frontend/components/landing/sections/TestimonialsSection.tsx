import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    name: '김OO, 연구자',
    title: '반복되는 가설 루프에서 벗어났어요',
    quote: [
      { text: '같은 시간대에 같은 메모를 반복한다는 걸 보고, ', highlighted: false },
      { text: '유사 생각 알림으로 다른 방향을 시도하게 됐습니다.', highlighted: true },
      { text: ' 결과적으로 아이디어가 더 빨리 확장돼요.', highlighted: false },
    ],
  },
  {
    name: '이OO, 엔지니어',
    title: '아키텍처 아이디어가 자연스럽게 이어져요',
    quote: [
      { text: '메모 진화 4단계로 맥락을 채우고, ', highlighted: false },
      { text: '속도·곡률 집계로 다음 단계 타이밍을 잡습니다.', highlighted: true },
      { text: ' 회의 준비 시간이 절반으로 줄었어요.', highlighted: false },
    ]
  },
  {
    name: '박OO, 수험생',
    title: '불안감이 줄고 공부가 선명해졌습니다',
    quote: [
      { text: '생각의 흐름이 보이니, ', highlighted: false },
      { text: '어떤 날에 암기가 잘 되는지 시간대 분포로 확인합니다.', highlighted: true },
      { text: ' 패턴에 맞춰 계획을 바꾸니 효율이 올라갔어요.', highlighted: false },
    ]
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          패턴이 보이면, 다음이 빨라집니다
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          반복을 줄이고, 확장을 돕는 실제 사용자들의 경험입니다.
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
              "생각의 흐름을 읽으면, 다음이 보입니다."
            </blockquote>
            <cite className="block mt-6 text-lg text-gray-500 not-italic">
              — 방향·속도·리듬을 아는 메모 —
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
} 
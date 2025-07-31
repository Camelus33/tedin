import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    name: '김OO, 토플 준비생',
    title: '영어독해 시간이 2시간 → 1시간으로 줄었어요.',
    quote: [
      { text: '토익 시험을 앞두고 영어독해에 매일 2시간씩 투자했는데도 점수가 안 올라서 고민이었어요. ', highlighted: false },
      { text: 'Time Sprint로 빠르게 핵심 문장 뽑는 데 집중했는데, 효과가 대단했어요.', highlighted: true },
      { text: ' 절약된 시간으로 다른 과목에 좀 더 투자할 수 있게 되었어요.', highlighted: false },
    ],
  },
  {
    name: '이OO, 공무원 수험생',
    title: "하루 8시간 → 5시간, 듣는 복습으로 운동도 가능",
    quote: [
      { text: "과목이 너무 많아서 까먹는게 많았죠. 하루 8시간씩 공부해도 별로 남는 게 없었죠. ", highlighted: false },
      { text: "메모카드 기능이 대박이었죠. 반복 학습 시간이 반이상 크게 줄었어요.", highlighted: true },
      { text: " 운동할 때, 들으며 복습할 수 있어 너무 좋아요.", highlighted: false },
    ]
  },
  {
    name: '박OO, 직장인 (시험준비 병행)',
    title: '자격증 공부 시간 3시간 → 1시간 30분',
    quote: [
      { text: '퇴근 후 3시간씩 자격증 공부하느라 체력이 바닥났는데, ', highlighted: false },
      { text: "단권화 노트로 복습하니 딱 반으로 줄었어요.", highlighted: true },
      { text: ' 스트레스가 준 게 제일 커요. 시간압박감이 심했거든요.', highlighted: false },
    ]
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          반으로 준 학습 시간, 스트레스도 반
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          학습 시간 단축이 합격 여부를 결정합니다.
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
              "학습 시간 단축이 곧 생산성 향상입니다."
            </blockquote>
            <cite className="block mt-6 text-lg text-gray-500 not-italic">
              — 절약된 시간으로 더 큰 성과 —
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
} 
import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: '김O현, 대학생', 
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "전공 서적만 봐도 머리가 아팠어요. 두꺼운 책들이 주는 부담감 때문에 공부 자체가 스트레스였죠. Atomic Reading으로 3분씩 핵심만 골라 읽다 보니, 부담스러운 전공공부의 부담감이 가벼워졌어요. 이제는 어려운 개념도 차근차근 이해할 수 있게 되었습니다.",
  },
  {
    id: 2,
    name: '이O준, 공시 수험생',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by-wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "행정법, 민법, 헌법... 끝없는 암기 분량에 지쳐있었어요. Memo Evolve로 작은 단위씩 정리하고 연결하다 보니, 방대한 학습분량을 소화할 수 있게 되었어요. 이제는 새로운 판례가 나와도 기존 지식과 연결해서 빠르게 이해할 수 있습니다. 양이 많아도 두렵지 않아요.",
  },
  {
    id: 3,
    name: '박O영, 직장인',
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "수시로 변하는 업무지시, 회의록, 보고서... 정신없이 쌓이는 업무들 때문에 항상 놓치는 게 있었어요. 이제는 모든 내용을 AMFA로 기록하고 AI를 이용해 나만의 업무공간을 구축했습니다. 과거 회의 내용도 즉시 찾아주고, 비슷한 업무 패턴도 알려줘서 일이 훨씬 수월해졌어요.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          공부가 이렇게 쉬워질 줄 몰랐어요
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
           AMFA로 학습의 부담을 덜고, 진짜 실력을 키운 사람들의 생생한 후기입니다.
        </p>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-8 rounded-xl shadow-lg flex flex-col border border-gray-100 relative">
              <div className="absolute top-0 left-0 -translate-x-3 -translate-y-3 text-7xl text-blue-100 opacity-80 font-serif">
                “
              </div>
              <p className="text-gray-700 mb-8 flex-grow text-base md:text-lg leading-relaxed z-10">
                {testimonial.quote}
              </p>
              <div className="flex items-center mt-auto">
                <Image 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  width={48} 
                  height={48} 
                  className="rounded-full mr-4 object-cover"
                  unoptimized
                />
                <span className="font-semibold text-gray-800">{testimonial.name}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* 브랜드 핵심 메시지 */}
        <div className="mt-20 text-center">
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-2xl md:text-3xl font-serif text-gray-700 italic leading-relaxed">
              "처음엔 반신반의했는데,<br />
              정말 달라졌어요.<br />
              이제 공부가 재미있습니다."
            </blockquote>
            <cite className="block mt-6 text-lg text-gray-500 not-italic">
              — AMFA 3개월 사용자
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
} 
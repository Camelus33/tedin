import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'J.H. Kim, 마케팅 팀장',
    title: '월말만 되면 API 비용 때문에 보고서 쓰기가 무서웠어요.',
    quote: [
      { text: '프로젝트 개요를 매번 붙여넣다 보니, 월초에 API 예산의 절반을 써버리기 일쑤였죠. 이젠 AI-Link에 단 한번만 설계해두니, ', highlighted: false },
      { text: 'API 호출이 1/3로 줄었습니다.', highlighted: true },
      { text: ' 비용 걱정 없이 AI를 마음껏 활용해요.', highlighted: false },
    ],
  },
  {
    name: 'S.Y. Park, 사회학과 3학년',
    title: "제 리포트가 'AI 복붙'처럼 보일까봐 불안했어요.",
    quote: [
      { text: "다들 AI를 쓰니 참고자료나 표현이 겹칠 수밖에 없잖아요. AI-Link에 제가 읽은 자료와 1줄메모와 생각을 넣어줬더니, 완전히 다른 관점의 글이 나왔어요. ", highlighted: false },
      { text: "'표절 걱정 없는 나만의 AI'가 생긴 기분이에요.", highlighted: true },
    ]
  },
  {
    name: 'Dr. Choi, 뇌과학 연구원',
    title: '프롬프트 입력만 30분… 진짜 연구는 시작도 못 했죠.',
    quote: [
      { text: '연구 계획서 하나 쓰려면 제 이전 연구 목록과 복잡한 실험 절차를 전부 설명해야 했어요. 그 반복 작업이 너무 지쳤는데, 이젠 AI-Link 클릭 한 번으로 끝나요. ', highlighted: false },
      { text: "프롬프팅에 쏟던 에너지를 진짜 '사고'하는 데 쓰고 있습니다.", highlighted: true },
    ]
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          설계된 AI로 앞서가는 사람들
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          같은 AI, 다른 결과. 그 비밀은 '행동 설계'에 있습니다.
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
              "AI의 생각을 빌리지 마세요. 당신의 생각으로 AI를 설계하세요."
            </blockquote>
            <cite className="block mt-6 text-lg text-gray-500 not-italic">
              — AI 사용자에서, AI 설계자로 —
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
} 
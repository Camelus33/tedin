import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    title: "논문 10개의 관계, AI가 먼저 파악해요",
    name: '대학생',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "리뷰 과제때문에 논문 14개를 읽어야 했는데, ChatGPT는 이전 내용을 기억못해서 매번 길게 프롬프팅을 했어요. 논문 주요 페이지마다 1줄 메모를 달고 AI-Link로 뽑아서 필요할 때만  링크입력하고 답변을 뽑으니 너무 편하네요.",
  },
  {
    id: 2,
    title: "회의록과 데이터를 연결해 보고서를 만들어요",
    name: '직장인',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "경영진 보고를 위해 6개월치 회의록과 운영 데이터를 분석해야 했습니다. 중요 페이지마다 1줄 메모, 메모진화 답변을 달아 AI-Link를 생성하고 NotebookL에 입력했습니다. 음성오버뷰를 봅았는데 숫자오류가 하나도 없더군요. 이건 대박맞아요!",
  },
  {
    id: 3,
    title: "두 전문 분야, AI가 넘나들며 통합해요",
    name: '연구자',
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "AI에게 나의 지식정도를 설명하는 게 가장 큰 숙제였습니다. AI가 내가 모르는 것만 답해주길 원했거든요. Habitus33으로 읽은 책별로 1줄 메모, 태그를 달아 AI-Link를 뽑고 입력했죠. 맥락추론을 하더군요. 당분간 계속 쓸 생각입니다.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          AI가 말을 잘 들어요.
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
           일일이 사실 대조하거나 다시 설명하는 것, 그리고 간간히 섞인 할루시네이션 걱정 없이 사용해요! 대박이죠.
        </p>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-8 rounded-xl shadow-lg flex flex-col border border-gray-100 relative">
              <div className="absolute top-0 left-0 -translate-x-3 -translate-y-3 text-7xl text-cyan-100 opacity-80 font-serif">
                "
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 z-10">{testimonial.title}</h3>
              <p className="text-gray-700 mb-8 flex-grow text-base leading-relaxed z-10">
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
              "불필요한 시간을 많이 아낄 수 있었어요. 만족합니다!"
            </blockquote>
            <cite className="block mt-6 text-lg text-gray-500 not-italic">
              — Habitus33
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
} 
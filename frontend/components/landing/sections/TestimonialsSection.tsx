import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    title: "논문 10개의 관계, AI가 먼저 파악해요",
    name: '대학생',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "리뷰 페이퍼 때문에 논문 10개를 읽어야 했는데, ChatGPT는 이전 내용을 기억하지 못해 힘들었어요. Habitus33으로 1줄 메모를 만들고 AI-Link를 생성해 입력하고 분석해달라고 했더니, 출처가 분명한 추론을 해줘요. 이전엔 할루시네이션때문에 다시 확인을 다해야 헸거든요. 최고죠!.",
  },
  {
    id: 2,
    title: "회의록과 데이터를 연결해 보고서를 만들어요",
    name: '직장인',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "경영진 보고를 위해 6개월치 회의록과 운영 데이터를 분석해야 했습니다. 자료마다 1줄 메모, 태그와 4단계 답변을 달아 AI-Link 뽑았어요. 질문으로 '3월 회의록에 있는 고객이탈률이 얼마야?'라고 했는데, 정확한 답이 나왔어요. 숫자 오류를 극복한거죠. 대단한거죠!.",
  },
  {
    id: 3,
    title: "두 전문 분야, AI가 넘나들며 통합해요",
    name: '연구자',
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "신경과학과 AI, 두 분야의 논문을 연결하는 게 가장 큰 숙제였습니다. AI는 관점이 오락가락 했어요. Habitus33으로 각 분야 논문을 페이지별로 1줄 메모, 태그를 달아 AI-Link를 생성했습니다. 제가 일정한 관점으로 정확히 연결해 답변합니다.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          AI가 내 생각을 읽는 것 같아요
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
           복잡한 프롬프트 작성 없이, AI와 진정한 협업을 시작한 사용자들의 실제 경험담입니다.
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
              "불필요한 시간을 많이 아낄 수 있었어요. 후회하지 않으실거에요!"
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
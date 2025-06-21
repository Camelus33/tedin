import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    title: "친구들이 '너만 뭔가 특별한 답을 받는다'고 해요",
    name: '대학생',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "같은 ChatGPT를 써도 제가 받는 답변이 확실히 달라요. AI-Link 덕분에 AI가 제 맥락을 완전히 이해하거든요. 친구들이 신기해하면서 비결을 물어보는데, 이건 제 비밀 무기예요.",
  },
  {
    id: 2,
    title: "동료들이 '어떻게 그런 통찰을 얻냐'고 물어봐요",
    name: '직장인',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "AI-Link로 만든 보고서를 보고 팀장님이 '이 수준의 분석은 컨설팅 회사 수준이다'라고 하셨어요. 같은 데이터를 봐도 제가 뽑아내는 인사이트가 다르다고 동료들이 놀라워해요.",
  },
  {
    id: 3,
    title: "AI가 제 전문성 수준에 맞춰 대화해줘요",
    name: '연구자',
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "이제 AI에게 배경 설명할 필요가 없어요. 제 연구 분야와 지식 수준을 완벽히 파악하고 그에 맞는 깊이 있는 답변을 줍니다. 마치 해당 분야 최고 전문가와 대화하는 것 같아요.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          남들이 궁금해하는 비밀
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
           같은 AI를 써도 왜 이 사람들만 다른 답변을 받을까요?
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
              "이제 저도 남들이 궁금해하는 사람이 됐어요"
            </blockquote>
            <cite className="block mt-6 text-lg text-gray-500 not-italic">
              — AI-Link 사용자들의 공통된 경험 —
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
} 
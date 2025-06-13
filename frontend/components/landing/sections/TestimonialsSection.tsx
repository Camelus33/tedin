import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: '김O현, 대학생', 
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "처음엔 3분이 너무 짧다고 생각했어요. 하지만 첫 파도를 만들어보니 정말 달랐어요. 전공서적의 어려운 개념들이 작은 돌멩이처럼 하나씩 명확해지더라고요. 이제는 깊이 있는 이해가 자연스럽게 확산되는 걸 느껴요.",
  },
  {
    id: 2,
    name: '이O준, 공시 수험생',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by-wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "방대한 법조문들을 보면서 깊은 바다에 다이브하고 싶었어데 수면에서만 맴돌고 있었어요. AMFA로 1줄 메모에서 시작한 파문들이 연결되면서, 이제는 복잡한 판례도 기존 지식과 자연스럽게 연결돼요. 진짜 깊이가 생겼어요.",
  },
  {
    id: 3,
    name: '박O영, 직장인',
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "업무에 필요한 지식들이 파편처럼 흩어져 있었는데, AI Link 단계에서 모든 게 연결되기 시작했어요. 과거 회의록에서 얻은 인사이트가 현재 프로젝트와 연결되고, 작은 메모 하나가 큰 아이디어로 확산되는 경험이 정말 신기해요.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          작은 파도가 이렇게 커질 줄 몰랐어요
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
           3분으로 시작해서 깊은 지식 바다를 만들어낸 사람들의 생생한 파도 경험담입니다.
        </p>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-8 rounded-xl shadow-lg flex flex-col border border-gray-100 relative">
              <div className="absolute top-0 left-0 -translate-x-3 -translate-y-3 text-7xl text-cyan-100 opacity-80 font-serif">
                "
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
              "처음엔 3분이었는데,<br />
              어느새 나만의 지식 바다가 생겼어요.<br />
              정말 신기해요."
            </blockquote>
            <cite className="block mt-6 text-lg text-gray-500 not-italic">
              — AMFA 파도 경험자
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
} 
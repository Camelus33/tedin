import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: '김O현, 대학생', 
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "처음엔 3분이 너무 짧다고 생각했어요. 근데 막상 해보니까 집중이 엄청 잘 되더라고요. 전공서적 읽을 때 항상 멍하니 넘어갔던 부분들이 이제는 '아, 이게 이런 뜻이구나' 하면서 이해가 돼요. 1줄 메모 쓰면서 정말 읽었다는 느낌이 들어요.",
  },
  {
    id: 2,
    name: '이O준, 공시 수험생',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "법조문 읽을 때 항상 겉핥기식으로 읽고 있다는 생각이 들었어요. 근데 메모 진화 기능 쓰면서 '이 조문이 실제로는 어떤 상황에 적용되지?' 이런 식으로 생각하게 되더라고요. 이제 판례 공부할 때도 앞에서 배운 내용이 자연스럽게 떠올라요.",
  },
  {
    id: 3,
    name: '박O영, 직장인',
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "업무 관련 책들 읽어도 당장 써먹을 수가 없어서 답답했거든요. 그런데 AI Link 기능이 정말 신기해요. 예전에 읽었던 마케팅 책 내용이 지금 하는 프로젝트랑 연결되면서 '아, 이걸 이렇게 적용할 수 있구나' 하는 순간들이 생겨요.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          3분이 이렇게 달라질 줄 몰랐어요
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
           3분으로 시작해서 진짜 변화를 경험한 사람들의 솔직한 이야기입니다.
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
              "처음엔 그냥 3분이었는데,<br />
              어느새 습관이 완전히 바뀌었어요.<br />
              만족합니다!"
            </blockquote>
            <cite className="block mt-6 text-lg text-gray-500 not-italic">
              — 실제 사용자
            </cite>
          </div>
        </div>
      </div>
    </section>
  );
} 
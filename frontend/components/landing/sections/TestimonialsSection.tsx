import React from 'react';
import Image from 'next/image'; // For placeholder images
import { FiMessageSquare } from 'react-icons/fi'; // Icon for quote

// Updated placeholder testimonial data with realistic scenarios
const testimonials = [
  {
    id: 1,
    name: '국제선 승무원 최O람', 
    image: 'https://unavatar.io/github/choiboram?fallback=https://source.unsplash.com/50x50/?portrait,flightattendant',
    quote: "국제선 승객은 각 나라 언어로 다양한 요청을 하세요. 일일이 다 외워서 전달해야 합니다. 더군다나 비즈니스 클래스의 긴 요청은 긴장의 연속이죠. 확실히 효과가 있네요. 앞으로 계속 쓸 생각입니다.",
  },
  {
    id: 2,
    name: '변호사 수험생 이O훈',
    image: 'https://unavatar.io/github/leejihoon?fallback=https://source.unsplash.com/50x50/?portrait,student,male',
    quote: "저희는 꼭 외워야 하는 조문과 판례가 많거든요. 그리고 외워도 자꾸 까먹는 것들이 있는데 이것 때문에 포기하는 선후배들을 많이 봤어요. 저는 Habitus33에 만족해요. 꾸준히 학습에 사용할 생각입니다.",
  },
  {
    id: 3,
    name: 'MIT 박사과정 박O영',
    image: 'https://unavatar.io/github/parksoyoung?fallback=https://source.unsplash.com/50x50/?portrait,student,female',
    quote: "사이버네틱스를 활용한 뇌과학기반 기억 개선앱이라 하셔서, 호기심에 한번 해봤어요. 어려운 개념인 피드백루프를 건망증 개선에 도입한 점이 놀랍죠. 건망증 있으신 분들께 권합니다. 저에게도 ^^.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
          Habitus33으로 <span className="text-indigo-600">성공을 만드는</span>사람들
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
           막연한 노력에서 벗어나 선명하게 성장을 만드세요.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col">
              <FiMessageSquare className="w-8 h-8 text-indigo-300 mb-4" />
              <p className="text-gray-600 italic mb-6 flex-grow text-base md:text-base">"{testimonial.quote}"</p>
              <div className="flex items-center mt-auto pt-4 border-t border-gray-200">
                <Image 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  width={40} 
                  height={40} 
                  className="rounded-full mr-3"
                  unoptimized // Keep this if external image optimization is not configured
                />
                <span className="font-semibold text-gray-700">{testimonial.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 
import React from 'react';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: '최O람, 국제선 승무원', 
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "불규칙한 비행 스케줄 탓에 외국어 공부는 늘 뒷전이었어요. '오늘도 피곤하니 내일부터' 하던 날들이었죠. Habitus33의 'Atomic Reading'은 그런 제게 딱 맞는 처방이었어요. 짧지만 강한 몰입으로 다시 공부 리듬을 찾았고, 이 작은 습관이 지금은 가장 큰 무기가 되었습니다.",
  },
  {
    id: 2,
    name: '이O훈, 변호사 수험생',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "몇 시간씩 책상에 앉아도 머리에 남는 게 없어 슬럼프가 왔었어요. '나만의 리듬'을 찾으라는 말이 처음엔 막연했는데, TS 모드로 제 집중력 패턴을 확인하고는 무릎을 쳤습니다. 긴 시간이 아니라, 저에게 맞는 짧은 호흡의 반복이 정답이었어요. 이젠 조급함 대신 제 페이스대로 꾸준히 나아갑니다.",
  },
  {
    id: 3,
    name: '박O영, 데이터 과학자',
    image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    quote: "수많은 논문을 읽고 연결하는 게 일인데, 정보의 홍수 속에서 길을 잃기 일쑤였죠. Habitus33의 '메모 진화'는 단순한 기록을 넘어, 제 머릿속 지식들을 엮어주는 '생각의 허브'가 되었어요. 작은 메모 하나를 '진화'시키는 노력이 쌓여, 흩어져 있던 아이디어들이 하나의 통찰로 연결되는 순간을 경험합니다.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-6">
          당신과 같은 길을 걷는 사람들
        </h2>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
           작은 노력으로 자신만의 리듬을 발견하고, 성장의 즐거움을 경험한 실제 후기입니다.
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
      </div>
    </section>
  );
} 
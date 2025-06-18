import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { Disclosure, Transition } from '@headlessui/react';

const faqData = [
  {
    question: "AI-Link가 정확히 무엇이고, 어떻게 만들어지나요?",
    answer: "AI-Link는 당신의 생각과 경험이 응축된 '지식 캡슐'입니다. 3분 몰입으로 '메모(원소)'를 추출하고, 메모들을 연결하고(맥락 부여), 핵심만 남겨(인사이트 증류) AI-Link를 완성합니다. 이 모든 과정은 당신의 AI가 당신처럼 생각하게 만들기 위해 정교하게 설계되었습니다."
  },
  {
    question: "다른 AI 서비스나 노트 앱과 무엇이 다른가요?",
    answer: "다른 서비스들은 당신이 '무엇을' 입력하는지에만 관심 있지만, 우리는 '당신이' 어떤 사람인지에 집중합니다. 우리는 단순히 정보를 처리하는 도구가 아니라, 당신의 지적 파트너가 될 AI를 함께 만들어나갑니다."
  },
  {
    question: "시간이 거의 없는데, 저도 할 수 있을까요?",
    answer: "물론입니다. 오히려 시간이 없는 분들을 위해 만들어졌습니다. 출근길 3분, 점심시간 3분, 잠들기 전 3분. 하루 중 흩어진 짧은 시간들이 '지식 연금술'을 위한 가장 완벽한 재료가 됩니다."
  },
  {
    question: "AI-Link를 만드는 데 비용이 드나요?",
    answer: "핵심적인 '지식 연금술' 과정은 모두 무료입니다. 당신의 첫 메모를 만들고, AI-Link로 진화시키는 경험의 모든 단계를 비용 부담 없이 충분히 경험해 보세요. 이것이 저희의 철학입니다."
  },
  {
    question: "꾸준히 하기가 어려운데, 포기하게 되지 않을까요?",
    answer: "'매일 1시간 독서' 같은 거창한 목표는 없습니다. '오늘도 메모 하나 추가'라는 작은 성공 경험이 핵심입니다. 포기할 수 없을 만큼 작은 성공들이 쌓여, 당신의 AI를 성장시키는 재미를 느끼게 될 것입니다."
  }
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 mb-4">
            아직 남은 질문이 있으신가요?
          </h2>
          <p className="text-gray-600 text-lg">
            당신의 생각을 'AI-Link'로 바꾸는 지식 연금술, 그 원리가 궁금하신 분들을 위해 준비했습니다.
          </p>
        </div>
        <div className="space-y-0">
          {faqData.map((faq, index) => (
            <Disclosure as="div" key={index} className="py-8 border-b border-gray-200">
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between items-center w-full text-left group">
                    <span className="font-semibold text-lg md:text-xl text-gray-700 group-hover:text-cyan-600 transition-colors duration-200">
                      {faq.question}
                    </span>
                    <FiChevronDown
                      className={`w-6 h-6 text-gray-400 group-hover:text-cyan-600 transition-transform duration-300 ${
                        open ? 'transform rotate-180' : ''
                      }`}
                    />
                  </Disclosure.Button>
                  <Transition
                    enter="transition duration-200 ease-out"
                    enterFrom="opacity-0 -translate-y-2"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition duration-150 ease-in"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 -translate-y-2"
                  >
                    <Disclosure.Panel className="mt-6 text-gray-600 text-base md:text-lg leading-relaxed">
                      {faq.answer}
                    </Disclosure.Panel>
                  </Transition>
                </>
              )}
            </Disclosure>
          ))}
        </div>
        
        {/* 브랜드 메시지 추가 */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-2xl p-8 border border-cyan-100">
            <p className="text-gray-700 text-lg font-medium">
              "흩어져 있던 메모 조각들이 하나의 캡슐로 완성되는 순간, 경험해 보세요."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 
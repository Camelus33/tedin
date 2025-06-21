import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { Disclosure, Transition } from '@headlessui/react';

const faqData = [
  {
    question: "정말 남들과 다른 답변을 받을 수 있나요?",
    answer: "네, 확실히 다릅니다. 같은 ChatGPT를 써도 AI-Link 사용자들은 완전히 다른 수준의 답변을 받습니다. AI가 당신의 맥락과 전문성을 완벽히 이해하기 때문에, 마치 해당 분야 최고 전문가와 대화하는 것 같은 경험을 하게 됩니다."
  },
  {
    question: "다른 사람들이 정말 '어떻게 그런 답을 받냐'고 물어보나요?",
    answer: "실제 사용자들의 공통된 경험입니다. 친구들이 '너만 뭔가 특별한 답을 받는다', 동료들이 '어떻게 그런 통찰을 얻냐'고 신기해합니다. 이건 우연이 아니라, AI-Link가 만드는 확실한 차별화의 결과입니다."
  },
  {
    question: "복잡하거나 어렵지 않나요?",
    answer: "전혀 복잡하지 않습니다. 깊게 집중한 순간 떠오른 한 줄 메모에서 시작해서, 생각을 연결하고, 완성된 이야기로 만드는 자연스러운 과정입니다. 누구나 쉽게 따라할 수 있도록 직관적으로 설계되었습니다."
  },
  {
    question: "무료로 정말 모든 기능을 사용할 수 있나요?",
    answer: "핵심 기능은 모두 무료입니다. AI가 당신을 완전히 이해하고, 맞춤형 답변을 제공하는 모든 과정을 비용 부담 없이 경험하실 수 있습니다. 먼저 그 놀라운 차이를 직접 느껴보세요."
  },
  {
    question: "바로 효과를 볼 수 있나요?",
    answer: "첫 번째 AI-Link를 만드는 순간부터 차이를 느끼실 겁니다. AI가 당신의 맥락을 이해하고 답변하는 모습을 보면 '아, 이게 바로 그 차이구나'라고 깨닫게 됩니다. 많은 사용자들이 첫 경험에서 감탄합니다."
  }
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 mb-4">
            마지막 의구심을 해결해 드릴게요
          </h2>
          <p className="text-gray-600 text-lg">
            "정말 남들과 다른 답변을 받을 수 있을까?" 궁금한 모든 것을 솔직하게 답변드립니다.
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
              "더 이상 의심하지 마세요. 그 차이를 직접 경험해 보세요."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 
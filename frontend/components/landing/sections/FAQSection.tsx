import React from 'react';
import { FiChevronDown } from 'react-icons/fi'; // FiHelpCircle 아이콘 제거
import { Disclosure, Transition } from '@headlessui/react';

const faqData = [
  {
    question: "Atomic Reading (3분 11페이지)은 어떤 원리이고, 어떻게 도움이 되나요?",
    answer: "Atomic Reading은 '습관은 작게 시작해야 꾸준할 수 있다'는 원리에 기반합니다. 3분이라는 짧은 시간과 11페이지(평균 독서 속도 기준)라는 명확한 목표는 독서에 대한 심리적 부담을 낮춰줍니다. 이를 통해 '작은 성공'을 매일 경험하며, 뇌가 독서를 부담스러운 일이 아닌 즐거운 습관으로 받아들이도록 돕습니다. 목표는 속도가 아닌, '나만의 학습 리듬'을 만드는 첫걸음입니다."
  },
  {
    question: "‘나만의 학습 리듬’을 찾는 것이 왜 중요한가요?",
    answer: "모든 사람에게 맞는 '완벽한 공부법'은 없습니다. 중요한 것은 나의 뇌가 가장 활성화되는 최적의 패턴을 아는 것입니다. Habitus33은 TS(Thought Sprints) 모드를 통해 당신의 정보 처리 속도와 집중력 변화를 객관적인 데이터로 보여줍니다. 이 데이터를 통해 '나만의 리듬'을 발견하고, 이를 바탕으로 학습 효율을 극대화하는 것이 저희 서비스의 핵심 목표입니다."
  },
  {
    question: "ZenGo는 구체적으로 어떤 기능이며, 학습에 어떻게 활용되나요?",
    answer: "ZenGo는 정보를 일시적으로 붙잡아두는 '작업 기억력(Working Memory)'을 단련시키는 도구입니다. 작업 기억력은 독해, 암기, 문제 해결 능력의 바탕이 되는 핵심 인지 기능입니다. ZenGo를 통해 어려운 개념이나 꼭 외워야 할 정보를 게임처럼 즐겁게 훈련하며, 뇌의 '코어 근육'과 같은 작업 기억 용량을 효과적으로 늘릴 수 있습니다."
  },
  {
    question: "‘메모 진화’는 일반적인 메모와 무엇이 다른가요?",
    answer: "단순한 기록을 넘어, 지식의 '체화'를 돕는 과정입니다. '메모 진화'는 4단계의 구조화된 질문을 통해 새로운 정보를 나의 기존 지식과 연결하고, 그 의미를 되새기며, 나아가 어떻게 적용할지 생각하도록 돕습니다. 이는 수동적인 정보 수집을 능동적인 지혜로 바꾸는 강력한 피드백 루프를 만듭니다."
  },
  {
    question: "서비스가 분석해주는 '인지 능력'에는 구체적으로 어떤 것들이 있나요?",
    answer: "Habitus33은 두 가지 핵심 인지 능력을 측정하고 시각화합니다. 첫째, '정보 처리 속도(PPM, Pages Per Minute)'로, TS 모드를 통해 당신이 얼마나 빠르고 꾸준하게 정보를 처리하는지 분석합니다. 둘째, '작업 기억 용량'으로, ZenGo를 통해 당신이 한 번에 얼마나 많은 정보를 효과적으로 처리할 수 있는지 측정합니다. 대시보드는 이 두 능력의 변화를 한눈에 보여주는 당신만의 '두뇌 컨디션 리포트'입니다."
  },
  {
    question: "다른 학습 관리나 두뇌 훈련 앱과 Habitus33은 무엇이 다른가요?",
    answer: "대부분의 앱이 '무엇을' 배울지(콘텐츠)에 집중하거나, 단순한 두뇌 게임을 제공합니다. Habitus33은 '어떻게' 배우는지(학습 과정 자체)에 집중합니다. 우리는 당신의 뇌가 정보를 받아들이고 처리하는 근본적인 메커니즘, 즉 '피드백 루프'를 이해하고 개선하도록 돕는 '인지 코치'입니다. 당신의 잠재력을 최대로 끌어내는 학습 엔진을 만드는 것이 우리의 차별점입니다."
  },
  {
    question: "평생 무료로 제공되는 핵심 기능은 어디까지인가요?",
    answer: "학습 피드백 루프를 구축하고 경험하는 핵심 기능은 평생 무료입니다. 여기에는 '정보 처리 속도 측정(TS 모드)', '작업 기억 용량 측정(ZenGo 기본)', 그리고 이 모든 변화를 추적하는 '개인 대시보드'가 포함됩니다. 루프를 점검하고 기본적인 선순환을 만드는 경험은 추가 비용 없이 충분히 가능합니다."
  },
  {
    question: "ZenGo 마이버스(프리미엄)는 언제 필요한가요?",
    answer: "핵심 기능으로 기본적인 피드백 루프 개선을 경험한 후, 특정 목표(시험 과목 암기, 업무 지식 습득 등)를 위해 '잊지 말아야 할 정보'를 직접 게임 콘텐츠로 만들어 더욱 강력하고 맞춤화된 기억 훈련을 하고 싶을 때 유용합니다. DIY 기억 도구라고 생각하시면 됩니다."
  },
  {
    question: "측정된 제 데이터는 안전하게 관리되나요?",
    answer: "네, 사용자의 개인 정보와 측정 데이터는 최신 보안 기술을 적용하여 안전하게 관리됩니다. 데이터는 서비스 개선 및 개인 맞춤 피드백 제공 목적으로만 활용되며, 관련 법규 및 규정을 엄격히 준수합니다. 자세한 내용은 개인정보처리방침을 참고해주세요."
  }
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 text-center mb-16">
          자주 묻는 질문
        </h2>
        <div className="space-y-0">
          {faqData.map((faq, index) => (
            <Disclosure as="div" key={index} className="py-8 border-b border-gray-200">
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between items-center w-full text-left group">
                    <span className="font-semibold text-lg md:text-xl text-gray-700 group-hover:text-blue-600 transition-colors duration-200">
                      {faq.question}
                    </span>
                    <FiChevronDown
                      className={`w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-transform duration-300 ${
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
      </div>
    </section>
  );
} 
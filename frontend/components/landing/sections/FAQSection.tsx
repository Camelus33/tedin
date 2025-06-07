import React from 'react';
import { FiHelpCircle, FiChevronDown } from 'react-icons/fi'; // Icons for FAQ
import { Disclosure, Transition } from '@headlessui/react';

const faqData = [
  {
    question: "'작업 기억력 피드백 루프'가 정확히 무엇인가요?",
    answer: "정보를 받아들이고(입력), 처리하며(작업 기억력 작동), 그 결과를 바탕으로 다음 행동이나 생각을 조절하는(피드백) 일련의 과정을 의미합니다. 이 루프가 얼마나 효율적으로 작동하는지가 학습, 업무, 일상생활의 성과에 큰 영향을 미칩니다."
  },
  {
    question: "피드백 루프의 '악순환'과 '선순환'은 어떻게 다른가요?",
    answer: "'악순환'은 정보 처리(속도/용량)가 비효율적이어서 부정적인 결과(실수, 낮은 이해도)를 낳고, 이것이 다시 스트레스나 자신감 하락으로 이어져 다음 정보 처리를 더 방해하는 상태입니다. 반면 '선순환'은 정확한 측정과 인지를 통해 정보 처리를 효율화하고 긍정적인 결과(성공, 성취감)를 만들어, 이것이 동기 부여가 되어 루프 전체를 더욱 강화시키는 상태입니다."
  },
  {
    question: "이 서비스는 과학적 근거가 있나요?",
    answer: "Habitus33은 작업 기억력, 인지 부하 이론, 피드백 루프 등 신경과학 및 인지심리학의 연구 결과를 기반으로 설계되었습니다. 특히 '측정-인지-개선'의 과정은 목표 달성 및 습관 형성에 효과적인 과학적 원리에 기반합니다."
  },
  {
    question: "TS 모드와 ZenGo가 피드백 루프 개선에 어떻게 도움이 되나요?",
    answer: "TS 모드는 정보 처리 '속도'를, ZenGo는 '용량'을 객관적으로 측정하여 사용자가 자신의 루프 상태를 정확히 '인지'하도록 돕습니다. 자신의 약점을 파악하고 개선되는 과정을 데이터로 확인하는 것 자체가 강력한 '피드백'이 되어 루프를 선순환으로 전환하는 핵심 동력이 됩니다."
  },
   {
    question: "왜 33일인가요? 정말 33일이면 효과가 있나요?",
    answer: "새로운 길이 익숙해지려면 시간이 필요하듯, 우리 뇌에 새로운 학습 리듬이 자리 잡는 데에도 꾸준한 시간이 필요합니다. 33일은 완성이 아닌, 의미 있는 '변화의 시작'을 경험하기에 충분한 시간입니다. 중요한 것은 숫자가 아닌, '어제의 나보다 조금 더 나아졌다'는 감각을 꾸준히 느끼는 것입니다."
  },
  {
    question: "매일 사용해야 하나요? 바쁘면 건너뛰어도 되나요?",
    answer: "매일 꾸준히 하는 것이 가장 효과적이지만, 강박을 가질 필요는 없습니다. 중요한 것은 자신의 상태를 주기적으로 '측정'하고 '인지'하는 습관을 만드는 것입니다. 건너뛴 날이 있더라도 다시 시작하여 꾸준함을 유지하는 것이 좋습니다."
  },
  {
    question: "다른 두뇌 훈련 게임 앱과 무엇이 다른가요?",
    answer: "대부분의 게임이 '점수'를 목표로 한다면, Habitus33은 '과정'에 집중합니다. 우리는 당신이 게임을 통해 자신의 인지 상태를 이해하고, 그 이해를 바탕으로 실생활의 학습에서 더 깊은 집중을 경험하도록 돕는 '가이드'입니다. 게임은 목적이 아닌, 당신의 성장을 돕는 즐거운 도구입니다."
  },
  {
    question: "무료 핵심 기능에는 정확히 무엇이 포함되나요?",
    answer: "작업 기억력 피드백 루프의 핵심 요소인 '정보 처리 속도 측정(TS 모드)', '작업 기억 용량 측정(ZenGo 기본)', 그리고 이 측정 결과들을 확인하고 변화를 추적할 수 있는 '33일 리포트 대시보드' 기능이 평생 무료로 제공됩니다. 루프 점검과 기본적인 선순환 구축 경험은 무료로 충분히 가능합니다."
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
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-brand-primary text-center mb-12">
          자주 묻는 질문
        </h2>
        <div className="space-y-6">
          {faqData.map((faq, index) => (
            <Disclosure as="div" key={index} className="p-6 border border-gray-200 rounded-lg bg-brand-secondary">
              {({ open }) => (
                <>
                  <Disclosure.Button className="flex justify-between items-center w-full text-left">
                    <span className="font-semibold text-lg text-gray-900">{faq.question}</span>
                    <FiChevronDown
                      className={`${
                        open ? 'transform rotate-180' : ''
                      } w-5 h-5 text-brand-primary transition-transform`}
                    />
                  </Disclosure.Button>
                  <Transition
                    enter="transition duration-100 ease-out"
                    enterFrom="transform scale-95 opacity-0"
                    enterTo="transform scale-100 opacity-100"
                    leave="transition duration-75 ease-out"
                    leaveFrom="transform scale-100 opacity-100"
                    leaveTo="transform scale-95 opacity-0"
                  >
                    <Disclosure.Panel className="mt-4 text-gray-700">
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
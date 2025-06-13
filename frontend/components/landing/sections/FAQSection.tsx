import React from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { Disclosure, Transition } from '@headlessui/react';

const faqData = [
  {
    question: "3분 읽고 1줄 메모가 정말 효과가 있나요?",
    answer: "네, 매우 효과적입니다! 핵심은 '많이 읽기'가 아니라 '깊이 사고하기'입니다. 3분 동안 집중해서 읽고, 그 내용을 1줄로 압축하는 과정에서 진짜 이해가 일어납니다. 이 작은 물방울 같은 메모가 연결되고 확장되면서 상상을 넘어서는 깊이의 학습 파도가 시작되죠."
  },
  {
    question: "다른 독서 앱들과 뭐가 다른가요?",
    answer: "대부분의 앱은 '더 많이, 더 빨리' 읽으라고 합니다. 하지만 우리는 '당신의 속도로, 작게 시작하라'고 말합니다. 다른 사람과 비교하지 않고, 오직 어제의 나와만 비교합니다. 부담스러운 목표 대신 '오늘도 3분만' 이라는 작은 약속으로 시작하세요."
  },
  {
    question: "메모 진화가 일반 메모와 어떻게 다른가요?",
    answer: "일반 메모는 '기록'에 그치지만, 메모 진화는 '성장'입니다. 4단계 질문을 통해 읽은 내용이 내 경험과 연결되고, 새로운 아이디어로 발전합니다. '아, 이 내용이 저번에 겪었던 일과 비슷하네'라는 깨달음의 순간들이 쌓여가죠."
  },
  {
    question: "ZenGo는 게임인가요, 학습 도구인가요?",
    answer: "둘 다입니다! 게임처럼 재미있지만 뇌의 '작업 기억력'을 키우는 진짜 훈련입니다. 복잡한 내용을 머릿속에서 정리하고 기억하는 능력이 늘어나면, 공부할 때 '머리가 맑아진 느낌'을 경험하게 됩니다."
  },
  {
    question: "정말 나만의 학습 리듬을 찾을 수 있나요?",
    answer: "네, 데이터가 보여줍니다. TS 모드를 통해 언제, 어떤 방식으로 읽을 때 가장 집중이 잘 되는지 객관적으로 확인할 수 있어요. '아침형인 줄 알았는데 저녁에 더 집중이 잘 되네?'같은 새로운 발견을 하게 됩니다."
  },
  {
    question: "무료로 어디까지 사용할 수 있나요?",
    answer: "핵심 기능은 평생 무료입니다! 3분 독서 측정, 기본 메모 진화, 개인 성장 대시보드까지 무료로 이용하세요. '이 정도면 충분히 변화를 경험할 수 있다'는 게 저희 철학입니다. 더 깊이 있는 기능이 필요할 때만 프리미엄을 고려하시면 됩니다."
  },
  {
    question: "바쁜 직장인도 정말 할 수 있을까요?",
    answer: "오히려 바쁜 분들에게 더 효과적입니다. 출근길 지하철 3분, 점심시간 3분, 잠들기 전 3분... 하루 중 3분은 언제든 찾을 수 있거든요. '시간이 없어서 못 읽었다'는 핑계가 사라지고, '오늘도 해냈다'는 성취감을 매일 느끼게 됩니다."
  },
  {
    question: "학습 효과가 정말 있나요?",
    answer: "작은 변화부터 시작됩니다. '책 읽기가 이렇게 쉬웠나?'라는 경험이 첫 번째 변화입니다. 그 다음엔 '내가 이런 생각을 할 수 있구나'하는 메모 진화의 경험, 마지막엔 '복잡한 내용도 정리가 되네'하는 인지 능력 향상을 체감하게 됩니다."
  },
  {
    question: "중도에 포기하지 않을 수 있을까요?",
    answer: "포기할 이유가 없어집니다. 3분이라는 작은 목표, 매일의 작은 성취, 나만의 속도 존중... 이 모든 것이 '계속하고 싶게' 만듭니다. '오늘은 못했네'가 아니라 '내일은 3분만 더'라는 마음이 들게 되죠."
  }
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-800 mb-4">
            궁금한 게 있으시죠?
          </h2>
          <p className="text-gray-600 text-lg">
            처음 파도를 만들기 전에는 다들 이런 걸 궁금해하세요. 작은 물방울로 시작해보면 생각보다 자연스러워요.
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
            <p className="text-gray-700 text-lg font-medium mb-2">
              "처음엔 3분이었는데, 어느새 나만의 지식 바다가 생겼어요. 정말 신기해요."
            </p>
            <p className="text-cyan-600 text-sm font-medium">
              — AMFA 파도 경험자
            </p>
          </div>
        </div>
      </div>
    </section>
  );
} 
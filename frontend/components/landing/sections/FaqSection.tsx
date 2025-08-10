import React from 'react';

const faqs = [
  {
    q: '생각 패턴은 어떻게 계산하나요?',
    a: '메모/인라인/연결/진화의 타임스탬프와 텍스트 임베딩을 사용합니다. 임베딩이 가능하면 코사인 유사도, 불가 시 자카드 폴백으로 유사도를 계산하며, 속도(의미 이동/시간), 곡률(방향 전환), 리듬(간격의 평균·표준편차·CV), 시간대·요일 분포를 집계합니다.'
  },
  {
    q: '개인정보와 보안은 안전한가요?',
    a: '모든 분석은 인증된 사용자 범위에서만 이루어지며, 서버 환경변수에 저장된 키를 통해 임베딩이 수행됩니다. 사용자는 본인 데이터만 조회할 수 있으며, 설정에서 알림을 개별 제어하도록 확장할 예정입니다.'
  },
  {
    q: '유사/반복 생각 알림을 끌 수 있나요?',
    a: '마일스톤 토스트와 유사 생각 제안은 비침투적 디자인이 원칙입니다. 알림 설정(온/오프, 빈도)을 제공하며, 기본값은 최소 알림으로 운영합니다.'
  },
  {
    q: '학습 시간 단축과 어떤 관계가 있나요?',
    a: '반복되는 생각을 감지하고 흐름을 수치화하면, 다음 행동이 빨라집니다. 연결과 진화가 자동으로 제안되어 “생각 정리→확장→집중” 루프가 짧아지고, 실제 체감 시간을 줄입니다.'
  },
  {
    q: '어디서 결과를 볼 수 있나요?',
    a: '프론트의 /analytics 화면에서 최근 N일 집계(속도·곡률·리듬·시간대/요일)를 확인할 수 있습니다. 메모 편집 화면에서는 마일스톤 달성 시 토스트 안내가 표시됩니다.'
  }
];

export default function FaqSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 text-center mb-6">자주 묻는 질문</h2>
        <p className="text-lg text-gray-600 text-center mb-12">생각의 패턴과 방향을 추적하는 방식과 운영 방식을 소개합니다.</p>
        <div className="space-y-6">
          {faqs.map((item) => (
            <details key={item.q} className="group bg-gray-50 rounded-xl border border-gray-100 p-5 open:shadow">
              <summary className="cursor-pointer select-none font-semibold text-gray-800 flex items-center justify-between">
                <span>{item.q}</span>
                <span className="ml-4 text-indigo-500 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <div className="mt-3 text-gray-600 leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
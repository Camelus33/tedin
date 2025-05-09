import React from "react";

export default function TermsOfServicePage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Terms of Service / 이용약관</h1>
      {/* 영문 버전 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">[EN] Terms of Service</h2>
        <ol className="list-decimal pl-6 space-y-4 text-sm">
          <li>
            <strong>Purpose</strong>
            <p>These terms govern the use of Habitus33 ("Company") services, define the rights and obligations of members and the company, the scope of data and content utilization, and other necessary matters.</p>
          </li>
          <li>
            <strong>Definitions</strong>
            <ul className="list-disc pl-6">
              <li>"Service": All web/mobile-based services provided by the company, including brain optimization, reading habits, cognitive training, community, payment, etc.</li>
              <li>"Member": A person who agrees to these terms and registers for the service</li>
              <li>"Operator/Clan Leader": A member who creates and manages a community/study group</li>
              <li>"Content": All text, images, data, games, AI outputs, etc. provided or created within the service</li>
            </ul>
          </li>
          <li>
            <strong>Effect and Amendment of Terms</strong>
            <ul className="list-disc pl-6">
              <li>These terms take effect by being posted on the service screen or otherwise notified.</li>
              <li>The company may amend the terms within the scope not violating relevant laws, and will notify in advance when changes are made.</li>
            </ul>
          </li>
          <li>
            <strong>Membership and Management</strong>
            <ul className="list-disc pl-6">
              <li>Members may join after agreeing to the terms.</li>
              <li>Members must keep their information accurate and up to date.</li>
              <li>Withdrawal, suspension, and forced withdrawal are regulated.</li>
            </ul>
          </li>
          <li>
            <strong>Use of Service & Data Utilization</strong>
            <ul className="list-disc pl-6">
              <li>The service is provided year-round in principle, and some services (paid/premium, etc.) may require separate payment.</li>
              <li>Member data (reading, cognitive training, notes, community activity, etc.) may be used for statistics, service improvement, AI training, personalized feedback, and research in anonymized/pseudonymized form.</li>
              <li>Content posted by members (notes, community posts, etc.) may be used for service operation, promotion, AI training, statistics, research, etc., and members agree to this.</li>
              <li>Consent for content utilization may be withdrawn at any time, and upon withdrawal, related data will be deleted or anonymized immediately.</li>
            </ul>
          </li>
          <li>
            <strong>Prohibited Acts</strong>
            <ul className="list-disc pl-6">
              <li>No identity theft, illegal acts, service disruption, copyright infringement, AI abuse, or misuse</li>
              <li>Respect for healthy communication and others' rights in the community</li>
            </ul>
          </li>
          <li>
            <strong>Operator/Clan Leader Rights and Responsibilities</strong>
            <ul className="list-disc pl-6">
              <li>Community management, member approval/sanction, content management, etc.</li>
              <li>Abuse of operator rights may result in restriction or suspension of service use</li>
            </ul>
          </li>
          <li>
            <strong>Payment, Refund, Subscription, etc.</strong>
            <ul className="list-disc pl-6">
              <li>Paid service payment, refund, and subscription cancellation are subject to separate policies.</li>
              <li>Payment details and refund conditions are provided separately within the service.</li>
            </ul>
          </li>
          <li>
            <strong>Copyright and Intellectual Property</strong>
            <ul className="list-disc pl-6">
              <li>Copyright of the service and proprietary content belongs to the company or rightful owners.</li>
              <li>Copyright of content before posting belongs to the member, but all content displayed through the service is owned by the company. Members are deemed to have agreed to the use of such content for service operation, promotion, AI training, statistics, research, etc., as necessary for stable service.</li>
              <li>Members must not infringe the copyrights or other rights of others or the company.</li>
            </ul>
          </li>
          <li>
            <strong>Disclaimer and Limitation of Liability</strong>
            <ul className="list-disc pl-6">
              <li>The company is not responsible for service failures due to force majeure, member fault, etc.</li>
              <li>Disputes between members or between members and operators are, in principle, resolved by the parties themselves.</li>
              <li>AI outputs, statistics, and recommendations are for reference only, and the company is not legally responsible for their accuracy or suitability.</li>
            </ul>
          </li>
          <li>
            <strong>Dispute Resolution and Governing Law</strong>
            <ul className="list-disc pl-6">
              <li>The company strives for prompt and fair resolution of disputes.</li>
              <li>The laws of the Republic of Korea apply.</li>
            </ul>
          </li>
          <li>
            <strong>Other</strong>
            <ul className="list-disc pl-6">
              <li>Matters not specified in these terms are governed by relevant laws and company policies.</li>
              <li>Changes to the terms will be notified in advance, and continued use of the service after changes constitutes agreement to the revised terms.</li>
            </ul>
          </li>
        </ol>
        <p className="mt-8 text-xs text-gray-500">
          These terms are effective as of June 1, 2024.
        </p>
      </section>
      {/* 국문 버전 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">[국문] 이용약관</h2>
        <ol className="list-decimal pl-6 space-y-4 text-sm">
          <li>
            <strong>목적</strong>
            <p>본 약관은 Habitus33(이하 "회사")가 제공하는 서비스의 이용조건, 회원과 회사의 권리·의무, 데이터 및 콘텐츠 활용범위, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
          </li>
          <li>
            <strong>정의</strong>
            <ul className="list-disc pl-6">
              <li>"서비스": 회사가 제공하는 뇌 최적화, 독서 습관, 인지 훈련, 커뮤니티, 결제 등 웹/모바일 기반 서비스 일체</li>
              <li>"회원": 본 약관에 동의하고 서비스에 가입한 자</li>
              <li>"운영자/클랜장": 커뮤니티/스터디 그룹을 생성·운영하는 회원</li>
              <li>"콘텐츠": 서비스 내 제공 또는 회원이 생성한 텍스트, 이미지, 데이터, 게임, AI 결과물 등 일체</li>
            </ul>
          </li>
          <li>
            <strong>약관의 효력 및 변경</strong>
            <ul className="list-disc pl-6">
              <li>본 약관은 서비스 화면에 게시하거나 기타 방법으로 공지함으로써 효력이 발생합니다.</li>
              <li>회사는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 사전 공지합니다.</li>
            </ul>
          </li>
          <li>
            <strong>회원가입 및 관리</strong>
            <ul className="list-disc pl-6">
              <li>회원은 약관 동의 후 가입할 수 있습니다.</li>
              <li>회원정보의 정확성 및 최신성 유지 의무가 있습니다.</li>
              <li>회원 탈퇴, 자격정지, 강제탈퇴 등 규정이 적용됩니다.</li>
            </ul>
          </li>
          <li>
            <strong>서비스의 이용 및 데이터 활용</strong>
            <ul className="list-disc pl-6">
              <li>서비스는 연중무휴 제공을 원칙으로 하며, 일부 서비스(유료/프리미엄 등)는 별도 결제가 필요할 수 있습니다.</li>
              <li>회원의 서비스 이용 데이터(독서, 인지 훈련, 메모, 커뮤니티 활동 등)는 통계, 서비스 개선, AI 학습, 맞춤형 피드백, 연구 등에 익명/가명화하여 활용될 수 있습니다.</li>
              <li>회원이 서비스 내 게시한 콘텐츠(메모, 커뮤니티 글 등)는 서비스 운영, 홍보, AI 학습, 통계, 연구 등 목적으로 활용될 수 있으며, 회원은 이에 동의합니다.</li>
              <li>콘텐츠 활용에 대한 동의는 언제든지 철회할 수 있으며, 철회 시 관련 데이터는 즉시 삭제 또는 익명화 처리됩니다.</li>
            </ul>
          </li>
          <li>
            <strong>금지행위</strong>
            <ul className="list-disc pl-6">
              <li>타인 정보 도용, 불법행위, 서비스 방해, 저작권 침해, AI 악용, 부정 이용 등 금지</li>
              <li>커뮤니티 내 건전한 소통 및 타인 권리 존중</li>
            </ul>
          </li>
          <li>
            <strong>운영자/클랜장 권한 및 책임</strong>
            <ul className="list-disc pl-6">
              <li>커뮤니티 관리, 멤버 승인/제재, 콘텐츠 관리 등</li>
              <li>운영자 권한 남용 시 제한 및 서비스 이용 정지 가능</li>
            </ul>
          </li>
          <li>
            <strong>결제, 환불, 구독 등</strong>
            <ul className="list-disc pl-6">
              <li>유료 서비스 결제, 환불, 구독 해지 등은 별도 정책에 따릅니다.</li>
              <li>결제 내역, 환불 조건 등은 서비스 내 별도 안내합니다.</li>
            </ul>
          </li>
          <li>
            <strong>저작권 및 지적재산권</strong>
            <ul className="list-disc pl-6">
              <li>서비스 및 자체 제공 콘텐츠의 저작권은 회사 또는 정당한 권리자에 귀속됩니다.</li>
              <li>회원이 서비스 내 게시하기 전 콘텐츠 내용에 대한 저작권은 회원에게 있으나 본 서비스를 이용해 표시되는 모든 콘텐츠에 대한 저작권은 본 사에 귀속됩니다. 또한 안정적 서비스를 위해 필요한 서비스 운영, 홍보, AI 학습, 통계, 연구 등 목적 내 사용에 동의한 것으로 간주합니다.</li>
              <li>회원은 타인 및 본 사의 저작권 등 권리를 침해해서는 안 됩니다.</li>
            </ul>
          </li>
          <li>
            <strong>면책 및 책임 제한</strong>
            <ul className="list-disc pl-6">
              <li>회사는 천재지변, 불가항력, 회원 귀책 사유 등으로 인한 서비스 장애에 책임지지 않습니다.</li>
              <li>회원 간, 회원-운영자 간 분쟁은 원칙적으로 당사자 간 해결합니다.</li>
              <li>AI 결과물, 통계, 추천 등은 참고용이며, 회사는 그 정확성·적합성에 대해 법적 책임을 지지 않습니다.</li>
            </ul>
          </li>
          <li>
            <strong>분쟁 해결 및 준거법</strong>
            <ul className="list-disc pl-6">
              <li>분쟁 발생 시 회사는 신속하고 공정한 처리를 위해 노력합니다.</li>
              <li>대한민국 법령을 준거법으로 합니다.</li>
            </ul>
          </li>
          <li>
            <strong>기타</strong>
            <ul className="list-disc pl-6">
              <li>본 약관에 명시되지 않은 사항은 관련 법령 및 회사 정책에 따릅니다.</li>
              <li>약관 변경 시 사전 공지하며, 변경 후에도 서비스 이용 시 동의한 것으로 간주합니다.</li>
            </ul>
          </li>
        </ol>
        <p className="mt-8 text-xs text-gray-500">
          본 약관은 2024년 6월 1일부터 적용됩니다.
        </p>
      </section>
    </main>
  );
} 
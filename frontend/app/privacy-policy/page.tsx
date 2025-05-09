import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy / 개인정보처리방침</h1>
      {/* 영문 버전 */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">[EN] Privacy Policy</h2>
        <p className="mb-4">
          Habitus33 ("Company") values your privacy and processes your personal data safely and transparently in accordance with applicable laws and global standards. This Privacy Policy explains how we collect, use, store, and protect your information.
        </p>
        <ol className="list-decimal pl-6 space-y-4 text-sm">
          <li>
            <strong>Personal Data Collected & Collection Methods</strong>
            <ul className="list-disc pl-6">
              <li>Required: Name, email, password, nickname, payment info (for paid services), service usage records (reading/training/notes/routines), access logs, IP address, device info, browser info</li>
              <li>Optional: Profile photo, bio, community activity, marketing consent, etc.</li>
              <li>Collection: Sign-up, service use, payment, events/promotions, customer support, automatic collection (cookies, log analysis, SDK, etc.)</li>
            </ul>
          </li>
          <li>
            <strong>Purpose of Use & Scope of Utilization</strong>
            <ul className="list-disc pl-6">
              <li>Membership management (registration, verification, withdrawal, etc.)</li>
              <li>Service provision (reading/cognitive training/routines/community, etc.)</li>
              <li>Personalized content, statistics, reports, recommendations, service improvement</li>
              <li>Payment/refund processing, fraud prevention</li>
              <li>Legal compliance and dispute response</li>
              <li>AI training, statistical analysis, research (after anonymization/pseudonymization)</li>
              <li>Marketing and advertising (only with user consent, opt-out guaranteed)</li>
            </ul>
          </li>
          <li>
            <strong>Retention & Use Period</strong>
            <ul className="list-disc pl-6">
              <li>Deleted immediately upon account withdrawal (except as required by law)</li>
              <li>Records related to payment/transactions are retained for 5 years as per relevant laws</li>
              <li>Marketing/advertising data is deleted immediately upon withdrawal of consent</li>
            </ul>
          </li>
          <li>
            <strong>Provision & Entrustment to Third Parties</strong>
            <ul className="list-disc pl-6">
              <li>Not provided externally in principle</li>
              <li>Entrusted to third parties for payment, analytics, cloud, AI training, etc. with prior notice and consent</li>
              <li>Exceptions as required by law</li>
            </ul>
          </li>
          <li>
            <strong>Scope of Data Utilization & User Rights</strong>
            <ul className="list-disc pl-6">
              <li>User data (reading, cognitive training, notes, etc.) may be used for statistics, service improvement, AI model training, and personalized feedback.</li>
              <li>Data may be anonymized/pseudonymized for research, statistics, and AI training.</li>
              <li>Users may request consent/withdrawal for data utilization at any time.</li>
              <li>Marketing/advertising data is only used with separate consent, and opt-out is guaranteed.</li>
            </ul>
          </li>
          <li>
            <strong>User Rights & Exercise Methods</strong>
            <ul className="list-disc pl-6">
              <li>Request access, correction, deletion, suspension of processing, data portability</li>
              <li>Withdraw consent and delete account at any time</li>
              <li>Withdraw marketing/advertising consent at any time</li>
              <li>Under 14: legal guardian consent required (if applicable)</li>
            </ul>
          </li>
          <li>
            <strong>Destruction Procedures & Methods</strong>
            <ul className="list-disc pl-6">
              <li>Destroyed immediately after purpose is achieved or retention period expires</li>
              <li>Electronic files: deleted irrecoverably</li>
              <li>Paper: shredded or incinerated</li>
            </ul>
          </li>
          <li>
            <strong>Cookies & Automatic Collection</strong>
            <ul className="list-disc pl-6">
              <li>Used for analytics, personalized service, and security enhancement</li>
              <li>Can be disabled via browser settings</li>
            </ul>
          </li>
          <li>
            <strong>Data Protection Officer & Contact</strong>
            <ul className="list-disc pl-6">
              <li>Officer: Jinny B. Suh (jinny@tedin.kr)</li>
              <li>Contact: Customer support or email</li>
            </ul>
          </li>
          <li>
            <strong>Policy Changes</strong>
            <ul className="list-disc pl-6">
              <li>Notice provided on website and/or individually</li>
            </ul>
          </li>
        </ol>
        <p className="mt-8 text-xs text-gray-500">
          This policy is effective as of June 1, 2024.
        </p>
      </section>
      {/* 국문 버전 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">[국문] 개인정보처리방침</h2>
        <p className="mb-4">
          Habitus33(이하 "회사")는 이용자의 개인정보를 소중히 여기며, 관련 법령 및 글로벌 기준에 따라 안전하게 보호하고 투명하게 처리하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>
        <ol className="list-decimal pl-6 space-y-4 text-sm">
          <li>
            <strong>수집하는 개인정보 항목 및 수집 방법</strong>
            <ul className="list-disc pl-6">
              <li>필수: 이름, 이메일, 비밀번호, 닉네임, 결제정보(유료 서비스 이용 시), 서비스 이용기록(독서/훈련/메모/루틴 등), 접속로그, IP주소, 기기정보, 브라우저 정보</li>
              <li>선택: 프로필 사진, 자기소개, 커뮤니티 활동 정보, 마케팅 수신 동의 등</li>
              <li>수집 방법: 회원가입, 서비스 이용, 결제, 이벤트/프로모션, 고객센터 문의, 자동수집(쿠키, 로그분석, SDK 등)</li>
            </ul>
          </li>
          <li>
            <strong>개인정보의 이용 목적 및 활용 범위</strong>
            <ul className="list-disc pl-6">
              <li>회원 관리(가입, 본인확인, 탈퇴 등)</li>
              <li>서비스 제공(독서/인지 훈련/루틴/커뮤니티 등)</li>
              <li>맞춤형 콘텐츠, 통계, 리포트, 추천, 서비스 개선</li>
              <li>결제 및 환불 처리, 부정 이용 방지</li>
              <li>법적 의무 이행 및 분쟁 대응</li>
              <li>AI 학습, 통계 분석, 연구 목적의 데이터 활용(익명화/가명화 후)</li>
              <li>마케팅 및 광고(이용자 동의 시, 거부권 보장)</li>
            </ul>
          </li>
          <li>
            <strong>개인정보의 보유 및 이용 기간</strong>
            <ul className="list-disc pl-6">
              <li>회원 탈퇴 시 즉시 파기(단, 관련 법령에 따라 일정 기간 보관 필요 시 해당 기간 보관)</li>
              <li>전자상거래 등에서의 소비자 보호에 관한 법률 등 관련 법령에 따라 결제/거래 기록 등은 5년간 보관</li>
              <li>마케팅/광고 목적 동의 철회 시 즉시 파기</li>
            </ul>
          </li>
          <li>
            <strong>개인정보의 제3자 제공 및 위탁</strong>
            <ul className="list-disc pl-6">
              <li>원칙적으로 외부에 제공하지 않음</li>
              <li>결제, 데이터 분석, 클라우드, AI 학습 등 서비스 제공을 위한 위탁 시 사전 고지 및 동의</li>
              <li>법령에 따른 제공 시 예외</li>
            </ul>
          </li>
          <li>
            <strong>데이터의 활용 및 권리 범위</strong>
            <ul className="list-disc pl-6">
              <li>이용자의 서비스 이용 데이터(독서, 인지 훈련, 메모 등)는 통계, 서비스 개선, AI 모델 학습, 맞춤형 피드백 제공 등에 활용될 수 있습니다.</li>
              <li>이용자 식별이 불가능하도록 익명화/가명화 처리 후 연구, 통계, AI 학습 등에 활용할 수 있습니다.</li>
              <li>이용자는 언제든지 데이터 활용에 대한 동의/철회를 요청할 수 있습니다.</li>
              <li>마케팅/광고 목적 데이터 활용은 별도 동의 시에만 진행되며, 거부권이 보장됩니다.</li>
            </ul>
          </li>
          <li>
            <strong>이용자의 권리와 행사 방법</strong>
            <ul className="list-disc pl-6">
              <li>개인정보 열람, 정정, 삭제, 처리정지, 데이터 이동권 요청 가능</li>
              <li>동의 철회 및 회원 탈퇴 가능</li>
              <li>마케팅/광고 수신 동의 철회 가능</li>
              <li>만 14세 미만 아동의 경우 법정대리인 동의 필요(해당 시)</li>
            </ul>
          </li>
          <li>
            <strong>개인정보의 파기 절차 및 방법</strong>
            <ul className="list-disc pl-6">
              <li>목적 달성, 보유기간 경과 시 즉시 파기</li>
              <li>전자적 파일: 복구 불가능한 방법으로 삭제</li>
              <li>종이 문서: 분쇄 또는 소각</li>
            </ul>
          </li>
          <li>
            <strong>쿠키 등 자동수집 장치의 설치·운영 및 거부</strong>
            <ul className="list-disc pl-6">
              <li>서비스 이용 분석, 맞춤형 서비스 제공, 보안 강화 목적</li>
              <li>브라우저 설정을 통해 쿠키 저장 거부 가능</li>
            </ul>
          </li>
          <li>
            <strong>개인정보 보호책임자 및 문의처</strong>
            <ul className="list-disc pl-6">
              <li>책임자: 진니비수 (jinny@tedin.kr)</li>
              <li>문의: 고객센터 또는 이메일</li>
            </ul>
          </li>
          <li>
            <strong>정책 변경 시 고지</strong>
            <ul className="list-disc pl-6">
              <li>변경 시 웹사이트 공지 및 개별 통지</li>
            </ul>
          </li>
        </ol>
        <p className="mt-8 text-xs text-gray-500">
          본 방침은 2024년 6월 1일부터 적용됩니다.
        </p>
      </section>
    </main>
  );
} 
### Habitus33 결제/유료화 설계 문서 (Draft v0.1)

#### TL;DR
- 심리스(Seamless) 결제 경험을 목표로, “일일 한도 기반 소프트 페이월 → Checkout → 원래 작업 즉시 복귀” 흐름을 표준화
- 가치 축(핵심/고유/지불)으로 기능 가치를 내부 점수화해 우선순위 확정, 측정/가드/업셀/결제를 시스템화
- 아래 6개 정책을 서버 주도 측정과 가드로 일관 적용하고, 프런트는 시각화/업셀/리다이렉트만 담당

---

### 1) 확정 유료화 정책(2025-Phase 1)
- **AI 하이브리드 검색+AI 대화**: 일일 5회 무료
- **ZenGo 게임(마이버스/오리지널)**: 100% 무료
- **인지분석 결과보기**: 100% 유료(구독자 전용)
- **PDF 하이라이트/메모**: 일일 20회
- **AI-Link 생성**: 일일 3회
- **TS 메모카드**: 누적 100개까지 무료, 101개부터 유료

**원칙**
- 모든 제한은 서버에서 측정/판정(신뢰성). 프런트는 남은 횟수 표시와 업셀 UX만 담당
- 결제 성공 시 즉시 “직전 작업 자동 재시도”, 실패/취소 시 현재 맥락 유지

---

### 2) 서비스 가치 프레임(내부 기준)
- **핵심가치(CV)**: 학습 시간 단축, 인지 개선, 결과물 품질(정확한 요약/정리)
- **고유가치(UV)**: AMFA 엔진(Atomic→Memo Evolution→Focused Note→AI-Link), ZenGo 인지게임, 하이브리드 검색, 개인화 리포트
- **지불가치(WTP)**: 즉시성(대기 제거), 무제한/여유 용량, 장문/고급 모델, 내보내기/공유, 마켓플 할인, 광고 제거

**내부 점수화(1~5): S = 0.5·CV + 0.3·UV + 0.2·WTP**
- 상위 우선: 하이브리드 검색/대화, AMFA 분석 리포트, 요약/단권화, ZenGo(전환 트리거로 우수)

---

### 3) 측정/저장(서버, MongoDB/Prisma)
- **컬렉션 A: `user_daily_usage`**
  - `userId`, `date`(YYYY-MM-DD, KST), `counters`: `{ aiHybridChat, pdfHighlight, aiLink }`
- **컬렉션 B: `user_quota_total`**
  - `userId`, `total`: `{ tsMemoCard }`
- **리셋**: 매일 00:00 KST 기준
- **구독자 처리**: 일일 제한형(5/20/3)은 사실상 무제한 또는 높은 상한

**상수(환경/설정)**
- `FREE_LIMIT_AI_HYBRID_CHAT_PER_DAY=5`
- `FREE_LIMIT_PDF_HIGHLIGHT_PER_DAY=20`
- `FREE_LIMIT_AI_LINK_PER_DAY=3`
- `FREE_LIMIT_TS_MEMOCARD_TOTAL=100`
- `TIMEZONE=Asia/Seoul`

---

### 4) 서버 API/가드(권장 배치)
- **요약 API**
  - `GET /api/usage/summary`: 오늘 사용량/남은 횟수, TS 메모카드 누적, 다음 리셋까지 남은 시간(KST)
  - `POST /api/usage/increment`: `body.action` in [`aiHybridChat`,`pdfHighlight`,`aiLink`,`tsMemoCard`]
- **가드(핵심 라우트 맨 앞)**
  - AI 하이브리드 검색/대화: `aiHybridChat` 증가 시도 → 초과면 402 유사 응답(JSON 메시지 포함)
  - PDF 하이라이트/메모: `pdfHighlight` 증가 시도 → 초과면 402
  - TS 메모카드 생성: 누적 100 초과 시 402
  - 인지분석 결과보기: 100% 유료 → 구독자 검증(미구독 403/리다이렉트)
- **결제/구독(Next API, A안 유지)**
  - `POST /api/payments/create-checkout`: Stripe Checkout 세션 생성(가격 ID=env)
  - `POST /api/payments/cancel-subscription`: Stripe 취소
  - `POST /api/webhooks/stripe`: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted` 처리
  - **권장 추가**: `POST /api/payments/create-portal`(Stripe Billing Portal 세션)

**파일 레퍼런스**
- 서버(Next): `backend/app/api/payments/*`, `backend/app/api/webhooks/stripe/route.ts`, `backend/app/api/user/subscription/route.ts`
- 서버(DB): `backend/prisma/schema.prisma`
- 프런트 API 클라이언트: `frontend/lib/apiClient.ts`

---

### 5) 프런트 UX(심리스 업셀)
- **공통 훅: `useUsage`**
  - 마운트 시 `/api/usage/summary` → 헤더 배지/화면 남은 횟수 표시
- **트리거**
  - 서버 402 수신 시, 현재 화면에 Paywall 카드 표시(작업 맥락 유지)
  - CTA “지금 계속하기” → Checkout 이동 → 성공 복귀 시 “직전 작업 자동 재시도”
- **표기**
  - 헤더 배지: AI 요청/하이라이트/AI-Link 남은 횟수
  - TS 메모카드: “100/100” 카운터, 101 시도 시 Paywall
  - 인지분석: 미구독 접근 시 “구독 전용” 안내 + 결제 버튼
- **이미 연결됨**
  - 업그레이드 버튼 → `createCheckoutSession(planId)` → Stripe 리다이렉트(A안)
  - `NEXT_PUBLIC_PAYMENTS_API_URL` 기반 Next API 직접 호출

---

### 6) KPI / 실험
- **퍼널 이벤트**
  - `paywall_impression`, `paywall_cta_click`, `checkout_started`, `checkout_completed`, `checkout_abandoned`
  - `credits_exhausted_<feature>`, `resume_after_payment`
- **KPI(초기 가이드)**
  - Paywall CTR ≥ 15%
  - Checkout 시작→완료 ≥ 45%
  - 무료→유료 전환 1~3%
  - 연간 플랜 비중 ≥ 25%
- **A/B 슬롯**
  - 일일 한도(5 vs 10 vs 15), Paywall 카피, “한 번 더 무료” 유예 on/off, 연간 할인(15/17/20%)

---

### 7) 단계별 롤아웃(4주)
- **1주차**
  - Stripe 환경/웹훅 확정, Checkout 흐름 최종 점검(이미 A안 연결 완료)
- **2주차**
  - Usage API/스토리지, AI 하이브리드 검색/대화 서버 가드(402), 프런트 Paywall(결과 영역 1곳), 헤더 배지
- **3주차**
  - PDF/AI-Link 동일 패턴 가드/Paywall, TS 메모카드 누적 100 가드, 인지분석 100% 유료 가드
- **4주차**
  - Billing Portal, 대시보드/지표, 첫 A/B 시작(일일 한도 5 vs 10)

---

### 8) 환경변수 체크리스트
- **프런트(Vercel)**
  - `NEXT_PUBLIC_PAYMENTS_API_URL` = Next API 외부 URL
  - `NEXT_PUBLIC_APP_URL` = 성공/취소 리다이렉트 베이스
- **백엔드(Render, Next API)**
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PRICE_MONTHLY_ID`, `STRIPE_PRICE_YEARLY_ID`
  - `NEXT_PUBLIC_APP_URL`
- **운영 상수(서버)**
  - `FREE_LIMIT_*` 값(위 정책 수치), `TIMEZONE=Asia/Seoul`

---

### 9) 보안/운영 유의
- 웹훅은 원문(body)로 서명 검증, 프록시/바디 파서가 본문 변형하지 않도록 주의
- 키/가격ID/시크릿은 환경변수로만 관리
- 과금/가드는 반드시 서버에서(프런트는 보조 표시)
- 성공/취소 URL 화이트리스트(오픈 리다이렉트 방지)
- 결제 기록 멱등성 고려(중복 이벤트 처리)

---

### 10) 오픈 이슈(다음 논의 주제)
- 인지분석 100% 유료: 페이지별 접근 정책(부분 미리보기 허용 여부)
- “한 번 더 무료” 유예 적용 범위(전환율 실험)
- 구독자 “공정 사용 정책” 상한선(악의적 사용 방지)
- 연간 할인율(15/17/20%)과 가격표 카피 테스트
- Billing Portal 사용 vs 자체 해지 플로우 유지

---

### 11) 부록: 구현 범위 나누기(제안)
- **서버(우선)**: `user_daily_usage`, `user_quota_total`, `/api/usage/*`, 핵심 라우트 가드, 인지분석 가드
- **프런트(우선)**: `useUsage`, 헤더 배지, Paywall 카드(결과 영역 1곳), 402 처리
- **서버(후속)**: Billing Portal, A/B 토글
- **프런트(후속)**: TS 메모카드 카운터 표시, 인지분석 구독자 UX, 마케팅 카피 A/B



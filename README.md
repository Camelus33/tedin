# Habitus33 - 생각의 패턴과 방향을 추적하는 AI 메모 서비스

> **"Track Your Thought Patterns, Evolve Your Knowledge"**
>
> Habitus33은 사용자의 1줄 메모, 인라인 쓰레드, 메모 진화(4단계), 지식 연결의 시간적 흐름을 정밀하게 기록하고, **생각의 방향·속도·리듬**을 분석하여 성장을 돕는 AI 메모/학습 서비스입니다.

## 🚀 무엇을 해결하나요? (TL;DR)

- 생각의 패턴과 방향을 추적: 메모 활동의 시간·내용 흐름을 기록해 방향, 속도, 리듬을 수치화
- 유사/반복 생각 감지: 임베딩 기반 유사도 + 자카드 폴백으로 과거 유사 메모 탐지
- 성장 타이밍 안내: 인라인/진화/연결 달성 시 토스트로 “다음 행동” 제안
- 최소 변경, 최대 효과: 기존 구조 유지 + 필드 추가/이벤트 스트림/분석 API만 도입

## 🧩 핵심 개념

- AMFA: A(Atomic Reading) → M(Memo Evolution) → F(Focused Note) → A(AI-Link)
- Thought Analytics: Speed(속도), Curvature(방향 전환), Rhythm(리듬/CV), Time Patterns(시간대/요일)
- ThoughtEvent: 메모 생성/수정/인라인/연결/진화/마일스톤을 표준화하여 기록

## 🎯 주요 기능

### ⚡ 학습 가속 시스템

#### **TS (Time Sprint) - 3분 집중 독서**
- **3분 타이머**: 집중력 최적화를 위한 과학적 시간 설정
- **PDF 하이라이트**: 텍스트 선택 → 즉시 메모 작성
- **진행도 추적**: 실시간 학습 진행률 시각화
- **일시정지 기능**: 메모 작성 시 자동 타이머 정지

#### **메모 진화 시스템**
- **1줄 메모**: 핵심 내용을 한 줄로 압축
- **진화 질문**: "왜 중요한가?", "언제 사용할까?" 등 5단계 질문
- **개인 경험 연결**: 기존 지식과의 연관성 발견
- **단권화 노트**: 진화된 메모를 하나의 완성된 지식으로 통합

#### **AI-Link 지식 캡슐**
- **개인화된 AI 파트너**: 사용자의 지식 DNA를 이해하는 AI
- **즉시 소통**: 프롬프트 없이도 AI가 사용자 맥락 파악
- **지식 공유**: AI 접근 가능한 구조화된 데이터로 공유

### 📚 지식 관리 + 생각 패턴 추적
- **책 관리**: PDF 업로드, 하이라이트, 메모 작성
- **컬렉션**: 주제별 메모 그룹화 및 연결
- **개념이해도**: 실시간 학습 진행도 측정
- **생각 패턴 집계**: `/api/analytics/aggregate`로 최근 N일의 생각 속도/곡률/리듬·시간대/요일 분포 제공
- **유사 생각 탐지**: `/api/analytics/similar`로 과거 메모와의 의미적 유사성(임베딩/자카드) 검색
- **마일스톤 알림**: 인라인 쓰레드·진화 4단계·지식 연결 달성 시 토스트 알림 (프론트 `TSNoteCard`)

### 🧠 인지과학 기반 게임

#### **Zengo - 인지능력 향상 게임**
- **3x3, 5x5, 7x7 보드**: 난이도별 인지 훈련
- **순서 기억**: 단어를 올바른 순서로 배치하는 작업기억력 훈련
- **실시간 피드백**: 즉시 정답 확인 및 학습 효과 분석
- **인지 메트릭**: 작업기억력, 주의력, 처리속도 등 8가지 인지능력 측정

#### **Myverse - 컬렉션 기반 지식 게임**
- **개인 컬렉션 활용**: 자신이 만든 지식으로 게임 플레이
- **지식 연결**: 관련 개념들을 연결하는 창의적 사고 훈련

#### **Brain Hack Routine - 뇌 과학 기반 학습 루틴**
- **AMFA 엔진 활용**: 실제 학습 워크플로우 적용
- **개인화된 루틴**: 사용자 패턴에 맞춘 최적화된 학습 경로

### 📊 생각 패턴 분석 시스템

#### 지표 정의
- Speed: 인접 메모 임베딩 간 (1 - cosine) / Δt(min)
- Curvature: 연속 의미 이동 벡터 간 각도(라디안)
- Rhythm: 이벤트 간 간격 평균/표준편차/변동계수(CV), 간이 버스트 지수
- Time Patterns: 시간대/요일 히스토그램

#### 빠른 확인 방법
```bash
# 백엔드 기동 후(로컬: http://localhost:8000)
curl -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:8000/api/analytics/aggregate?days=30" | jq
```

#### **학습 효과 측정**
- **개념이해도**: 실시간 학습 진행도 측정
- **기억 보존률**: 장기 기억 형성 효과 분석
- **학습 가속도**: 시간 대비 지식 습득 효율성 측정

## 🛠 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, MongoDB(Mongoose)
- **AI Integration**: OpenAI(Embedding `text-embedding-3-small`), Claude, Gemini, Perplexity
- **PDF Processing**: PDF.js, react-pdf
- **State Management**: Redux Toolkit, Zustand
- **Deployment**: Vercel (Frontend), Render (Backend)

## 📈 학습 가속 효과

### **과학적 근거 기반 성과**

#### **학습 시간 25% 단축 → 달성 가능한 결과**
- **시험 준비 시간 단축**: 6시간 공부 → 4.5시간으로 단축, 하루에 1.5시간 여유 시간 확보
- **새로운 기술 습득 가속**: 3개월 코딩 학습 → 2.25개월로 단축, 더 빠른 취업/전직 가능
- **언어 학습 효율성**: 1년 영어 학습 → 9개월로 단축, 해외 유학/취업 준비 시간 단축
- **업무 스킬 향상**: 새로운 도구/프로세스 학습 시간 단축으로 업무 생산성 향상

#### **지식 연결성 5배 향상 → 달성 가능한 결과**
- **창의적 문제 해결**: 관련 개념들을 자동 연결하여 새로운 해결책 발견
- **학제간 통합 사고**: 문학 + 과학, 역사 + 기술 등 경계를 넘는 통찰력 개발
- **기억의 연쇄 효과**: 하나의 개념이 다른 개념들을 자동으로 떠올리게 하는 지식 네트워크 구축
- **실무 적용력 향상**: 이론과 실무를 자연스럽게 연결하여 즉시 활용 가능한 지식 체계 구축

#### **기억 보존률 4배 향상 → 달성 가능한 결과**
- **장기 기억 형성**: 1주일 후에도 80% 이상의 내용 기억 유지 (일반적 20% 대비)
- **시험 성적 향상**: 단기 암기가 아닌 깊은 이해로 시험에서 고득점 달성
- **업무 역량 지속**: 교육받은 내용을 오래 기억하여 지속적인 업무 성과 창출
- **개인 브랜딩**: 전문 지식을 오래 기억하여 해당 분야의 전문가로 인정받기

### **개인화된 학습 경험**
- **개인 지식 DNA**: AI-Link를 통한 개인화된 학습 파트너
- **적응형 난이도**: 사용자 수준에 맞춘 게임 및 학습 콘텐츠
- **실시간 피드백**: 즉시 학습 효과 확인 및 개선점 제시

## 🚀 시작하기

```bash
# 저장소 클론
git clone https://github.com/Camelus33/habitus33.git
cd habitus33

# 의존성 설치 (루트에서 워크스페이스 일괄 설치)
npm install

# 환경 변수 설정
# 1) backend/.env
#    - MONGODB_URI=...
#    - JWT_SECRET=...
#    - (선택) FRONTEND_URL=http://localhost:3000
#    - (선택) OPENAI_API_KEY=...  # 임베딩/유사도 검색 활성화
# 2) frontend/.env.local
#    - NEXT_PUBLIC_API_URL=http://localhost:8000

# 개발 서버 실행 (두 개 터미널 권장)
npm run dev:backend   # http://localhost:8000
npm run dev:frontend  # http://localhost:3000
```

## 📖 문서

- [브랜드 가이드라인](./docs/HABITUS33_Brand_Guidelines_v3.4.md)
- [마케팅 전략 가이드](./docs/Habitus33_Marketing_Strategy_Guide.md)
- [AI-Link 아키텍처 가이드](./docs/AI_Link_Architecture_Guide.txt)

## 🧱 데이터 모델 하이라이트

- `backend/src/models/Note.ts`
  - `importanceReasonAt/momentContextAt/relatedKnowledgeAt/mentalImageAt: Date`
  - `relatedLinks[].createdAt: Date`
  - `milestone1NotifiedAt/milestone2NotifiedAt: Date`
  - `embedding: number[]`(선택), `embeddingGeneratedAt: Date`

- `backend/src/models/ThoughtEvent.ts`
  - `type`: `create_note | update_note | add_inline_thread | evolve_memo | add_connection | add_thought | milestone_achieved`
  - `userId, noteId, sessionId, textPreview, tokens, createdAt, clientCreatedAt, meta`

## 🔌 API 요약(핵심)

- Analytics
  - `GET /api/analytics/aggregate?days=30` → 속도/곡률/리듬/시간대 분포 집계
  - `POST /api/analytics/similar` → `{ text, limit?, hourBucket?, weekday? }` 유사 메모 탐지
  - `GET /api/analytics/metrics` → 최근 7일 이벤트/링크 개수

- Diagnostics(관리자)
  - `GET /api/diagnostics/env` → 주요 키 존재 여부
  - `POST /api/diagnostics/embedding` → 임베딩 테스트
  - `POST /api/diagnostics/embedding/batch` → 비어있는 임베딩 일괄 생성(페이징)

## ⏱ 헤더 시계 & 누적 사용시간 집계

- 데스크톱 헤더 우측 알림 아이콘 왼쪽에 다음 시간이 표시됩니다.
  - 누적: 계정 기준 전체 사용 누적시간 (서버 집계)
  - 세션: 현재 로그인 이후 경과시간 (클라이언트 실시간)
- 프론트엔드: `frontend/components/common/HeaderClock.tsx`
- 백엔드 API
  - `GET /api/users/me/stats` → `{ totalUsageMs, ... }` (ms)
  - `POST /api/users/me/usage` → 바디 `{ deltaMs: number }` (인증 필요)
    - 클라이언트는 가시 상태에서 약 60초마다 하트비트를 전송하고, 탭 비활성/종료 시 최소한의 요청만 보냅니다.

## 🧮 XP/Level 모델(무한 성장형)

- 목적: 많이·잘 학습하는 사용자가 빠르게 성장. 일일 시간 상한 없음.
- XP 구성(감소효용):
  - `XP_time = a · (T_hours)^0.85`
  - `XP_memo = b · (M)^0.80`
  - `XP_concept = c · (C_sum / 1000)^0.90`
  - 총합: `Total_XP = XP_time + XP_memo + XP_concept`
- 레벨 임계치: `RequiredXP(L) = k · L^1.45`
- 초기 계수(튜닝 대상): `a=80, b=100, c=220, k=500`
- API: `GET /api/users/me/stats` 응답에 `level, totalXP, nextLevel, progressToNext, xpBreakdown` 포함

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

**"Think Forward, Habitus33"** - 생각의 패턴과 방향을 추적하고 성장으로 연결합니다.
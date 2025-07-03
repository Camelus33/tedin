# Habitus33: 지능형 워크플로우 설계 플랫폼

> **"Design the workflow. Automate the outcome."**  
> 워크플로우를 설계하고, 결과물을 자동화하세요.

Habitus33은 당신이 단순한 'AI 사용자'가 아닌, 복잡한 목표를 달성하기 위한 'AI 행동 설계자(AI Action Designer)'가 되도록 돕습니다. 당신의 전문 지식과 명확한 목표는, AI의 작업을 체계적으로 지시하는 강력한 '지능형 실행 계획서(Intelligent Blueprint)'가 됩니다. Habitus33은 당신의 의도를 AI가 실행할 최적의 '워크플로우'로 전환하는 경험을 제공합니다.

## ✨ 주요 기능 (Key Features)

Habitus33은 사용자의 생각을 구조화하고 지적 생산성을 극대화하기 위한 다양한 기능을 제공합니다.

- **🧠 Zengo (젠고):** 집중력과 메타인지 훈련을 위한 인터랙티브 게임입니다.
- **🌌 MyVerse (마이버스):** 사용자가 수집한 지식 조각들을 탐험하고 게임화된 학습을 즐길 수 있는 개인화된 지식 우주입니다.
- **🤔 TS (Thinking-Self):** 구조화된 질문을 통해 메모를 점진적으로 발전시켜 통찰을 얻는 시스템입니다.
- **📚 Books & Reading Sessions:** 도서를 등록하고, 집중적인 독서 세션을 통해 학습 데이터를 축적합니다.
- **📝 Summary Notes & Flashcards:** 학습한 내용을 요약 노트로 정리하고, 플래시카드를 통해 효과적으로 복습합니다.
- **📊 Analytics Dashboard:** 학습 과정에서 축적된 인지 데이터(집중도, 학습 시간 등)를 시각적으로 분석하고 피드백을 제공합니다.
- **🔗 AI-Link:** 사용자의 지식 베이스와 목표를 결합하여, AI가 실행할 구체적인 워크플로우를 설계하는 핵심 기술입니다.

---

## ⚙️ 핵심 아키텍처: AMFA 엔진 & AI-Link

Habitus33의 핵심인 **AMFA(Atomic Reading, Memo Evolve, Furnace Knowledge, AI-Link) 엔진**은 당신의 생각을 AI가 정밀하게 실행할 수 있는 '지능형 실행 계획서'로 변환합니다.

1.  **Atomic Reading (데이터 수집):** 워크플로우의 기초가 되는 최소 단위의 데이터를 수집합니다.
2.  **Memo Evolve (인사이트 연결):** 수집된 데이터들을 연결하며 숨겨진 관계를 파악하고 인사이트를 도출합니다.
3.  **Furnace Knowledge (컨텍스트 구축):** 연결된 인사이트를 응축하여 워크플로우 실행의 기반이 될 '컨텍스트 베이스'를 구축합니다.
4.  **AI-Link (워크플로우 설계):** '컨텍스트 베이스'와 '최종 목표'를 결합하여 AI가 실행할 최종 '지능형 실행 계획서(AI-Link)'를 설계합니다.

---

## 🧑‍💻 개발 워크플로우: `Taskmaster`

이 프로젝트는 개발 생산성 향상을 위해 **`Taskmaster`**라는 CLI 도구를 적극적으로 활용합니다. `Taskmaster`는 PRD(제품 요구사항 문서) 파싱을 통한 태스크 자동 생성, 복잡도 분석, 하위 태스크 분할 등 개발의 전 과정을 체계적으로 관리합니다.

- **초기 설정:** `task-master init`으로 프로젝트를 설정하고 `task-master parse-prd`로 초기 태스크를 생성합니다.
- **작업 관리:** `task-master list`, `next`, `show <id>` 명령어로 작업을 확인하고 관리합니다.
- **자동화:** `expand <id>`로 복잡한 태스크를 자동으로 분해하고, `update` 명령어로 변경사항을 전파합니다.

모든 기여자는 `Taskmaster`를 통해 일관된 개발 워크플로우를 따르는 것을 권장합니다.

---

## 🛠️ 기술 스택 (Tech Stack)

### **프론트엔드 (Frontend)**
- **Core:** Next.js 14 (App Router), React 18, TypeScript
- **상태 관리:** Zustand, Redux Toolkit
- **스타일링:** Tailwind CSS, Framer Motion, `clsx`, `tailwind-merge`
- **UI 컴포넌트:** Radix UI (Dialog, Dropdown, etc.), Headless UI
- **폼:** Formik, Yup
- **데이터 시각화:** Recharts, Chart.js, Lottie
- **기타:** Axios, date-fns, Lucide Icons, React Hot Toast

### **백엔드 (Backend)**
- **Core:** Node.js, Express.js, TypeScript
- **데이터베이스:** MongoDB Atlas, Prisma (ORM)
- **인증/보안:** JWT, bcrypt, Helmet, CORS
- **API 유효성 검사:** express-validator
- **기타:** Stripe (결제), Multer (파일 업로드), Compression

### **테스트 (Testing)**
- **Framework:** Jest
- **라이브러리:** React Testing Library, Supertest

### **배포 & 인프라 (DevOps & Infra)**
- **프론트엔드:** Vercel
- **백엔드:** Render
- **데이터베이스:** MongoDB Atlas
- **패키지 관리:** NPM Workspaces (Monorepo)

---

## ⚡️ 설치 및 실행 (Installation & Usage)

이 프로젝트는 [NPM Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)를 사용하여 `frontend`와 `backend`를 모노레포(monorepo) 구조로 관리합니다.

### **1. 필수 조건**
- Node.js v18 이상
- npm v7 이상
- MongoDB Atlas 계정 및 Connection String

### **2. 의존성 설치**
프로젝트 루트 디렉토리에서 아래 명령어를 실행하면, `frontend`와 `backend`의 모든 패키지가 한 번에 설치됩니다.
```bash
npm install
```

### **3. 환경 변수 설정**
실행에 필요한 환경 변수 파일을 각각 생성하고 내용을 채워야 합니다.
- **백엔드:** `backend/.env` 파일을 생성하고 아래 내용을 참고하여 채웁니다.
  ```
  PORT=8000
  MONGODB_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  STRIPE_SECRET_KEY=your_stripe_secret_key
  STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
  ```
- **프론트엔드:** `frontend/.env.local` 파일을 생성하고, 백엔드 서버 주소를 지정합니다.
  ```
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```

### **4. 개발 서버 실행**
루트 디렉토리에서 아래 명령어를 실행하여 프론트엔드와 백엔드 개발 서버를 동시에 시작할 수 있습니다.

```bash
# 프론트엔드 (localhost:3000)와 백엔드 (localhost:8000) 동시 실행
npm run dev --workspaces
```

개별적으로 실행하려면 다음 명령어를 사용하세요.
```bash
# 프론트엔드만 실행
npm run dev --workspace=frontend

# 백엔드만 실행
npm run dev --workspace=backend
```

---

## 📂 디렉토리 구조 (Directory Structure)

```
habitus33/
│
├── README.md                # 👈 바로 이 파일!
├── package.json             # ✅ 루트 패키지 매니저 (워크스페이스 설정)
├── .taskmaster/             # 🧑‍💻 Taskmaster 설정 및 태스크 데이터
│
├── backend/                 # 📦 Express + Prisma + MongoDB 기반 API 서버
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma    # 데이터베이스 스키마
│   └── src/                 # 핵심 서버 코드 (controllers, models, routes 등)
│
├── frontend/                # 📦 Next.js 기반 프론트엔드 앱
│   ├── package.json
│   ├── app/                 # App Router 기반 페이지/라우트
│   ├── components/          # 재사용 UI 컴포넌트
│   ├── lib/                 # API 클라이언트, 유틸리티 함수
│   ├── store/               # Zustand, Redux 상태 관리
│   └── ...
│
└── scripts/                 # 유틸리티 스크립트
```

---

## 🤝 기여하기 (Contributing)

Habitus33은 더 나은 지적 생산성 도구를 만들기 위한 기여를 언제나 환영합니다.

- **커밋 메시지:** 프로젝트는 [Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/) 명세를 따릅니다.
- **브랜치 전략:** `main`을 중심으로 한 Trunk-Based Development를 지향합니다.
    - `main`: 안정적인 최신 버전의 코드가 반영되는 메인 브랜치입니다.
    - `feature/multi-language`: 다국어 지원 기능 개발을 위한 전용 브랜치입니다.
- **코드 스타일:** `ESLint`와 `Prettier`를 통해 코드 스타일을 일관되게 유지합니다.

버그 리포트, 기능 제안, 코드 기여 등 어떤 형태의 참여든 환영합니다. 먼저 이슈를 생성하여 논의를 시작해주세요.
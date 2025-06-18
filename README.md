# Habitus33 - 당신의 생각을 이해하는 AI 학습 플랫폼

> **"read short, deep dive."**
> 당신의 생각은, 그 자체로 가장 완벽한 프롬프트가 됩니다.

Habitus33은 더 이상 사용자가 AI에게 질문하는 법을 배울 필요 없는 세상을 꿈꿉니다.
당신의 작은 독서와 메모가 만들어내는 자연스러운 생각의 흐름, 그 '파도'를 AI가 먼저 이해하고, 가장 깊은 곳의 통찰을 건져 올리는 **Prompt-Free 학습 경험**을 제공합니다.

---

## 🤔 Habitus33은 어떻게 동작하나요?: 5단계 고객 여정

Habitus33은 AMFA(Atomic Reading, Memo Evolve, Furnace Knowledge, AI-Link) 엔진을 통해 당신의 생각을 AI가 이해할 수 있는 '지식 캡슐'로 만듭니다. 그 여정은 다음과 같습니다.

### **1단계: 당신만의 '지식의 바다'를 만들다**
Habitus33 안에서 당신이 읽는 모든 문장, 기록하는 모든 메모는 당신만의 '지식의 바다'에 파문을 일으킵니다. 이 바다는 당신의 고유한 생각과 맥락이 담긴, 세상에 단 하나뿐인 공간이 됩니다.

### **2단계: 단 한 번의 클릭으로, 바다의 정수를 담아내다**
AI의 도움이 필요한 순간, 당신은 그저 "내 바다의 지도를 만들어줘"라고 요청(원클릭)하기만 하면 됩니다. 이 신호는 **AMFA 엔진**을 깨우는 열쇠입니다. 엔진은 당신의 바다 전체를 탐사하며 모든 생각의 흐름과 지식의 맥락을 정제하고 구조화하여 그 정수만을 응축합니다.

### **3단계: 생각의 본질을 담은 'AI-Link'를 손에 쥐다**
잠시 후, 당신의 손에는 **'AI-Link'**라는 눈부신 지식 캡슐이 쥐어집니다. 이것은 당신이 탐험해 온 '지식의 바다' 전체의 항해 지도이자, 당신 생각의 DNA가 담긴 나침반입니다.

### **4단계: 'AI-Link'를 건네, AI를 당신의 바다로 초대하다**
당신은 이 'AI-Link'를 AI 에이전트에게 건네줍니다. 이것은 AI에게 보내는 '명령'이 아닌, 당신의 바다로의 정중한 '초대장'입니다. AI는 프롬프트 한 마디 없이도 당신의 세계를 유영하기 시작합니다.

### **5단계: '질문'이 아닌, '사유'의 결과물을 얻다**
AI는 당신의 바다 가장 깊은 곳에서, 당신의 의도와 완벽하게 공명하는 보석 같은 통찰을 건져 올릴 것입니다. 당신이 얻는 것은 단순한 '답변'이 아닌, 당신의 오랜 사유와 AI의 분석력이 만나 탄생한 '창조적 결과물'입니다.

---

## 🛠️ 기술 스택

- **프론트엔드:** Next.js (App Router), TypeScript, Redux Toolkit, TailwindCSS, framer-motion, Chart.js 등
- **백엔드:** Node.js, Express, MongoDB Atlas & Mongoose, JWT 인증

---

## ⚡️ 설치 및 실행 (Installation & Usage)

이 프로젝트는 [NPM Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)를 사용하여 `frontend`와 `backend`를 모노레포(monorepo) 구조로 관리합니다.

### 1. 필수 조건
- Node.js v18 이상
- npm v7 이상
- MongoDB Atlas 계정 및 Connection String

### 2. 의존성 설치
프로젝트 루트 디렉토리에서 아래 명령어를 실행하면, `frontend`와 `backend`의 모든 패키지가 한 번에 설치됩니다.
```bash
npm install
```

### 3. 환경 변수 설정
실행에 필요한 환경 변수 파일을 각각 생성하고 내용을 채워야 합니다.
- **백엔드:** `backend/.env` 파일을 생성하고 아래 내용을 참고하여 채웁니다.
  ```
  PORT=8000
  MONGODB_URI=your_mongodb_connection_string
  JWT_SECRET=your_jwt_secret
  ```
- **프론트엔드:** `frontend/.env.local` 파일을 생성하고, 백엔드 서버 주소를 지정합니다.
  ```
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```

### 4. 개발 서버 실행
각 워크스페이스(frontend, backend)의 개발 서버를 개별적으로 실행할 수 있습니다.

**프론트엔드 서버 실행 (http://localhost:3000):**
```bash
npm run dev --workspace=frontend
```

**백엔드 서버 실행 (http://localhost:8000):**
```bash
npm run dev --workspace=backend
```

**✅ 모든 서버 동시에 실행하기:**
```bash
npm run dev --workspaces
```

---

## 📂 디렉토리 구조 (Directory Structure)

```
habitus33/
│
├── README.md                # 👈 바로 이 파일!
├── package.json             # ✅ 루트 패키지 매니저 (워크스페이스 설정)
├── package-lock.json        # 의존성 lock 파일
├── .gitignore
├── tsconfig.json            # 공통 TypeScript 설정
│
├── backend/                 # 📦 Express + MongoDB 기반 API 서버 (워크스페이스)
│   ├── package.json         # 백엔드 의존성 및 스크립트
│   ├── src/                 # 핵심 서버 코드 (controllers, models, routes 등)
│   └── ...
│
├── frontend/                # 📦 Next.js 기반 프론트엔드 앱 (워크스페이스)
│   ├── package.json         # 프론트엔드 의존성 및 스크립트
│   ├── app/                 # App Router 기반 페이지/라우트
│   ├── components/          # 재사용 UI 컴포넌트
│   ├── store/               # Redux Toolkit 상태 관리
│   └── ...
│
├── node_modules/            # 🤖 설치된 모든 의존성 (루트/워크스페이스 공통)
└── scripts/                 # 유틸리티 스크립트
```
> 상세한 내부 구조는 각 `backend`와 `frontend` 디렉토리 내부를 참고해주세요.

---

## 구현/진행 중 기능

- **젠고 오리지널 오픈마켓:** 노트 거래, 큐레이션, 평점 시스템 개발 중
- **메모진화 트리 시각화:** 메모 간 연결 및 진화 경로 UI 개발 중
- **사용자 제작 젠고 게임:** 커스터마이즈/공유 기능 확장 중

---

## 기여하기

(기여 방법 안내 예정)

---

## 💎 Ontology: AI-Link의 지능을 설계하다

Habitus33의 핵심 기술인 `AI-Link`는 단순한 데이터 묶음이 아닙니다.
이 프로젝트는 사용자의 학습 활동과 지식 구조를 의미론적으로 표현하기 위해 **웹 온톨로지 언어(OWL) 기반의 자체 온톨로지 모델**을 정의하고 사용합니다.

이 온톨로지 모델은 AI가 사용자의 복잡한 맥락을 '이해'하도록 돕는 설계도 역할을 하며, `JSON-LD`를 통해 기존 데이터 구조를 변경하지 않고도 시맨틱 웹 기술을 적용하는 비파괴적인 방식으로 구현되었습니다.

### 주요 산출물

- **[Ontology Development Guide](./ONTOLOGY_GUIDELINES.md)**
  - 온톨로지 설계 원칙, 핵심 클래스 및 속성, 추론 규칙 등 모델의 모든 것을 정의하는 공식 가이드입니다.
- **[ai-link-context.jsonld](./frontend/public/ai-link-context.jsonld)**
  - 실제 `AI-Link` 데이터와 온톨로지 모델을 연결하는 `JSON-LD` 컨텍스트 파일입니다. 이 파일을 통해 데이터는 기계가 이해할 수 있는 '지식그래프'로 변환됩니다.
- **[Ontology Scripts](./scripts/ontology/)**
  - 온톨로지 모델의 검증(SHACL) 및 추론(SPIN/SPARQL)을 위한 스크립트가 위치하는 디렉토리입니다.

프로젝트의 지능적인 측면에 기여하고 싶다면 위 문서들을 반드시 숙지해주시기 바랍니다.

---

## 라이선스

(라이선스 정보 추가 예정)
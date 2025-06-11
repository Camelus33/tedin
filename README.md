# Habitus33 - Micro Reading & Memory Evolution Platform

뇌 최적화와 문해력, 기억력, 지식 확장을 위한 신경과학 기반 SaaS.
**마이크로 리딩, 메모진화, 기억력 게임, 오픈마켓, 사용자 제작 암기법까지!**

> "읽고, 기록하고, 진화하라. 당신의 뇌는 매일 새로워질 수 있다." - Habitus33

---

## 프로젝트 소개

Habitus33는 사용자의 문해력과 기억력, 지식 확장을 극대화하는 **인지과학 기반 인지 성장 플랫폼**입니다.
짧은 시간 집중 리딩, 메모의 진화, 기억력 게임, 지식 오픈마켓, 사용자 제작 암기법 등
**실질적 변화와 성장**을 이끄는 혁신적 도구들을 제공합니다.

---

## 주요 기능

### 1. 마이크로 리딩 (TS모드)
- **설명:** 텍스트를 잘게 쪼개 제한시간 동안 읽으며, 4단계(예열-집중-반추-피드백)로 문해력을 극대화합니다.
- **목표:** 짧은 시간 내 몰입 독서 → 정보 처리력 및 이해력 향상
- **특징:** 실시간 타이머, 섹션별 진행, 반추 기록

### 2. 메모진화
- **설명:** 마이크로 리딩의 '반추기록'에서 작성한 1줄 메모를 발전시켜, 지식을 확장하고 기억을 강화합니다.
- **목표:** 단순 메모 → 연결, 확장, 반복을 통한 장기 기억화
- **특징:** 메모 간 연결, 진화 트리, SRS(반복 복습) 지원

### 3. 젠고 기본
- **설명:** 바둑판 기반 기억착수 게임으로, 작업 기억력(Working Memory) 증강을 목표로 합니다.
- **목표:** 정보 임시 저장 및 활용 능력 강화
- **특징:** 다양한 난이도, 실시간 피드백, 점수 시스템

### 4. 젠고 오리지널
- **설명:** 사용자의 '단권화노트'(지식 요약/정리본)를 사고팔 수 있는 오픈마켓입니다.
- **목표:** 지식의 유통, 공유, 경제적 가치 창출
- **특징:** 노트 등록/구매, 평점/리뷰, 큐레이션

### 5. 젠고 마이버스
- **설명:** 사용자가 직접 젠고 게임을 만들어 자신만의 암기법을 실천할 수 있습니다.
- **목표:** 맞춤형 암기법 설계 및 실습
- **특징:** 게임 커스터마이즈, 공유, 챌린지

---

## 기술 스택

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

## 라이선스

(라이선스 정보 추가 예정)
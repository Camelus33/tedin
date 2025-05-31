# Habitus33 - Micro Reading & Memory Evolution Platform

뇌 최적화와 문해력, 기억력, 지식 확장을 위한 신경과학 기반 SaaS.
**마이크로 리딩, 메모진화, 기억력 게임, 오픈마켓, 사용자 제작 암기법까지!**

> “읽고, 기록하고, 진화하라. 당신의 뇌는 매일 새로워질 수 있다.” - Habitus33

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

## 설치 및 실행

### 필수 조건
- Node.js v16 이상
- MongoDB Atlas 계정 및 Connection String

### 백엔드
```bash
cd backend
npm install
# .env 파일에 MONGODB_URI, JWT_SECRET 등 환경 변수 설정
npm run dev
```

### 프론트엔드
```bash
cd frontend
npm install
# .env.local 파일에 NEXT_PUBLIC_API_URL 등 환경 변수 설정 (필요시)
npm run dev
```
- 프론트엔드: `http://localhost:3000`
- 백엔드: `http://localhost:8000` (또는 .env 설정 포트)

---

## 환경 변수

### 백엔드 (`backend/.env`)
```
PORT=8000
MONGODB_URI=...
JWT_SECRET=...
```

### 프론트엔드 (`frontend/.env.local`)
```
# NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 디렉토리 구조 (2024.06 기준, 상세 주석 포함)

```
habitus33/
│
├── README.md                # 프로젝트 소개 및 사용법 문서
├── package.json             # 루트 패키지 매니저(워크스페이스/공통 의존성)
├── package-lock.json        # 의존성 lock 파일
├── .gitignore               # Git 관리 제외 파일 목록
├── tsconfig.json            # TypeScript 공통 설정
│
├── app/                     # (루트) 앱 레벨 공통 코드/설정 (Next.js SSR 등)
│   ├── api/                 # API 라우트(Next.js)
│   ├── auth/                # 인증 관련 라우트
│   └── ui/                  # 공통 UI 컴포넌트
│
├── public/                  # 정적 파일(이미지, 사운드 등)
│   └── sounds/              # 효과음 등 오디오 파일
│
├── scripts/                 # 데이터 가공, 배치, 분석 등 유틸리티 스크립트
│   ├── zengo-proverbs-*.js  # 젠고 게임용 속담 데이터/분석/변환 스크립트
│   ├── check-zengo-data.js  # 젠고 데이터 검증
│   ├── insert-zengo-proverbs.js # DB에 젠고 속담 삽입
│   ├── ...                  # 기타 데이터 처리/백업/분석 스크립트
│
├── dump/                    # 데이터 백업, 임시 저장소
│   └── habitus33/           # 백업 데이터 하위 폴더
│
├── backend/                 # Express + MongoDB 기반 API 서버
│   ├── package.json         # 백엔드 의존성/스크립트
│   ├── package-lock.json
│   ├── tsconfig.json        # 백엔드 TypeScript 설정
│   ├── .env                 # 백엔드 환경 변수(비공개)
│   ├── app/                 # (신규) Next.js API 라우트/핸들러
│   │   ├── api/             # 결제, 유저, 웹훅 등 API 엔드포인트
│   │   │   ├── payments/    # 결제 관련 API (Stripe 등)
│   │   │   ├── user/        # 유저 관련 API
│   │   │   └── webhooks/    # 외부 서비스 웹훅
│   │   └── lib/             # API 라우트용 라이브러리
│   ├── src/                 # 핵심 서버 코드
│   │   ├── app.ts           # Express 앱 진입점
│   │   ├── database.ts      # DB 연결/설정
│   │   ├── controllers/     # 각 도메인별 요청 처리 로직
│   │   │   ├── zengoController.ts      # 젠고 게임/오리지널/마이버스
│   │   │   ├── myverseGameController.ts# 마이버스(사용자 제작 게임)
│   │   │   ├── noteController.ts       # 메모진화/노트
│   │   │   ├── bookController.ts       # 도서/내서재
│   │   │   ├── ...                     # 기타(유저, 세션, 루틴 등)
│   │   ├── models/          # Mongoose 스키마/모델
│   │   │   ├── Zengo.ts, MyverseGame.ts, Note.ts, ... # 각 도메인별 모델
│   │   ├── routes/          # API 라우트 정의
│   │   │   ├── zengo.ts, myverseGames.ts, notes.ts, ... # 각 도메인별 라우트
│   │   ├── services/        # 비즈니스 로직/서비스 계층
│   │   ├── middlewares/     # 인증, 권한 등 미들웨어
│   │   ├── utils/           # 공통 유틸리티 함수
│   │   ├── types/           # 타입 정의
│   │   ├── scripts/         # 서버 데이터 마이그레이션/유틸
│   │   └── backups/         # 서버 데이터 백업
│   ├── prisma/              # Prisma ORM 스키마/마이그레이션
│   │   └── schema.prisma
│   └── scripts/             # 서버 데이터 초기화/마이그레이션 스크립트
│
├── frontend/                # Next.js 기반 사용자 앱(프론트엔드)
│   ├── package.json         # 프론트엔드 의존성/스크립트
│   ├── package-lock.json
│   ├── tsconfig.json        # 프론트엔드 TypeScript 설정
│   ├── .eslintrc.json       # 린트 설정
│   ├── next.config.js       # Next.js 설정
│   ├── tailwind.config.js   # TailwindCSS 설정
│   ├── postcss.config.js    # PostCSS 설정
│   ├── app/                 # App Router 기반 페이지/라우트(도메인별 폴더)
│   │   ├── ts/              # 마이크로 리딩(TS모드)
│   │   ├── zengo/           # 젠고 기본/오리지널/마이버스
│   │   ├── books/           # 내 서재/도서
│   │   ├── brain-hack-routine/ # 루틴/습관
│   │   ├── dashboard/       # 인지 대시보드
│   │   ├── profile/         # 사용자 프로필
│   │   ├── reading-session/ # 리딩 세션
│   │   ├── myverse/         # 마이버스(사용자 제작 게임)
│   │   ├── share/           # 공유 기능
│   │   ├── onboarding/      # 온보딩
│   │   ├── notifications/   # 알림
│   │   ├── analytics/       # 통계/분석
│   │   └── ...              # 기타(약관, 정책 등)
│   ├── components/          # 재사용 UI 컴포넌트(도메인별/공통)
│   │   ├── ts/              # TS모드 관련 컴포넌트
│   │   ├── zengo/           # 젠고 관련 컴포넌트
│   │   ├── flashcard/       # 플래시카드
│   │   ├── landing/         # 랜딩/소개
│   │   ├── onboarding/      # 온보딩
│   │   ├── common/          # 공통 UI
│   │   ├── debug/           # 디버그/개발용
│   │   ├── dev/             # 개발용
│   │   ├── cognitive/       # 인지 관련
│   │   └── ...              # 기타
│   ├── store/               # Redux Toolkit 스토어/슬라이스
│   │   ├── store.ts         # 스토어 설정
│   │   ├── provider.tsx     # Provider 컴포넌트
│   │   └── slices/          # 도메인별 슬라이스(book, zengo, myverse 등)
│   ├── lib/                 # API 클라이언트, 유틸 함수 등
│   ├── hooks/               # 커스텀 훅(useAuth, useBooks, useTS 등)
│   ├── styles/              # 글로벌/모듈 CSS, Tailwind 등
│   ├── public/              # 정적 파일(이미지 등)
│   │   └── images/          # 이미지 리소스
│   ├── scripts/             # 프론트엔드 유틸 스크립트
│   └── src/                 # 타입, 유틸, 스타일 등(분리 관리)
│       ├── types/           # 타입 정의(zengo 등)
│       ├── utils/           # 유틸 함수
│       └── styles/          # 테마 등 스타일
│
└── node_modules/            # 공통 의존성(루트/백엔드/프론트엔드)
```

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
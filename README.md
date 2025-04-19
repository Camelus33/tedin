# Habitus33 - Brain Optimizer & Reading Habit System

뇌 최적화와 독서 습관, 인지력 향상을 위한 신경과학 기반 SaaS. 단 16분, 몰입·집중·기억력을 완전히 새롭게 설계하세요.

## 프로젝트 소개

Habitus33는 신경과학 기반의 뇌 최적화 루틴, 독서 습관 트래킹, 인지 훈련(Brain Training) 등으로 사용자의 집중력·이해력·기억력·습관 형성을 지원하는 웹 서비스입니다.

- **TS 모드**: (구 TT모드) 예열 → 본독서 → 반추 → 결과의 4단계 집중 독서 사이클. 각 단계별로 UX/로직 분리, 몰입 루틴 제공
- **ZenGo 모드**: 다양한 인지 훈련 세션(기억력, 주의력, 논리력 등)과 피드백, 세션별 동적 라우팅 지원
- **33일 루틴**: 습관 형성 및 트래킹, 마일스톤 관리
- **독서 현황/통계/분석**: 대시보드, 분석, 리더보드, 여정, 공유 등 다양한 시각화와 피드백

## 최근 업데이트 (2024.06)

### 새로운 기능
- TS모드(구 TT모드) 단계별 분리 및 UX 강화 (warmup/reading/review/result)
- ZenGo 인지 훈련 세션별 동적 라우팅, 결과/피드백 강화
- 도서 상세/수정/메모/추가 등 CRUD 세분화
- 온보딩, 프로필 업그레이드, 공유 등 신규 플로우 추가
- 글로벌 스타일, 애니메이션, 상태 관리, 보안/운영 강화

### 진행 중인 기능
- 소셜 기능, 커뮤니티, 고급 통계/분석, 알림 시스템 등

## 기술 스택

### 프론트엔드
- Next.js (App Router)
- TypeScript
- Redux Toolkit
- TailwindCSS
- framer-motion, Chart.js, react-hot-toast 등

### 백엔드
- Node.js
- Express
- MongoDB & Mongoose
- JWT 인증

## 주요 기능

- 회원가입/로그인/초대코드 시스템
- 도서 등록/상세/수정/메모/진행률 관리
- TS 모드 (예열-본독서-반추-결과) 집중 루틴
- ZenGo 모드 (인지 훈련 세션/결과/피드백)
- 33일 습관 루틴 트래킹/마일스톤
- 독서 통계/분석/리더보드/여정/공유
- 온보딩, 프로필 업그레이드, 알림 등

## 설치 및 실행

### 필수 조건
- Node.js v16 이상
- MongoDB

### 프론트엔드 설치
```bash
cd frontend
npm install
npm run dev
```

### 백엔드 설치
```bash
cd backend
npm install
npm run dev
```

## 환경 변수 설정

### 백엔드 (.env)
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/habitus33
JWT_SECRET=your_jwt_secret
```

### 프론트엔드 (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 디렉토리 구조 (2024.06 기준)

```
habitus33/
├── frontend/                    # 💻 Next.js App Router 기반 사용자 앱
│   ├── app/                    # 페이지 라우팅
│   │   ├── auth/
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── books/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── notes/
│   │   │   │       ├── new/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── ...
│   │   │   ├── new/
│   │   │   └── add/
│   │   ├── ts/               # TS 모드(집중 독서 루틴)
│   │   │   ├── page.tsx      # 세션 설정/시작
│   │   │   ├── warmup/
│   │   │   │   └── page.tsx
│   │   │   ├── reading/
│   │   │   │   └── page.tsx
│   │   │   ├── review/
│   │   │   │   └── page.tsx
│   │   │   └── result/
│   │   │       └── page.tsx
│   │   ├── zengo/            # ZenGo 인지 훈련
│   │   │   ├── page.tsx
│   │   │   ├── zengo.css
│   │   │   ├── session/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── session.css
│   │   │   └── results/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── reading-session/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── onboarding/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   └── upgrade/
│   │   │       └── page.tsx
│   │   ├── journey/
│   │   │   └── page.tsx
│   │   ├── leaderboard/
│   │   ├── share/
│   │   │   └── [shareId]/
│   │   ├── legal/
│   │   └── dev/
│   ├── components/
│   ├── hooks/
│   ├── store/
│   ├── lib/
│   ├── styles/
│   ├── tests/
│   └── public/
│
├── backend/                    # 🔧 Express + MongoDB 기반 API 서버
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── config/
│   │   └── app.ts
...
```

## API 문서

API 문서는 [여기](docs/api.md)에서 확인하실 수 있습니다.

### 주요 API 엔드포인트

#### 도서 관리
- `GET /api/books` - 도서 목록 조회
- `GET /api/books/:id` - 도서 상세 정보 조회
- `POST /api/books` - 새 도서 등록
- `PUT /api/books/:id` - 도서 정보 수정
- `PUT /api/books/:id/progress` - 도서 진행상황 업데이트
- `DELETE /api/books/:id` - 도서 삭제

#### 독서 세션
- `POST /api/reading-sessions` - 새 독서 세션 시작
- `PUT /api/reading-sessions/:id` - 독서 세션 업데이트
- `GET /api/reading-sessions/stats` - 독서 통계 조회

## 기여 방법

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.

## 연락처

개발자: camelus – camelus.tedin@gmail.com
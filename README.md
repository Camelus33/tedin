# Habitus33 - Fast Reading

읽기능력 향상을 위한 인지증강 앱 서비스. 더 빠르게, 더 깊게, 더 오래 읽으세요.

## 프로젝트 소개

Habitus33(Fast Reading)는 독서 능력 향상을 위한 웹 애플리케이션입니다. TT(Time Trial) 모드와 ZenGo 모드를 통해 사용자의 독서 속도, 집중력, 이해력, 메타인지 능력을 향상시킵니다.

- **TT 모드**: 타이머 기반 집중 독서 시스템으로, 예열 → 독서 → 반추 3단계 학습 사이클을 통해 독서 효율성과 기억력을 향상
- **ZenGo 모드**: 바둑에서 영감을 받은 인지 훈련으로, 집중력, 기억력, 메타 인지 능력을 다양한 모듈을 통해 훈련

## 최근 업데이트 (2024.03)

### 새로운 기능
- 책 정보 수정 페이지 개선
  - 장르 선택 기능 (12개 카테고리)
  - 독서 목적 설정 (정독, 다독, 발췌독, 복습, TT모드)
  - TT모드 전용 읽기 속도 설정
  - 현재 페이지 진행률 추적
- 로컬 스토리지 기반 메타데이터 관리
- 향상된 에러 처리 및 타임아웃 관리
- 반응형 UI/UX 개선

### 진행 중인 기능
- 책 표지 이미지 업로드 (UI 구현 완료, 기능 구현 예정)
- 독서 통계 대시보드
- 소셜 기능

## 기술 스택

### 프론트엔드
- Next.js (App Router)
- TypeScript
- Redux Toolkit
- TailwindCSS
- Formik & Yup

### 백엔드
- Node.js
- Express
- MongoDB & Mongoose
- JWT 인증

## 주요 기능

- 회원가입/로그인/초대코드 시스템
- 도서 등록 및 관리
- TT 모드 (예열-독서-반추)
- ZenGo 모드 (다양한 인지 훈련 모듈)
- 독서 메모 및 태그 관리
- 독서 진행률 및 통계
- 리더보드 및 성과 공유
- 상장 및 뱃지 시스템

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

## 디렉토리 구조

```
habitus33/
├── frontend/                    # 💻 Next.js App Router 기반 사용자 앱
│   ├── app/                    # 페이지 라우팅
│   │   ├── auth/              # 인증 관련 페이지
│   │   ├── books/             # 도서 관리 페이지
│   │   ├── dashboard/         # 메인 대시보드
│   │   ├── reading-session/   # 독서 세션 관리
│   │   ├── ts/               # TT 모드 관련 페이지
│   │   ├── zengo/            # ZenGo 모드 페이지
│   │   ├── profile/          # 사용자 프로필
│   │   ├── analytics/        # 독서 분석 페이지
│   │   ├── journey/          # 독서 여정 페이지
│   │   ├── leaderboard/      # 리더보드
│   │   ├── share/            # 공유 기능
│   │   ├── legal/           # 법적 문서
│   │   └── dev/             # 개발자 도구
│   ├── components/             # 공통 UI 컴포넌트
│   │   ├── common/           # 재사용 가능한 기본 컴포넌트
│   │   ├── books/            # 도서 관련 컴포넌트
│   │   └── analytics/        # 분석 관련 컴포넌트
│   ├── hooks/                  # 커스텀 훅
│   ├── store/                  # Redux Toolkit
│   ├── lib/                    # 유틸 함수
│   │   ├── api/              # API 통합 모듈
│   │   └── utils/            # 유틸리티 함수
│   ├── styles/                 # Tailwind 설정 + 전역 테마 토큰
│   ├── tests/                  # 테스트 파일
│   └── public/                 # 정적 자산
│
├── backend/                    # 🔧 Express + MongoDB 기반 API 서버
│   ├── src/
│   │   ├── controllers/        # 기능별 컨트롤러
│   │   ├── routes/             # 라우팅 (REST API 구조)
│   │   ├── models/             # Mongoose 스키마
│   │   ├── middlewares/        # 인증, 오류, 검증 등
│   │   ├── utils/              # 유틸 함수
│   │   ├── config/             # 환경 변수, DB 연결
│   │   └── app.ts              # Express 앱 정의
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

개발자: 김개발 – developer@email.com 
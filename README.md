# Habitus33 AI-Link Workflow Engine

## 1. 프로젝트 개요

이 프로젝트는 Habitus33 서비스의 핵심 백엔드 기능인 **AI-Link 워크플로우 엔진**을 구현합니다. 이 엔진의 목표는 사용자의 분산된 지식(메모, 하이라이트 등)을 온톨로지 기반 지식 그래프로 구조화하고, 사용자의 목표에 맞춰 최적의 컨텍스트를 AI 모델에 제공함으로써, '프롬프트 없는' 초개인화 AI 경험을 제공하는 것입니다.

## 2. 핵심 아키텍처

![Architecture Diagram](https://path.to/architecture_diagram.png) 
*(TODO: 아키텍처 다이어그램 이미지 링크 추가)*

본 시스템은 3단계의 파이프라인으로 구성됩니다.

1.  **Context Orchestrator**: 사용자의 목표(`aiLinkGoal`)를 입력받아, 지식 그래프에서 관련 메모, 책 구절 등을 SPARQL 쿼리로 조회하여 `ContextBundle`을 생성합니다.
2.  **Prompt Generator**: `ContextBundle`을 각 AI 모델(OpenAI, Claude 등)의 특성에 맞는 최적의 프롬프트로 변환합니다.
3.  **Response Handler**: AI의 응답을 파싱하여 사용자에게 보여줄 최종 결과로 가공하고, 답변에서 발견된 새로운 지식은 다시 지식 그래프에 저장합니다.

## 3. 기술 스택

-   **언어**: TypeScript
-   **프레임워크**: Node.js, Express
-   **데이터베이스**: MongoDB (주요 데이터), GraphDB (지식 그래프 - 예: Stardog, Neo4j)
-   **온톨로지**: RDF/OWL, SPARQL
-   **테스팅**: Jest, Supertest

## 4. 시작하기

### 설치

```bash
# 저장소 복제
git clone https://github.com/habitus33/habitus33.git
cd habitus33/backend

# 의존성 설치
npm install
```

### 환경 변수 설정

루트 디렉터리에 `.env` 파일을 생성하고 다음 변수를 설정합니다.

```
MONGODB_URI=mongodb://localhost:27017/habitus33
GRAPHDB_URL=http://localhost:7200/repositories/habitus33
# ... 기타 필요한 변수들
  ```

### 실행

```bash
# 개발 모드로 실행 (핫 리로딩)
npm run dev:watch

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start
```

### 테스트

```bash
# 모든 유닛 테스트 실행
npm test

# 통합 테스트만 실행
npm run test:integration
```

## 5. 주요 디렉터리 구조

-   `src/models/`: MongoDB 스키마 (Mongoose)
-   `src/services/`: 핵심 비즈니스 로직 (ContextOrchestrator 등)
-   `src/controllers/`: API 요청/응답 처리
-   `src/routes/`: API 라우팅
-   `ontology/`: RDF/OWL 온톨로지 파일 (`.ttl`)
-   `tests/`: 통합 테스트 파일
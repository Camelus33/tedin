# AMFA 프로세스 인터랙티브 데모 설계

## Executive Summary

AMFA 프로세스의 핵심 가치인 "Prompt Free" 경험을 사용자가 직접 체험할 수 있는 인터랙티브 데모를 설계합니다. 기존 컴포넌트를 활용하여 3개 페르소나별로 맞춤화된 10분 체험 시나리오를 제공합니다.

## 기존 컴포넌트 분석 결과

### 활용 가능한 기존 애니메이션 컴포넌트
1. **WaveAnimation**: 마우스 인터랙션 기반 파도 효과 - 사용자 행동에 따른 동적 반응
2. **AMFAAnimation**: 스크롤 기반 파티클 → 연결 → 캡슐화 애니메이션
3. **AMFACards**: 4단계 AMFA 프로세스 카드 시스템 
4. **InteractiveOnboardingGuide**: 기존 온보딩 가이드 (업그레이드 필요)
5. **ArticleToCapsuleAnimation**: 기사에서 캡슐로의 변환 애니메이션

### 개선이 필요한 영역
- 페르소나별 맞춤 콘텐츠 부족
- 실제 AMFA 프로세스 체험 기능 미흡
- 10분 가치 경험 시나리오 부재

---

## 인터랙티브 데모 전체 구조

### Phase 1: 페르소나 선택 (1분)
**목표**: 사용자 유형 식별 및 맞춤 경험 시작

#### UI/UX 설계
```typescript
interface PersonaSelectionProps {
  onPersonaSelect: (persona: 'learner' | 'researcher' | 'professional') => void;
}
```

**구현 요소**:
- 3개 페르소나 카드 (기존 AMFACards 스타일 활용)
- 각 카드 호버 시 WaveAnimation 트리거
- 선택 시 해당 페르소나 맞춤 애니메이션 전환

**페르소나별 카드 디자인**:
1. **학습자**: BookOpenIcon, 사이언 색상, "AI 튜터 체험하기"
2. **연구자**: LightBulbIcon, 퍼플 색상, "연구 파트너 체험하기"  
3. **직장인**: CpuChipIcon, 블루 색상, "업무 파트너 체험하기"

### Phase 2: AMFA 프로세스 인터랙티브 체험 (7분)

#### 2.1 Atomic Reading + Atomic Memo (2분)
**학습자 시나리오**: TOEFL 지문 → 핵심 단어 메모
**연구자 시나리오**: 논문 초록 → 연구 질문 메모  
**직장인 시나리오**: 시장 리포트 → 인사이트 메모

**인터랙션 설계**:
```typescript
interface AtomicMemoCreatorProps {
  persona: PersonaType;
  sampleContent: string;
  onMemoCreated: (memo: AtomicMemo) => void;
}
```

**구현 기능**:
- 드래그 앤 드롭으로 텍스트 선택
- 실시간 메모 생성 (1줄 제한)
- 생성된 메모에 파티클 효과 (기존 AMFAAnimation 활용)

#### 2.2 Memo Evolution (2분)
**목표**: 여러 메모들이 연결되어 진화하는 과정 시각화

**인터랙션 설계**:
```typescript
interface MemoEvolutionProps {
  atomicMemos: AtomicMemo[];
  onEvolutionComplete: (evolvedMemo: EvolvedMemo) => void;
}
```

**시각적 구현**:
- 기존 AMFAAnimation의 파티클 연결 로직 활용
- 메모들이 자석처럼 끌어당겨지는 애니메이션
- 연결선 생성 후 새로운 통합 메모 등장

**페르소나별 진화 시나리오**:
- **학습자**: 단어 메모들 → 문법 패턴 발견
- **연구자**: 개별 관찰 → 가설 형성
- **직장인**: 데이터 포인트 → 트렌드 인사이트

#### 2.3 Focused Note (2분)
**목표**: 진화된 메모에서 핵심 노트 추출

**인터랙션 설계**:
```typescript
interface FocusedNoteGeneratorProps {
  evolvedMemo: EvolvedMemo;
  persona: PersonaType;
  onNoteGenerated: (note: FocusedNote) => void;
}
```

**구현 기능**:
- AI 기반 자동 요약 (실제 API 호출 시뮬레이션)
- 사용자가 중요도 조절 가능한 슬라이더
- 실시간 노트 길이/품질 조정

#### 2.4 AI-Link 생성 (1분)
**목표**: 최종 지식 캡슐 생성 및 AI 어시스턴트 연결

**시각적 구현**:
- 기존 CrystalAnimation 활용
- 노트가 캡슐로 변환되는 모핑 애니메이션
- AI 아바타 등장 및 첫 대화 시뮬레이션

### Phase 3: 가치 실증 및 다음 단계 (2분)

#### 3.1 Before/After 비교 (1분)
**구현 요소**:
```typescript
interface BeforeAfterComparisonProps {
  persona: PersonaType;
  originalTask: string;
  aiLinkResult: string;
}
```

**시각적 설계**:
- 분할 화면으로 "일반 AI vs AI-Link" 비교
- 프롬프트 작성 시간 vs 즉시 응답 시간 비교
- 응답 품질 차이 하이라이트

#### 3.2 개인화 설정 및 시작하기 (1분)
**구현 요소**:
- 학습 목표/연구 분야/업무 영역 설정
- 알림 주기 및 선호도 설정
- "내 AI-Link 만들기" CTA 버튼

---

## 페르소나별 맞춤 시나리오 상세

### 학습자 (Sarah Kim) 시나리오
**샘플 콘텐츠**: TOEFL Reading 지문
```
"The Industrial Revolution marked a major turning point in history. 
It transformed manufacturing, transportation, and communication..."
```

**체험 흐름**:
1. **Atomic Memo**: "Industrial Revolution = major turning point" 생성
2. **Evolution**: 여러 역사적 전환점 메모들과 연결 → "역사적 변화 패턴" 발견
3. **Focused Note**: "산업혁명의 3가지 핵심 변화와 현대적 의미" 요약
4. **AI-Link**: "TOEFL 역사 문제에서 이런 패턴이 나오면 이렇게 접근하세요" 조언

### 연구자 (Dr. James Park) 시나리오  
**샘플 콘텐츠**: 최신 AI 논문 초록
```
"Recent advances in transformer architectures have shown 
significant improvements in natural language understanding..."
```

**체험 흐름**:
1. **Atomic Memo**: "Transformer → NLU 성능 향상" 생성
2. **Evolution**: 관련 아키텍처 메모들과 연결 → "AI 발전 트렌드" 도출
3. **Focused Note**: "트랜스포머 기반 연구의 3가지 핵심 방향과 연구 기회" 정리
4. **AI-Link**: "당신의 연구 분야에서 이 기술을 활용할 수 있는 3가지 방법" 제안

### 직장인 (Michael Chen) 시나리오
**샘플 콘텐츠**: 시장 분석 리포트
```
"Q4 consumer spending showed a 15% increase in digital services 
while traditional retail declined by 8%..."
```

**체험 흐름**:
1. **Atomic Memo**: "디지털 서비스 +15%, 전통 소매 -8%" 생성
2. **Evolution**: 다른 시장 데이터와 연결 → "디지털 전환 가속화" 트렌드 발견
3. **Focused Note**: "Q4 소비 패턴 변화와 비즈니스 기회 3가지" 요약
4. **AI-Link**: "이 트렌드를 당신의 프로젝트에 적용하는 전략" 제안

---

## 기술적 구현 사양

### 컴포넌트 아키텍처
```typescript
// 메인 데모 컨테이너
interface AMFAInteractiveDemoProps {
  onDemoComplete: (result: DemoResult) => void;
  onPersonaSelect: (persona: PersonaType) => void;
}

// 단계별 컴포넌트
interface StepComponentProps {
  persona: PersonaType;
  stepData: StepData;
  onStepComplete: (result: StepResult) => void;
  onStepProgress: (progress: number) => void;
}
```

### 상태 관리
```typescript
interface DemoState {
  currentStep: 'persona' | 'atomic' | 'evolution' | 'focused' | 'ailink' | 'comparison';
  persona: PersonaType | null;
  stepResults: {
    atomicMemo?: AtomicMemo;
    evolvedMemo?: EvolvedMemo;
    focusedNote?: FocusedNote;
    aiLink?: AILink;
  };
  progress: number;
}
```

### 애니메이션 통합
- **기존 WaveAnimation**: 사용자 인터랙션 반응
- **기존 AMFAAnimation**: 단계 전환 및 프로세스 시각화
- **새로운 MorphingAnimation**: 메모 → 노트 → 캡슐 변환
- **새로운 ConnectionAnimation**: 메모들 간의 연결 시각화

---

## 성능 및 접근성 고려사항

### 성능 최적화
- **지연 로딩**: 단계별 컴포넌트 lazy loading
- **애니메이션 최적화**: requestAnimationFrame 활용
- **메모리 관리**: 불필요한 애니메이션 정리

### 접근성 (WCAG 2.1 AA 준수)
- **키보드 내비게이션**: 모든 인터랙션 요소 접근 가능
- **스크린 리더**: 애니메이션 진행 상황 음성 안내
- **색상 대비**: 최소 4.5:1 대비율 유지
- **모션 감소**: prefers-reduced-motion 지원

### 반응형 디자인
- **데스크톱**: 풀 인터랙티브 경험
- **태블릿**: 터치 최적화 인터랙션
- **모바일**: 단순화된 애니메이션, 핵심 기능 유지

---

## 분석 및 측정 지표

### 사용자 행동 추적
```typescript
interface DemoAnalytics {
  stepCompletionTimes: Record<string, number>;
  interactionCounts: Record<string, number>;
  dropoffPoints: string[];
  personaPreferences: Record<PersonaType, number>;
}
```

### 핵심 성공 지표
- **완료율**: 전체 데모 완료 비율 (목표: 80%+)
- **참여도**: 각 단계별 평균 체류 시간
- **전환율**: 데모 완료 후 회원가입 비율 (목표: 25%+)
- **만족도**: 데모 후 설문 점수 (목표: 4.5/5.0+)

---

## 구현 우선순위

### P0 (필수 - 2주)
1. 페르소나 선택 인터페이스
2. 기본 AMFA 4단계 인터랙션
3. 페르소나별 샘플 콘텐츠 통합

### P1 (중요 - 3주)  
1. 고급 애니메이션 효과
2. Before/After 비교 기능
3. 분석 시스템 통합

### P2 (개선 - 4주)
1. 고급 개인화 설정
2. 소셜 공유 기능
3. 다국어 지원

---

## 다음 단계 연결점

### Task 4 (개인화된 온보딩 플로우 UI/UX)
- 데모 완료 후 자연스러운 온보딩 플로우 연결
- 데모에서 수집한 선호도 정보 활용

### Task 5 (프론트엔드 구현)
- React/Next.js 기반 컴포넌트 구현
- 기존 AMFA 컴포넌트들과의 통합

### Task 6 (백엔드 로직)
- 데모 진행 상황 저장
- AI 시뮬레이션 API 구현
- 분석 데이터 수집

이 설계를 통해 사용자들은 AMFA 프로세스의 실제 가치를 체험하고, "Prompt Free" 철학을 직접 경험할 수 있게 됩니다. 
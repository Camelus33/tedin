# Habitus33 Ontology Developer Guide v1.0

## 1. 개요 (Introduction)

### 1.1. 프로젝트 비전
이 문서는 Habitus33의 독보적인 AI-Link 기술의 핵심이 될 '학습자 중심 지식 온톨로지'의 설계 및 개발 가이드입니다. 이 온톨로지의 목표는 AI가 서비스의 맥락에서 벗어나 오직 학습자의 지식 형성 과정과 인지적 성장에만 집중하여, 깊이 있는 개인화된 상호작용을 가능하게 하는 것입니다.

### 1.2. 핵심 철학 및 원칙
- **학습자 중심성 (Learner-Centricity):** 모든 데이터와 관계는 학습자의 인지 과정, 경험, 맥락을 중심으로 모델링됩니다.
- **AI 해석 가능성 (AI-Interpretability):** AI가 최소한의 해석 비용으로 학습자의 의도와 상태를 명확하게 추론할 수 있도록 설계됩니다.
- **상호 운용성 (Interoperability):** W3C 표준(RDF, OWL, SKOS)을 준수하여 특정 기술에 종속되지 않고 외부 지식 베이스와 연동 가능하도록 합니다.
- **점진적 확장성 (Evolvability):** 새로운 학습 영역이나 데이터 유형이 추가될 때, 기존 구조를 파괴하지 않고 유연하게 확장될 수 있도록 설계합니다.

---

## 2. 온톨로지 명세 (Ontology Specification)

### 2.1. 네임스페이스 및 URI 규칙
- **기본 URI (Base URI):** `https://habitus33.ai/ontology/`
- **주요 네임스페이스 (Prefixes):**
    - `h33o`: `https://habitus33.ai/ontology/core#` (온톨로지 스키마)
    - `h33r`: `https://habitus33.ai/resource/` (실제 데이터 인스턴스)
    - `skos`: `http://www.w3.org/2004/02/skos/core#` (개념 체계)
    - `prov`: `http://www.w3.org/ns/prov#` (데이터 출처 및 이력)
    - `xsd`: `http://www.w3.org/2001/XMLSchema#` (데이터 타입)

### 2.2. 핵심 클래스 (Core Classes)
- **`h33o:Agent`**: 학습 과정의 주체.
    - `h33o:Learner`: 개인 사용자.
- **`h33o:KnowledgeResource`**: 학습의 재료.
    - `h33o:TextResource`, `h33o:UserGeneratedContent` (`Note`, `Summary`, `Question`)
- **`h33o:LearningActivity`**: 학습자의 구체적 행동.
    - `h33o:ConsumptionActivity`, `h33o:CreationActivity`, `h33o:CognitiveActivity`
- **`skos:Concept`**: 학습의 대상이 되는 아이디어나 주제.
- **`h33o:CognitiveState`**: 특정 시점의 내면적 상태.
    - `h33o:ComprehensionLevel`, `h33o:MentalModel`, `h33o:Insight`

### 2.3. 핵심 속성 (Core Properties)
- **Object Properties:**
    - `h33o:performs`: `Learner` -> `LearningActivity`
    - `h33o:targets`: `LearningActivity` -> `skos:Concept`
    - `h33o:hasState`: `Learner` -> `CognitiveState`
    - `prov:wasGeneratedBy`: `CognitiveState` -> `LearningActivity`
    - `prov:used`: `LearningActivity` -> `CognitiveState`
- **Datatype Properties:**
    - `h33o:hasContent`: `Note` -> `xsd:string`
    - `prov:generatedAtTime`: `LearningActivity` -> `xsd:dateTime`
    - `skos:prefLabel`: `skos:Concept` -> `xsd:string`

---

## 3. 비파괴적 통합 가이드 (Non-Disruptive Integration)
### 3.1. JSON-LD 컨텍스트 매핑
기존 AI-Link JSON 구조를 변경하지 않고, `@context` 파일을 통해 각 JSON 키에 온톨로지적 의미를 부여합니다. 이 방식은 시스템 안정성을 유지하면서 시맨틱 웹 기술을 도입하는 핵심 전략입니다.

- **참조 파일:** `frontend/public/ai-link-context.jsonld`

---

## 4. 고급 모델링 (Advanced Modeling)
### 4.1. 시간적 진행 모델링 (Temporal Evolution)
`PROV-O` 온톨로지를 활용하여 모든 `CognitiveState`가 특정 `LearningActivity`에 의해 생성(`prov:wasGeneratedBy`)되고, 이전 상태를 기반(`prov:used`)으로 함을 명시합니다. 이를 통해 학습자의 이해도 변화 과정을 인과적으로 추적할 수 있습니다.

### 4.2. 추론 규칙 (Inference Rules)
SPIN 또는 SHACL 규칙을 사용하여 명시적 데이터에 기반한 새로운 사실을 추론합니다.
- **예시 규칙:** 3회 이상 학습 활동 + 1회 이상 메모 작성 -> '기본 이해' 상태 획득.
- **참조 파일:** `scripts/ontology/inference_rules.spin.ttl`

---

## 5. AI 상호작용 프로토콜 (AI Interaction Protocol)
AI-Link 데이터 내에 `aiInterpretationProtocol` 메타데이터를 포함시켜, AI가 데이터를 해석하는 관점과 초점을 명확히 지시합니다.
- **`persona`**: "Personalized Learning Companion"
- **`focusDirectives`**: 학습자의 인지적 진화에 초점, 시스템 내부 ID 및 타인 비교는 무시.
- **`ethicalGuardrails`**: 타인과 비교 금지, 건설적이고 격려하는 피드백 생성.

---

## 6. 품질 보증 및 테스트 (Validation & QA)
### 6.1. 데이터 무결성 검증
**SHACL**을 사용하여 데이터가 정의된 규칙(예: 클래스의 필수 속성, 값의 타입)을 준수하는지 검증합니다.
- **참조 파일:** `scripts/ontology/validation_shapes.shacl.ttl`

### 6.2. 모델 일관성 검증
**SPARQL** 쿼리를 사용하여 온톨로지 모델 자체의 논리적 일관성(예: 속성의 Domain/Range 준수 여부)을 검증합니다. 
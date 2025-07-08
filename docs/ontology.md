# Habitus33 온톨로지 설계 문서

## 1. 개요

이 문서는 Habitus33의 지식 그래프를 구성하는 온톨로지의 설계 원칙과 구조를 설명합니다. 우리 온톨로지는 재사용성과 확장성을 위해 계층적 구조를 가집니다.

-   **Mid-Level Ontology (Core)**: 다른 어떤 도메인에서도 재사용할 수 있는 보편적이고 추상적인 개념(사람, 문서, 개념 등)을 정의합니다.
-   **Domain-Level Ontology (App)**: Habitus33 서비스에만 존재하는 구체적인 개념(PDF책, 메모 진화, 읽기 세션 등)을 정의하며, Mid-Level 온톨로지를 상속받아 확장합니다.

## 2. 온톨로지 파일 구조

-   `backend/ontology/core/`: Mid-Level 온톨로지 파일 위치
    -   `Agent.ttl`: 사용자와 팀 등 행위 주체를 정의합니다. (FOAF 온톨로지 확장)
    -   `KnowledgeResource.ttl`: 책, 아티클 등 지식 자원을 정의합니다. (BIBO, Dublin Core 확장)
    -   `KnowledgeUnit.ttl`: 메모, 하이라이트 등 지식의 최소 단위를 정의합니다.
-   `backend/ontology/app/`: Domain-Level 온톨로지 파일 위치
    -   `habitus33.ttl`: 서비스 고유 개념을 정의하고, 모든 Core 온톨로지를 임포트하여 통합합니다.

## 3. 핵심 클래스 및 관계

### Mid-Level (Core)

-   `core-agent:User`: 시스템 사용자 (foaf:Person)
-   `core-k-resource:Book`: 일반적인 책 (bibo:Book)
-   `core-k-unit:Note`: 일반적인 메모

### Domain-Level (App)

-   `app:PDFBook`: 우리 시스템에 업로드된 PDF 책. `core-k-resource:Book`을 상속.
-   `app:MemoEvolution`: 여러 노트를 종합하여 진화시킨 상위 레벨의 지식. `core-k-unit:KnowledgeUnit`을 상속.
-   `app:hasReadingSession` (관계): `User`가 `ReadingSession`을 가짐.
-   `app:evolvedFrom` (관계): `MemoEvolution`이 어떤 `Note`들로부터 진화했는지 나타냄.

## 4. 온톨로지 확장 가이드

새로운 개념(예: '웹 클리핑')을 추가해야 할 경우:

1.  **분류**: 이 개념이 '지식 자원'인가, '지식 단위'인가? -> '지식 단위(KnowledgeUnit)'에 가깝다.
2.  **파일 선택**: `backend/ontology/app/habitus33.ttl` 파일을 연다.
3.  **클래스 정의**: 다음과 같이 새로운 클래스를 추가한다.
    ```turtle
    :WebClipping rdf:type owl:Class ;
                 rdfs:subClassOf core-k-unit:KnowledgeUnit .
    ```
4.  **관계 정의**: 필요하다면 `WebClipping`이 가지는 고유한 관계(예: `clippedFromURL`)를 `owl:ObjectProperty` 또는 `owl:DatatypeProperty`로 정의한다. 
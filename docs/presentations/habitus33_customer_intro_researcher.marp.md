---
marp: true
title: Habitus33 for Researchers
paginate: true
theme: default
class: lead
description: 고객용(연구자 세그먼트) 15장
style: |
  section { color: #e5e7eb; }
  h1, h2, h3 { color: #e5e7eb; }
  h1 { font-size: 52px; }
  h2 { font-size: 40px; }
  p, li { font-size: 28px; line-height: 1.5; }
  a { color: #93c5fd; }
---

![bg](./assets/bg_cover.svg)
# Thought Pattern Mapping, Habitus33
![bg right:40% 80%](../../frontend/public/images/mascot/habitus-logo-seal.png)
Researcher Edition — 문헌‑메모를 AI‑준비 지식으로

---

![bg](./assets/bg_problem.svg)
# 연구자의 현재 문제
![bg opacity:0.06](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'><rect x='80' y='560' width='1440' height='260' rx='16' fill='%23ffffff' fill-opacity='0.06' stroke='%2393c5fd' stroke-dasharray='10,8' stroke-opacity='0.5' stroke-width='3'/><text x='150' y='700' fill='%2393c5fd' fill-opacity='0.8' font-size='28' font-family='Arial'>Screenshot placeholder</text></svg>)
- 방대한 문헌 하이라이트가 흩어짐, 재사용성 낮음
- LLM이 도메인 컨텍스트/용어 계층을 충분히 반영 못함
- 리뷰/초록/도표 생성 반복 부담

---

![bg](./assets/bg_solution.svg)
![bg](./assets/bg_solution.svg)
# 해결: 컨텍스트 보존형 캡슐화
![bg opacity:0.06](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'><rect x='80' y='560' width='1440' height='260' rx='16' fill='%23ffffff' fill-opacity='0.06' stroke='%2374c0fc' stroke-dasharray='10,8' stroke-opacity='0.5' stroke-width='3'/><text x='150' y='700' fill='%2374c0fc' fill-opacity='0.8' font-size='28' font-family='Arial'>Screenshot placeholder</text></svg>)
문헌 하이라이트→메모→단권화 노트→AI‑Link(JSON‑LD)
도메인 온톨로지 문맥을 LLM에 직접 전달

---

![bg](./assets/bg_amfa.svg)
![bg](./assets/bg_amfa.svg)
# AMFA 적용
![bg opacity:0.06](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'><rect x='80' y='560' width='1440' height='260' rx='16' fill='%23ffffff' fill-opacity='0.06' stroke='%238b5cf6' stroke-dasharray='10,8' stroke-opacity='0.5' stroke-width='3'/><text x='150' y='700' fill='%238b5cf6' fill-opacity='0.8' font-size='28' font-family='Arial'>Screenshot placeholder</text></svg>)
- Atomic Memo(논문 단락 요약)
- Memo Evolution(근거/연결/인용 정리)
- Focused Note(섹션 구조 유지)
- AI‑Link(용어/관계 캡슐)

---

![bg](./assets/bg_solution.svg)
![bg](./assets/bg_solution.svg)
# 워크플로우(요약)
![bg opacity:0.06](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'><rect x='80' y='560' width='1440' height='260' rx='16' fill='%23ffffff' fill-opacity='0.06' stroke='%230ea5e9' stroke-dasharray='10,8' stroke-opacity='0.5' stroke-width='3'/><text x='150' y='700' fill='%230ea5e9' fill-opacity='0.8' font-size='28' font-family='Arial'>Screenshot placeholder</text></svg>)
PDF 선택→메모 → 단권화(순서/출처 유지) →
하이브리드 검색 → AI 요약/리뷰/표 생성

---

![bg](./assets/bg_problem.svg)
![bg](./assets/bg_problem.svg)
# 데모 1: 문헌 캡처
![bg opacity:0.08](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'><rect x='80' y='520' width='1440' height='300' rx='16' fill='%23ffffff' fill-opacity='0.08' stroke='%2394a3b8' stroke-dasharray='10,8' stroke-opacity='0.6' stroke-width='3'/><text x='150' y='690' fill='%2394a3b8' fill-opacity='0.9' font-size='28' font-family='Arial'>PDF highlight</text></svg>)
- 하이라이트→원클릭 메모 저장
- 반추 메모 자동화로 맥락 손실 최소화

---

![bg](./assets/bg_amfa.svg)
![bg](./assets/bg_amfa.svg)
# 데모 2: 구조화/관계화
![bg opacity:0.08](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'><rect x='80' y='520' width='1440' height='300' rx='16' fill='%23ffffff' fill-opacity='0.08' stroke='%23a78bfa' stroke-dasharray='10,8' stroke-opacity='0.6' stroke-width='3'/><text x='150' y='690' fill='%23a78bfa' fill-opacity='0.9' font-size='28' font-family='Arial'>Links / graph</text></svg>)
- 생각추가/연결로 개념 그래프 강화
- 단권화 노트에 출처·순서 보존

---

![bg](./assets/bg_solution.svg)
![bg](./assets/bg_solution.svg)
# 데모 3: 캡슐 활용
![bg opacity:0.08](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'><rect x='80' y='520' width='1440' height='300' rx='16' fill='%23ffffff' fill-opacity='0.08' stroke='%236366f1' stroke-dasharray='10,8' stroke-opacity='0.6' stroke-width='3'/><text x='150' y='690' fill='%236366f1' fill-opacity='0.9' font-size='28' font-family='Arial'>AI‑Link / review</text></svg>)
- AI‑Link로 도메인 컨텍스트 주입
- 리뷰 초안/도표/요약 자동 생성 가속

---

![bg](./assets/bg_amfa.svg)
![bg](./assets/bg_amfa.svg)
# 개인 지식 검색 + 대화
![bg opacity:0.06](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'><rect x='80' y='560' width='1440' height='260' rx='16' fill='%23ffffff' fill-opacity='0.06' stroke='%230ea5e9' stroke-dasharray='10,8' stroke-opacity='0.5' stroke-width='3'/><text x='150' y='700' fill='%230ea5e9' fill-opacity='0.8' font-size='28' font-family='Arial'>Search / chat</text></svg>)
- 키워드+벡터 검색으로 관련 연구 즉시 회수
- 결과를 컨텍스트로 질의 → 정확한 인용/근거 포함

---

![bg](./assets/bg_problem.svg)
![bg](./assets/bg_problem.svg)
# 차별화(연구자 관점)
![bg opacity:0.06](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'><rect x='80' y='560' width='1440' height='260' rx='16' fill='%23ffffff' fill-opacity='0.06' stroke='%2394a3b8' stroke-dasharray='10,8' stroke-opacity='0.5' stroke-width='3'/><text x='150' y='700' fill='%2394a3b8' fill-opacity='0.8' font-size='28' font-family='Arial'>Diff visual</text></svg>)
- 도메인 온톨로지 보존, 출처·순서 일관 관리
- 외부 LLM에 직접 주입 가능한 JSON‑LD 캡슐

---

![bg](./assets/bg_solution.svg)
![bg](./assets/bg_solution.svg)
# 결과/ROI
![bg opacity:0.06](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'><rect x='80' y='560' width='1440' height='260' rx='16' fill='%23ffffff' fill-opacity='0.06' stroke='%230ea5e9' stroke-dasharray='10,8' stroke-opacity='0.5' stroke-width='3'/><text x='150' y='700' fill='%230ea5e9' fill-opacity='0.8' font-size='28' font-family='Arial'>Value metrics</text></svg>)
- 리서치 합성 속도·품질 동시 개선
- 중복 검색/요약 공수 절감

---

![bg](./assets/bg_problem.svg)
![bg](./assets/bg_problem.svg)
# 플랜(예시)
![bg opacity:0.06](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'><rect x='80' y='560' width='1440' height='260' rx='16' fill='%23ffffff' fill-opacity='0.06' stroke='%2393c5fd' stroke-dasharray='10,8' stroke-opacity='0.5' stroke-width='3'/><text x='150' y='700' fill='%2393c5fd' fill-opacity='0.8' font-size='28' font-family='Arial'>Pricing</text></svg>)
- Free: 기본 수집/검색
- Pro: 무제한/심층 분석/AI‑Link 확장
- Premium: 팀 공유/리뷰 파이프라인

---

![bg](./assets/bg_solution.svg)
![bg](./assets/bg_solution.svg)
# 콜투액션
![bg opacity:0.06](data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'><rect x='80' y='560' width='1440' height='260' rx='16' fill='%23ffffff' fill-opacity='0.06' stroke='%230ea5e9' stroke-dasharray='10,8' stroke-opacity='0.5' stroke-width='3'/><text x='150' y='700' fill='%230ea5e9' fill-opacity='0.8' font-size='28' font-family='Arial'>CTA</text></svg>)
샘플 논문으로 3분 데모 → 연구 캡슐 즉시 생성



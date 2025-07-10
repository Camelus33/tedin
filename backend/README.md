# Backend – Graph Database & ETL Guide

## Prerequisites

1. **Node.js** ≥ 18  
2. **MongoDB** running with Habitus33 data (default: `mongodb://127.0.0.1:27017/habitus33`)  
3. **Apache Jena Fuseki** 4.x  
   - Recommended: start via Docker Compose (`docker compose up -d fuseki`)
   - Alternate: download `apache-jena-fuseki` and run `./fuseki-server --update --mem /habitus33`

> Fuseki should expose its UI & SPARQL endpoint at `http://localhost:3030`.

## Environment Variables

Create a **`.env`** file in `backend/` (or export in shell):

```
MONGO_URI=mongodb://127.0.0.1:27017/habitus33
GRAPH_DB_ENDPOINT=http://localhost:3030/habitus33
GRAPH_DB_USER=admin   # if authentication enabled
GRAPH_DB_PASS=admin
```

## Install Dependencies

```
cd backend
npm install
```

This installs `sparql-http-client`, `n3`, and other backend packages.

## ETL – Mongo → Fuseki

Run the ETL script to migrate existing **books** and **notes** collections into the RDF store.

```
npm run etl:mongo-to-fuseki
```

The script performs:
1. Reads all documents from MongoDB.
2. Transforms each into RDF triples according to `docs/rdf_mapping.md`.
3. Inserts triples into Fuseki using SPARQL `INSERT DATA`.

> Outputs processed counts to the console.

## Verification

After ETL, execute:

```
npm run verify:graph
```

The verification script counts `Book` and `Note` instances in both MongoDB and Fuseki, reporting mismatches.

- ✅ **Success**: counts match → script exits with 0.
- ❌ **Failure**: mismatch → script exits with 1 and prints details.

## Cleanup / Re-run

To wipe the dataset and re-run ETL during development:

1. Access Fuseki UI → Dataset → Delete.  
2. `docker compose down -v fuseki` to remove volume (if using Docker).  
3. Re-create dataset and repeat ETL steps.

---

For further ontology editing or advanced SPARQL, see `docs/ONTOLOGY_PRINCIPLES` and `backend/ontology/*.ttl` files. 

# 테스트 구조 및 실행 가이드

## 1. 유닛/로직 테스트 (Jest)
- 실행: `npm test`
- 용도: 유닛, 비동기, DB/외부 의존성 없는 순수 함수 검증
- 환경: Babel + TypeScript + ESM
- 제한: sparql-http-client 등 ESM-only 패키지 체인 사용하는 테스트는 Jest에서 실행 불가

## 2. 통합/그래프 테스트 (ts-node)
- 실행: `npm run test:integration`
- 용도: Fuseki, sparql-http-client, 온톨로지 등 실제 데이터 흐름 통합 시나리오 검증
- 환경: ts-node 직접 실행 (Jest 환경과 분리)

## 참고
- Jest의 ESM-only 패키지 한계로 인해 통합 테스트는 ts-node로 분리 실행
- 실제 코드/테스트 실패(스냅샷, 데이터 불일치 등)는 환경 세팅과 무관하며, 추후 리팩터링 필요 
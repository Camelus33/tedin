# Graph Database Decision Record

## Date
2025-07-09

## Context
Habitus33 requires a graph database to store and query OWL ontologies that describe notes, books, and their relationships. Two leading options were evaluated:

* **Neo4j (Property Graph + Cypher)**
* **Apache Jena Fuseki (RDF Triple Store + SPARQL)**

## Comparison
| Feature | Neo4j | Apache Jena Fuseki |
|---------|-------|--------------------|
| Data Model | Property Graph (nodes/relations with properties) | RDF triples (subject–predicate–object) |
| OWL Ontology Support | Limited – requires manual mapping; no built-in reasoning | Native RDF/OWL; built-in reasoner (RDFS, OWL-DL/FULL) |
| Query Language | Cypher (SQL-like, intuitive) | SPARQL (W3C standard) |
| Reasoning | External plugins needed | Included; integrates with Pellet/HermiT |
| Performance Focus | Fast relationship traversal | Optimised for RDF query & reasoning |
| Tooling | Browser, Bloom, APOC; large ecosystem | Jena API, Fuseki UI, SHACL; semantic-web ecosystem |
| Learning Curve | Gentle for basic graphs | Steeper (RDF/OWL concepts) |
| Licensing | GPLv3 (desktop) / commercial for clustering | Apache 2.0 (permissive) |
| Future (2025+) | Growing semantic extensions | Continued optimisations, cloud images |

## Decision
**Apache Jena Fuseki** will be adopted for the initial implementation.

### Rationale
1. Native handling of OWL ontologies aligns with our existing `.ttl` files, eliminating fragile mapping layers.
2. Built-in reasoning enables knowledge-gap detection and hidden-link discovery without extra infrastructure.
3. SPARQL is an industry standard; skills and examples transfer to other semantic-web tools.
4. Fuseki’s Apache 2.0 licence avoids Neo4j’s commercial clustering costs.
5. Container images are lightweight and integrate cleanly with Docker Compose.

Neo4j remains an option for high-performance traversal analytics once the semantic backbone is stable; federation or data-pipeline sync can be revisited if needed.

## Consequences
* Docker Compose will run a `jena-fuseki` service exposing port **3030** with a persistent volume.
* Backend will use the `sparql-http-client` library for queries.
* Environment variables to be added:
  * `GRAPH_DB_ENDPOINT=http://localhost:3030/habitus33`
  * `GRAPH_DB_NAMESPACE=habitus33`
  * `GRAPH_DB_USER=admin`
  * `GRAPH_DB_PASS=admin`
* Future reasoning tasks can toggle between built-in rules and external Pellet for heavier inference. 
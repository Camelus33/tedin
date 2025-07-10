# RDF Mapping: MongoDB → Habitus33 Ontology

## Overview
This document defines how existing MongoDB documents in the `notes` and `books` collections map to RDF triples that follow the Habitus33 ontology namespaces.

| MongoDB Collection | Ontology Class | Subject URI Pattern | Mongo Field | Predicate (IRI) | Notes |
|--------------------|---------------|---------------------|-------------|-----------------|-------|
| `books` | `core-k-resource:Book` | `habitus:book/{_id}` | `_id` | `rdf:type` → `core-k-resource:Book` | Primary node |
| | | | `title` | `dcterms:title` | |
| | | | `author` | `dcterms:creator` | expects URI or literal |
| | | | `isbn` | `bibo:isbn` | literal |
| | | | `publishedDate` | `dcterms:issued` | `xsd:date` |
| | | | `tags[]` | `skos:subject` | each tag literal |
| `notes` | `core-k-unit:Note` | `habitus:note/{_id}` | `_id` | `rdf:type` → `core-k-unit:Note` | Primary node |
| | | | `userId` | `dcterms:creator` | `habitus:user/{userId}` |
| | | | `bookId` | `core-k-unit:refersToResource` | `habitus:book/{bookId}` |
| | | | `content` | `core-k-unit:text` | literal |
| | | | `tags[]` | `skos:subject` | each tag literal |
| | | | `type` | `rdf:type` (additional) | Map `'quote'` → `habitus:QuoteNote`, `'thought'` → `habitus:ThoughtNote`, `'question'` → `habitus:QuestionNote` |
| | | | `createdAt` | `dcterms:created` | `xsd:dateTime` |
| | | | `pageNumber` | `app:pageNumber` | `xsd:integer` (if present) |
| | | | `highlightedText` | `app:highlightText` | literal |

### Namespaces Used
```
@prefix habitus: <https://w3id.org/habitus33/resource/> .
@prefix core-k-unit: <https://w3id.org/habitus33/ontology/core/k-unit#> .
@prefix core-k-resource: <https://w3id.org/habitus33/ontology/core/k-resource#> .
@prefix app: <https://w3id.org/habitus33/ontology/app#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix bibo: <http://purl.org/ontology/bibo/> .
```

## Example Triple (Note)
```
habitus:note/64d12a43 rdf:type core-k-unit:Note ;
    dcterms:creator habitus:user/abc123 ;
    core-k-unit:refersToResource habitus:book/5f1bd ;
    core-k-unit:text "Sapiens argues that shared myths unite humans." ;
    skos:subject "history" ;
    dcterms:created "2025-07-09T11:05:00Z"^^xsd:dateTime .
```

## Next Steps
* Implement transformation functions converting each document to Turtle or SPARQL INSERT statements following this mapping.
* Validate transformed triples with SHACL once loaded. 
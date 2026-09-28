---
title: "DIVA"
description: "Document intelligence with visual attribution. DIVA turns PDF collections into structured records and cited answers while keeping every extracted value connected to its source page and coordinates."
pubDate: "Sep 7 2026"
heroImage: "/projects/diva/workflow.svg"
badge: "Open source"
stack: ["rag", "llm", "vision", "data"]
context: "experiment"
repo: "https://github.com/awpbash/DIVA"
tools: ["FastAPI", "React", "Cosmos DB"]
---

DIVA stands for Document Intelligence with Visual Attribution. It takes a collection of PDFs, extracts a shared set of fields, links related documents, and serves the result through review screens, structured queries, and chat.

The key detail is provenance. Every extracted value carries its source snippet, page number, and page coordinates. A user can open a citation and see the exact clause, paragraph, or table row that supports the answer.

## Why I built it

A typical document RAG system retrieves chunks and asks a model to write an answer. Broad questions are straightforward. Auditing becomes harder when the answer is a date, fee, threshold, obligation, or total.

Related documents add another problem. A contract may have several amendments. The newest amendment might update the term while saying nothing about the fee. Reading only the newest document loses the fee. Reading only the original misses both changes.

DIVA treats each named field separately. It walks the document family for that field and returns the newest document that actually establishes its value. Earlier values remain available as history.

## What it does

- Reads PDFs with local RapidOCR or Azure Content Understanding.
- Preserves OCR line boxes and page geometry through the extraction pipeline.
- Extracts fields defined by the active document domain.
- Shows each value beside its source passage for human review.
- Links document families through relationships such as amendments and supersedence.
- Answers semantic questions through search and exact questions through structured field tools.
- Opens every accepted citation on the relevant PDF page with the supporting region highlighted.

![A DIVA chat answer with its citation opened on the supporting contract clause](/projects/diva/chat-citation.png)

## The evidence path

The citation rectangle comes from the document reader. RapidOCR returns detected text lines and their boxes. DIVA normalises those coordinates, groups them into blocks and table rows, then carries the geometry into the evidence record attached to each field.

The extraction model can clean text and identify the relevant field. It does not generate citation coordinates. This keeps the visual citation tied to the page data produced by the reader.

The stored evidence includes:

- the extracted value,
- a verbatim source snippet,
- the source document and page,
- one or more page-relative rectangles,
- confidence and review status,
- the field definition used during extraction.

Reviewers can approve, reject, or correct a value. Corrections remain in the record history and use configurable approval counts.

## Resolving amendments field by field

The sample corpus contains a master agreement and two amendments. The master agreement sets an annual fee of SGD 48,000 and a three-year term. The first amendment changes the fee to SGD 61,500. The second changes the term to five years and stays silent on the fee.

DIVA resolves the current result as SGD 61,500 and five years. Each value points to the document that most recently changed that field.

![Current contract values with their source documents and earlier values](/projects/diva/knowledge-supersedence.png)

This resolution is deterministic application logic. The model extracts and normalises the fields. Python orders the document family and computes the current value for each field.

## A configurable document framework

The extraction engine is shared across document types. A domain configuration defines what a deployment should understand through four files:

1. An analyzer describing document categories and party roles.
2. An ontology listing the record and relationship vocabulary.
3. A build pack mapping extracted facts into records and derived links.
4. An operational view defining the fields shown to reviewers.

The shipped `commercial_agreement` domain is a working example. Another deployment can define a different field vocabulary without copying the ingestion and retrieval code. Values outside the configured contract are kept for review or placed in quarantine records.

## Retrieval and cited answers

DIVA chooses a retrieval path based on the question:

- Vector search for clauses with similar meaning.
- Keyword search for exact phrases.
- Verified-field lookup for current named values.
- Structured aggregation for comparisons, filters, and totals.
- Defined-term and section lookup for document-specific language.

Arithmetic and filtering run in Python or the store query layer. The model selects tools and writes the explanation from the returned evidence bundle. A citation guard removes any citation identifier that was absent from that bundle.

Access controls are applied before evidence reaches the model or browser. The application has separate default, confidential, and administrator roles, plus a verifier permission for the review workflow.

## Architecture

![DIVA application architecture](/projects/diva/architecture.svg)

DIVA ships as one Docker application image. FastAPI serves the API and the compiled React workspace from the same origin. The application connects to an OpenAI-compatible model endpoint and Azure Cosmos DB, while original PDFs, page images, extraction artifacts, and the SQLite application database stay under persistent storage.

Cosmos DB holds the searchable projection: records, relationships, and embeddings. The files under `storage/` remain the rebuildable source of truth for document processing. A local Cosmos emulator and client-side vector ranking support development.

## Testing it on real documents

The repository includes a small synthetic contract family with expected answers for a repeatable demo. It also has an optional corpus of 19 public contracts from the CUAD dataset, arranged into six amendment chains. That corpus exercises OCR, varied legal formatting, party identities, amendment relationships, and page-level citations against SEC filings.

![A cited answer opened against a public SEC filing](/projects/diva/real-world-citation.png)

## Current status

DIVA is public under the MIT licence. The repository currently marks version 0.3 as unreleased and under active development. A local instance runs through Docker Compose with an API key for an OpenAI-compatible model endpoint.

## Project links

- **[GitHub repository](https://github.com/awpbash/DIVA)**
- **[Architecture documentation](https://github.com/awpbash/DIVA/blob/main/docs/architecture.md)**
- **[Pipeline documentation](https://github.com/awpbash/DIVA/blob/main/docs/PIPELINE_OVERVIEW.md)**
- **[Domain authoring guide](https://github.com/awpbash/DIVA/blob/main/docs/domains.md)**

# 08 — Rewrite Vector Service with Fixed Threshold (Task 3.1)

Status: resolved
Type: task
Milestone: 3 — Backend APIs

## Task

Rewrite `src/lib/vector-service.ts`: OpenAI `text-embedding-3-small` embeddings (batched), pgvector insert + search with cosine similarity threshold ≥ 0.6, top-8, per-document dedup.

## Files

- Modify: `src/lib/vector-service.ts`
  - `generateEmbeddings(texts)` / `generateQueryEmbedding(query)` via `@ai-sdk/openai` + `embed`/`embedMany`
  - `addDocuments(documentId, chunks)` — raw-SQL batch insert into `DocumentChunk` (pgvector), updates `chunkCount`/`status`
  - `searchSimilar(queryEmbedding, limit=8, threshold=0.6)` — `1 - (embedding <=> $1)` join over completed documents, dedup by document keeping highest score

## Acceptance

- Test probe: `Embedding dimension: 1536`, search returns results with no errors.

## Comments

- Complete. Commits `506db1b..576ce11`; review clean.

# Task 3.1 Report — Rewrite vector service with fixed threshold

**Status:** ✅ Complete
**Commit:** `506db1b`
**Summary:** Replaced [vector-service.ts](src/lib/vector-service.ts) with the plan's object-literal service — pgvector cosine search at threshold 0.6, top-8, per-document dedup, Prisma client from [db.ts](src/lib/db.ts), `embed`/`embedMany` with `text-embedding-3-small`.

## What changed

- Deleted old class-based `VectorService` (retry loops, connection-retry hack, `SearchResult` payload shape, `getStats`/`clearAllVectors`/`deleteDocumentChunks` — all unused or re-added when needed).
- `searchSimilar(embedding, limit=8, threshold=0.6)` — raw SQL over `"DocumentChunk"` ⋈ `"Document"`, dedup by `documentId` keeping highest score.
- `addDocuments` — raw-SQL batch insert, then sets `Document.chunkCount` + `status='completed'`.
- Bumped `@ai-sdk/openai` 1.3.24 → latest (2.x): `ai` v7 requires provider spec v2; old version threw `AI_UnsupportedModelVersionError`.

## Verification

Live API test blocked (OpenAI account: "no credits remaining"). Verified via mocked-HTTP self-check (`npx tsx`, assert-based):

- `generateQueryEmbedding` → **1536-dim** ✅
- `generateEmbeddings` (3 inputs) → 3 × 1536-dim ✅
- Dedup keeps highest-scoring chunk per document ✅

The unmocked run confirmed the code path is correct — it reached OpenAI's API and failed only on billing.

## Concerns

- **OpenAI credits exhausted** — live embedding calls will fail until the account is topped up. Not a code issue.
- `tsc --noEmit` shows pre-existing errors in files owned by later tasks (`api/chat/route.ts`, `api/upload/route.ts`, `document-processor.ts`, `page.tsx`) — they reference the old service shape (`payload`, `getStats`, `DocumentChunk` type) and the deleted `@/lib/database`. Expected; resolved in Tasks 3.2/3.3+ per plan.
- `searchSimilar` defaults are baked in (`limit=8`, `threshold=0.6`) — callers can still override per call.

→ skipped: `getStats`/`clearAllVectors`/`deleteDocumentChunks`, retry/backoff loop. Add when a caller actually needs them; transient pg errors surface to the route handler instead of being swallowed.

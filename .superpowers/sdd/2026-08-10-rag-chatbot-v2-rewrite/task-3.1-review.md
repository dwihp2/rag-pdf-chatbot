# Task 3.1 Review — Vector service rewrite

**Verdict:** ✅ APPROVE
**Findings:** 3 total — 0 critical, 2 minor, 1 note

Reviewed: plan §Task 3.1, [task-3.1-report.md](task-3.1-report.md), [task-3.1-diff.patch](task-3.1-diff.patch), current [src/lib/vector-service.ts](../../../src/lib/vector-service.ts), [prisma/schema.prisma](../../../prisma/schema.prisma).

## 1. Spec compliance

| Requirement | Status |
|---|---|
| Cosine similarity ≥ 0.6 default | ✅ `threshold = 0.6`, `WHERE 1 - (embedding <=> $1::vector) > $2` |
| Top-8 | ✅ `limit = 8`, `LIMIT $3` |
| Dedup by document | ✅ `Set` filter keeps first (highest-scoring, since `ORDER BY embedding <=>`) chunk per `documentId` |
| text-embedding-3-small, 1536-dim | ✅ model constant; schema `vector(1536)`; ivfflat `vector_cosine_ops` index matches `<=>` |
| Raw SQL query shape | ✅ Matches plan's code block verbatim |
| Prisma from `./db` | ✅ old `./database` import gone |

Table/column identifiers (`"DocumentChunk"`, `"Document"`, `"documentId"`, `"pageNumber"`, `"chunkIndex"`, `"createdAt"`) all match the Prisma schema's default (unmapped) names. ✅

## 2. Quality

- **SQL injection-safe:** ✅ Both queries use `$1`/`$2`/`$3` placeholders via `$queryRawUnsafe`/`$executeRawUnsafe` with positional params — no string interpolation of user data. (`*Unsafe` = raw SQL string, still parameterized; safe.) The embedding vector string is server-generated from `number[]`, not user input.
- **Dedup correct:** ✅ Rows arrive ordered by ascending distance, so first-seen per document is the best chunk.
- **Minor — error taxonomy dropped:** Old code wrapped failures in `Error('Failed to…')`; new code lets SDK/Prisma errors propagate. Acceptable — route handlers (Task 3.2/3.3) own error shaping, and report shows callers haven't been rewritten yet.
- **Minor — per-row INSERT loop:** `addDocuments` does one round-trip per chunk instead of a single multi-row `VALUES` insert. Fine for current PDF sizes; batch if uploads get big. Report verified embedding dims (1536) and dedup behavior via mocked self-check; live OpenAI test blocked by account credits (not a code issue).

## 3. Scope — skipped utilities

- `getStats()` — **one stale caller:** [src/app/api/upload/route.ts:76](../../../src/app/api/upload/route.ts#L76) calls `vectorService.getStats()` and [src/app/api/chat/route.ts:28](../../../src/app/api/chat/route.ts#L28) uses old `limit=5, threshold=0.2` args. Both compile-break against the new service. Report flags these as owned by Tasks 3.2/3.3 — acceptable **iff those tasks land before any merge/deploy**. Not a 3.1 defect; tracking note only.
- `clearAllVectors`, `deleteDocumentChunks` — no callers anywhere. ✅ Safe to omit (YAGNI; re-add when document-deletion task needs them).
- Retry/backoff loop — correctly deleted; it was masking Neon connection drops. Transient errors now surface instead of being swallowed. ✅

## Critical issues

None.

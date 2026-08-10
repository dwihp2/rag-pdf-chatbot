# Task 3.2 Report: Rewrite document processor

**Status:** complete
**Commit:** 8554253

## Summary

Replaced LangChain-based document processor with a dependency-light version: simple `splitText` (1000/200 overlap) + lazy-loaded `pdf-parse`, per-page extraction, and updated the upload route to match the new interface.

## Changes

- `src/lib/document-processor.ts` — full rewrite. No LangChain, no class, no tmp-dir file writes (parses in-memory buffer), no uuid/`DocumentChunk` type. Object-literal `documentProcessor` with `processPDF`, `processMultiplePDFs`, `generateQueryEmbedding`.
- `src/app/api/upload/route.ts` — interface alignment: `doc.pageCount`/`doc.chunks.length` (was `totalPages`/`totalChunks`); prisma import `@/lib/database` → `@/lib/db` (old module deleted in Task 1.1); removed `vectorService.getStats()` (dropped in Task 3.1).
- `package.json` — reinstalled `pdf-parse` (+`@types/pdf-parse`).

## Deviations from plan

1. **pdf-parse pinned to `^1.1.1` (installed 1.1.4).** npm latest is 2.4.5, a breaking ESM rewrite with no default function export — the plan's code doesn't compile against it. v1 matches the plan's API.
2. **Per-page text extraction kept** (via pdf-parse `pagerender`). The plan's version attributed every chunk to page 1; citations need real page numbers, and the pre-existing upload route consumes per-file results anyway. ~15 extra lines.
3. **`processMultiplePDFs` retained** — upload route (not rewritten in this task) calls it.
4. **No `npm uninstall langchain @langchain/community` needed** — both were already absent from package.json, lockfile, and node_modules (Task 1.1). Verified: 0 references.

## Verification

- `tsc --noEmit`: no errors in `document-processor.ts`; upload route down to one pre-existing error (missing `userId` on Document create — upload route has no auth wiring yet, owned by a later task).
- Smoke test (generated PDF, 1920 chars): parsed 1 page, 3 chunks, correct text, 200-char overlap boundary exact, `pageNumber: 1` correct. PASS.
- `langchain`/`@langchain`: 0 refs in package.json, package-lock.json, node_modules.

## Concerns

- Upload route still lacks auth + `userId` on document create (type error remains) — belongs to the upload/API rewrite task, not 3.2.
- Splitter is naive (hard char boundary, no sentence awareness). Acceptable per plan; upgrade to a sentence-boundary splitter if retrieval quality suffers.
- `pdf-parse` v1 is unmaintained; v2 migration means adopting its new `PDFParse` class API. Defer until v1 breaks.

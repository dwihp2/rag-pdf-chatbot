# 09 — Rewrite Document Processor (Task 3.2)

Status: resolved
Type: task
Milestone: 3 — Backend APIs

## Task

Rewrite `src/lib/document-processor.ts` to drop LangChain: keep `pdf-parse` (lazy-loaded) for extraction, add a simple splitter (1000-char chunks, 200 overlap), and produce chunks for vectorization.

## Files

- Modify: `src/lib/document-processor.ts`
  - `splitText(text, 1000, 200)` — no langchain dependency
  - `parsePdfBuffer(buffer)` — dynamic `import("pdf-parse")`
  - `documentProcessor.processPDF(file)` → `{ chunks, pageCount }`; `generateQueryEmbedding(query)` delegating to `vectorService`
- Run: `npm uninstall langchain @langchain/community`

## Acceptance

- PDF uploads produce clean chunks without LangChain; page/summary handling preserved.

## Comments

- Complete. Commits `8554253..8b9f1d4`; review clean.
- Minor (deferred): failed PDFs silently swallowed in `processMultiplePDFs` — fixed later in the upload-route rewrite task.

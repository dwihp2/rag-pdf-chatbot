# 03 — Configure TypeScript Types (Task 1.3)

Status: resolved
Type: task
Milestone: 1 — Project Cleanup & Foundation

## Task

Create the shared types file for the rewrite: `AppSource`, `MyUIMessage`, and the API input types.

## Files

- Create: `src/types/index.ts`
  - `AppSource` — RAG source shape streamed as a data part (`id`, `documentId`, `filename`, `page`, `snippet`, `score`)
  - `MyUIMessage` — `UIMessage` extended with `sources` and `notification` data parts
  - `CreateChatInput`, `CreateDocumentInput`, `CreateCollectionInput`

## Acceptance

- Types compile and are consumed by `retrieval.ts`, `chat/route.ts`, API routes.

## Comments

- Complete. Commit `d3d3e45`; review clean.
- Minor (deferred): `ai` 4→7 bump adds a Node ≥22 floor — verify deploy target supports it.

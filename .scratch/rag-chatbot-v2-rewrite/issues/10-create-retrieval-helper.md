# 10 — Create Retrieval Helper (Task 3.3)

Status: resolved
Type: task
Milestone: 3 — Backend APIs

## Task

Create `src/lib/retrieval.ts` — formats search results into model context and `AppSource[]` for the chat API.

## Files

- Create: `src/lib/retrieval.ts`
  - `retrieveContext(query)` → `{ context, sources }`
  - Context: `[Document N]` markers joined by blank lines; empty result → "No relevant information found..." with no sources
  - Sources: `AppSource[]` with `snippet` = first 150 chars + `"..."`

## Acceptance

- Chat API can consume `context` (with `[N]` markers for citations) and `sources` (streamed as data parts).

## Comments

- Complete. Commit `88c4d50`; review clean.
- Minor (deferred): snippet adds `"..."` even when text ≤ 150 chars — cosmetic, plan-inherited.

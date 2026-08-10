# Task 1.3 Report: Configure TypeScript types

**Status:** ✅ Complete

## What was done

- Created [src/types/index.ts](../../../src/types/index.ts) exactly as specified in the plan:
  - `AppSource` — RAG source interface (id, documentId, filename, page, snippet, score)
  - `MyUIMessage` — custom `UIMessage` with `sources` and `notification` data parts
  - `CreateChatInput`, `CreateDocumentInput`, `CreateCollectionInput` — API input types

## Deviation from plan (required fix)

The plan's `MyUIMessage = UIMessage<never, {...}>` requires AI SDK v5+ (generic `UIMessage`).
Task 1.2 left top-level `ai@4.3.16` installed, where `UIMessage` is **not generic** —
the file failed to compile with `TS2315: Type 'UIMessage' is not generic`.

Fix: `npm install ai@^7` → `ai@7.0.58`, which also dedupes with
`@assistant-ui/react-ai-sdk@1.4.5`'s peer dependency (previously it carried its own nested copy).

## Verification

- `npm ls ai` → single `ai@7.0.58`, deduped across the tree.
- `npx tsc --noEmit` → **zero errors in `src/types/index.ts`**.
  Remaining errors are pre-existing, all in files the plan hasn't rewritten yet
  (`@/lib/database` imports, deleted `chat-layout`/`chatgpt-home` imports, langchain imports)
  — expected per Task 1.1 Step 8 ("errors only from files we haven't rewritten yet").

## Notes for later tasks

- Any task importing from `ai` now gets the v7 API (e.g. `toDataStreamResponse` → v5+ streaming
  helpers, `UIMessage` generics). Backend tasks in Milestone 3+ should be written against AI SDK v5+ API.

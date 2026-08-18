# Map — RAG Chatbot v2 Rewrite

> Converted from superpowers SDD ledger (`.superpowers/sdd/2026-08-10-rag-chatbot-v2-rewrite/`). Effort complete.

## Notes

Full rewrite of the RAG PDF chatbot. Executed 2026-08-10 → on branch `feature/v2-rewrite`, 6 milestones, 22 tasks, all resolved. See `spec.md` for the durable spec; `issues/` for per-task records.

## Decisions-so-far

1. DeepSeek `deepseek-chat` for chat (not `deepseek-v4-pro` — absent from SDK catalog at the time).
2. OpenAI `text-embedding-3-small` (1536-dim) for embeddings.
3. Better Auth (Prisma adapter, email/password, DB sessions); fresh DB, no migration of old data.
4. assistant-ui for chat surfaces (`AssistantModal` floating + `Thread` full-page); shadcn/ui for the rest.
5. Sources streamed as AI SDK v7 `type: 'source'` data parts; citations enforced via `[N]` system prompt.
6. Floating chat runs independent runtimes; cross-surface state via Zustand `{ activeThreadId, isFloatingOpen }`.
7. Retrieval: pgvector cosine similarity ≥ 0.6, top-8, per-document dedup.

## Fog

- None outstanding — all tasks resolved. Deferred items tracked in `spec.md` → "Deferred Items".

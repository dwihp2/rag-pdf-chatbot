# SDD ledger — plan: docs/superpowers/plans/2026-08-10-rag-chatbot-v2-rewrite.md

## Workspace: .superpowers/sdd/2026-08-10-rag-chatbot-v2-rewrite/

## BASE: f8a1a64f4226a39060f80a9793d8b01eca020392
## Branch: feature/v2-rewrite

## Global Constraints (verbatim from plan):
- Fresh database — no migration of existing data
- DeepSeek deepseek-v4-pro for chat, OpenAI text-embedding-3-small for embeddings (1536-dim)
- Better Auth manages its own tables; email/password auth with DB sessions
- All API routes under (dashboard) require authentication
- Phase 1 only: PDF upload, no text/md/docs yet
- Collections: many-to-many with documents, one collection per chat, personal space fallback
- Retrieval: pgvector cosine similarity ≥ 0.6, top-8, deduplicate by document
- Citations: mandatory [N] format enforced via system prompt, no <source id> XML tags
- Sources streamed via AI SDK v7 createUIMessageStream with type: 'source' parts
- Floating chat: independent runtime per surface, Zustand store for { activeThreadId, isFloatingOpen }
- Floating minimize: saves conversation, shows thread list on reopen
- All dead code removed: page-old.tsx, page-new.tsx, ChatInterface, QdrantService, neon-*, unused AI Elements, old citation parser

---

## Task Progress:

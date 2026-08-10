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

Task 1.1: complete (commits 7465163..5b13ddb, review clean after 1 fix round)
Task 1.1: fix round 1/5 (2 addressed, 0 open — carousel/ai-elements/kibo-ui deletion, package reporting; commits 7465163..5b13ddb)
Task 1.2: complete (commits bd8d2f8, review clean)
Task 1.2: minor (deferred): .npmrc legacy-peer-deps — remove when upgrading ai to v5
Task 1.3: complete (commits d3d3e45, review clean)
Task 1.3: minor (deferred): ai 4→7 bump adds Node ≥22 floor — verify deploy target supports it
Task 2.1: complete (commits d36dc9d, review clean)
Task 2.1: minor (deferred): stale v1 migration directory — squash at Milestone 2 end
Task 2.2: complete (commits fabbb4e, review clean)
Task 2.2: minor (deferred): BETTER_AUTH_SECRET is placeholder — rotate before deploy; test user test@test.com in dev DB
Task 2.3: complete (commits 52efc23, review clean)
Task 2.4: complete (commits 46e9192, review clean)

## Milestone 2 Complete: Database & Auth

Task 3.1: complete (commits 506db1b..576ce11, review clean)


# Spec: RAG PDF Chatbot v2 — Full Rewrite

> **Source:** converted from the superpowers plan "RAG PDF Chatbot v2 — Full Rewrite Implementation Plan" (2026-08-10) to the `.scratch/` issue-tracker convention on 2026-08-18.
> **Status:** Complete — all 22 tickets resolved. This is a historical record; code-level detail lives in git history (branch `feature/v2-rewrite`).

## Goal

Full rewrite of the RAG PDF chatbot with Better Auth (email/password), assistant-ui chat interface, floating Help Scout-style chat widget, collection-based knowledge organization, AI SDK v7 source streaming, structured citation enforcement, and DeepSeek chat + OpenAI embeddings model setup.

## Architecture

Next.js 15 App Router with route groups `(auth)` and `(dashboard)`. Better Auth manages users/sessions in Postgres. The chat API uses `createUIMessageStream` (AI SDK v7) to stream sources as first-class data parts. Frontend uses assistant-ui (`AssistantModal` for floating chat, `Thread` for full-page chat) with Zustand for cross-surface sync. pgvector handles semantic search with threshold ≥ 0.6, top-8, dedup.

## Tech Stack

Next.js 15, React 19, TypeScript, assistant-ui, Better Auth, Zustand, @ai-sdk/deepseek, @ai-sdk/openai (embeddings only), Prisma + pgvector, Tailwind CSS 4, shadcn/ui

## Global Constraints

- Fresh database — no migration of existing data
- DeepSeek `deepseek-chat` for chat, OpenAI `text-embedding-3-small` for embeddings (1536-dim)
- Better Auth manages its own tables; email/password auth with DB sessions
- All API routes under `(dashboard)` require authentication
- Phase 1 only: PDF upload, no text/md/docs yet
- Collections: many-to-many with documents, one collection per chat, personal space fallback
- Retrieval: pgvector cosine similarity ≥ 0.6, top-8, deduplicate by document
- Citations: mandatory `[N]` format enforced via system prompt, no `<source id>` XML tags
- Sources streamed via AI SDK v7 `createUIMessageStream` with `type: 'source'` parts
- Floating chat: independent runtime per surface, Zustand store for `{ activeThreadId, isFloatingOpen }`
- Floating minimize: saves conversation, shows thread list on reopen
- All dead code removed: `page-old.tsx`, `page-new.tsx`, `ChatInterface`, QdrantService, neon-*, unused AI Elements, old citation parser

## File Structure (as planned)

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (no auth wrapping)
│   ├── page.tsx                      # Landing page (unauthenticated)
│   ├── globals.css                   # Keep, clean up unused styles
│   ├── (auth)/
│   │   ├── login/page.tsx            # Login form
│   │   └── register/page.tsx         # Register form
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Auth guard + SidebarProvider + ZustandProvider
│   │   ├── page.tsx                  # Chat home (ChatGPTHome-style)
│   │   ├── chat/[id]/page.tsx        # Individual chat page
│   │   ├── documents/page.tsx        # Document management
│   │   └── collections/
│   │       ├── page.tsx              # Collections list
│   │       └── [id]/page.tsx         # Collection detail
│   └── api/
│       ├── auth/[...all]/route.ts    # Better Auth handler
│       ├── chat/route.ts             # RAG chat endpoint (v7 sources)
│       ├── chats/route.ts            # CRUD chat threads
│       ├── chats/[id]/route.ts       # Single chat + messages
│       ├── documents/route.ts        # CRUD documents
│       ├── documents/[id]/route.ts   # Single document
│       ├── collections/route.ts      # CRUD collections
│       ├── collections/[id]/route.ts # Single collection
│       └── upload/route.ts           # File upload handler
├── components/
│   ├── chat/                         # floating-chat, chat-page, thread-list, chat-home
│   ├── documents/                    # upload-zone, document-list
│   ├── collections/                  # collection-card, collection-picker
│   ├── auth/                         # auth-guard, login-form
│   ├── layout/                       # app-sidebar, app-header
│   └── ui/                           # shadcn/ui (kept + added as needed)
├── lib/                              # auth, auth-server, db, retrieval, document-processor, vector-service, utils
├── hooks/                            # use-chat-store, use-mobile
├── store/                            # chat-store (Zustand)
└── types/index.ts                    # AppSource, MyUIMessage, API input types
```

## Task Map

| Milestone | Tickets |
|-----------|---------|
| M1 Project Cleanup & Foundation | 01–03 |
| M2 Database & Auth | 04–07 |
| M3 Backend APIs | 08–12 |
| M4 Frontend — Chat | 13–17 |
| M5 Root Layout & Landing Page | 18–19 |
| M6 Verification & Polish | 20–22 |

## Key Decisions Made (from execution ledger)

1. **Model:** `deepseek-chat` (not `deepseek-v4-pro` — not in SDK catalog at the time)
2. **Embeddings:** OpenAI `text-embedding-3-small` (1536-dim)
3. **Auth:** Better Auth with Prisma adapter, email/password
4. **Database:** Fresh reset, no migration of old data
5. **UI library:** assistant-ui with shadcn/ui for non-chat surfaces
6. **Floating chat:** Independent runtimes + Zustand sync

## Deferred Items (from execution ledger)

- `.npmrc` `legacy-peer-deps=true` — remove when `ai` upgrades to v5
- Node ≥22 floor from `ai` v7 — verify deploy target
- Stale v1 migration directory — squash
- `BETTER_AUTH_SECRET` placeholder — rotate before deploy
- Failed PDFs silently swallowed — fix in upload route
- Snippet adds `"..."` even when text ≤ 150 chars — cosmetic

## Out of Scope / Later Phases

- Content types beyond PDF (Markdown/TXT/DOCX)
- Advanced search, bulk processing, analytics
- Test framework + browser E2E (adopted later — see `../abort-cancel-request-cache`)

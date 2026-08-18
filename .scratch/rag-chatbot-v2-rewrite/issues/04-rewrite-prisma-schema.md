# 04 — Rewrite Prisma Schema (Task 2.1)

Status: resolved
Type: task
Milestone: 2 — Database & Auth

## Task

Write the full v2 Prisma schema: Better Auth tables (User, Session, Account) plus app tables (Collection, CollectionMember, CollectionDocument, Chat, Message, Document, DocumentChunk). Fresh database — force reset, no data migration.

## Files

- Modify: `prisma/schema.prisma` (pgvector generator, `vector(1536)` embeddings, ivfflat index)
- Modify: `.env.local` (Better Auth + DeepSeek + OpenAI + DB vars)
- Run: `npx prisma db push --force-reset`, `npx prisma generate`

## Acceptance

- 10 models present; `npx prisma db pull --print` matches `schema.prisma` exactly.

## Comments

- Complete. Commit `d36dc9d`; review clean.
- Minor (deferred): stale v1 migration directory — squash later.

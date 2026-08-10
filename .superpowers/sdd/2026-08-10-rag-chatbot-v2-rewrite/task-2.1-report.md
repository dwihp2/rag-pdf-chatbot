# Task 2.1 Report: Rewrite Prisma Schema

**Status:** done
**Commit:** d36dc9d
**Summary:** Full v2 data model (User, Session, Account, Collection, CollectionMember, CollectionDocument, Chat, Message, Document, DocumentChunk) pushed to Neon and client generated.

## Steps completed

1. Schema written to `prisma/schema.prisma` — all 10 models per plan, relations + uniques intact.
2. `npx prisma db push --force-reset` — database reset and synced.
3. `npx prisma generate` — client v6.9.0 generated.
4. `npx prisma db pull --print` — output matches schema (embedding introspected as `Unsupported("vector")`, expected).
5. Env placeholders added to `.env.local` (BETTER_AUTH_SECRET, BETTER_AUTH_URL, DEEPSEEK_API_KEY, OPENAI_API_KEY) — file is gitignored, not committed.

## Deviations from plan

- **`generator pgvector` block omitted** — invalid Prisma syntax (as flagged in the task). pgvector enabled via existing `extensions = [vector]` on the datasource + `postgresqlExtensions` preview feature.
- **`@@index([embedding], type: "ivfflat")` omitted from schema** — Prisma 6.9 rejects ivfflat on `Unsupported("vector(1536)")` fields (index type only supported on extension-typed vector fields). Index created via raw SQL migration instead: `prisma/migrations/20260810_add_ivfflat_index/migration.sql`, applied with `prisma db execute`. Verified present (`db pull` shows `@@index([embedding])`).
- **`@@map` snake_case dropped** — plan's schema uses default PascalCase table names; kept as written.

## Concerns

- `BETTER_AUTH_SECRET`, `DEEPSEEK_API_KEY`, `OPENAI_API_KEY` in `.env.local` are placeholders — must be filled with real values before Task 2.2 (Better Auth setup) or any chat/embedding call works.
- `db pull` reports embedding as `Unsupported("vector")` without the `(1536)` dimension — cosmetic; column in DB is `vector(1536)`.
- Old migration history (`20250710161109_add_document_model`) is stale relative to the new schema; consider squashing migrations once v2 stabilizes.

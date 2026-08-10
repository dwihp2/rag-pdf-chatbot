# Task 2.1 Review: Prisma Schema Rewrite

**Reviewed:** `prisma/schema.prisma` @ d36dc9d (diff d3d3e45..d36dc9d) vs plan lines 288–461
**Reviewer verdict: ✅ APPROVE**

## Verdict

Approve. All 10 models match the plan field-for-field; both deviations are forced by Prisma limitations and are handled correctly.

## Model checklist (10/10)

| Model | Fields | Relations | Uniques/Cascades | ✓ |
|---|---|---|---|---|
| User | all | Session/Account/Chat/Document/Collection/CollectionMember | email unique | ✅ |
| Session | all | User | token unique, Cascade | ✅ |
| Account | all | User | Cascade | ✅ |
| Collection | all | owner/members/documents/chats | Cascade (owner) | ✅ |
| CollectionMember | all | Collection + User | `@@unique([collectionId, userId])`, Cascade ×2 | ✅ |
| CollectionDocument | all | Collection + Document | `@@unique([collectionId, documentId])`, Cascade ×2 | ✅ |
| Chat | all | User + Collection? + Messages | Cascade (user), **SetNull (collection)** — correct, deleting a collection keeps chats | ✅ |
| Message | all | Chat | Cascade | ✅ |
| Document | all | User + chunks + collections | Cascade | ✅ |
| DocumentChunk | all | Document | Cascade; ivfflat via raw SQL (see D2) | ✅ |

Constraints verified: one collection per chat (`Chat.collectionId` scalar, nullable) ✅; M:N collections↔documents via `CollectionDocument` ✅; `vector(1536)` matches `text-embedding-3-small` (plan line 14) ✅; fresh DB — no data-migration concern ✅.

## Deviations — both acceptable

**D1. `generator pgvector` block omitted — correct.**
That block is not valid Prisma; there is no `pgvector` generator provider. The actual mechanism is `extensions = [vector]` on the datasource + `postgresqlExtensions` preview feature, which the report confirms pushed successfully to Neon. The plan's snippet was wrong; the implementation is the documented-correct form. No action.

**D2. ivfflat index via raw SQL migration instead of `@@index([embedding], type: "ivfflat")` — correct.**
Prisma 6.9 can't express index ops on `Unsupported("vector(1536)")` fields; schema would fail validation. `prisma/migrations/20260810_add_ivfflat_index/migration.sql` creates it properly:

- `USING ivfflat ("embedding" vector_cosine_ops)` — opclass matches the retrieval query (`dc.embedding <=> $1::vector`, plan line 1054). Right opclass matters: `vector_cosine_ops` is what `<=>` uses.
- `IF NOT EXISTS` — safe re-apply.
- Verified present via `db pull` round-trip per report.
- `ponytail:` comment left in the schema marking the ceiling and where the index lives. Good.

Minor caveat (informational, not a finding): the migration file is not tracked in `_prisma_migrations` since it was applied via `db execute`, so a future `migrate reset` would drop the index without re-creating it. Acceptable while the project uses `db push`; if the project ever switches to `migrate dev`, re-apply this file.

## Findings

### Low

1. **Stale migration directory.** `prisma/migrations/20250710161109_add_document_model/` still describes the v1 snake_case schema (`document_chunks`, `original_name`, …). It no longer matches the pushed schema and will conflict if anyone ever runs `prisma migrate dev` (drift-detection failure). The report already flags squashing "once v2 stabilizes" — recommend tracking that as an explicit checkbox in a later task or deleting the stale directory at Milestone 2 end. Non-blocking now because the workflow is `db push`.

### Informational (no action)

2. **Old code references snake_case tables** (`src/lib/vector-service.ts:160`, `document-processor.ts`) — expected mid-rewrite breakage; Milestone 3 tasks replace these call sites with PascalCase `"DocumentChunk"` (plan line 1011). Not a schema defect.
3. **`db pull` shows `Unsupported("vector")` without the dimension** — cosmetic introspection limit; DB column is `vector(1536)` as verified at push time.

## Non-findings (checked, fine)

- **No `@@map` snake_case** — deliberate, plan uses PascalCase table names; consistent with v2 query code.
- **No `Role` enum / `@@index([documentId])` etc.** — plan doesn't specify them; raw queries don't `ORDER BY chunkIndex`. Absence matches spec; easy to add later if profiling says otherwise.
- **Cascade on join tables (CollectionMember/CollectionDocument)** — rows are pure join data with no independent value; Cascade on both parents is correct, not over-deletion.
- **Better Auth table shapes** (User/Session/Account field names) — match Better Auth's Prisma adapter expectations; Task 2.2 will confirm at adapter wiring time.

## Counts

- Critical: **0**
- Medium: 0
- Low: **1** (stale v1 migration directory)
- Informational: 2

**Proceed to Task 2.2.** Fill the placeholder secrets in `.env.local` first (report concern) — Better Auth setup needs `BETTER_AUTH_SECRET` to be real.

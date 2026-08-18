# 01 — Add `collection-access` lib + refactor routes (Task 1)

Status: ready-for-agent
Type: task

## Task

Add `src/lib/collection-access.ts` with `getCollectionAccess(userId, collectionId): Promise<"owner" | "member" | null>` — the single source of truth for collection access. Refactor the existing `collections` routes to use it (replacing any ad-hoc owner/member checks).

## Files

- Create: `src/lib/collection-access.ts`
- Refactor: `src/app/api/collections/route.ts`, `src/app/api/collections/[id]/route.ts` (and any route currently inlining membership logic)

## Acceptance

- All collection routes resolve access through `getCollectionAccess`; no duplicated logic remains.
- `null` for no access (or non-existent collection), `"owner"` for owner, `"member"` for members.

## Comments

- Prerequisite for tickets 02–05.

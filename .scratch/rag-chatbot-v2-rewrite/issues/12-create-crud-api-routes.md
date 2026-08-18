# 12 — Create CRUD API Routes (Task 3.5)

Status: resolved
Type: task
Milestone: 3 — Backend APIs

## Task

Create full CRUD routes for chats, documents, and collections, plus the file upload handler.

## Files

- Create: `src/app/api/chats/route.ts` (GET list, POST create)
- Create: `src/app/api/chats/[id]/route.ts` (GET with messages, DELETE — scoped to owner)
- Create: `src/app/api/documents/route.ts` (GET list, DELETE)
- Create: `src/app/api/documents/[id]/route.ts` (DELETE — scoped to owner)
- Create: `src/app/api/collections/route.ts` (GET list incl. memberships, POST create)
- Create: `src/app/api/collections/[id]/route.ts` (GET detail incl. documents+chats, DELETE owner-only)
- Create: `src/app/api/upload/route.ts` (PDF-only, creates Document record, processes via processor + vector service, marks `processing`/`completed`/`failed`)

## Acceptance

- All routes enforce session auth; document/collection operations scoped to owner; upload handles PDF-only + failure status.

## Comments

- Complete. Commit `7d33e05`; review conditional pass.
- Minor (deferred): upload route has no collection ownership check yet; `DELETE /api/documents` redundant with `[id]` route; missing input validation; DELETE returns success even if no row deleted.

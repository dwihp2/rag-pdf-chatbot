# 17 — Create Collections Pages (Task 4.5)

Status: resolved
Type: task
Milestone: 4 — Frontend — Chat

## Task

Create collections list and detail pages with create dialog and doc/chat counts.

## Files

- Create: `src/components/collections/collection-card.tsx` — card with name, description, doc/chat counts
- Create: `src/app/(dashboard)/collections/page.tsx` — grid list + "New Collection" dialog (POST `/api/collections`)
- Create: `src/app/(dashboard)/collections/[id]/page.tsx` — detail with documents and chats

## Acceptance

- Create a collection → appears in grid; detail page shows its documents and chats.

## Comments

- Complete. Commit `a5c7377`; review clean.

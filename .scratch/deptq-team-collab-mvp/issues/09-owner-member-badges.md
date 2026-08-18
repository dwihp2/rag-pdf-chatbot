# 09 — Add Owner/Member badges to collections list/cards (Task 9)

Status: ready-for-agent
Type: task
Blocked by: 05

## Task

Show Owner/Member badge on the collections list page and cards.

## Files

- Modify: `src/app/(dashboard)/collections/page.tsx` (render badge from list response `role`/`isOwner`)
- Modify: `src/components/collections/collection-card.tsx` (accept + display badge)

## Acceptance

- Each collection card shows Owner or Member based on the authenticated user's role.

## Comments

- Depends on ticket 05 adding `isOwner`/`role` to the list response.

# 02 — Add `POST /api/collections/[id]/join` (Task 2)

Status: ready-for-agent
Type: task
Blocked by: 01

## Task

Add the static-link join route. The current signed-in user becomes a member.

- Idempotent: owner joining returns 400 `Already owner`; existing member returns 200; 404 if the collection doesn't exist.

## Files

- Create: `src/app/api/collections/[id]/join/route.ts` (POST)

## Acceptance

- Bob joins via link → 200; re-join → 200 (idempotent); owner join → 400; missing collection → 404.

## Comments

- Use `getCollectionAccess` from ticket 01.

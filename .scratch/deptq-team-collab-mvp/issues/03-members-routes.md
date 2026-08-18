# 03 — Add members list + remove/leave routes (Task 3)

Status: ready-for-agent
Type: task
Blocked by: 01

## Task

- `GET /api/collections/[id]/members` — owner **and** members can list: `{ id, name, email, role, isOwner, joinedAt }[]`.
- `DELETE /api/collections/[id]/members/[userId]` — owner removing anyone, or a member removing themselves (leave). Removing the owner → 403.

## Files

- Create: `src/app/api/collections/[id]/members/route.ts` (GET)
- Create: `src/app/api/collections/[id]/members/[userId]/route.ts` (DELETE)

## Acceptance

- Both owner and members can list members; owner can remove any member; member can leave; removing the owner is 403.

## Comments

- Use `getCollectionAccess` from ticket 01.

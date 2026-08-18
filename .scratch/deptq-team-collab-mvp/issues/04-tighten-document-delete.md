# 04 — Tighten `DELETE /api/collections/[id]/documents/[documentId]` (Task 4)

Status: ready-for-agent
Type: task
Blocked by: 01

## Task

Behavior fix: allow only the collection **owner** or the **uploader** (`Document.userId === session.user.id`) to remove a document from a collection. Reject others with 403.

## Files

- Modify: `src/app/api/collections/[id]/documents/[documentId]/route.ts` (DELETE)

## Acceptance

- Bob removing alice's doc → 403; bob removing his own doc → 200; owner removing anyone's → 200.

## Comments

- Use `getCollectionAccess` from ticket 01.

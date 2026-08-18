# 05 — Re-verify membership in chat + include members in collection GET (Task 5)

Status: ready-for-agent
Type: task
Blocked by: 01

## Task

- `POST /api/chat` — when the chat has a `collectionId`, re-verify `owner OR member` before retrieving; otherwise 403. (Removed members can still read their own chat history via `GET /api/chat` — private chats persist.)
- `GET /api/collections/[id]` — include `members` (with user `id/name/email`) and `isOwner` in the response; also add `isOwner`/`role` to the collections list route response.

## Files

- Modify: `src/app/api/chat/route.ts` (POST)
- Modify: `src/app/api/collections/[id]/route.ts` (GET)
- Modify: `src/app/api/collections/route.ts` (GET list — role per collection)

## Acceptance

- Chat works while member → 403 after removal; collection detail returns `members` + `isOwner`; list returns role badges data.

## Comments

- Use `getCollectionAccess` from ticket 01.

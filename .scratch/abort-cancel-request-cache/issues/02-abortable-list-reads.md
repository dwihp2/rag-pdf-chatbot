# 02 — Wire abortable read pattern into list surfaces + chat history

Status: ready-for-agent
Type: task
Blocked by: 01

## Task

Adopt the abortable effect pattern across every read fetch. Route changes unmount the outgoing page → effect cleanup aborts the in-flight request automatically (covers menu clicks, back/forward, direct URL edits). Cancelled requests are recognised via the abort error and skipped — they never `setState` on an unmounted component and never surface as errors.

- List reads (Thread list, Document list, Collection list, Collection detail) go **through the request cache** (ticket 01).
- Chat history is **not** cached — a direct abortable fetch.

## Files

- Modify: `src/components/chat/thread-list.tsx` (Thread list — shared by sidebar + Floating Chat)
- Modify: `src/components/documents/document-list.tsx`
- Modify: `src/app/(dashboard)/collections/page.tsx` and `[id]/page.tsx`
- Modify: chat history load (wherever `GET /api/chats/[id]` is consumed)

## Acceptance

- Navigating away mid-load cancels the request; no stale render lands on unmounted components; no user-facing error for cancellations; list surfaces share cached reads.

## Comments

- Depends on ticket 01. Thin declarative wiring — verified by build, lint, and a manual navigation check (no component test harness).

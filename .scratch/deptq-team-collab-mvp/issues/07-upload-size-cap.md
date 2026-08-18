# 07 — Add 20 MB upload cap (server + client) (Task 7)

Status: ready-for-agent
Type: task

## Task

- Server (`/api/upload`): reject `file.size > 20 * 1024 * 1024` with 413 **before** processing.
- Client (`upload-zone.tsx`): 20 MB check with an error toast before upload.

## Files

- Modify: `src/app/api/upload/route.ts` (POST — 413 early return)
- Modify: `src/components/documents/upload-zone.tsx` (client-side size check + error toast)

## Acceptance

- A >20 MB file → 413 server-side and a toast client-side; no processing starts.

## Comments

- Independent of tickets 01–05.

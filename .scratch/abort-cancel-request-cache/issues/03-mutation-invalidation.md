# 03 — Wire mutation invalidation into create/delete flows

Status: ready-for-agent
Type: task
Blocked by: 01

## Task

After mutations, invalidate the affected cache keys so the next read is fresh. Surfaces are **eventually consistent** — each list re-reads on mount and the cache keeps that cheap. Live cross-surface synchronisation is out of scope.

- Invalidate on: create/delete of Chats, Documents, Collections, uploads, and Collection–Document operations.

## Files

- Modify: mutation call sites — chat create/delete (`chat-home`, `thread-list`), document upload/delete (`upload-zone`, `document-list`), collection create/delete/join/leave + doc add/remove (`collections` pages)

## Acceptance

- After each mutation, the affected cache keys are cleared and the next read is fresh; no stale data persists beyond a missed invalidation (TTL backstop still applies).

## Comments

- Depends on ticket 01's `invalidate(urlOrPrefix)` API.

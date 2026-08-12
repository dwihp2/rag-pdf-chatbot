# DeptQ v3 — Team Collaboration MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the dormant `CollectionMember` model into a working, minimal team-collaboration flow — invite teammates to a collection, give them scoped access, and make DeptQ genuinely usable as "one knowledge base per department." Bundles low-effort hardening (upload cap + rate limits).

**Decisions** (from design session, 2026-08-12 — grilling skill, all questions settled):

- Flat model: **no Organization entity**. Collections stay owned by one user; owners invite members.
- **Two roles** per collection: `owner` | `member`.
- **Zero schema changes** — `CollectionMember` already exists (`role` default `"member"`, `joinedAt`).
- Invite = **static link** `/api/collections/[id]/join`. Instant join for signed-in users. No tokens, no email, no approval queue.
- Members can: view collection, chat with it, add **their own** documents, remove **their own** documents from it.
- Owner only: rename/delete collection, manage members, remove anyone's documents.
- Chats stay **private per user**. A removed member's documents stay in the collection; their own chats stay in their account; collection access is revoked.
- **Behavior fix**: `DELETE /api/collections/[id]/documents/[documentId]` tightened from "any member" to uploader-or-owner.
- **Guard**: `POST /api/chat` re-verifies collection membership on every request (blocks removed members from querying a collection via an old chat).
- UI: member management lives on the collection detail page; Owner/Member badges in lists.
- Hardening: **20 MB** per-file upload cap; in-memory per-user rate limits — chat **30/min**, upload **10/hour**. No new dependencies; single-instance caveat accepted.
- Verification: manual QA + curl probes. No test framework this phase.

## Non-goals / Explicit Deferrals

- Organization/Workspace entity, org-level admin, shared department document library
- Admin (third) role, email-based invites (Resend etc.), Redis-backed rate limits
- Shared collection-wide chat history
- Content types beyond PDF (Markdown/TXT/DOCX) — next phase
- Auth (login/register) throttling, analytics, bulk processing, advanced search

## Changes

### New API routes

- `POST /api/collections/[id]/join` — current signed-in user becomes a member. Idempotent: owner joining returns 400 `Already owner`; existing member returns 200. 404 if collection doesn't exist.
- `GET /api/collections/[id]/members` — owner **and** members can list: `{ id, name, email, role, isOwner, joinedAt }[]`.
- `DELETE /api/collections/[id]/members/[userId]` — owner removing anyone, or a member removing themselves (leave). Removing the owner → 403.

### Permission fixes (existing routes)

- `DELETE /api/collections/[id]/documents/[documentId]` — allow only collection owner **or** the uploader (`Document.userId === session.user.id`). Reject others with 403.
- `POST /api/chat` — when the chat has a `collectionId`, re-verify `owner OR member` before retrieving; otherwise 403. (Removed members can still read their own chat history via `GET /api/chat` — private chats persist.)
- `GET /api/collections/[id]` — include `members` (with user `id/name/email`) and `isOwner` in the response.

### New lib

- `src/lib/collection-access.ts` — `getCollectionAccess(userId, collectionId): Promise<"owner" | "member" | null>`; single source of truth used by all collection routes and the chat route.
- `src/lib/rate-limit.ts` — in-memory fixed-window `Map<string, { count, resetAt }>` keyed by `userId:route`; `checkRateLimit(userId, key, { max, windowMs })` with window cleanup.

### Hardening (existing routes)

- `/api/upload` — reject `file.size > 20 * 1024 * 1024` with 413 before processing; apply `checkRateLimit(userId, "upload", { max: 10, windowMs: 3_600_000 })`.
- `/api/chat` (POST) — apply `checkRateLimit(userId, "chat", { max: 30, windowMs: 60_000 })` after auth.

### UI

- `src/app/(dashboard)/collections/[id]/page.tsx` — new **Members** card: list members with Owner/Member badges; owner sees "Copy invite link" (`navigator.clipboard` + toast) and Remove buttons; member sees "Leave collection".
- `src/app/(dashboard)/collections/page.tsx` + `src/components/collections/collection-card.tsx` — show Owner/Member badge (API already returns member collections; add `isOwner`/`role` to the list response).
- `src/components/documents/upload-zone.tsx` — client-side 20 MB check with an error toast before upload.

### Types

- `src/types/index.ts` — add `CollectionMemberDTO` and `CollectionRole = "owner" | "member"`.

## Tasks

1. [ ] Add `src/lib/collection-access.ts` (`getCollectionAccess`) and refactor `collections` routes to use it.
2. [ ] Add `POST /api/collections/[id]/join`.
3. [ ] Add `GET /api/collections/[id]/members` and `DELETE /api/collections/[id]/members/[userId]` (owner-remove + self-leave).
4. [ ] Tighten `DELETE /api/collections/[id]/documents/[documentId]` to uploader-or-owner.
5. [ ] Add collection-membership re-check to `POST /api/chat`; include members + `isOwner` in `GET /api/collections/[id]` and list route responses.
6. [ ] Add `src/lib/rate-limit.ts`; wire into `POST /api/chat` and `POST /api/upload`.
7. [ ] Add 20 MB server-side cap in `/api/upload` (413) and client-side check in `upload-zone.tsx`.
8. [ ] Build Members card UI on collection detail page (list, badges, copy-invite-link, remove/leave).
9. [ ] Add Owner/Member badges to collections list/cards.
10. [ ] Manual QA: run the curl probe list below; fix findings.
11. [ ] Update `CONTEXT.md` (Member concept: roles, invite link, removal semantics) and README feature list if needed.

## Verification (manual QA)

Two test accounts (`alice` = owner, `bob` = member). Probes:

```bash
# bob joins via static link
curl -X POST localhost:3000/api/collections/<id>/join -b "bob_cookie"          # 200
curl -X POST localhost:3000/api/collections/<id>/join -b "bob_cookie"          # 200 (idempotent)
curl -X POST localhost:3000/api/collections/<id>/join -b "alice_cookie"        # 400 (owner)

# members list visible to both
curl localhost:3000/api/collections/<id>/members -b "alice_cookie"             # 200, includes bob
curl localhost:3000/api/collections/<id>/members -b "bob_cookie"               # 200

# bob adds his own doc, then removes it
curl -X POST localhost:3000/api/collections/<id>/documents -b "bob_cookie" \
  -H 'Content-Type: application/json' -d '{"documentId":"<bob_doc>"}'          # 200
curl -X DELETE localhost:3000/api/collections/<id>/documents/<alice_doc> -b "bob_cookie"  # 403 (fixed)
curl -X DELETE localhost:3000/api/collections/<id>/documents/<bob_doc> -b "bob_cookie"    # 200 (own doc)

# chat scoped to collection works for bob; blocked after removal
curl -X POST localhost:3000/api/chat -b "bob_cookie" ...                        # 200 while member
curl -X DELETE localhost:3000/api/collections/<id>/members/<bob_id> -b "alice_cookie"     # 200
curl -X POST localhost:3000/api/chat -b "bob_cookie" ...                        # 403 after removal

# owner protections
curl -X DELETE localhost:3000/api/collections/<id>/members/<alice_id> -b "bob_cookie"      # 403 (owner)
curl -X DELETE localhost:3000/api/collections/<id>/members/<alice_id> -b "alice_cookie"    # 403 (can't remove owner)

# hardening
curl -F 'file=@big_25mb.pdf' localhost:3000/api/upload -b "alice_cookie"       # 413
# 31st chat request within a minute                                             # 429
```

## Acceptance Criteria

- [ ] Bob can join via link, chat with the collection, add/remove only his own documents.
- [ ] Removed members are blocked from collection retrieval on their next message (403).
- [ ] Uploads > 20 MB rejected (413) and rate limits return 429 at thresholds.
- [ ] Owner/Member badges visible; invite link copyable from the collection page.
- [ ] No schema changes, no new dependencies.

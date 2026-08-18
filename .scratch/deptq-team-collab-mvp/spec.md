# Spec: DeptQ v3 — Team Collaboration MVP

> **Source:** converted from the superpowers plan "DeptQ v3 — Team Collaboration MVP Implementation Plan" (2026-08-12) to the `.scratch/` issue-tracker convention on 2026-08-18.
> **Status:** Not started — 11 open tickets. Plan only; no code written.

## Goal

Turn the dormant `CollectionMember` model into a working, minimal team-collaboration flow — invite teammates to a collection, give them scoped access, and make DeptQ genuinely usable as "one knowledge base per department." Bundles low-effort hardening (upload cap + rate limits).

## Decisions (design session 2026-08-12 — grilling skill, all questions settled)

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

## Verification (manual QA)

Two test accounts (`alice` = owner, `bob` = member). Probes: join idempotency (200/200/400-owner), members list visible to both, bob adds/removes only his own docs (403 on alice's), chat works while member then 403 after removal, owner protections (403), upload >20MB → 413, 31st chat request → 429. Full probe list in ticket 10.

## Acceptance Criteria

- Bob can join via link, chat with the collection, add/remove only his own documents.
- Removed members are blocked from collection retrieval on their next message (403).
- Uploads > 20 MB rejected (413) and rate limits return 429 at thresholds.
- Owner/Member badges visible; invite link copyable from the collection page.
- No schema changes, no new dependencies.
